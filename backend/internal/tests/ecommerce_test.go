package tests

import (
	"bytes"
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"ecommerce-backend/internal/auth"
	"ecommerce-backend/internal/config"
	"ecommerce-backend/internal/database"
	"ecommerce-backend/internal/router"
	"ecommerce-backend/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

func setupTestEnvironment(t *testing.T) (*pgxpool.Pool, *config.Config, *gin.Engine, services.ChapaService) {
	gin.SetMode(gin.TestMode)
	cfg := config.Load()
	cfg.JWTSecret = "test-jwt-secret-key-32-bytes-long!!"
	cfg.ChapaWebhookSecret = "test-chapa-webhook-secret-12345"
	cfg.ChapaSecretKey = "mock-secret"

	pool, err := database.Connect(cfg.DatabaseURL)
	if err != nil {
		t.Fatalf("Failed to connect to test database: %v", err)
	}

	chapa := services.NewChapaService(cfg)
	r := router.Setup(pool, cfg, chapa)

	return pool, cfg, r, chapa
}

// 1. Test Password Hashing and JWT Token Verification
func TestAuthSecurity(t *testing.T) {
	password := "SecurePass123!"
	hash, err := auth.HashPassword(password)
	if err != nil {
		t.Fatalf("Failed to hash password: %v", err)
	}

	if !auth.CheckPassword(password, hash) {
		t.Errorf("Password check failed for correct password")
	}

	if auth.CheckPassword("WrongPassword", hash) {
		t.Errorf("Password check succeeded for invalid password")
	}

	userID := uuid.New()
	secret := "test-secret"
	token, err := auth.GenerateToken(userID, "test@example.com", "customer", secret, time.Hour)
	if err != nil {
		t.Fatalf("Token generation failed: %v", err)
	}

	claims, err := auth.ValidateToken(token, secret)
	if err != nil {
		t.Fatalf("Token validation failed: %v", err)
	}

	if claims.UserID != userID || claims.Email != "test@example.com" || claims.Role != "customer" {
		t.Errorf("Token claims mismatch: %+v", claims)
	}

	// Forged secret test
	if _, err := auth.ValidateToken(token, "wrong-secret"); err == nil {
		t.Errorf("Token validation should have failed with wrong secret")
	}
}

// 2. Test User Registration and Login Flow
func TestUserRegistrationAndLogin(t *testing.T) {
	pool, _, r, _ := setupTestEnvironment(t)
	defer pool.Close()

	email := fmt.Sprintf("testuser_%d@thriftflip.com", time.Now().UnixNano())

	// Register
	regPayload := map[string]string{
		"name":            "Test User",
		"email":           email,
		"password":        "TestPass123!",
		"confirmPassword": "TestPass123!",
	}
	regBody, _ := json.Marshal(regPayload)
	req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/register", bytes.NewBuffer(regBody))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusCreated {
		t.Fatalf("Expected 201 Created on registration, got %d: %s", w.Code, w.Body.String())
	}

	var regResp struct {
		Token string `json:"token"`
		User  struct {
			ID    string `json:"id"`
			Email string `json:"email"`
		} `json:"user"`
	}
	_ = json.Unmarshal(w.Body.Bytes(), &regResp)
	if regResp.Token == "" {
		t.Errorf("Expected JWT token in registration response")
	}

	// Prevent duplicate email registration
	wDup := httptest.NewRecorder()
	reqDup := httptest.NewRequest(http.MethodPost, "/api/v1/auth/register", bytes.NewBuffer(regBody))
	reqDup.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(wDup, reqDup)
	if wDup.Code != http.StatusConflict {
		t.Errorf("Expected 409 Conflict for duplicate email, got %d", wDup.Code)
	}

	// Login with correct credentials
	loginPayload := map[string]string{
		"email":    email,
		"password": "TestPass123!",
	}
	loginBody, _ := json.Marshal(loginPayload)
	wLog := httptest.NewRecorder()
	reqLog := httptest.NewRequest(http.MethodPost, "/api/v1/auth/login", bytes.NewBuffer(loginBody))
	reqLog.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(wLog, reqLog)

	if wLog.Code != http.StatusOK {
		t.Errorf("Expected 200 OK for valid login, got %d", wLog.Code)
	}

	// Login with wrong password
	loginFailPayload := map[string]string{
		"email":    email,
		"password": "WrongPassword!",
	}
	failBody, _ := json.Marshal(loginFailPayload)
	wFail := httptest.NewRecorder()
	reqFail := httptest.NewRequest(http.MethodPost, "/api/v1/auth/login", bytes.NewBuffer(failBody))
	reqFail.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(wFail, reqFail)

	if wFail.Code != http.StatusUnauthorized {
		t.Errorf("Expected 401 Unauthorized for invalid password, got %d", wFail.Code)
	}
}

