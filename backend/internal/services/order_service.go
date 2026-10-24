package services

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"math"
	"strings"
	"time"

	"ecommerce-backend/internal/config"
	"ecommerce-backend/internal/models"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type CreateOrderParams struct {
	UserID          uuid.UUID
	IdempotencyKey  string
	ShippingName    string
	ShippingEmail   string
	ShippingPhone   string
	ShippingAddress string
	ShippingCity    string
}

type OrderService interface {
	CreateOrder(ctx context.Context, params CreateOrderParams) (*models.Order, error)
	InitializeOrderPayment(ctx context.Context, orderID uuid.UUID, userID uuid.UUID) (*models.Order, string, error)
	VerifyAndCompletePayment(ctx context.Context, reference string) (*models.Order, error)
	HandleWebhookEvent(ctx context.Context, rawBody []byte, signature string) error
	GetUserOrders(ctx context.Context, userID uuid.UUID) ([]models.Order, error)
	GetOrderByID(ctx context.Context, orderID uuid.UUID, userID *uuid.UUID) (*models.Order, error)
	AdminListOrders(ctx context.Context) ([]models.Order, error)
	AdminUpdateOrderStatus(ctx context.Context, orderID uuid.UUID, newStatus string) (*models.Order, error)
}

type orderServiceImpl struct {
	pool  *pgxpool.Pool
	cfg   *config.Config
	chapa ChapaService
}

func NewOrderService(pool *pgxpool.Pool, cfg *config.Config, chapa ChapaService) OrderService {
	return &orderServiceImpl{
		pool:  pool,
		cfg:   cfg,
		chapa: chapa,
	}
}

