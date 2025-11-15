package handlers

import (
	"csci361/models"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type ConsumerHandler struct {
	db *gorm.DB
}

func NewConsumerHandler(db *gorm.DB) *ConsumerHandler {
	return &ConsumerHandler{db: db}
}

// GetAvailableSuppliers returns list of available suppliers
// @Summary Get available suppliers
// @Description Get list of suppliers available for linking
// @Tags consumers
// @Produce json
// @Security BearerAuth
// @Success 200 {array} models.Supplier
// @Router /consumer/suppliers [get]
func (h *ConsumerHandler) GetAvailableSuppliers(c *gin.Context) {
	var suppliers []models.Supplier
	err := h.db.Where("is_active = ? AND is_verified = ?", true, true).
		Order("company_name ASC").
		Find(&suppliers).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch suppliers"})
		return
	}

	c.JSON(http.StatusOK, suppliers)
}

// RequestLink creates a link request to a supplier
// @Summary Request supplier link
// @Description Request to link with a supplier
// @Tags consumers
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Supplier ID"
// @Success 201 {object} models.ConsumerSupplierLink
// @Router /consumer/suppliers/{id}/link [post]
func (h *ConsumerHandler) RequestLink(c *gin.Context) {
	supplierID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid supplier ID"})
		return
	}

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

	// Check if link already exists
	var existingLink models.ConsumerSupplierLink
	if err := h.db.Where("consumer_id = ? AND supplier_id = ?", consumer.ID, supplierID).First(&existingLink).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Link request already exists"})
		return
	}

	// Create link request
	link := models.ConsumerSupplierLink{
		ConsumerID:  consumer.ID,
		SupplierID:  uint(supplierID),
		Status:      "pending",
		RequestedAt: time.Now(),
	}

	if err := h.db.Create(&link).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create link request"})
		return
	}

	h.db.Preload("Supplier").First(&link, link.ID)

	c.JSON(http.StatusCreated, link)
}

// GetMyLinks returns consumer's supplier links
// @Summary Get my links
// @Description Get consumer's approved supplier links
// @Tags consumers
// @Produce json
// @Security BearerAuth
// @Success 200 {array} models.ConsumerSupplierLink
// @Router /consumer/links [get]
func (h *ConsumerHandler) GetMyLinks(c *gin.Context) {
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

	var links []models.ConsumerSupplierLink
	err := h.db.Where("consumer_id = ?", consumer.ID).
		Preload("Supplier").
		Order("approved_at DESC").
		Find(&links).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch links"})
		return
	}

	c.JSON(http.StatusOK, links)
}

// RemoveLink removes/unlinks from a supplier
// @Summary Remove link
// @Description Remove link with a supplier
// @Tags consumers
// @Security BearerAuth
// @Param id path int true "Link ID"
// @Success 200 {object} map[string]string
// @Router /consumer/links/{id} [delete]
func (h *ConsumerHandler) RemoveLink(c *gin.Context) {
	linkID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid link ID"})
		return
	}

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

	// Verify link belongs to consumer
	var link models.ConsumerSupplierLink
	if err := h.db.Where("id = ? AND consumer_id = ?", linkID, consumer.ID).First(&link).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Link not found"})
		return
	}

	// Soft delete by updating status
	link.Status = "unlinked"
	if err := h.db.Save(&link).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove link"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Link removed successfully"})
}

// GetLinkedConsumers returns linked consumers for supplier
// @Summary Get linked consumers
// @Description Get list of consumers linked to supplier
// @Tags consumers
// @Produce json
// @Security BearerAuth
// @Success 200 {array} models.ConsumerSupplierLink
// @Router /sales/consumers [get]
func (h *ConsumerHandler) GetLinkedConsumers(c *gin.Context) {
	_, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// TODO: Get supplier ID from user relationship
	supplierID := uint(1) // Placeholder

	var links []models.ConsumerSupplierLink
	err := h.db.Where("supplier_id = ? AND status = ?", supplierID, "approved").
		Preload("Consumer").
		Preload("Consumer.User").
		Order("approved_at DESC").
		Find(&links).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch linked consumers"})
		return
	}

	c.JSON(http.StatusOK, links)
}