// 3. Test Product Listing, Category Filter, and Search
func TestProductsAPI(t *testing.T) {
	pool, _, r, _ := setupTestEnvironment(t)
	defer pool.Close()

	// List all products
	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/api/v1/products", nil)
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK, got %d", w.Code)
	}

	var resp struct {
		Products []map[string]any `json:"products"`
		Total    int              `json:"total"`
	}
	_ = json.Unmarshal(w.Body.Bytes(), &resp)
	if resp.Total == 0 || len(resp.Products) == 0 {
		t.Errorf("Expected seeded products to be returned, got 0")
	}

	// Filter by category: men
	wMen := httptest.NewRecorder()
	reqMen := httptest.NewRequest(http.MethodGet, "/api/v1/products?category=men", nil)
	r.ServeHTTP(wMen, reqMen)

	var menResp struct {
		Products []struct {
			Category string `json:"category"`
		} `json:"products"`
	}
	_ = json.Unmarshal(wMen.Body.Bytes(), &menResp)
	for _, p := range menResp.Products {
		if p.Category != "men" {
			t.Errorf("Expected category 'men', got %s", p.Category)
		}
	}

	// Search product: "jeans"
	wSearch := httptest.NewRecorder()
	reqSearch := httptest.NewRequest(http.MethodGet, "/api/v1/products?search=jeans", nil)
	r.ServeHTTP(wSearch, reqSearch)

	var searchResp struct {
		Products []struct {
			Name string `json:"name"`
		} `json:"products"`
	}
	_ = json.Unmarshal(wSearch.Body.Bytes(), &searchResp)
	if len(searchResp.Products) == 0 {
		t.Errorf("Expected search for 'jeans' to return results")
	}
}

// 4. Test Cart Persistence, Stock Validation, and Item Management
func TestCartOperations(t *testing.T) {
	pool, cfg, r, _ := setupTestEnvironment(t)
	defer pool.Close()

	userID := uuid.New()
	_, err := pool.Exec(context.Background(), `
		INSERT INTO users (id, name, email, password_hash, role)
		VALUES ($1, 'Cart Tester', $2, 'hash', 'customer')
	`, userID, fmt.Sprintf("cart_%d@test.com", time.Now().UnixNano()))
	if err != nil {
		t.Fatalf("Failed to create test user: %v", err)
	}

	token, _ := auth.GenerateToken(userID, "cart@test.com", "customer", cfg.JWTSecret, time.Hour)

	// Add item 1 (White T-shirt) to cart
	addPayload := map[string]int{"product_id": 1, "quantity": 2}
	body, _ := json.Marshal(addPayload)
	wAdd := httptest.NewRecorder()
	reqAdd := httptest.NewRequest(http.MethodPost, "/api/v1/cart/items", bytes.NewBuffer(body))
	reqAdd.Header.Set("Authorization", "Bearer "+token)
	reqAdd.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(wAdd, reqAdd)

	if wAdd.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK on adding to cart, got %d: %s", wAdd.Code, wAdd.Body.String())
	}

	// Exceed stock test
	excessPayload := map[string]int{"product_id": 1, "quantity": 99999}
	exBody, _ := json.Marshal(excessPayload)
	wEx := httptest.NewRecorder()
	reqEx := httptest.NewRequest(http.MethodPost, "/api/v1/cart/items", bytes.NewBuffer(exBody))
	reqEx.Header.Set("Authorization", "Bearer "+token)
	reqEx.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(wEx, reqEx)

	if wEx.Code != http.StatusBadRequest {
		t.Errorf("Expected 400 Bad Request when exceeding stock, got %d", wEx.Code)
	}

	// Fetch cart
	wGet := httptest.NewRecorder()
	reqGet := httptest.NewRequest(http.MethodGet, "/api/v1/cart", nil)
	reqGet.Header.Set("Authorization", "Bearer "+token)
	r.ServeHTTP(wGet, reqGet)

	if wGet.Code != http.StatusOK {
		t.Errorf("Expected 200 OK on getting cart, got %d", wGet.Code)
	}

	// Clear cart
	wDel := httptest.NewRecorder()
	reqDel := httptest.NewRequest(http.MethodDelete, "/api/v1/cart", nil)
	reqDel.Header.Set("Authorization", "Bearer "+token)
	r.ServeHTTP(wDel, reqDel)

	if wDel.Code != http.StatusOK {
		t.Errorf("Expected 200 OK on clearing cart, got %d", wDel.Code)
	}
}