func (s *orderServiceImpl) CreateOrder(ctx context.Context, params CreateOrderParams) (*models.Order, error) {
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	// Idempotency check: if an order with this key already exists for this user, return it
	if params.IdempotencyKey != "" {
		var existingID uuid.UUID
		err := tx.QueryRow(ctx, "SELECT id FROM orders WHERE idempotency_key = $1 AND user_id = $2", params.IdempotencyKey, params.UserID).Scan(&existingID)
		if err == nil {
			order, err := s.getOrderByIDTx(ctx, tx, existingID)
			if err == nil {
				return order, nil
			}
		}
	}

	// Fetch user cart items with row locking on products to prevent race conditions & overselling
	rows, err := tx.Query(ctx, `
		SELECT c.product_id, c.quantity, p.name, p.price, p.stock
		FROM cart_items c
		JOIN products p ON c.product_id = p.id
		WHERE c.user_id = $1 AND p.is_active = true
		FOR UPDATE OF p
	`, params.UserID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch cart items: %w", err)
	}
	defer rows.Close()

	type itemDetail struct {
		productID int
		quantity  int
		name      string
		price     float64
		stock     int
	}

	var items []itemDetail
	var totalAmountCents int64

	for rows.Next() {
		var it itemDetail
		if err := rows.Scan(&it.productID, &it.quantity, &it.name, &it.price, &it.stock); err != nil {
			return nil, fmt.Errorf("error reading cart item: %w", err)
		}
		if it.quantity > it.stock {
			return nil, fmt.Errorf("insufficient stock for product '%s'. Requested %d, available %d", it.name, it.quantity, it.stock)
		}
		// Precise integer monetary calculation in minor units (cents)
		priceCents := int64(math.Round(it.price * 100))
		subtotalCents := priceCents * int64(it.quantity)
		totalAmountCents += subtotalCents
		items = append(items, it)
	}
	rows.Close()

	if len(items) == 0 {
		return nil, errors.New("cart is empty")
	}

	totalAmount := float64(totalAmountCents) / 100.0
	orderNumber := fmt.Sprintf("ORD-%s-%s", time.Now().Format("20060102"), strings.ToUpper(uuid.New().String()[:8]))
	orderID := uuid.New()

	_, err = tx.Exec(ctx, `
		INSERT INTO orders (
			id, user_id, order_number, total_amount, total_amount_cents, currency,
			shipping_name, shipping_email, shipping_phone, shipping_address, shipping_city,
			status, payment_status, idempotency_key, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'awaiting_payment', 'pending', $12, NOW(), NOW())
	`, orderID, params.UserID, orderNumber, totalAmount, totalAmountCents, s.cfg.PaymentCurrency,
		params.ShippingName, params.ShippingEmail, params.ShippingPhone, params.ShippingAddress, params.ShippingCity,
		params.IdempotencyKey)
	if err != nil {
		return nil, fmt.Errorf("failed to insert order: %w", err)
	}

	for _, it := range items {
		priceCents := int64(math.Round(it.price * 100))
		subtotal := float64(priceCents*int64(it.quantity)) / 100.0
		_, err = tx.Exec(ctx, `
			INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity, subtotal, created_at)
			VALUES ($1, $2, $3, $4, $5, $6, NOW())
		`, orderID, it.productID, it.name, it.price, it.quantity, subtotal)
		if err != nil {
			return nil, fmt.Errorf("failed to insert order item: %w", err)
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("failed to commit order creation: %w", err)
	}

	return s.GetOrderByID(ctx, orderID, &params.UserID)
}

func (s *orderServiceImpl) InitializeOrderPayment(ctx context.Context, orderID uuid.UUID, userID uuid.UUID) (*models.Order, string, error) {
	order, err := s.GetOrderByID(ctx, orderID, &userID)
	if err != nil {
		return nil, "", err
	}

	if order.PaymentStatus == "paid" {
		return nil, "", errors.New("order is already paid")
	}

	// Idempotency: check if an existing pending payment record with checkout URL exists
	var existingRef, existingCheckoutURL string
	err = s.pool.QueryRow(ctx, `
		SELECT reference, COALESCE(checkout_url, '') 
		FROM payments 
		WHERE order_id = $1 AND status = 'pending' AND checkout_url IS NOT NULL AND checkout_url != ''
		ORDER BY created_at DESC LIMIT 1
	`, order.ID).Scan(&existingRef, &existingCheckoutURL)
	if err == nil && existingCheckoutURL != "" {
		order.PaymentReference = existingRef
		return order, existingCheckoutURL, nil
	}

	// Generate unique merchant tracking reference satisfying Chapa's requirement
	merchantRef := fmt.Sprintf("thrift-%s-%d", strings.ReplaceAll(order.OrderNumber, "-", ""), time.Now().Unix())

	// Split name into first and last name
	names := strings.SplitN(strings.TrimSpace(order.ShippingName), " ", 2)
	firstName := names[0]
	lastName := "Customer"
	if len(names) > 1 && names[1] != "" {
		lastName = names[1]
	}

	// Ensure amount is in integer cents (minor units)
	amountCents := order.TotalAmountCents
	if amountCents == 0 {
		amountCents = int64(math.Round(order.TotalAmount * 100))
	}

	initReq := &ChapaInitRequest{
		Amount:            amountCents, // Integer minor units (e.g. 250000 cents for 2500.00 ETB)
		Currency:          s.cfg.PaymentCurrency,
		MerchantReference: merchantRef,
		Customer: ChapaCustomer{
			FirstName:   firstName,
			LastName:    lastName,
			Email:       order.ShippingEmail,
			PhoneNumber: order.ShippingPhone,
		},
		CallbackURL: fmt.Sprintf("%s/api/v1/payments/webhook", s.cfg.FrontendURL),
		ReturnURL:   fmt.Sprintf("%s/checkout/result?reference=%s", s.cfg.FrontendURL, merchantRef),
		Meta: map[string]string{
			"order_id":     order.ID.String(),
			"order_number": order.OrderNumber,
			"platform":     "ThriftFlipStore",
		},
		IdempotencyKey: fmt.Sprintf("idem-%s", merchantRef),
	}

	initResp, err := s.chapa.InitializePayment(initReq)
	if err != nil {
		return nil, "", fmt.Errorf("failed to initialize payment with Chapa: %w", err)
	}

	rawRespJSON, _ := json.Marshal(initResp)

	// Save payment record and attach reference to order atomically
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return nil, "", err
	}
	defer tx.Rollback(ctx)

	_, err = tx.Exec(ctx, `
		UPDATE orders SET payment_reference = $1, updated_at = NOW() WHERE id = $2
	`, merchantRef, order.ID)
	if err != nil {
		return nil, "", fmt.Errorf("failed to update order payment reference: %w", err)
	}

	chapaRef := initResp.Data.ChapaReference
	_, err = tx.Exec(ctx, `
		INSERT INTO payments (
			order_id, customer_id, reference, merchant_reference, chapa_reference,
			provider, amount, amount_in_cents, currency, status, checkout_url,
			raw_init_response, initialized_at, created_at, updated_at
		)
		VALUES ($1, $2, $3, $3, $4, 'chapa', $5, $6, $7, 'pending', $8, $9, NOW(), NOW(), NOW())
		ON CONFLICT (reference) DO UPDATE SET 
			checkout_url = EXCLUDED.checkout_url, 
			chapa_reference = EXCLUDED.chapa_reference,
			raw_init_response = EXCLUDED.raw_init_response,
			updated_at = NOW()
	`, order.ID, order.UserID, merchantRef, chapaRef, order.TotalAmount, amountCents, s.cfg.PaymentCurrency, initResp.Data.CheckoutURL, rawRespJSON)
	if err != nil {
		return nil, "", fmt.Errorf("failed to save payment record: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, "", err
	}

	order.PaymentReference = merchantRef
	return order, initResp.Data.CheckoutURL, nil
}

func (s *orderServiceImpl) VerifyAndCompletePayment(ctx context.Context, reference string) (*models.Order, error) {
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to start database transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	// Lock the order row FOR UPDATE to prevent race conditions and duplicate decrementing
	var order models.Order
	err = tx.QueryRow(ctx, `
		SELECT id, user_id, order_number, total_amount, COALESCE(total_amount_cents, 0), currency, 
		       shipping_name, shipping_email, shipping_phone, shipping_address, shipping_city, 
		       status, payment_status, COALESCE(payment_reference, ''), COALESCE(idempotency_key, ''), 
		       created_at, updated_at
		FROM orders
		WHERE payment_reference = $1 OR id::text = $1
		FOR UPDATE
	`, reference).Scan(
		&order.ID, &order.UserID, &order.OrderNumber, &order.TotalAmount, &order.TotalAmountCents, &order.Currency,
		&order.ShippingName, &order.ShippingEmail, &order.ShippingPhone, &order.ShippingAddress, &order.ShippingCity,
		&order.Status, &order.PaymentStatus, &order.PaymentReference, &order.IdempotencyKey, &order.CreatedAt, &order.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, fmt.Errorf("no order found for payment reference '%s'", reference)
		}
		return nil, err
	}

	// Idempotency check: if order is already marked as paid, return it immediately without re-decrementing stock
	if order.PaymentStatus == "paid" {
		_ = tx.Commit(ctx)
		return s.GetOrderByID(ctx, order.ID, nil)
	}

	// Independently verify payment with Chapa's server-side verification endpoint
	verifyResp, err := s.chapa.VerifyPayment(reference)
	if err != nil {
		// Record failed verification attempt safely
		_, _ = tx.Exec(ctx, "UPDATE payments SET status = 'failed', failure_reason = $1, updated_at = NOW() WHERE reference = $2", err.Error(), reference)
		_, _ = tx.Exec(ctx, "UPDATE orders SET payment_status = 'failed', updated_at = NOW() WHERE id = $1", order.ID)
		_ = tx.Commit(ctx)
		return nil, fmt.Errorf("chapa verification failed: %w", err)
	}

	// Distinguish top-level API status from transaction status
	if !strings.EqualFold(verifyResp.Status, "success") || !strings.EqualFold(verifyResp.Data.Status, "success") {
		_, _ = tx.Exec(ctx, "UPDATE payments SET status = 'failed', failure_reason = $1, updated_at = NOW() WHERE reference = $2", "Transaction status is "+verifyResp.Data.Status, reference)
		_ = tx.Commit(ctx)
		return nil, fmt.Errorf("payment not completed: transaction status is '%s'", verifyResp.Data.Status)
	}

	// In live mode, verify currency and amount
	if !s.chapa.IsTestMode() {
		if verifyResp.Data.Currency != "" && !strings.EqualFold(verifyResp.Data.Currency, order.Currency) {
			return nil, fmt.Errorf("currency mismatch: expected %s, got %s", order.Currency, verifyResp.Data.Currency)
		}

		// Amount verification supporting both integer minor units (cents) and major units
		if verifyResp.Data.Amount != nil {
			var verifiedAmountCents int64
			switch v := verifyResp.Data.Amount.(type) {
			case float64:
				// If amount is small (like 2500.00), it's major unit; if large (like 250000), it's minor unit
				if v >= float64(order.TotalAmountCents)*0.9 && v <= float64(order.TotalAmountCents)*1.1 {
					verifiedAmountCents = int64(math.Round(v))
				} else {
					verifiedAmountCents = int64(math.Round(v * 100))
				}
			case string:
				var parsed float64
				fmt.Sscanf(v, "%f", &parsed)
				if parsed >= float64(order.TotalAmountCents)*0.9 && parsed <= float64(order.TotalAmountCents)*1.1 {
					verifiedAmountCents = int64(math.Round(parsed))
				} else {
					verifiedAmountCents = int64(math.Round(parsed * 100))
				}
			}

			expectedCents := order.TotalAmountCents
			if expectedCents == 0 {
				expectedCents = int64(math.Round(order.TotalAmount * 100))
			}

			if verifiedAmountCents > 0 && verifiedAmountCents != expectedCents {
				return nil, fmt.Errorf("payment amount mismatch: expected %d cents, got %d cents", expectedCents, verifiedAmountCents)
			}
		}
	}

	// Atomically deduct inventory for each order item within the transaction
	rows, err := tx.Query(ctx, "SELECT product_id, quantity FROM order_items WHERE order_id = $1", order.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch order items for inventory update: %w", err)
	}
	defer rows.Close()

	type ordItem struct {
		productID int
		quantity  int
	}
	var items []ordItem
	for rows.Next() {
		var oi ordItem
		if err := rows.Scan(&oi.productID, &oi.quantity); err != nil {
			return nil, err
		}
		items = append(items, oi)
	}
	rows.Close()

	for _, oi := range items {
		_, err := tx.Exec(ctx, `
			UPDATE products 
			SET stock = GREATEST(stock - $1, 0), updated_at = NOW()
			WHERE id = $2
		`, oi.quantity, oi.productID)
		if err != nil {
			return nil, fmt.Errorf("failed to deduct inventory for product %d: %w", oi.productID, err)
		}
	}

	rawVerifyJSON, _ := json.Marshal(verifyResp)

	// Update order to paid
	_, err = tx.Exec(ctx, `
		UPDATE orders 
		SET payment_status = 'paid', status = 'paid', updated_at = NOW()
		WHERE id = $1
	`, order.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to update order payment status: %w", err)
	}

	// Update payment record
	now := time.Now()
	paymentMethod := verifyResp.Data.PaymentMethod
	if paymentMethod == "" {
		paymentMethod = "chapa"
	}
	chapaReference := verifyResp.Data.ChapaReference

	_, err = tx.Exec(ctx, `
		UPDATE payments 
		SET status = 'paid', 
		    chapa_reference = COALESCE(NULLIF($1, ''), chapa_reference),
		    payment_method = $2, 
		    raw_verify_response = $3, 
		    verified_at = $4, 
		    updated_at = $4
		WHERE reference = $5 OR order_id = $6
	`, chapaReference, paymentMethod, rawVerifyJSON, now, reference, order.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to update payment record: %w", err)
	}

	// Clear user cart items after successful payment
	_, _ = tx.Exec(ctx, "DELETE FROM cart_items WHERE user_id = $1", order.UserID)

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("failed to commit payment completion: %w", err)
	}

	return s.GetOrderByID(ctx, order.ID, nil)
}

