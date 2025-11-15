package handlers

import (
	"csci361/models"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type IncidentHandler struct {
	db *gorm.DB
}

func NewIncidentHandler(db *gorm.DB) *IncidentHandler {
	return &IncidentHandler{db: db}
}

type CreateIncidentRequest struct {
	SupplierID  uint   `json:"supplier_id" binding:"required"`
	OrderID     *uint  `json:"order_id,omitempty"`
	ChatID      uint   `json:"chat_id" binding:"required"`
	Title       string `json:"title" binding:"required"`
	Description string `json:"description" binding:"required"`
	Priority    string `json:"priority,omitempty"`
}

type UpdateIncidentRequest struct {
	Status     string `json:"status,omitempty"`
	Priority   string `json:"priority,omitempty"`
	AssignedTo *uint  `json:"assigned_to,omitempty"`
	Notes      string `json:"notes,omitempty"`
}

// CreateIncident creates a new incident report
// @Summary Create incident
// @Description Create a new incident/complaint report
// @Tags incidents
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body CreateIncidentRequest true "Incident details"
// @Success 201 {object} models.Incident
// @Failure 400 {object} map[string]string
// @Router /consumer/incidents [post]
func (h *IncidentHandler) CreateIncident(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var req CreateIncidentRequest
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

	// Create incident
	incident := models.Incident{
		ConsumerID:  consumer.ID,
		SupplierID:  req.SupplierID,
		OrderID:     req.OrderID,
		ChatID:      req.ChatID,
		Title:       req.Title,
		Description: req.Description,
		Priority:    req.Priority,
		Status:      "open",
	}

	if incident.Priority == "" {
		incident.Priority = "medium"
	}

	if err := h.db.Create(&incident).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create incident"})
		return
	}

	// Create initial log entry
	logEntry := models.IncidentLog{
		IncidentID: incident.ID,
		UserID:     userID.(uint),
		Action:     "created",
		NewValue:   "open",
		Notes:      "Incident created by consumer",
	}
	h.db.Create(&logEntry)

	// Load incident with relationships
	h.db.Preload("Consumer").Preload("Consumer.User").Preload("Supplier").First(&incident, incident.ID)

	c.JSON(http.StatusCreated, incident)
}

// GetSupplierIncidents returns incidents for supplier
// @Summary Get supplier incidents
// @Description Get incidents for authenticated supplier
// @Tags incidents
// @Produce json
// @Security BearerAuth
// @Param status query string false "Filter by status"
// @Param priority query string false "Filter by priority"
// @Success 200 {array} models.Incident
// @Failure 401 {object} map[string]string
// @Router /sales/incidents [get]
func (h *IncidentHandler) GetSupplierIncidents(c *gin.Context) {
	_, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// TODO: Get supplier ID from user relationship
	supplierID := uint(1) // Placeholder

	query := h.db.Where("supplier_id = ?", supplierID)

	// Apply filters
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	if priority := c.Query("priority"); priority != "" {
		query = query.Where("priority = ?", priority)
	}

	var incidents []models.Incident
	err := query.Preload("Consumer").
		Preload("Consumer.User").
		Preload("Order").
		Preload("AssignedUser").
		Order("created_at DESC").
		Find(&incidents).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch incidents"})
		return
	}

	c.JSON(http.StatusOK, incidents)
}

// GetAllIncidents returns all incidents (admin only)
// @Summary Get all incidents
// @Description Get all incidents for admin dashboard
// @Tags incidents
// @Produce json
// @Security BearerAuth
// @Param page query int false "Page number"
// @Param limit query int false "Items per page"
// @Success 200 {object} map[string]interface{}
// @Failure 401 {object} map[string]string
// @Router /admin/incidents [get]
func (h *IncidentHandler) GetAllIncidents(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	offset := (page - 1) * limit

	var incidents []models.Incident
	var total int64

	h.db.Model(&models.Incident{}).Count(&total)
	err := h.db.Offset(offset).
		Limit(limit).
		Preload("Consumer").
		Preload("Consumer.User").
		Preload("Supplier").
		Preload("Order").
		Preload("AssignedUser").
		Order("created_at DESC").
		Find(&incidents).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch incidents"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"incidents":   incidents,
		"total":       total,
		"page":        page,
		"limit":       limit,
		"total_pages": (int(total) + limit - 1) / limit,
	})
}

// UpdateIncident updates incident details
// @Summary Update incident
// @Description Update incident status, priority, or other details
// @Tags incidents
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Incident ID"
// @Param request body UpdateIncidentRequest true "Updated incident details"
// @Success 200 {object} models.Incident
// @Failure 400 {object} map[string]string
// @Router /sales/incidents/{id} [put]
func (h *IncidentHandler) UpdateIncident(c *gin.Context) {
	incidentID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid incident ID"})
		return
	}

	userID, _ := c.Get("user_id")

	var req UpdateIncidentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var incident models.Incident
	if err := h.db.First(&incident, uint(incidentID)).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Incident not found"})
		return
	}

	// Store old values for logging
	oldStatus := incident.Status
	oldPriority := incident.Priority

	// Update incident fields
	if req.Status != "" && req.Status != incident.Status {
		incident.Status = req.Status
		h.createIncidentLog(incident.ID, userID.(uint), "status_changed", oldStatus, req.Status, req.Notes)
	}

	if req.Priority != "" && req.Priority != incident.Priority {
		incident.Priority = req.Priority
		h.createIncidentLog(incident.ID, userID.(uint), "priority_changed", oldPriority, req.Priority, req.Notes)
	}

	if req.AssignedTo != nil && (incident.AssignedTo == nil || *req.AssignedTo != *incident.AssignedTo) {
		incident.AssignedTo = req.AssignedTo
		h.createIncidentLog(incident.ID, userID.(uint), "assigned", "", "", req.Notes)
	}

	if err := h.db.Save(&incident).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update incident"})
		return
	}

	// Load updated incident with relationships
	h.db.Preload("Consumer").Preload("Consumer.User").Preload("Supplier").Preload("AssignedUser").First(&incident, incident.ID)

	c.JSON(http.StatusOK, incident)
}

