package routes

import (
	"csci361/config"
	"csci361/handlers"
	"csci361/middleware"
	ws "csci361/websocket"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func Initialize(r *gin.Engine, db *gorm.DB, cfg *config.Config) {
	// Initialize handlers
	authHandler := handlers.NewAuthHandler(db, cfg)
	userHandler := handlers.NewUserHandler(db)
	supplierHandler := handlers.NewSupplierHandler(db)
	consumerHandler := handlers.NewConsumerHandler(db)
	productHandler := handlers.NewProductHandler(db)
	orderHandler := handlers.NewOrderHandler(db)
	chatHandler := handlers.NewChatHandler(db)
	incidentHandler := handlers.NewIncidentHandler(db)
	analyticsHandler := handlers.NewAnalyticsHandler(db)

	// Initialize WebSocket hub
	wsHub := ws.NewHub()
	go wsHub.Run()

	// API v1 routes
	v1 := r.Group("/api/v1")

	// Public routes (no authentication required)
	public := v1.Group("/")
	{
		public.POST("/auth/register", authHandler.Register)
		public.POST("/auth/login", authHandler.Login)
		public.POST("/auth/refresh", authHandler.RefreshToken)
		public.GET("/categories", productHandler.GetCategories)
	}

	// Protected routes (authentication required)
	protected := v1.Group("/")
	protected.Use(middleware.AuthMiddleware(cfg))
	{
		// User profile routes
		protected.GET("/profile", userHandler.GetProfile)
		protected.PUT("/profile", userHandler.UpdateProfile)
		protected.POST("/profile/avatar", userHandler.UploadAvatar)

		// Consumer routes
		consumer := protected.Group("/consumer")
		consumer.Use(middleware.RoleMiddleware("consumer"))
		{
			consumer.GET("/suppliers", consumerHandler.GetAvailableSuppliers)
			consumer.POST("/suppliers/:id/link", consumerHandler.RequestLink)
			consumer.GET("/links", consumerHandler.GetMyLinks)
			consumer.DELETE("/links/:id", consumerHandler.RemoveLink)
			consumer.GET("/products", productHandler.GetProductsForConsumer)
			consumer.GET("/orders", orderHandler.GetConsumerOrders)
			consumer.POST("/orders", orderHandler.CreateOrder)
			consumer.GET("/chats", chatHandler.GetConsumerChats)
			consumer.POST("/incidents", incidentHandler.CreateIncident)
		}

		// Sales routes (for supplier sales staff)
		sales := protected.Group("/sales")
		sales.Use(middleware.RoleMiddleware("sales"))
		{
			sales.GET("/link-requests", supplierHandler.GetLinkRequests)
			sales.PUT("/link-requests/:id", supplierHandler.HandleLinkRequest)
			sales.GET("/consumers", consumerHandler.GetLinkedConsumers)
			sales.GET("/orders", orderHandler.GetSupplierOrders)
			sales.PUT("/orders/:id/status", orderHandler.UpdateOrderStatus)
			sales.GET("/chats", chatHandler.GetSupplierChats)
			sales.POST("/chats/:id/escalate", chatHandler.EscalateChat)
			sales.GET("/incidents", incidentHandler.GetSupplierIncidents)
			sales.PUT("/incidents/:id", incidentHandler.UpdateIncident)
		}

		// Admin routes (for supplier admins)
		admin := protected.Group("/admin")
		admin.Use(middleware.RoleMiddleware("admin", "owner"))
		{
			admin.GET("/users", userHandler.GetUsers)
			admin.POST("/users", userHandler.CreateUser)
			admin.PUT("/users/:id", userHandler.UpdateUser)
			admin.DELETE("/users/:id", userHandler.DeleteUser)

			admin.GET("/products", productHandler.GetProducts)
			admin.POST("/products", productHandler.CreateProduct)
			admin.PUT("/products/:id", productHandler.UpdateProduct)
			admin.DELETE("/products/:id", productHandler.DeleteProduct)
			admin.POST("/products/:id/images", productHandler.UploadProductImages)

			admin.POST("/categories", productHandler.CreateCategory)
			admin.PUT("/categories/:id", productHandler.UpdateCategory)
			admin.DELETE("/categories/:id", productHandler.DeleteCategory)

			admin.GET("/orders", orderHandler.GetAllOrders)
			admin.GET("/analytics", analyticsHandler.GetDashboard)
			admin.GET("/analytics/kpis", analyticsHandler.GetKPIs)

			admin.GET("/incidents", incidentHandler.GetAllIncidents)
			admin.PUT("/incidents/:id/assign", incidentHandler.AssignIncident)
			admin.PUT("/incidents/:id/resolve", incidentHandler.ResolveIncident)

			admin.GET("/subscription", supplierHandler.GetSubscription)
			admin.PUT("/subscription", supplierHandler.UpdateSubscription)
		}

		// Owner-only routes
		owner := protected.Group("/owner")
		owner.Use(middleware.RoleMiddleware("owner"))
		{
			owner.GET("/reports/complaints", analyticsHandler.GetComplaintsReport)
			owner.GET("/reports/transcripts", chatHandler.ExportTranscripts)
			owner.GET("/reports/incidents", incidentHandler.ExportIncidents)
		}

		// Platform admin routes (for platform administrators)
		platform := protected.Group("/platform")
		platform.Use(middleware.RoleMiddleware("platform_admin"))
		{
			platform.GET("/suppliers", supplierHandler.GetAllSuppliers)
			platform.PUT("/suppliers/:id/verify", supplierHandler.VerifySupplier)
			platform.PUT("/suppliers/:id/suspend", supplierHandler.SuspendSupplier)
			platform.GET("/subscriptions", supplierHandler.GetAllSubscriptions)
			platform.GET("/analytics/platform", analyticsHandler.GetPlatformAnalytics)
		}

		// WebSocket endpoint
		protected.GET("/ws", func(c *gin.Context) {
			ws.HandleWebSocket(wsHub, c.Writer, c.Request, db)
		})
	}
}
