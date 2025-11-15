package handlers

import (
	"csci361/models"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type ChatHandler struct {
	db *gorm.DB
}

func NewChatHandler(db *gorm.DB) *ChatHandler {
	return &ChatHandler{db: db}
}

type SendMessageRequest struct {
	ChatID      uint   `json:"chat_id" binding:"required"`
	Content     string `json:"content" binding:"required"`
	MessageType string `json:"message_type,omitempty"`
}

// GetConsumerChats returns consumer's chat conversations
// @Summary Get consumer chats
// @Description Get all chat conversations for authenticated consumer
// @Tags chat
// @Produce json
// @Security BearerAuth
// @Success 200 {array} models.Chat
// @Failure 401 {object} map[string]string
// @Router /consumer/chats [get]
func (h *ChatHandler) GetConsumerChats(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Get consumer record
	var consumer models.Consumer
	if err := h.db.Where("user_id = ?", userID).First(&consumer).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Consumer not found"})
		return
	}

	var chats []models.Chat
	err := h.db.Where("consumer_id = ?", consumer.ID).
		Preload("Supplier").
		Preload("Messages", func(db *gorm.DB) *gorm.DB {
			return db.Order("created_at DESC").Limit(1)
		}).
		Find(&chats).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch chats"})
		return
	}

	c.JSON(http.StatusOK, chats)
}

// GetSupplierChats returns supplier's chat conversations
// @Summary Get supplier chats
// @Description Get all chat conversations for authenticated supplier
// @Tags chat
// @Produce json
// @Security BearerAuth
// @Success 200 {array} models.Chat
// @Failure 401 {object} map[string]string
// @Router /sales/chats [get]
func (h *ChatHandler) GetSupplierChats(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Get supplier ID from user (assuming user belongs to supplier)
	var user models.User
	if err := h.db.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// TODO: Get supplier ID from user relationship
	supplierID := uint(1) // Placeholder

	var chats []models.Chat
	err := h.db.Where("supplier_id = ?", supplierID).
		Preload("Consumer").
		Preload("Consumer.User").
		Preload("Messages", func(db *gorm.DB) *gorm.DB {
			return db.Order("created_at DESC").Limit(1)
		}).
		Find(&chats).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch chats"})
		return
	}

	c.JSON(http.StatusOK, chats)
}

// GetChatMessages returns messages for a specific chat
// @Summary Get chat messages
// @Description Get messages for a specific chat conversation
// @Tags chat
// @Produce json
// @Security BearerAuth
// @Param chat_id path int true "Chat ID"
// @Param page query int false "Page number"
// @Param limit query int false "Items per page"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Router /chats/{chat_id}/messages [get]
func (h *ChatHandler) GetChatMessages(c *gin.Context) {
	chatID, err := strconv.ParseUint(c.Param("chat_id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid chat ID"})
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	offset := (page - 1) * limit

	var messages []models.Message
	var total int64

	// Check if user has access to this chat
	userID, _ := c.Get("user_id")
	if !h.hasAccessToChat(uint(chatID), userID.(uint)) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	h.db.Model(&models.Message{}).Where("chat_id = ?", chatID).Count(&total)
	err = h.db.Where("chat_id = ?", chatID).
		Preload("Sender").
		Preload("Attachments").
		Order("created_at DESC").
		Offset(offset).
		Limit(limit).
		Find(&messages).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch messages"})
		return
	}

	// Mark messages as read if user is not the sender
	h.markMessagesAsRead(uint(chatID), userID.(uint))

	c.JSON(http.StatusOK, gin.H{
		"messages":    messages,
		"total":       total,
		"page":        page,
		"limit":       limit,
		"total_pages": (int(total) + limit - 1) / limit,
	})
}