// 5. Test Order Creation, Payment Initialization, Verification, and Inventory Consistency
func TestOrderAndPaymentWorkflow(t *testing.T) {
	pool, cfg, r, chapa := setupTestEnvironment(t)
	defer pool.Close()

	ctx := context.Background()
	userID := uuid.New()
	_, _ = pool.Exec(ctx, `
		INSERT INTO users (id, name, email, password_hash, role)
		VALUES ($1, 'Order Tester', $2, 'hash', 'customer')
	`, userID, fmt.Sprintf("order_%d@test.com", time.Now().UnixNano()))

	token, _ := auth.GenerateToken(userID, "order@test.com", "customer", cfg.JWTSecret, time.Hour)

	// Add item 1 (quantity 2) to cart
	_, _ = pool.Exec(ctx, "INSERT INTO cart_items (user_id, product_id, quantity) VALUES ($1, 1, 2)", userID)

	// Get initial stock for product 1
	var initialStock int
	_ = pool.QueryRow(ctx, "SELECT stock FROM products WHERE id = 1").Scan(&initialStock)

	// Create order
	idempotencyKey := fmt.Sprintf("idemp-%d", time.Now().UnixNano())
	orderPayload := map[string]string{
		"idempotency_key":  idempotencyKey,
		"shipping_name":    "Abebe Bikila",
		"shipping_email":   "abebe@example.com",
		"shipping_phone":   "0911223344",
		"shipping_address": "Bole, Addis Ababa",
		"shipping_city":    "Addis Ababa",
	}
	ordBody, _ := json.Marshal(orderPayload)
	wOrd := httptest.NewRecorder()
	reqOrd := httptest.NewRequest(http.MethodPost, "/api/v1/orders", bytes.NewBuffer(ordBody))
	reqOrd.Header.Set("Authorization", "Bearer "+token)
	reqOrd.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(wOrd, reqOrd)

	if wOrd.Code != http.StatusCreated {
		t.Fatalf("Failed to create order, got %d: %s", wOrd.Code, wOrd.Body.String())
	}

	var ordResp struct {
		ID               string  `json:"id"`
		OrderNumber      string  `json:"order_number"`
		TotalAmount      float64 `json:"total_amount"`
		Status           string  `json:"status"`
		PaymentStatus    string  `json:"payment_status"`
		PaymentReference string  `json:"payment_reference"`
	}
	_ = json.Unmarshal(wOrd.Body.Bytes(), &ordResp)

	// Verify price calculation: Product 1 is 1400.00 ETB x 2 = 2800.00 ETB
	expectedTotal := 2800.00
	if ordResp.TotalAmount != expectedTotal {
		t.Errorf("Expected total amount %.2f ETB, got %.2f ETB", expectedTotal, ordResp.TotalAmount)
	}

	// Test duplicate order creation with same idempotency key
	wDupOrd := httptest.NewRecorder()
	reqDupOrd := httptest.NewRequest(http.MethodPost, "/api/v1/orders", bytes.NewBuffer(ordBody))
	reqDupOrd.Header.Set("Authorization", "Bearer "+token)
	reqDupOrd.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(wDupOrd, reqDupOrd)

	if wDupOrd.Code != http.StatusCreated && wDupOrd.Code != http.StatusOK {
		t.Errorf("Expected idempotent handling for order creation, got %d", wDupOrd.Code)
	}

	// Initialize Chapa payment
	initPayload := map[string]string{"order_id": ordResp.ID}
	initBody, _ := json.Marshal(initPayload)
	wInit := httptest.NewRecorder()
	reqInit := httptest.NewRequest(http.MethodPost, "/api/v1/payments/initialize", bytes.NewBuffer(initBody))
	reqInit.Header.Set("Authorization", "Bearer "+token)
	reqInit.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(wInit, reqInit)

	if wInit.Code != http.StatusOK {
		t.Fatalf("Failed to initialize payment, got %d: %s", wInit.Code, wInit.Body.String())
	}

	var payInitResp struct {
		CheckoutURL      string `json:"checkout_url"`
		PaymentReference string `json:"payment_reference"`
	}
	_ = json.Unmarshal(wInit.Body.Bytes(), &payInitResp)
	if payInitResp.CheckoutURL == "" || payInitResp.PaymentReference == "" {
		t.Fatalf("Expected checkout URL and payment reference from payment initialization")
	}

	// Verify payment server-side
	orderService := services.NewOrderService(pool, cfg, chapa)
	completedOrder, err := orderService.VerifyAndCompletePayment(ctx, payInitResp.PaymentReference)
	if err != nil {
		t.Fatalf("VerifyAndCompletePayment failed: %v", err)
	}

	if completedOrder.PaymentStatus != "paid" || completedOrder.Status != "paid" {
		t.Errorf("Expected paid status, got payment=%s status=%s", completedOrder.PaymentStatus, completedOrder.Status)
	}

	// Verify stock was decremented by 2
	var updatedStock int
	_ = pool.QueryRow(ctx, "SELECT stock FROM products WHERE id = 1").Scan(&updatedStock)
	if updatedStock != initialStock-2 {
		t.Errorf("Expected stock to be %d, got %d", initialStock-2, updatedStock)
	}

	// Duplicate verification must be idempotent and not decrement stock twice
	_, err = orderService.VerifyAndCompletePayment(ctx, payInitResp.PaymentReference)
	if err != nil {
		t.Fatalf("Second verification failed: %v", err)
	}

	var stockAfterSecondVerify int
	_ = pool.QueryRow(ctx, "SELECT stock FROM products WHERE id = 1").Scan(&stockAfterSecondVerify)
	if stockAfterSecondVerify != updatedStock {
		t.Errorf("Idempotency violation: stock was decremented twice! Expected %d, got %d", updatedStock, stockAfterSecondVerify)
	}
}

