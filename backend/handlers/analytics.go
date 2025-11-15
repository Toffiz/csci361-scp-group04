package handlers

import (
	"csci361/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type AnalyticsHandler struct {
	db *gorm.DB
}

func NewAnalyticsHandler(db *gorm.DB) *AnalyticsHandler {
	return &AnalyticsHandler{db: db}
}

type DashboardResponse struct {
	Summary      map[string]interface{} `json:"summary"`
	RecentOrders []models.Order         `json:"recent_orders"`
	TopProducts  []ProductStats         `json:"top_products"`
	KPIs         KPIResponse            `json:"kpis"`
}

type ProductStats struct {
	ProductID   uint    `json:"product_id"`
	ProductName string  `json:"product_name"`
	TotalSold   int     `json:"total_sold"`
	Revenue     float64 `json:"revenue"`
}

type KPIResponse struct {
	OrderCount        int64   `json:"order_count"`
	GMV               float64 `json:"gmv"`
	AverageOrderValue float64 `json:"average_order_value"`
	ActiveConsumers   int64   `json:"active_consumers"`
	PendingIncidents  int64   `json:"pending_incidents"`
	ResolvedIncidents int64   `json:"resolved_incidents"`
}

// GetDashboard returns dashboard analytics
// @Summary Get dashboard analytics
// @Description Get analytics dashboard data (admin/owner only)
// @Tags analytics
// @Produce json
// @Security BearerAuth
// @Param period query string false "Time period (week/month/year)"
// @Success 200 {object} DashboardResponse
// @Router /admin/analytics [get]
func (h *AnalyticsHandler) GetDashboard(c *gin.Context) {
	_, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// TODO: Get supplier ID from user relationship
	supplierID := uint(1) // Placeholder

	period := c.DefaultQuery("period", "month")
	startDate := h.getStartDate(period)

	// Get summary statistics
	var orderCount int64
	var totalGMV float64

	h.db.Model(&models.Order{}).
		Where("supplier_id = ? AND order_date >= ?", supplierID, startDate).
		Count(&orderCount)

	h.db.Model(&models.Order{}).
		Where("supplier_id = ? AND order_date >= ? AND status != ?", supplierID, startDate, "cancelled").
		Select("COALESCE(SUM(total), 0)").
		Scan(&totalGMV)

	avgOrderValue := float64(0)
	if orderCount > 0 {
		avgOrderValue = totalGMV / float64(orderCount)
	}

	// Get active consumers count
	var activeConsumers int64
	h.db.Model(&models.ConsumerSupplierLink{}).
		Where("supplier_id = ? AND status = ?", supplierID, "approved").
		Count(&activeConsumers)

	// Get incident counts
	var pendingIncidents, resolvedIncidents int64
	h.db.Model(&models.Incident{}).
		Where("supplier_id = ? AND status IN ?", supplierID, []string{"open", "in_progress"}).
		Count(&pendingIncidents)

	h.db.Model(&models.Incident{}).
		Where("supplier_id = ? AND status = ?", supplierID, "resolved").
		Count(&resolvedIncidents)

	// Get recent orders
	var recentOrders []models.Order
	h.db.Where("supplier_id = ?", supplierID).
		Preload("Consumer").
		Preload("Consumer.User").
		Order("order_date DESC").
		Limit(10).
		Find(&recentOrders)

	// Get top products
	topProducts := h.getTopProducts(supplierID, startDate)

	response := DashboardResponse{
		Summary: map[string]interface{}{
			"period":     period,
			"start_date": startDate,
			"end_date":   time.Now(),
		},
		RecentOrders: recentOrders,
		TopProducts:  topProducts,
		KPIs: KPIResponse{
			OrderCount:        orderCount,
			GMV:               totalGMV,
			AverageOrderValue: avgOrderValue,
			ActiveConsumers:   activeConsumers,
			PendingIncidents:  pendingIncidents,
			ResolvedIncidents: resolvedIncidents,
		},
	}

	c.JSON(http.StatusOK, response)
}