func (s *orderServiceImpl) HandleWebhookEvent(ctx context.Context, rawBody []byte, signature string) error {
	// Constant-time signature verification
	if !s.chapa.ValidateWebhookSignature(rawBody, signature) {
		return errors.New("invalid or missing webhook signature")
	}

	var payload struct {
		Event             string `json:"event"`
		TxRef             string `json:"tx_ref"`
		Reference         string `json:"reference"`
		MerchantReference string `json:"merchant_reference"`
		Status            string `json:"status"`
	}

	if err := json.Unmarshal(rawBody, &payload); err != nil {
		return fmt.Errorf("invalid webhook JSON: %w", err)
	}

	ref := payload.MerchantReference
	if ref == "" {
		ref = payload.TxRef
	}
	if ref == "" {
		ref = payload.Reference
	}
	if ref == "" {
		return errors.New("missing transaction reference in webhook payload")
	}

	// Record event for auditing and safe duplicate handling
	var eventExists bool
	err := s.pool.QueryRow(ctx, "SELECT EXISTS (SELECT 1 FROM payment_events WHERE reference = $1 AND event_type = $2)", ref, payload.Event).Scan(&eventExists)
	if err == nil && eventExists {
		// Duplicate webhook received; safely ignore and acknowledge
		return nil
	}

	_, _ = s.pool.Exec(ctx, `
		INSERT INTO payment_events (reference, event_type, payload, signature, processed, created_at)
		VALUES ($1, $2, $3, $4, true, NOW())
	`, ref, payload.Event, rawBody, signature)

	// Never trust webhook fields alone; independently verify with Chapa before marking order paid
	if strings.EqualFold(payload.Status, "success") || strings.Contains(strings.ToLower(payload.Event), "success") || strings.Contains(strings.ToLower(payload.Event), "charge.complete") {
		_, err := s.VerifyAndCompletePayment(ctx, ref)
		return err
	}

	return nil
}

