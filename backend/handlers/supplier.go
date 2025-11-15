package handlers

import (
	"csci361/models"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type SupplierHandler struct {
	db *gorm.DB
}

func NewSupplierHandler(db *gorm.DB) *SupplierHandler {
	return &SupplierHandler{db: db}
}

// GetLinkRequests returns pending link requests for supplier
// @Summary Get link requests
// @Description Get pending consumer link requests for supplier
// @Tags suppliers
// @Produce json
// @Security BearerAuth
// @Success 200 {array} models.ConsumerSupplierLink
// @Router /sales/link-requests [get]
func (h *SupplierHandler) GetLinkRequests(c *gin.Context) {
	_, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// TODO: Get supplier ID from user relationship
	supplierID := uint(1) // Placeholder

	var linkRequests []models.ConsumerSupplierLink
	err := h.db.Where("supplier_id = ? AND status = ?", supplierID, "pending").
		Preload("Consumer").
		Preload("Consumer.User").
		Order("requested_at DESC").
		Find(&linkRequests).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch link requests"})
		return
	}

	c.JSON(http.StatusOK, linkRequests)
}

// HandleLinkRequest approves or denies a link request
// @Summary Handle link request
// @Description Approve or deny consumer link request
// @Tags suppliers
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Link Request ID"
// @Param request body map[string]string true "Action (approve/deny)"
// @Success 200 {object} models.ConsumerSupplierLink
// @Router /sales/link-requests/{id} [put]
func (h *SupplierHandler) HandleLinkRequest(c *gin.Context) {
	linkID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid link ID"})
		return
	}

	var req struct {
		Action string `json:"action" binding:"required,oneof=approve deny"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var link models.ConsumerSupplierLink
	if err := h.db.First(&link, uint(linkID)).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Link request not found"})
		return
	}

	if link.Status != "pending" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Link request already processed"})
		return
	}

	if req.Action == "approve" {
		now := time.Now()
		link.Status = "approved"
		link.ApprovedAt = &now

		// Create chat for the consumer-supplier link
		chat := models.Chat{
			ConsumerID: link.ConsumerID,
			SupplierID: link.SupplierID,
			Status:     "active",
		}
		h.db.Create(&chat)
	} else {
		link.Status = "denied"
	}

	if err := h.db.Save(&link).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update link request"})
		return
	}

	h.db.Preload("Consumer").Preload("Consumer.User").First(&link, link.ID)

	c.JSON(http.StatusOK, link)
}

// GetAllSuppliers returns all suppliers (platform admin)
// @Summary Get all suppliers
// @Description Get list of all suppliers (platform admin only)
// @Tags suppliers
// @Produce json
// @Security BearerAuth
// @Success 200 {array} models.Supplier
// @Router /platform/suppliers [get]
func (h *SupplierHandler) GetAllSuppliers(c *gin.Context) {
	var suppliers []models.Supplier
	err := h.db.Preload("Subscription").
		Order("created_at DESC").
		Find(&suppliers).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch suppliers"})
		return
	}

	c.JSON(http.StatusOK, suppliers)
}

// VerifySupplier marks a supplier as verified
// @Summary Verify supplier
// @Description Verify supplier account (platform admin only)
// @Tags suppliers
// @Security BearerAuth
// @Param id path int true "Supplier ID"
// @Success 200 {object} models.Supplier
// @Router /platform/suppliers/{id}/verify [put]
func (h *SupplierHandler) VerifySupplier(c *gin.Context) {
	supplierID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid supplier ID"})
		return
	}

	var supplier models.Supplier
	if err := h.db.First(&supplier, uint(supplierID)).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Supplier not found"})
		return
	}

	supplier.IsVerified = true
	if err := h.db.Save(&supplier).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to verify supplier"})
		return
	}

	c.JSON(http.StatusOK, supplier)
}

// SuspendSupplier suspends a supplier account
// @Summary Suspend supplier
// @Description Suspend supplier account (platform admin only)
// @Tags suppliers
// @Security BearerAuth
// @Param id path int true "Supplier ID"
// @Success 200 {object} models.Supplier
// @Router /platform/suppliers/{id}/suspend [put]
func (h *SupplierHandler) SuspendSupplier(c *gin.Context) {
	supplierID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid supplier ID"})
		return
	}

	var supplier models.Supplier
	if err := h.db.First(&supplier, uint(supplierID)).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Supplier not found"})
		return
	}

	supplier.IsActive = false
	if err := h.db.Save(&supplier).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to suspend supplier"})
		return
	}

	c.JSON(http.StatusOK, supplier)
}

// GetSubscription returns supplier's subscription details
// @Summary Get subscription
// @Description Get current supplier subscription details
// @Tags suppliers
// @Produce json
// @Security BearerAuth
// @Success 200 {object} models.Subscription
// @Router /admin/subscription [get]
func (h *SupplierHandler) GetSubscription(c *gin.Context) {
	_, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// TODO: Get supplier ID from user relationship
	supplierID := uint(1) // Placeholder

	var subscription models.Subscription
	if err := h.db.Where("supplier_id = ?", supplierID).First(&subscription).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Subscription not found"})
		return
	}

	c.JSON(http.StatusOK, subscription)
}

// UpdateSubscription updates subscription details
// @Summary Update subscription
// @Description Update supplier subscription details
// @Tags suppliers
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body models.Subscription true "Updated subscription"
// @Success 200 {object} models.Subscription
// @Router /admin/subscription [put]
func (h *SupplierHandler) UpdateSubscription(c *gin.Context) {
	_, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// TODO: Get supplier ID from user relationship
	supplierID := uint(1) // Placeholder

	var updateData struct {
		PlanName     string `json:"plan_name"`
		BillingCycle string `json:"billing_cycle"`
	}

	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var subscription models.Subscription
	if err := h.db.Where("supplier_id = ?", supplierID).First(&subscription).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Subscription not found"})
		return
	}

	subscription.PlanName = updateData.PlanName
	subscription.BillingCycle = updateData.BillingCycle

	if err := h.db.Save(&subscription).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update subscription"})
		return
	}

	c.JSON(http.StatusOK, subscription)
}

// GetAllSubscriptions returns all subscriptions (platform admin)
// @Summary Get all subscriptions
// @Description Get list of all supplier subscriptions
// @Tags suppliers
// @Produce json
// @Security BearerAuth
// @Success 200 {array} models.Subscription
// @Router /platform/subscriptions [get]
func (h *SupplierHandler) GetAllSubscriptions(c *gin.Context) {
	var subscriptions []models.Subscription
	err := h.db.Preload("Supplier").
		Order("created_at DESC").
		Find(&subscriptions).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch subscriptions"})
		return
	}

	c.JSON(http.StatusOK, subscriptions)
}