// GetKPIs returns detailed KPI metrics
// @Summary Get KPI metrics
// @Description Get detailed KPI metrics (admin/owner only)
// @Tags analytics
// @Produce json
// @Security BearerAuth
// @Param start_date query string false "Start date (YYYY-MM-DD)"
// @Param end_date query string false "End date (YYYY-MM-DD)"
// @Success 200 {object} map[string]interface{}
// @Router /admin/analytics/kpis [get]
func (h *AnalyticsHandler) GetKPIs(c *gin.Context) {
	_, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// TODO: Get supplier ID from user relationship
	supplierID := uint(1) // Placeholder

	startDateStr := c.DefaultQuery("start_date", time.Now().AddDate(0, -1, 0).Format("2006-01-02"))
	endDateStr := c.DefaultQuery("end_date", time.Now().Format("2006-01-02"))

	startDate, _ := time.Parse("2006-01-02", startDateStr)
	endDate, _ := time.Parse("2006-01-02", endDateStr)

	// Order metrics
	var orderCount int64
	var totalRevenue, cancelledRevenue float64

	h.db.Model(&models.Order{}).
		Where("supplier_id = ? AND order_date BETWEEN ? AND ?", supplierID, startDate, endDate).
		Count(&orderCount)

	h.db.Model(&models.Order{}).
		Where("supplier_id = ? AND order_date BETWEEN ? AND ? AND status != ?",
			supplierID, startDate, endDate, "cancelled").
		Select("COALESCE(SUM(total), 0)").
		Scan(&totalRevenue)

	h.db.Model(&models.Order{}).
		Where("supplier_id = ? AND order_date BETWEEN ? AND ? AND status = ?",
			supplierID, startDate, endDate, "cancelled").
		Select("COALESCE(SUM(total), 0)").
		Scan(&cancelledRevenue)

	// Reorder rate calculation
	var repeatCustomers int64
	h.db.Raw(`
		SELECT COUNT(DISTINCT consumer_id) 
		FROM orders 
		WHERE supplier_id = ? 
		AND order_date BETWEEN ? AND ?
		AND consumer_id IN (
			SELECT consumer_id 
			FROM orders 
			WHERE supplier_id = ? 
			AND order_date < ?
		)
	`, supplierID, startDate, endDate, supplierID, startDate).Scan(&repeatCustomers)

	var totalCustomers int64
	h.db.Model(&models.Order{}).
		Where("supplier_id = ? AND order_date BETWEEN ? AND ?", supplierID, startDate, endDate).
		Distinct("consumer_id").
		Count(&totalCustomers)

	reorderRate := float64(0)
	if totalCustomers > 0 {
		reorderRate = (float64(repeatCustomers) / float64(totalCustomers)) * 100
	}

	// Chat response time (first response)
	var avgResponseTime float64
	h.db.Raw(`
		SELECT AVG(EXTRACT(EPOCH FROM (m.created_at - c.created_at))) / 60
		FROM chats c
		INNER JOIN messages m ON c.id = m.chat_id
		WHERE c.supplier_id = ?
		AND m.created_at = (
			SELECT MIN(created_at)
			FROM messages
			WHERE chat_id = c.id
			AND sender_id IN (
				SELECT id FROM users WHERE role IN ('sales', 'admin', 'owner')
			)
		)
	`, supplierID).Scan(&avgResponseTime)

	c.JSON(http.StatusOK, gin.H{
		"order_metrics": gin.H{
			"total_orders":      orderCount,
			"total_revenue":     totalRevenue,
			"cancelled_revenue": cancelledRevenue,
			"average_order_value": func() float64 {
				if orderCount > 0 {
					return totalRevenue / float64(orderCount)
				}
				return 0
			}(),
		},
		"customer_metrics": gin.H{
			"total_customers":  totalCustomers,
			"repeat_customers": repeatCustomers,
			"reorder_rate":     reorderRate,
		},
		"service_metrics": gin.H{
			"avg_first_response_time_minutes": avgResponseTime,
		},
		"period": gin.H{
			"start_date": startDate,
			"end_date":   endDate,
		},
	})
}