// 6. Test Webhook Signature and Duplicate Delivery
func TestPaymentWebhook(t *testing.T) {
	pool, cfg, r, chapa := setupTestEnvironment(t)
	defer pool.Close()

	payload := map[string]any{
		"event":     "charge.complete",
		"tx_ref":    "test-ref-webhook-1",
		"reference": "test-ref-webhook-1",
		"status":    "success",
		"amount":    1400.00,
	}
	rawBody, _ := json.Marshal(payload)

	// Valid HMAC signature
	mac := hmac.New(sha256.New, []byte(cfg.ChapaWebhookSecret))
	mac.Write(rawBody)
	validSig := hex.EncodeToString(mac.Sum(nil))

	if !chapa.ValidateWebhookSignature(rawBody, validSig) {
		t.Errorf("Signature validation failed for valid signature")
	}

	if chapa.ValidateWebhookSignature(rawBody, "invalid-forged-signature") {
		t.Errorf("Signature validation succeeded for forged signature!")
	}

	// Test webhook endpoint rejection with invalid signature
	wBad := httptest.NewRecorder()
	reqBad := httptest.NewRequest(http.MethodPost, "/api/v1/payments/webhook", bytes.NewBuffer(rawBody))
	reqBad.Header.Set("x-chapa-signature", "invalid-signature")
	reqBad.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(wBad, reqBad)

	if wBad.Code != http.StatusUnauthorized {
		t.Errorf("Expected 401 Unauthorized for bad webhook signature, got %d", wBad.Code)
	}
}