// AssignIncident assigns incident to a user
// @Summary Assign incident
// @Description Assign incident to a specific user
// @Tags incidents
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Incident ID"
// @Param request body map[string]uint true "Assignment details"
// @Success 200 {object} models.Incident
// @Failure 400 {object} map[string]string
// @Router /admin/incidents/{id}/assign [put]
func (h *IncidentHandler) AssignIncident(c *gin.Context) {
	incidentID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid incident ID"})
		return
	}

	userID, _ := c.Get("user_id")

	var req struct {
		AssignedTo uint   `json:"assigned_to" binding:"required"`
		Notes      string `json:"notes"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var incident models.Incident
	if err := h.db.First(&incident, uint(incidentID)).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Incident not found"})
		return
	}

	// Verify assigned user exists
	var assignedUser models.User
	if err := h.db.First(&assignedUser, req.AssignedTo).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Assigned user not found"})
		return
	}

	incident.AssignedTo = &req.AssignedTo
	incident.Status = "in_progress"

	if err := h.db.Save(&incident).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to assign incident"})
		return
	}

	// Create log entry
	h.createIncidentLog(incident.ID, userID.(uint), "assigned", "", assignedUser.Email, req.Notes)

	// Load updated incident
	h.db.Preload("Consumer").Preload("Consumer.User").Preload("Supplier").Preload("AssignedUser").First(&incident, incident.ID)

	c.JSON(http.StatusOK, incident)
}

// ResolveIncident marks incident as resolved
// @Summary Resolve incident
// @Description Mark incident as resolved
// @Tags incidents
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Incident ID"
// @Param request body map[string]string true "Resolution details"
// @Success 200 {object} models.Incident
// @Failure 400 {object} map[string]string
// @Router /admin/incidents/{id}/resolve [put]
func (h *IncidentHandler) ResolveIncident(c *gin.Context) {
	incidentID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid incident ID"})
		return
	}

	userID, _ := c.Get("user_id")

	var req struct {
		Notes string `json:"notes" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var incident models.Incident
	if err := h.db.First(&incident, uint(incidentID)).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Incident not found"})
		return
	}

	now := time.Now()
	incident.Status = "resolved"
	incident.ResolvedAt = &now

	if err := h.db.Save(&incident).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to resolve incident"})
		return
	}

	// Create log entry
	h.createIncidentLog(incident.ID, userID.(uint), "resolved", "in_progress", "resolved", req.Notes)

	// Load updated incident
	h.db.Preload("Consumer").Preload("Consumer.User").Preload("Supplier").Preload("AssignedUser").First(&incident, incident.ID)

	c.JSON(http.StatusOK, incident)
}

// ExportIncidents exports incident data for reporting
// @Summary Export incidents
// @Description Export incident data for reporting purposes
// @Tags incidents
// @Produce json
// @Security BearerAuth
// @Param supplier_id query int false "Filter by supplier ID"
// @Param start_date query string false "Start date (YYYY-MM-DD)"
// @Param end_date query string false "End date (YYYY-MM-DD)"
// @Success 200 {object} map[string]interface{}
// @Router /owner/reports/incidents [get]
func (h *IncidentHandler) ExportIncidents(c *gin.Context) {
	supplierIDStr := c.Query("supplier_id")
	startDateStr := c.Query("start_date")
	endDateStr := c.Query("end_date")

	query := h.db.Model(&models.Incident{}).
		Preload("Consumer").
		Preload("Consumer.User").
		Preload("Supplier").
		Preload("AssignedUser").
		Preload("Logs")

	if supplierIDStr != "" {
		supplierID, _ := strconv.ParseUint(supplierIDStr, 10, 32)
		query = query.Where("supplier_id = ?", supplierID)
	}

	if startDateStr != "" && endDateStr != "" {
		startDate, _ := time.Parse("2006-01-02", startDateStr)
		endDate, _ := time.Parse("2006-01-02", endDateStr)
		query = query.Where("created_at BETWEEN ? AND ?", startDate, endDate)
	}

	var incidents []models.Incident
	if err := query.Find(&incidents).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to export incidents"})
		return
	}

	// Calculate summary statistics
	statusCounts := make(map[string]int)
	priorityCounts := make(map[string]int)

	for _, incident := range incidents {
		statusCounts[incident.Status]++
		priorityCounts[incident.Priority]++
	}

	c.JSON(http.StatusOK, gin.H{
		"incidents":        incidents,
		"total":            len(incidents),
		"status_summary":   statusCounts,
		"priority_summary": priorityCounts,
		"exported_at":      time.Now(),
	})
}

// Helper function to create incident log entries
func (h *IncidentHandler) createIncidentLog(incidentID, userID uint, action, oldValue, newValue, notes string) {
	logEntry := models.IncidentLog{
		IncidentID: incidentID,
		UserID:     userID,
		Action:     action,
		OldValue:   oldValue,
		NewValue:   newValue,
		Notes:      notes,
	}
	h.db.Create(&logEntry)
}
