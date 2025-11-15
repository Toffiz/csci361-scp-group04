package handlers

import (
	"csci361/models"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type OrderHandler struct {
	db *gorm.DB
}

func NewOrderHandler(db *gorm.DB) *OrderHandler {
	return &OrderHandler{db: db}
}

type CreateOrderRequest struct {
	SupplierID uint `json:"supplier_id" binding:"required"`
	Items      []struct {
		ProductID uint    `json:"product_id" binding:"required"`
		Quantity  int     `json:"quantity" binding:"required,min=1"`
		UnitPrice float64 `json:"unit_price" binding:"required"`
	} `json:"items" binding:"required,min=1"`
	Notes string `json:"notes"`
}

// CreateOrder creates a new order
// @Summary Create order
// @Description Create a new order (consumer only)
// @Tags orders
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body CreateOrderRequest true "Order details"
// @Success 201 {object} models.Order
// @Router /consumer/orders [post]
func (h *OrderHandler) CreateOrder(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var req CreateOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get consumer record
	var consumer models.Consumer
	if err := h.db.Where("user_id = ?", userID).First(&consumer).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Consumer not found"})
		return
	}

	// Verify consumer is linked to supplier
	var link models.ConsumerSupplierLink
	if err := h.db.Where("consumer_id = ? AND supplier_id = ? AND status = ?",
		consumer.ID, req.SupplierID, "approved").First(&link).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Not linked to this supplier"})
		return
	}

	// Calculate order total
	var total float64
	for _, item := range req.Items {
		total += item.UnitPrice * float64(item.Quantity)
	}

	// Create order
	order := models.Order{
		ConsumerID: consumer.ID,
		SupplierID: req.SupplierID,
		Status:     "pending",
		Total:      total,
		Currency:   "KZT",
		Notes:      req.Notes,
		OrderDate:  time.Now(),
	}

	if err := h.db.Create(&order).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create order"})
		return
	}

	// Create order items
	for _, item := range req.Items {
		orderItem := models.OrderItem{
			OrderID:   order.ID,
			ProductID: item.ProductID,
			Quantity:  item.Quantity,
			UnitPrice: item.UnitPrice,
			Total:     item.UnitPrice * float64(item.Quantity),
		}
		h.db.Create(&orderItem)
	}

	// Load order with relationships
	h.db.Preload("OrderItems").Preload("OrderItems.Product").
		Preload("Supplier").First(&order, order.ID)

	c.JSON(http.StatusCreated, order)
}

// GetConsumerOrders returns orders for consumer
// @Summary Get consumer orders
// @Description Get orders for authenticated consumer
// @Tags orders
// @Produce json
// @Security BearerAuth
// @Param status query string false "Filter by status"
// @Success 200 {array} models.Order
// @Router /consumer/orders [get]
func (h *OrderHandler) GetConsumerOrders(c *gin.Context) {
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

	query := h.db.Where("consumer_id = ?", consumer.ID)

	// Apply status filter
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}

	var orders []models.Order
	err := query.Preload("OrderItems").
		Preload("OrderItems.Product").
		Preload("Supplier").
		Order("order_date DESC").
		Find(&orders).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch orders"})
		return
	}

	c.JSON(http.StatusOK, orders)
}

// GetSupplierOrders returns orders for supplier
// @Summary Get supplier orders
// @Description Get orders for authenticated supplier
// @Tags orders
// @Produce json
// @Security BearerAuth
// @Param status query string false "Filter by status"
// @Success 200 {array} models.Order
// @Router /sales/orders [get]
func (h *OrderHandler) GetAllOrders(c *gin.Context) {
	_, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// TODO: Get supplier ID from user relationship
	supplierID := uint(1) // Placeholder

	query := h.db.Where("supplier_id = ?", supplierID)

	// Apply status filter
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}

	var orders []models.Order
	err := query.Preload("OrderItems").
		Preload("OrderItems.Product").
		Preload("Consumer").
		Preload("Consumer.User").
		Order("order_date DESC").
		Find(&orders).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch orders"})
		return
	}

	c.JSON(http.StatusOK, orders)
}

// GetAllOrders returns all orders (admin only)
// @Summary Get all orders
// @Description Get all orders for admin dashboard
// @Tags orders
// @Produce json
// @Security BearerAuth
// @Param page query int false "Page number"
// @Param limit query int false "Items per page"
// @Success 200 {object} map[string]interface{}
// @Router /sales/orders [get]
func (h *OrderHandler) GetSupplierOrders(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	offset := (page - 1) * limit

	// TODO: Get supplier ID from user relationship
	supplierID := uint(1) // Placeholder

	var orders []models.Order
	var total int64

	h.db.Model(&models.Order{}).Where("supplier_id = ?", supplierID).Count(&total)
	err := h.db.Where("supplier_id = ?", supplierID).
		Preload("OrderItems").
		Preload("OrderItems.Product").
		Preload("Consumer").
		Preload("Consumer.User").
		Offset(offset).
		Limit(limit).
		Order("order_date DESC").
		Find(&orders).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch orders"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"orders":      orders,
		"total":       total,
		"page":        page,
		"limit":       limit,
		"total_pages": (int(total) + limit - 1) / limit,
	})
}

// UpdateOrderStatus updates order status
// @Summary Update order status
// @Description Update order status (sales/admin only)
// @Tags orders
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Order ID"
// @Param request body map[string]string true "New status"
// @Success 200 {object} models.Order
// @Router /sales/orders/{id}/status [put]
func (h *OrderHandler) UpdateOrderStatus(c *gin.Context) {
	orderID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid order ID"})
		return
	}

	var req struct {
		Status string `json:"status" binding:"required,oneof=pending confirmed shipped delivered cancelled"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var order models.Order
	if err := h.db.First(&order, uint(orderID)).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
		return
	}

	order.Status = req.Status

	if err := h.db.Save(&order).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update order status"})
		return
	}

	// Load order with relationships
	h.db.Preload("OrderItems").
		Preload("OrderItems.Product").
		Preload("Consumer").
		Preload("Consumer.User").
		First(&order, order.ID)

	c.JSON(http.StatusOK, order)
}
