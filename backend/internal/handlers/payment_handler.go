package handlers

import (
	"io"
	"net/http"
	"strings"

	"ecommerce-backend/internal/middleware"
	"ecommerce-backend/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type PaymentHandler struct {
	orderService services.OrderService
}

func NewPaymentHandler(orderService services.OrderService) *PaymentHandler {
	return &PaymentHandler{orderService: orderService}
}

type InitPaymentRequest struct {
	OrderID string `json:"order_id" binding:"required"`
}

func (h *PaymentHandler) Initialize(c *gin.Context) {
	userID := c.MustGet(middleware.ContextUserIDKey).(uuid.UUID)

	var req InitPaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Valid order_id is required"})
		return
	}

	orderID, err := uuid.Parse(req.OrderID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid order ID format"})
		return
	}

	order, checkoutURL, err := h.orderService.InitializeOrderPayment(c.Request.Context(), orderID, userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"checkout_url":       checkoutURL,
		"payment_reference":  order.PaymentReference,
		"merchant_reference": order.PaymentReference,
		"amount":             order.TotalAmount,
		"currency":           order.Currency,
		"order":              order,
	})
}

func (h *PaymentHandler) Verify(c *gin.Context) {
	reference := strings.TrimSpace(c.Param("reference"))
	if reference == "" {
		reference = strings.TrimSpace(c.Query("reference"))
	}
	if reference == "" {
		reference = strings.TrimSpace(c.Query("tx_ref"))
	}
	if reference == "" {
		reference = strings.TrimSpace(c.Query("trx_ref"))
	}
	if reference == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Payment reference is required"})
		return
	}

	order, err := h.orderService.VerifyAndCompletePayment(c.Request.Context(), reference)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Payment verified and order confirmed",
		"status":  order.PaymentStatus,
		"order":   order,
	})
}

func (h *PaymentHandler) Webhook(c *gin.Context) {
	signature := c.GetHeader("x-chapa-signature")

	rawBody, err := io.ReadAll(c.Request.Body)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to read request body"})
		return
	}

	if err := h.orderService.HandleWebhookEvent(c.Request.Context(), rawBody, signature); err != nil {
		if strings.Contains(strings.ToLower(err.Error()), "signature") {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid webhook signature"})
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "received"})
}
