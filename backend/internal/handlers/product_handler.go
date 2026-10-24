package handlers

import (
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"ecommerce-backend/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ProductHandler struct {
	pool *pgxpool.Pool
}

func NewProductHandler(pool *pgxpool.Pool) *ProductHandler {
	return &ProductHandler{pool: pool}
}

type ProductListResponse struct {
	Products   []models.Product `json:"products"`
	Total      int              `json:"total"`
	Page       int              `json:"page"`
	Limit      int              `json:"limit"`
	TotalPages int              `json:"total_pages"`
}

func (h *ProductHandler) List(c *gin.Context) {
	category := strings.ToLower(strings.TrimSpace(c.Query("category")))
	search := strings.TrimSpace(c.Query("search"))
	if search == "" {
		search = strings.TrimSpace(c.Query("q"))
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	if page < 1 {
		page = 1
	}
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	if limit < 1 || limit > 100 {
		limit = 20
	}
	offset := (page - 1) * limit

	ctx := c.Request.Context()

	var whereClauses []string
	var args []any
	argIdx := 1

	whereClauses = append(whereClauses, "is_active = true")

	if category != "" {
		whereClauses = append(whereClauses, fmt.Sprintf("category = $%d", argIdx))
		args = append(args, category)
		argIdx++
	}

	if search != "" {
		whereClauses = append(whereClauses, fmt.Sprintf("(name ILIKE $%d OR description ILIKE $%d)", argIdx, argIdx))
		args = append(args, "%"+search+"%")
		argIdx++
	}

	whereSQL := " WHERE " + strings.Join(whereClauses, " AND ")

	// Count total
	countQuery := "SELECT COUNT(*) FROM products" + whereSQL
	var total int
	if err := h.pool.QueryRow(ctx, countQuery, args...).Scan(&total); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count products"})
		return
	}

	// Fetch items
	selectQuery := fmt.Sprintf(`
		SELECT id, name, description, price, category, image_url, stock, is_active, created_at, updated_at
		FROM products
		%s
		ORDER BY id ASC
		LIMIT $%d OFFSET $%d
	`, whereSQL, argIdx, argIdx+1)
	args = append(args, limit, offset)

	rows, err := h.pool.Query(ctx, selectQuery, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch products"})
		return
	}
	defer rows.Close()

	var products []models.Product
	for rows.Next() {
		var p models.Product
		if err := rows.Scan(
			&p.ID, &p.Name, &p.Description, &p.Price, &p.Category,
			&p.ImageURL, &p.Stock, &p.IsActive, &p.CreatedAt, &p.UpdatedAt,
		); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error scanning products"})
			return
		}
		products = append(products, p)
	}

	totalPages := (total + limit - 1) / limit
	if totalPages < 1 {
		totalPages = 1
	}

	c.JSON(http.StatusOK, ProductListResponse{
		Products:   products,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	})
}

func (h *ProductHandler) GetByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
		return
	}

	ctx := c.Request.Context()
	var p models.Product
	err = h.pool.QueryRow(ctx, `
		SELECT id, name, description, price, category, image_url, stock, is_active, created_at, updated_at
		FROM products
		WHERE id = $1
	`, id).Scan(
		&p.ID, &p.Name, &p.Description, &p.Price, &p.Category,
		&p.ImageURL, &p.Stock, &p.IsActive, &p.CreatedAt, &p.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	c.JSON(http.StatusOK, p)
}

type ProductInput struct {
	Name        string  `json:"name" binding:"required"`
	Description string  `json:"description" binding:"required"`
	Price       float64 `json:"price" binding:"required,gt=0"`
	Category    string  `json:"category" binding:"required"`
	ImageURL    string  `json:"image_url" binding:"required"`
	Stock       int     `json:"stock" binding:"gte=0"`
	IsActive    *bool   `json:"is_active"`
}

func (h *ProductHandler) AdminCreate(c *gin.Context) {
	var req ProductInput
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	req.Category = strings.ToLower(strings.TrimSpace(req.Category))
	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}

	ctx := c.Request.Context()
	var p models.Product
	err := h.pool.QueryRow(ctx, `
		INSERT INTO products (name, description, price, category, image_url, stock, is_active, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
		RETURNING id, name, description, price, category, image_url, stock, is_active, created_at, updated_at
	`, req.Name, req.Description, req.Price, req.Category, req.ImageURL, req.Stock, isActive).Scan(
		&p.ID, &p.Name, &p.Description, &p.Price, &p.Category,
		&p.ImageURL, &p.Stock, &p.IsActive, &p.CreatedAt, &p.UpdatedAt,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create product"})
		return
	}

	c.JSON(http.StatusCreated, p)
}

func (h *ProductHandler) AdminUpdate(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
		return
	}

	var req ProductInput
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	req.Category = strings.ToLower(strings.TrimSpace(req.Category))
	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}

	ctx := c.Request.Context()
	var p models.Product
	err = h.pool.QueryRow(ctx, `
		UPDATE products 
		SET name = $1, description = $2, price = $3, category = $4, image_url = $5, stock = $6, is_active = $7, updated_at = NOW()
		WHERE id = $8
		RETURNING id, name, description, price, category, image_url, stock, is_active, created_at, updated_at
	`, req.Name, req.Description, req.Price, req.Category, req.ImageURL, req.Stock, isActive, id).Scan(
		&p.ID, &p.Name, &p.Description, &p.Price, &p.Category,
		&p.ImageURL, &p.Stock, &p.IsActive, &p.CreatedAt, &p.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update product"})
		return
	}

	c.JSON(http.StatusOK, p)
}

func (h *ProductHandler) AdminDelete(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
		return
	}

	ctx := c.Request.Context()
	// Soft delete to protect order history integrity
	res, err := h.pool.Exec(ctx, "UPDATE products SET is_active = false, updated_at = NOW() WHERE id = $1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete product"})
		return
	}
	if res.RowsAffected() == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Product deactivated successfully"})
}