// 7. Test Customer Order Ownership & Admin Authorization
func TestRoleAuthorization(t *testing.T) {
	pool, cfg, r, _ := setupTestEnvironment(t)
	defer pool.Close()

	customerID := uuid.New()
	adminID := uuid.New()

	customerToken, _ := auth.GenerateToken(customerID, "cust@test.com", "customer", cfg.JWTSecret, time.Hour)
	adminToken, _ := auth.GenerateToken(adminID, "admin@test.com", "admin", cfg.JWTSecret, time.Hour)

	// Customer attempting to access admin order list
	wForbidden := httptest.NewRecorder()
	reqForbidden := httptest.NewRequest(http.MethodGet, "/api/v1/admin/orders", nil)
	reqForbidden.Header.Set("Authorization", "Bearer "+customerToken)
	r.ServeHTTP(wForbidden, reqForbidden)

	if wForbidden.Code != http.StatusForbidden {
		t.Errorf("Expected 403 Forbidden for customer accessing admin endpoint, got %d", wForbidden.Code)
	}

	// Admin accessing admin order list
	wAdmin := httptest.NewRecorder()
	reqAdmin := httptest.NewRequest(http.MethodGet, "/api/v1/admin/orders", nil)
	reqAdmin.Header.Set("Authorization", "Bearer "+adminToken)
	r.ServeHTTP(wAdmin, reqAdmin)

	if wAdmin.Code != http.StatusOK {
		t.Errorf("Expected 200 OK for admin accessing admin endpoint, got %d", wAdmin.Code)
	}
}

// 8. Test Non-Existent Payment Reference Verification
func TestPaymentVerificationNonExistent(t *testing.T) {
	pool, _, r, _ := setupTestEnvironment(t)
	defer pool.Close()

	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/api/v1/payments/verify/non-existent-ref-99999", nil)
	r.ServeHTTP(w, req)

	if w.Code == http.StatusOK {
		t.Errorf("Expected verification to fail for non-existent reference, got 200 OK")
	}
}

// 9. Test Customer Order Privacy (Customer B cannot view Customer A's order)
func TestCustomerOrderPrivacy(t *testing.T) {
	pool, cfg, r, _ := setupTestEnvironment(t)
	defer pool.Close()

	ctx := context.Background()
	userA := uuid.New()
	userB := uuid.New()

	_, _ = pool.Exec(ctx, "INSERT INTO users (id, name, email, password_hash, role) VALUES ($1, 'User A', $2, 'hash', 'customer')", userA, fmt.Sprintf("usera_%d@test.com", time.Now().UnixNano()))
	_, _ = pool.Exec(ctx, "INSERT INTO users (id, name, email, password_hash, role) VALUES ($1, 'User B', $2, 'hash', 'customer')", userB, fmt.Sprintf("userb_%d@test.com", time.Now().UnixNano()))

	tokenB, _ := auth.GenerateToken(userB, "userb@test.com", "customer", cfg.JWTSecret, time.Hour)

	// Create order belonging to User A
	orderA := uuid.New()
	_, err := pool.Exec(ctx, `
		INSERT INTO orders (id, user_id, order_number, total_amount, currency, shipping_name, shipping_email, shipping_phone, shipping_address, shipping_city, status, payment_status)
		VALUES ($1, $2, 'ORD-PRIVACY-01', 1200.00, 'ETB', 'User A', 'usera@test.com', '0911000000', 'Bole', 'Addis Ababa', 'awaiting_payment', 'pending')
	`, orderA, userA)
	if err != nil {
		t.Fatalf("Failed to create user A order: %v", err)
	}

	// User B tries to view User A's order
	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, fmt.Sprintf("/api/v1/orders/%s", orderA.String()), nil)
	req.Header.Set("Authorization", "Bearer "+tokenB)
	r.ServeHTTP(w, req)

	if w.Code != http.StatusNotFound && w.Code != http.StatusForbidden {
		t.Errorf("Privacy violation: User B accessed User A's order! Expected 404 or 403, got %d", w.Code)
	}
}
