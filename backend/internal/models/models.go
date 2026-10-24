package models

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID           uuid.UUID `json:"id"`
	Name         string    `json:"name"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"`
	Role         string    `json:"role"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type Product struct {
	ID          int       `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Price       float64   `json:"price"`
	Category    string    `json:"category"`
	ImageURL    string    `json:"image_url"`
	Stock       int       `json:"stock"`
	IsActive    bool      `json:"is_active"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type CartItem struct {
	ID        int       `json:"id"`
	UserID    uuid.UUID `json:"user_id"`
	ProductID int       `json:"product_id"`
	Quantity  int       `json:"quantity"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	Product   *Product  `json:"product,omitempty"`
}

type CartResponse struct {
	Items    []CartItem `json:"items"`
	TotalQty int        `json:"total_quantity"`
	Subtotal float64    `json:"subtotal"`
}

type Order struct {
	ID               uuid.UUID   `json:"id"`
	UserID           uuid.UUID   `json:"user_id"`
	OrderNumber      string      `json:"order_number"`
	TotalAmount      float64     `json:"total_amount"`
	TotalAmountCents int64       `json:"total_amount_cents"`
	Currency         string      `json:"currency"`
	ShippingName     string      `json:"shipping_name"`
	ShippingEmail    string      `json:"shipping_email"`
	ShippingPhone    string      `json:"shipping_phone"`
	ShippingAddress  string      `json:"shipping_address"`
	ShippingCity     string      `json:"shipping_city"`
	Status           string      `json:"status"`
	PaymentStatus    string      `json:"payment_status"`
	PaymentReference string      `json:"payment_reference,omitempty"`
	IdempotencyKey   string      `json:"idempotency_key,omitempty"`
	CreatedAt        time.Time   `json:"created_at"`
	UpdatedAt        time.Time   `json:"updated_at"`
	Items            []OrderItem `json:"items,omitempty"`
}

type OrderItem struct {
	ID           int       `json:"id"`
	OrderID      uuid.UUID `json:"order_id"`
	ProductID    int       `json:"product_id"`
	ProductName  string    `json:"product_name"`
	ProductPrice float64   `json:"product_price"`
	Quantity     int       `json:"quantity"`
	Subtotal     float64   `json:"subtotal"`
	CreatedAt    time.Time `json:"created_at"`
	ImageURL     string    `json:"image_url,omitempty"`
}

type Payment struct {
	ID                int        `json:"id"`
	OrderID           uuid.UUID  `json:"order_id"`
	CustomerID        *uuid.UUID `json:"customer_id,omitempty"`
	Reference         string     `json:"reference"`
	MerchantReference string     `json:"merchant_reference"`
	ChapaReference    string     `json:"chapa_reference,omitempty"`
	Provider          string     `json:"provider"`
	Amount            float64    `json:"amount"`
	AmountInCents     int64      `json:"amount_in_cents"`
	Currency          string     `json:"currency"`
	Status            string     `json:"status"`
	PaymentMethod     string     `json:"payment_method,omitempty"`
	FailureReason     string     `json:"failure_reason,omitempty"`
	CheckoutURL       string     `json:"checkout_url,omitempty"`
	RawInitResponse   any        `json:"raw_init_response,omitempty"`
	RawVerifyResponse any        `json:"raw_verify_response,omitempty"`
	InitializedAt     time.Time  `json:"initialized_at"`
	VerifiedAt        *time.Time `json:"verified_at,omitempty"`
	CreatedAt         time.Time  `json:"created_at"`
	UpdatedAt         time.Time  `json:"updated_at"`
}

type PaymentEvent struct {
	ID        int       `json:"id"`
	Reference string    `json:"reference"`
	EventType string    `json:"event_type"`
	Payload   any       `json:"payload"`
	Signature string    `json:"signature,omitempty"`
	Processed bool      `json:"processed"`
	CreatedAt time.Time `json:"created_at"`
}

type ContactMessage struct {
	ID        int       `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Subject   string    `json:"subject"`
	Message   string    `json:"message"`
	CreatedAt time.Time `json:"created_at"`
}
