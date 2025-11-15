package ws

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"sync"
	"time"

	"github.com/gorilla/websocket"
	"gorm.io/gorm"
)

// Message represents a websocket message.
type Message struct {
	Type    string      `json:"type"`              // e.g. "chat_message", "read_receipt", "typing_indicator"
	ChatID  uint        `json:"chat_id,omitempty"` // chat to which this message belongs
	UserID  uint        `json:"user_id,omitempty"` // sender / actor
	Content string      `json:"content,omitempty"` // text content (for chat messages)
	Data    interface{} `json:"data,omitempty"`    // extra payload (e.g. { "message_id": 123 }, { "is_typing": true })
}

// Client represents a websocket client.
type Client struct {
	hub    *Hub
	conn   *websocket.Conn
	send   chan []byte
	userID uint
	role   string
	chatID uint
}

// Hub maintains the set of active clients and broadcasts messages to clients.
type Hub struct {
	clients    map[*Client]bool // registered clients
	broadcast  chan []byte      // inbound messages from clients
	register   chan *Client     // register requests from clients
	unregister chan *Client     // unregister requests from clients
	mu         sync.RWMutex     // mutex for thread safety
}

// NewHub creates a new websocket hub.
func NewHub() *Hub {
	return &Hub{
		clients:    make(map[*Client]bool),
		broadcast:  make(chan []byte),
		register:   make(chan *Client),
		unregister: make(chan *Client),
	}
}

// Run starts the hub event loop.
func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = true
			h.mu.Unlock()
			log.Printf("Client connected: UserID %d, ChatID %d", client.userID, client.chatID)

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
				log.Printf("Client disconnected: UserID %d, ChatID %d", client.userID, client.chatID)
			}
			h.mu.Unlock()

		case message := <-h.broadcast:
			// Broadcast to everyone (or you can decode and use BroadcastToChat instead).
			h.mu.RLock()
			for client := range h.clients {
				select {
				case client.send <- message:
				default:
					close(client.send)
					delete(h.clients, client)
				}
			}
			h.mu.RUnlock()
		}
	}
}

// BroadcastToChat sends a message to all clients in a specific chat.
func (h *Hub) BroadcastToChat(chatID uint, message []byte) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	for client := range h.clients {
		// TODO: Check if client has access to this chat (permissions, membership).
		if client.chatID != chatID {
			continue
		}
		select {
		case client.send <- message:
		default:
			// If the client's send buffer is full, drop the client.
			close(client.send)
			delete(h.clients, client)
		}
	}
}

// SendReadReceipt sends read receipt for messages.
func (h *Hub) SendReadReceipt(chatID, userID, messageID uint) {
	msg := Message{
		Type:   "read_receipt",
		ChatID: chatID,
		UserID: userID,
		Data: map[string]uint{
			"message_id": messageID,
		},
	}

	payload, err := json.Marshal(msg)
	if err != nil {
		log.Printf("Failed to marshal read receipt: %v", err)
		return
	}

	h.BroadcastToChat(chatID, payload)
}

// SendTypingIndicator sends typing indicator to chat participants.
func (h *Hub) SendTypingIndicator(chatID, userID uint, isTyping bool) {
	msg := Message{
		Type:   "typing_indicator",
		ChatID: chatID,
		UserID: userID,
		Data: map[string]bool{
			"is_typing": isTyping,
		},
	}

	payload, err := json.Marshal(msg)
	if err != nil {
		log.Printf("Failed to marshal typing indicator: %v", err)
		return
	}

	h.BroadcastToChat(chatID, payload)
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		// Allow all origins in development.
		// TODO: Restrict origins in production.
		return true
	},
}

// HandleWebSocket handles websocket connections.
func HandleWebSocket(hub *Hub, w http.ResponseWriter, r *http.Request, db *gorm.DB) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("WebSocket upgrade failed: %v", err)
		return
	}

	// TODO: Extract user info from JWT token in query params or headers.
	// Placeholder user/role:
	userID := uint(1)
	role := "consumer"

	// ChatID from query parameter, e.g. ws://.../ws?chat_id=123
	var chatID uint
	if rawChat := r.URL.Query().Get("chat_id"); rawChat != "" {
		if val, err := strconv.ParseUint(rawChat, 10, 64); err == nil {
			chatID = uint(val)
		}
	}

	client := &Client{
		hub:    hub,
		conn:   conn,
		send:   make(chan []byte, 256),
		userID: userID,
		role:   role,
		chatID: chatID,
	}

	client.hub.register <- client

	// Start goroutines for reading and writing.
	go client.writePump()
	go client.readPump()
}

// readPump pumps messages from the websocket connection to the hub.
func (c *Client) readPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()

	c.conn.SetReadLimit(5120)
	c.conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	c.conn.SetPongHandler(func(string) error {
		c.conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})

	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket error: %v", err)
			}
			break
		}

		log.Printf("Received message from user %d: %s", c.userID, string(message))

		// Here you can decode the message and route based on Type.
		// For now, echo / broadcast it.
		// Example: process only chat messages and route via BroadcastToChat:
		var msg Message
		if err := json.Unmarshal(message, &msg); err == nil && msg.ChatID != 0 {
			c.hub.BroadcastToChat(msg.ChatID, message)
		} else {
			// Fallback: broadcast to everyone.
			c.hub.broadcast <- message
		}
	}
}

// writePump pumps messages from the hub to the websocket connection.
func (c *Client) writePump() {
	defer c.conn.Close()

	for message := range c.send {
		if err := c.conn.WriteMessage(websocket.TextMessage, message); err != nil {
			log.Printf("WebSocket write error: %v", err)
			return
		}
	}

	if err := c.conn.WriteMessage(websocket.CloseMessage, []byte{}); err != nil {
		log.Printf("WebSocket write close error: %v", err)
	}

}
