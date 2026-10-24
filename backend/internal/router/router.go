package router

import (
	"ecommerce-backend/internal/config"
	"ecommerce-backend/internal/handlers"
	"ecommerce-backend/internal/middleware"
	"ecommerce-backend/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

func Setup(pool *pgxpool.Pool, cfg *config.Config, chapa services.ChapaService) *gin.Engine {
	r := gin.Default()

	// Apply CORS
	r.Use(middleware.CORS(cfg.CORSOrigin))

	// Instantiate services & handlers
	orderService := services.NewOrderService(pool, cfg, chapa)

	authHandler := handlers.NewAuthHandler(pool, cfg)
	productHandler := handlers.NewProductHandler(pool)
	cartHandler := handlers.NewCartHandler(pool)
	orderHandler := handlers.NewOrderHandler(orderService)
	paymentHandler := handlers.NewPaymentHandler(orderService)
	contactHandler := handlers.NewContactHandler(pool)
	healthHandler := handlers.NewHealthHandler(pool)

	// Health check endpoints
	r.GET("/health", healthHandler.Health)

	api := r.Group("/api/v1")
	{
		api.GET("/health", healthHandler.Health)

		// Public Auth
		authGroup := api.Group("/auth")
		{
			authGroup.POST("/register", authHandler.Register)
			authGroup.POST("/login", authHandler.Login)
			authGroup.POST("/logout", authHandler.Logout)
			authGroup.GET("/me", middleware.AuthRequired(cfg.JWTSecret), authHandler.Me)
		}

		// Public Products
		api.GET("/products", productHandler.List)
		api.GET("/products/:id", productHandler.GetByID)

		// Public Contact
		api.POST("/contact", contactHandler.Submit)

		// Payment Webhook (signature validated inside handler)
		api.POST("/payments/webhook", paymentHandler.Webhook)

		// Public/Optional-Auth Verification (called when customer returns from Chapa checkout)
		api.GET("/payments/verify/:reference", middleware.OptionalAuth(cfg.JWTSecret), paymentHandler.Verify)
		api.GET("/payments/verify", middleware.OptionalAuth(cfg.JWTSecret), paymentHandler.Verify)

		// Protected Cart Routes
		cartGroup := api.Group("/cart", middleware.AuthRequired(cfg.JWTSecret))
		{
			cartGroup.GET("", cartHandler.GetCart)
			cartGroup.POST("/items", cartHandler.AddItem)
			cartGroup.PUT("/items/:id", cartHandler.UpdateItem)
			cartGroup.DELETE("/items/:id", cartHandler.RemoveItem)
			cartGroup.DELETE("", cartHandler.ClearCart)
			cartGroup.POST("/merge", cartHandler.MergeCart)
		}

		// Protected Customer Orders
		orderGroup := api.Group("/orders", middleware.AuthRequired(cfg.JWTSecret))
		{
			orderGroup.POST("", orderHandler.Create)
			orderGroup.GET("", orderHandler.ListUserOrders)
			orderGroup.GET("/:id", orderHandler.GetByID)
		}

		// Protected Payment Initialization
		paymentGroup := api.Group("/payments", middleware.AuthRequired(cfg.JWTSecret))
		{
			paymentGroup.POST("/initialize", paymentHandler.Initialize)
		}

		// Admin Routes
		adminGroup := api.Group("/admin", middleware.AuthRequired(cfg.JWTSecret), middleware.AdminRequired())
		{
			adminGroup.POST("/products", productHandler.AdminCreate)
			adminGroup.PUT("/products/:id", productHandler.AdminUpdate)
			adminGroup.DELETE("/products/:id", productHandler.AdminDelete)

			adminGroup.GET("/orders", orderHandler.AdminList)
			adminGroup.PUT("/orders/:id/status", orderHandler.AdminUpdateStatus)

			adminGroup.GET("/contacts", contactHandler.AdminList)
		}
	}

	return r
}
