package handlers

import (
	"net/http"
	"strings"

	"ecommerce-backend/internal/middleware"
	"ecommerce-backend/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type OrderHandler struct {
	orderService services.OrderService
}

func NewOrderHandler(orderService services.OrderService) *OrderHandler {
	return &OrderHandler{orderService: orderService}
}

type CreateOrderRequest struct {
	IdempotencyKey  string `json:"idempotency_key"`
	ShippingName    string `json:"shipping_name" binding:"required"`
	ShippingEmail   string `json:"shipping_email" binding:"required,email"`
	ShippingPhone   string `json:"shipping_phone" binding:"required"`
	ShippingAddress string `json:"shipping_address" binding:"required"`
	ShippingCity    string `json:"shipping_city" binding:"required"`
}

type UpdateOrderStatusRequest struct {
	Status string `json:"status" binding:"required"`
}

func (h *OrderHandler) Create(c *gin.Context) {
	userID := c.MustGet(middleware.ContextUserIDKey).(uuid.UUID)

	var req CreateOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Please provide all required shipping information."})
		return
	}

	idempotencyKey := strings.TrimSpace(req.IdempotencyKey)
	if idempotencyKey == "" {
		idempotencyKey = strings.TrimSpace(c.GetHeader("X-Idempotency-Key"))
	}

	order, err := h.orderService.CreateOrder(c.Request.Context(), services.CreateOrderParams{
		UserID:          userID,
		IdempotencyKey:  idempotencyKey,
		ShippingName:    req.ShippingName,
		ShippingEmail:   req.ShippingEmail,
		ShippingPhone:   req.ShippingPhone,
		ShippingAddress: req.ShippingAddress,
		ShippingCity:    req.ShippingCity,
	})
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, order)
}

func (h *OrderHandler) ListUserOrders(c *gin.Context) {
	userID := c.MustGet(middleware.ContextUserIDKey).(uuid.UUID)
	orders, err := h.orderService.GetUserOrders(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch orders"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"orders": orders})
}

func (h *OrderHandler) GetByID(c *gin.Context) {
	userID := c.MustGet(middleware.ContextUserIDKey).(uuid.UUID)
	role := c.MustGet(middleware.ContextUserRole).(string)

	orderIDStr := c.Param("id")
	orderID, err := uuid.Parse(orderIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid order ID format"})
		return
	}

	var userPtr *uuid.UUID
	if role != "admin" {
		userPtr = &userID
	}

	order, err := h.orderService.GetOrderByID(c.Request.Context(), orderID, userPtr)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
		return
	}

	c.JSON(http.StatusOK, order)
}

func (h *OrderHandler) AdminList(c *gin.Context) {
	orders, err := h.orderService.AdminListOrders(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch orders"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"orders": orders})
}

func (h *OrderHandler) AdminUpdateStatus(c *gin.Context) {
	orderIDStr := c.Param("id")
	orderID, err := uuid.Parse(orderIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid order ID format"})
		return
	}

	var req UpdateOrderStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Status is required"})
		return
	}

	order, err := h.orderService.AdminUpdateOrderStatus(c.Request.Context(), orderID, req.Status)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, order)
}