// SendMessage sends a new message in a chat
// @Summary Send message
// @Description Send a new message in a chat conversation
// @Tags chat
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body SendMessageRequest true "Message content"
// @Success 201 {object} models.Message
// @Failure 400 {object} map[string]string
// @Router /chats/messages [post]
func (h *ChatHandler) SendMessage(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var req SendMessageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if user has access to this chat
	if !h.hasAccessToChat(req.ChatID, userID.(uint)) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	// Create message
	message := models.Message{
		ChatID:      req.ChatID,
		SenderID:    userID.(uint),
		Content:     req.Content,
		MessageType: req.MessageType,
	}

	if message.MessageType == "" {
		message.MessageType = "text"
	}

	if err := h.db.Create(&message).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send message"})
		return
	}

	// Load message with relationships
	h.db.Preload("Sender").Preload("Attachments").First(&message, message.ID)

	// TODO: Send message via WebSocket to connected clients

	c.JSON(http.StatusCreated, message)
}

// EscalateChat escalates a chat to admin level
// @Summary Escalate chat
// @Description Escalate chat conversation to admin level
// @Tags chat
// @Security BearerAuth
// @Param chat_id path int true "Chat ID"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Router /sales/chats/{chat_id}/escalate [post]
func (h *ChatHandler) EscalateChat(c *gin.Context) {
	chatID, err := strconv.ParseUint(c.Param("chat_id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid chat ID"})
		return
	}

	userID, _ := c.Get("user_id")

	// Check if user has access to this chat
	if !h.hasAccessToChat(uint(chatID), userID.(uint)) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	// Update chat status to escalated
	if err := h.db.Model(&models.Chat{}).Where("id = ?", chatID).Update("status", "escalated").Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to escalate chat"})
		return
	}

	// Create system message about escalation
	systemMessage := models.Message{
		ChatID:      uint(chatID),
		SenderID:    userID.(uint),
		Content:     "Chat has been escalated to admin level",
		MessageType: "system",
	}
	h.db.Create(&systemMessage)

	c.JSON(http.StatusOK, gin.H{"message": "Chat escalated successfully"})
}

// ExportTranscripts exports chat transcripts (owner only)
// @Summary Export chat transcripts
// @Description Export chat transcripts for reporting
// @Tags chat
// @Produce json
// @Security BearerAuth
// @Param supplier_id query int false "Filter by supplier ID"
// @Param start_date query string false "Start date (YYYY-MM-DD)"
// @Param end_date query string false "End date (YYYY-MM-DD)"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Router /owner/reports/transcripts [get]
func (h *ChatHandler) ExportTranscripts(c *gin.Context) {
	supplierIDStr := c.Query("supplier_id")
	startDateStr := c.Query("start_date")
	endDateStr := c.Query("end_date")

	query := h.db.Model(&models.Chat{}).Preload("Messages").Preload("Consumer").Preload("Supplier")

	if supplierIDStr != "" {
		supplierID, _ := strconv.ParseUint(supplierIDStr, 10, 32)
		query = query.Where("supplier_id = ?", supplierID)
	}

	if startDateStr != "" && endDateStr != "" {
		startDate, _ := time.Parse("2006-01-02", startDateStr)
		endDate, _ := time.Parse("2006-01-02", endDateStr)
		query = query.Where("created_at BETWEEN ? AND ?", startDate, endDate)
	}

	var chats []models.Chat
	if err := query.Find(&chats).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to export transcripts"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"chats":       chats,
		"total":       len(chats),
		"exported_at": time.Now(),
	})
}

// Helper functions

func (h *ChatHandler) hasAccessToChat(chatID, userID uint) bool {
	var chat models.Chat
	if err := h.db.First(&chat, chatID).Error; err != nil {
		return false
	}

	// Check if user is consumer in this chat
	var consumer models.Consumer
	if err := h.db.Where("user_id = ? AND id = ?", userID, chat.ConsumerID).First(&consumer).Error; err == nil {
		return true
	}

	// Check if user belongs to supplier in this chat
	// TODO: Implement supplier-user relationship check

	return false
}

func (h *ChatHandler) markMessagesAsRead(chatID, userID uint) {
	h.db.Model(&models.Message{}).
		Where("chat_id = ? AND sender_id != ? AND is_read = ?", chatID, userID, false).
		Updates(map[string]interface{}{
			"is_read": true,
			"read_at": time.Now(),
		})
}
