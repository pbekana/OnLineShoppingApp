package handlers

import (
	"net/http"
	"strings"

	"ecommerce-backend/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ContactHandler struct {
	pool *pgxpool.Pool
}

func NewContactHandler(pool *pgxpool.Pool) *ContactHandler {
	return &ContactHandler{pool: pool}
}

type ContactRequest struct {
	Name    string `json:"name" binding:"required"`
	Email   string `json:"email" binding:"required,email"`
	Subject string `json:"subject" binding:"required"`
	Message string `json:"message" binding:"required"`
}

func (h *ContactHandler) Submit(c *gin.Context) {
	var req ContactRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Please provide your name, valid email, subject, and message."})
		return
	}

	req.Email = strings.TrimSpace(strings.ToLower(req.Email))
	ctx := c.Request.Context()

	var id int
	err := h.pool.QueryRow(ctx, `
		INSERT INTO contact_messages (name, email, subject, message, created_at)
		VALUES ($1, $2, $3, $4, NOW())
		RETURNING id
	`, req.Name, req.Email, req.Subject, req.Message).Scan(&id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save message. Please try again later."})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Thank you for reaching out! We have received your message and will get back to you shortly.",
		"id":      id,
	})
}

func (h *ContactHandler) AdminList(c *gin.Context) {
	ctx := c.Request.Context()
	rows, err := h.pool.Query(ctx, `
		SELECT id, name, email, subject, message, created_at
		FROM contact_messages
		ORDER BY created_at DESC
	`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch contact messages"})
		return
	}
	defer rows.Close()

	var messages []models.ContactMessage
	for rows.Next() {
		var m models.ContactMessage
		if err := rows.Scan(&m.ID, &m.Name, &m.Email, &m.Subject, &m.Message, &m.CreatedAt); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error reading contact messages"})
			return
		}
		messages = append(messages, m)
	}

	c.JSON(http.StatusOK, gin.H{"messages": messages})
}