// GetComplaintsReport returns complaints/incidents report
// @Summary Get complaints report
// @Description Get detailed complaints and resolution report
// @Tags analytics
// @Produce json
// @Security BearerAuth
// @Param start_date query string false "Start date (YYYY-MM-DD)"
// @Param end_date query string false "End date (YYYY-MM-DD)"
// @Success 200 {object} map[string]interface{}
// @Router /owner/reports/complaints [get]
func (h *AnalyticsHandler) GetComplaintsReport(c *gin.Context) {
	_, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// TODO: Get supplier ID from user relationship
	supplierID := uint(1) // Placeholder

	startDateStr := c.Query("start_date")
	endDateStr := c.Query("end_date")

	query := h.db.Model(&models.Incident{}).Where("supplier_id = ?", supplierID)

	if startDateStr != "" && endDateStr != "" {
		startDate, _ := time.Parse("2006-01-02", startDateStr)
		endDate, _ := time.Parse("2006-01-02", endDateStr)
		query = query.Where("created_at BETWEEN ? AND ?", startDate, endDate)
	}

	// Count by status
	statusCounts := make(map[string]int64)
	statuses := []string{"open", "in_progress", "escalated", "resolved", "closed"}

	for _, status := range statuses {
		var count int64
		query.Where("status = ?", status).Count(&count)
		statusCounts[status] = count
	}

	// Count by priority
	priorityCounts := make(map[string]int64)
	priorities := []string{"low", "medium", "high", "urgent"}

	for _, priority := range priorities {
		var count int64
		h.db.Model(&models.Incident{}).
			Where("supplier_id = ? AND priority = ?", supplierID, priority).
			Count(&count)
		priorityCounts[priority] = count
	}

	// Average resolution time
	var avgResolutionHours float64
	h.db.Raw(`
		SELECT AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))) / 3600
		FROM incidents
		WHERE supplier_id = ?
		AND resolved_at IS NOT NULL
	`, supplierID).Scan(&avgResolutionHours)

	c.JSON(http.StatusOK, gin.H{
		"status_breakdown":     statusCounts,
		"priority_breakdown":   priorityCounts,
		"avg_resolution_hours": avgResolutionHours,
		"generated_at":         time.Now(),
	})
}

// GetPlatformAnalytics returns platform-wide analytics
// @Summary Get platform analytics
// @Description Get platform-wide analytics (platform admin only)
// @Tags analytics
// @Produce json
// @Security BearerAuth
// @Success 200 {object} map[string]interface{}
// @Router /platform/analytics/platform [get]
func (h *AnalyticsHandler) GetPlatformAnalytics(c *gin.Context) {
	var totalSuppliers, activeSuppliers, verifiedSuppliers int64
	var totalConsumers int64
	var totalOrders int64
	var totalRevenue float64

	h.db.Model(&models.Supplier{}).Count(&totalSuppliers)
	h.db.Model(&models.Supplier{}).Where("is_active = ?", true).Count(&activeSuppliers)
	h.db.Model(&models.Supplier{}).Where("is_verified = ?", true).Count(&verifiedSuppliers)
	h.db.Model(&models.Consumer{}).Count(&totalConsumers)
	h.db.Model(&models.Order{}).Count(&totalOrders)
	h.db.Model(&models.Order{}).
		Where("status != ?", "cancelled").
		Select("COALESCE(SUM(total), 0)").
		Scan(&totalRevenue)

	c.JSON(http.StatusOK, gin.H{
		"suppliers": gin.H{
			"total":    totalSuppliers,
			"active":   activeSuppliers,
			"verified": verifiedSuppliers,
		},
		"consumers": gin.H{
			"total": totalConsumers,
		},
		"orders": gin.H{
			"total":   totalOrders,
			"revenue": totalRevenue,
		},
		"generated_at": time.Now(),
	})
}

// Helper functions

func (h *AnalyticsHandler) getStartDate(period string) time.Time {
	now := time.Now()

	switch period {
	case "week":
		return now.AddDate(0, 0, -7)
	case "month":
		return now.AddDate(0, -1, 0)
	case "year":
		return now.AddDate(-1, 0, 0)
	default:
		return now.AddDate(0, -1, 0)
	}
}

func (h *AnalyticsHandler) getTopProducts(supplierID uint, startDate time.Time) []ProductStats {
	var stats []ProductStats

	h.db.Raw(`
		SELECT 
			p.id as product_id,
			p.name as product_name,
			SUM(oi.quantity) as total_sold,
			SUM(oi.total) as revenue
		FROM products p
		INNER JOIN order_items oi ON p.id = oi.product_id
		INNER JOIN orders o ON oi.order_id = o.id
		WHERE p.supplier_id = ?
		AND o.order_date >= ?
		AND o.status != 'cancelled'
		GROUP BY p.id, p.name
		ORDER BY revenue DESC
		LIMIT 10
	`, supplierID, startDate).Scan(&stats)

	return stats
}
