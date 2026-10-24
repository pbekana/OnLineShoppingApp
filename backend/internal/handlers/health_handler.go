package handlers

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

type HealthHandler struct {
	pool *pgxpool.Pool
}

func NewHealthHandler(pool *pgxpool.Pool) *HealthHandler {
	return &HealthHandler{pool: pool}
}

func (h *HealthHandler) Health(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 2*time.Second)
	defer cancel()

	dbStatus := "connected"
	if err := h.pool.Ping(ctx); err != nil {
		dbStatus = "unavailable"
	}

	c.JSON(http.StatusOK, gin.H{
		"status":   "ok",
		"service":  "The Thrift-flip Store API",
		"database": dbStatus,
		"time":     time.Now().UTC().Format(time.RFC3339),
	})
}
