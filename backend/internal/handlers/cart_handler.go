package handlers

import (
	"errors"
	"net/http"
	"strconv"

	"ecommerce-backend/internal/middleware"
	"ecommerce-backend/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type CartHandler struct {
	pool *pgxpool.Pool
}

func NewCartHandler(pool *pgxpool.Pool) *CartHandler {
	return &CartHandler{pool: pool}
}

type AddCartItemRequest struct {
	ProductID int `json:"product_id" binding:"required"`
	Quantity  int `json:"quantity"`
}

type UpdateCartItemRequest struct {
	Quantity int `json:"quantity" binding:"required"`
}

type MergeCartItem struct {
	ProductID int `json:"product_id" binding:"required"`
	Quantity  int `json:"quantity" binding:"required,gt=0"`
}

type MergeCartRequest struct {
	Items []MergeCartItem `json:"items" binding:"required"`
}

func (h *CartHandler) GetCart(c *gin.Context) {
	userID := c.MustGet(middleware.ContextUserIDKey).(uuid.UUID)
	ctx := c.Request.Context()

	rows, err := h.pool.Query(ctx, `
		SELECT c.id, c.user_id, c.product_id, c.quantity, c.created_at, c.updated_at,
		       p.name, p.description, p.price, p.category, p.image_url, p.stock, p.is_active
		FROM cart_items c
		JOIN products p ON c.product_id = p.id
		WHERE c.user_id = $1
		ORDER BY c.created_at ASC
	`, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch cart"})
		return
	}
	defer rows.Close()

	var items []models.CartItem
	var subtotal float64
	var totalQty int

	for rows.Next() {
		var it models.CartItem
		var p models.Product
		if err := rows.Scan(
			&it.ID, &it.UserID, &it.ProductID, &it.Quantity, &it.CreatedAt, &it.UpdatedAt,
			&p.Name, &p.Description, &p.Price, &p.Category, &p.ImageURL, &p.Stock, &p.IsActive,
		); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read cart items"})
			return
		}
		p.ID = it.ProductID
		it.Product = &p
		items = append(items, it)
		subtotal += p.Price * float64(it.Quantity)
		totalQty += it.Quantity
	}

	c.JSON(http.StatusOK, models.CartResponse{
		Items:    items,
		TotalQty: totalQty,
		Subtotal: subtotal,
	})
}

func (h *CartHandler) AddItem(c *gin.Context) {
	userID := c.MustGet(middleware.ContextUserIDKey).(uuid.UUID)

	var req AddCartItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product or quantity"})
		return
	}
	if req.Quantity <= 0 {
		req.Quantity = 1
	}

	ctx := c.Request.Context()

	// Check product existence and available stock
	var p models.Product
	err := h.pool.QueryRow(ctx, `
		SELECT id, name, price, stock, is_active
		FROM products
		WHERE id = $1
	`, req.ProductID).Scan(&p.ID, &p.Name, &p.Price, &p.Stock, &p.IsActive)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Product does not exist"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	if !p.IsActive {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Product is no longer available"})
		return
	}

	// Fetch existing cart item quantity if already in cart
	var currentQty int
	err = h.pool.QueryRow(ctx, `
		SELECT quantity FROM cart_items WHERE user_id = $1 AND product_id = $2
	`, userID, req.ProductID).Scan(&currentQty)

	newQty := req.Quantity
	if err == nil {
		newQty += currentQty
	}

	if newQty > p.Stock {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Requested quantity exceeds available stock (" + strconv.Itoa(p.Stock) + " in stock)"})
		return
	}

	_, err = h.pool.Exec(ctx, `
		INSERT INTO cart_items (user_id, product_id, quantity, created_at, updated_at)
		VALUES ($1, $2, $3, NOW(), NOW())
		ON CONFLICT (user_id, product_id)
		DO UPDATE SET quantity = $3, updated_at = NOW()
	`, userID, req.ProductID, newQty)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add product to cart"})
		return
	}

	h.GetCart(c)
}

func (h *CartHandler) UpdateItem(c *gin.Context) {
	userID := c.MustGet(middleware.ContextUserIDKey).(uuid.UUID)
	idStr := c.Param("id")
	cartItemID, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid cart item ID"})
		return
	}

	var req UpdateCartItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Quantity is required"})
		return
	}

	ctx := c.Request.Context()

	// If quantity <= 0, remove item
	if req.Quantity <= 0 {
		_, err := h.pool.Exec(ctx, "DELETE FROM cart_items WHERE id = $1 AND user_id = $2", cartItemID, userID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove item"})
			return
		}
		h.GetCart(c)
		return
	}

	// Verify stock
	var stock int
	err = h.pool.QueryRow(ctx, `
		SELECT p.stock
		FROM cart_items c
		JOIN products p ON c.product_id = p.id
		WHERE c.id = $1 AND c.user_id = $2
	`, cartItemID, userID).Scan(&stock)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Cart item not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	if req.Quantity > stock {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Requested quantity exceeds available stock (" + strconv.Itoa(stock) + " in stock)"})
		return
	}

	_, err = h.pool.Exec(ctx, "UPDATE cart_items SET quantity = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3", req.Quantity, cartItemID, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update quantity"})
		return
	}

	h.GetCart(c)
}

func (h *CartHandler) RemoveItem(c *gin.Context) {
	userID := c.MustGet(middleware.ContextUserIDKey).(uuid.UUID)
	idStr := c.Param("id")
	cartItemID, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid cart item ID"})
		return
	}

	ctx := c.Request.Context()
	_, err = h.pool.Exec(ctx, "DELETE FROM cart_items WHERE id = $1 AND user_id = $2", cartItemID, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove item"})
		return
	}

	h.GetCart(c)
}

func (h *CartHandler) ClearCart(c *gin.Context) {
	userID := c.MustGet(middleware.ContextUserIDKey).(uuid.UUID)
	ctx := c.Request.Context()

	_, err := h.pool.Exec(ctx, "DELETE FROM cart_items WHERE user_id = $1", userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear cart"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Cart cleared successfully"})
}

func (h *CartHandler) MergeCart(c *gin.Context) {
	userID := c.MustGet(middleware.ContextUserIDKey).(uuid.UUID)

	var req MergeCartRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid merge items payload"})
		return
	}

	ctx := c.Request.Context()
	tx, err := h.pool.Begin(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Transaction error"})
		return
	}
	defer tx.Rollback(ctx)

	for _, item := range req.Items {
		var stock int
		var isActive bool
		err := tx.QueryRow(ctx, "SELECT stock, is_active FROM products WHERE id = $1", item.ProductID).Scan(&stock, &isActive)
		if err != nil || !isActive || stock <= 0 {
			continue // skip unavailable items
		}

		var existingQty int
		err = tx.QueryRow(ctx, "SELECT quantity FROM cart_items WHERE user_id = $1 AND product_id = $2", userID, item.ProductID).Scan(&existingQty)

		finalQty := item.Quantity
		if err == nil {
			finalQty += existingQty
		}

		if finalQty > stock {
			finalQty = stock
		}

		_, err = tx.Exec(ctx, `
			INSERT INTO cart_items (user_id, product_id, quantity, created_at, updated_at)
			VALUES ($1, $2, $3, NOW(), NOW())
			ON CONFLICT (user_id, product_id)
			DO UPDATE SET quantity = $3, updated_at = NOW()
		`, userID, item.ProductID, finalQty)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to merge cart item"})
			return
		}
	}

	if err := tx.Commit(ctx); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit merge"})
		return
	}

	h.GetCart(c)
}