func (s *orderServiceImpl) GetUserOrders(ctx context.Context, userID uuid.UUID) ([]models.Order, error) {
	rows, err := s.pool.Query(ctx, `
		SELECT id, user_id, order_number, total_amount, COALESCE(total_amount_cents, 0), currency, 
		       shipping_name, shipping_email, shipping_phone, shipping_address, shipping_city, 
		       status, payment_status, COALESCE(payment_reference, ''), COALESCE(idempotency_key, ''), 
		       created_at, updated_at
		FROM orders
		WHERE user_id = $1
		ORDER BY created_at DESC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var orders []models.Order
	for rows.Next() {
		var o models.Order
		if err := rows.Scan(
			&o.ID, &o.UserID, &o.OrderNumber, &o.TotalAmount, &o.TotalAmountCents, &o.Currency,
			&o.ShippingName, &o.ShippingEmail, &o.ShippingPhone, &o.ShippingAddress, &o.ShippingCity,
			&o.Status, &o.PaymentStatus, &o.PaymentReference, &o.IdempotencyKey, &o.CreatedAt, &o.UpdatedAt,
		); err != nil {
			return nil, err
		}
		orders = append(orders, o)
	}
	rows.Close()

	for i := range orders {
		items, err := s.getOrderItems(ctx, orders[i].ID)
		if err == nil {
			orders[i].Items = items
		}
	}

	return orders, nil
}

func (s *orderServiceImpl) GetOrderByID(ctx context.Context, orderID uuid.UUID, userID *uuid.UUID) (*models.Order, error) {
	query := `
		SELECT id, user_id, order_number, total_amount, COALESCE(total_amount_cents, 0), currency, 
		       shipping_name, shipping_email, shipping_phone, shipping_address, shipping_city, 
		       status, payment_status, COALESCE(payment_reference, ''), COALESCE(idempotency_key, ''), 
		       created_at, updated_at
		FROM orders
		WHERE id = $1
	`
	args := []any{orderID}
	if userID != nil {
		query += " AND user_id = $2"
		args = append(args, *userID)
	}

	var o models.Order
	err := s.pool.QueryRow(ctx, query, args...).Scan(
		&o.ID, &o.UserID, &o.OrderNumber, &o.TotalAmount, &o.TotalAmountCents, &o.Currency,
		&o.ShippingName, &o.ShippingEmail, &o.ShippingPhone, &o.ShippingAddress, &o.ShippingCity,
		&o.Status, &o.PaymentStatus, &o.PaymentReference, &o.IdempotencyKey, &o.CreatedAt, &o.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	items, err := s.getOrderItems(ctx, o.ID)
	if err == nil {
		o.Items = items
	}

	return &o, nil
}

func (s *orderServiceImpl) getOrderByIDTx(ctx context.Context, tx pgx.Tx, orderID uuid.UUID) (*models.Order, error) {
	var o models.Order
	err := tx.QueryRow(ctx, `
		SELECT id, user_id, order_number, total_amount, COALESCE(total_amount_cents, 0), currency, 
		       shipping_name, shipping_email, shipping_phone, shipping_address, shipping_city, 
		       status, payment_status, COALESCE(payment_reference, ''), COALESCE(idempotency_key, ''), 
		       created_at, updated_at
		FROM orders
		WHERE id = $1
	`, orderID).Scan(
		&o.ID, &o.UserID, &o.OrderNumber, &o.TotalAmount, &o.TotalAmountCents, &o.Currency,
		&o.ShippingName, &o.ShippingEmail, &o.ShippingPhone, &o.ShippingAddress, &o.ShippingCity,
		&o.Status, &o.PaymentStatus, &o.PaymentReference, &o.IdempotencyKey, &o.CreatedAt, &o.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	rows, err := tx.Query(ctx, `
		SELECT oi.id, oi.order_id, oi.product_id, oi.product_name, oi.product_price, oi.quantity, oi.subtotal, oi.created_at, COALESCE(p.image_url, '')
		FROM order_items oi
		LEFT JOIN products p ON oi.product_id = p.id
		WHERE oi.order_id = $1
	`, orderID)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var it models.OrderItem
			if err := rows.Scan(&it.ID, &it.OrderID, &it.ProductID, &it.ProductName, &it.ProductPrice, &it.Quantity, &it.Subtotal, &it.CreatedAt, &it.ImageURL); err == nil {
				o.Items = append(o.Items, it)
			}
		}
	}

	return &o, nil
}

func (s *orderServiceImpl) getOrderItems(ctx context.Context, orderID uuid.UUID) ([]models.OrderItem, error) {
	rows, err := s.pool.Query(ctx, `
		SELECT oi.id, oi.order_id, oi.product_id, oi.product_name, oi.product_price, oi.quantity, oi.subtotal, oi.created_at, COALESCE(p.image_url, '')
		FROM order_items oi
		LEFT JOIN products p ON oi.product_id = p.id
		WHERE oi.order_id = $1
	`, orderID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []models.OrderItem
	for rows.Next() {
		var it models.OrderItem
		if err := rows.Scan(&it.ID, &it.OrderID, &it.ProductID, &it.ProductName, &it.ProductPrice, &it.Quantity, &it.Subtotal, &it.CreatedAt, &it.ImageURL); err != nil {
			return nil, err
		}
		items = append(items, it)
	}
	return items, nil
}

func (s *orderServiceImpl) AdminListOrders(ctx context.Context) ([]models.Order, error) {
	rows, err := s.pool.Query(ctx, `
		SELECT id, user_id, order_number, total_amount, COALESCE(total_amount_cents, 0), currency, 
		       shipping_name, shipping_email, shipping_phone, shipping_address, shipping_city, 
		       status, payment_status, COALESCE(payment_reference, ''), COALESCE(idempotency_key, ''), 
		       created_at, updated_at
		FROM orders
		ORDER BY created_at DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var orders []models.Order
	for rows.Next() {
		var o models.Order
		if err := rows.Scan(
			&o.ID, &o.UserID, &o.OrderNumber, &o.TotalAmount, &o.TotalAmountCents, &o.Currency,
			&o.ShippingName, &o.ShippingEmail, &o.ShippingPhone, &o.ShippingAddress, &o.ShippingCity,
			&o.Status, &o.PaymentStatus, &o.PaymentReference, &o.IdempotencyKey, &o.CreatedAt, &o.UpdatedAt,
		); err != nil {
			return nil, err
		}
		orders = append(orders, o)
	}
	rows.Close()

	for i := range orders {
		items, err := s.getOrderItems(ctx, orders[i].ID)
		if err == nil {
			orders[i].Items = items
		}
	}

	return orders, nil
}

func (s *orderServiceImpl) AdminUpdateOrderStatus(ctx context.Context, orderID uuid.UUID, newStatus string) (*models.Order, error) {
	order, err := s.GetOrderByID(ctx, orderID, nil)
	if err != nil {
		return nil, err
	}

	validTransitions := map[string][]string{
		"awaiting_payment": {"paid", "cancelled"},
		"paid":             {"processing", "cancelled"},
		"processing":       {"shipped", "cancelled"},
		"shipped":          {"delivered", "cancelled"},
		"delivered":        {},
		"cancelled":        {},
	}

	allowed, ok := validTransitions[order.Status]
	if !ok {
		return nil, fmt.Errorf("unknown current order status: %s", order.Status)
	}

	isAllowed := false
	for _, a := range allowed {
		if a == newStatus {
			isAllowed = true
			break
		}
	}

	if !isAllowed {
		return nil, fmt.Errorf("invalid status transition from '%s' to '%s'", order.Status, newStatus)
	}

	_, err = s.pool.Exec(ctx, "UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2", newStatus, orderID)
	if err != nil {
		return nil, fmt.Errorf("failed to update status: %w", err)
	}

	return s.GetOrderByID(ctx, orderID, nil)
}
