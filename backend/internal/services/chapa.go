package services

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"ecommerce-backend/internal/config"
)

type ChapaCustomer struct {
	FirstName   string `json:"first_name,omitempty"`
	LastName    string `json:"last_name,omitempty"`
	Email       string `json:"email,omitempty"`
	PhoneNumber string `json:"phone_number,omitempty"`
}

type ChapaInitRequest struct {
	Amount            int64             `json:"amount"` // Integer minor units (e.g. cents/santim: 2500.00 ETB = 250000)
	Currency          string            `json:"currency"`
	MerchantReference string            `json:"merchant_reference"`
	Customer          ChapaCustomer     `json:"customer"`
	CallbackURL       string            `json:"callback_url,omitempty"`
	ReturnURL         string            `json:"return_url,omitempty"`
	Meta              map[string]string `json:"meta,omitempty"`
	IdempotencyKey    string            `json:"-"`
}

type ChapaInitResponse struct {
	Status  string `json:"status"`
	Message string `json:"message"`
	Data    struct {
		CheckoutURL    string `json:"checkout_url"`
		ChapaReference string `json:"chapa_reference,omitempty"`
	} `json:"data"`
}

type ChapaVerifyResponse struct {
	Status  string `json:"status"`
	Message string `json:"message"`
	Data    struct {
		ChapaReference    string `json:"chapa_reference"`
		MerchantReference string `json:"merchant_reference"`
		Amount            any    `json:"amount"` // Can be returned as integer cents or number
		Currency          string `json:"currency"`
		Status            string `json:"status"`
		PaymentMethod     string `json:"payment_method,omitempty"`
		Customer          struct {
			FirstName   string `json:"first_name,omitempty"`
			LastName    string `json:"last_name,omitempty"`
			Email       string `json:"email,omitempty"`
			PhoneNumber string `json:"phone_number,omitempty"`
		} `json:"customer,omitempty"`
		CreatedAt string `json:"created_at,omitempty"`
		UpdatedAt string `json:"updated_at,omitempty"`
	} `json:"data"`
}

type ChapaService interface {
	InitializePayment(req *ChapaInitRequest) (*ChapaInitResponse, error)
	VerifyPayment(reference string) (*ChapaVerifyResponse, error)
	ValidateWebhookSignature(rawBody []byte, signature string) bool
	IsTestMode() bool
}

type chapaServiceImpl struct {
	cfg        *config.Config
	httpClient *http.Client
}

func NewChapaService(cfg *config.Config) ChapaService {
	return &chapaServiceImpl{
		cfg: cfg,
		httpClient: &http.Client{
			Timeout: 20 * time.Second,
		},
	}
}

func (s *chapaServiceImpl) IsTestMode() bool {
	return s.cfg.ChapaSecretKey == "" || strings.HasPrefix(s.cfg.ChapaSecretKey, "mock") || strings.HasPrefix(s.cfg.ChapaSecretKey, "test")
}

func (s *chapaServiceImpl) InitializePayment(req *ChapaInitRequest) (*ChapaInitResponse, error) {
	if s.IsTestMode() {
		// Local development test mode when merchant secret is not yet provided
		checkoutURL := fmt.Sprintf("%s/checkout/result?reference=%s&test_mode=true", s.cfg.FrontendURL, req.MerchantReference)
		return &ChapaInitResponse{
			Status:  "success",
			Message: "Hosted payment url generated (Test Mode)",
			Data: struct {
				CheckoutURL    string `json:"checkout_url"`
				ChapaReference string `json:"chapa_reference,omitempty"`
			}{
				CheckoutURL:    checkoutURL,
				ChapaReference: "MOCK-CHAPA-" + req.MerchantReference,
			},
		}, nil
	}

	bodyBytes, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal chapa v2 payload: %w", err)
	}

	url := fmt.Sprintf("%s/hosted", strings.TrimSuffix(s.cfg.ChapaBaseURL, "/"))
	httpReq, err := http.NewRequest(http.MethodPost, url, bytes.NewBuffer(bodyBytes))
	if err != nil {
		return nil, fmt.Errorf("failed to construct http request: %w", err)
	}

	httpReq.Header.Set("Authorization", "Bearer "+s.cfg.ChapaSecretKey)
	httpReq.Header.Set("Content-Type", "application/json")
	if req.IdempotencyKey != "" {
		httpReq.Header.Set("Idempotency-Key", req.IdempotencyKey)
	}

	resp, err := s.httpClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("chapa initialization network error: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read chapa response body: %w", err)
	}

	var initResp ChapaInitResponse
	if err := json.Unmarshal(respBody, &initResp); err != nil {
		return nil, fmt.Errorf("failed to decode chapa response (HTTP %d): %s", resp.StatusCode, string(respBody))
	}

	if resp.StatusCode >= 400 || !strings.EqualFold(initResp.Status, "success") {
		return nil, fmt.Errorf("chapa API rejected initialization: %s (status code %d)", initResp.Message, resp.StatusCode)
	}

	if initResp.Data.CheckoutURL == "" {
		return nil, errors.New("chapa API succeeded but returned empty checkout URL")
	}

	return &initResp, nil
}

func (s *chapaServiceImpl) VerifyPayment(reference string) (*ChapaVerifyResponse, error) {
	if s.IsTestMode() {
		// In local test mode without live merchant keys, return simulated successful verification
		return &ChapaVerifyResponse{
			Status:  "success",
			Message: "Payment retrieved successful (Test Mode)",
			Data: struct {
				ChapaReference    string `json:"chapa_reference"`
				MerchantReference string `json:"merchant_reference"`
				Amount            any    `json:"amount"`
				Currency          string `json:"currency"`
				Status            string `json:"status"`
				PaymentMethod     string `json:"payment_method,omitempty"`
				Customer          struct {
					FirstName   string `json:"first_name,omitempty"`
					LastName    string `json:"last_name,omitempty"`
					Email       string `json:"email,omitempty"`
					PhoneNumber string `json:"phone_number,omitempty"`
				} `json:"customer,omitempty"`
				CreatedAt string `json:"created_at,omitempty"`
				UpdatedAt string `json:"updated_at,omitempty"`
			}{
				ChapaReference:    "MOCK-CHAPA-" + reference,
				MerchantReference: reference,
				Amount:            nil, // matched dynamically
				Currency:          s.cfg.PaymentCurrency,
				Status:            "success",
				PaymentMethod:     "mock_test",
			},
		}, nil
	}

	url := fmt.Sprintf("%s/%s/verify", strings.TrimSuffix(s.cfg.ChapaBaseURL, "/"), reference)
	httpReq, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to construct verification request: %w", err)
	}

	httpReq.Header.Set("Authorization", "Bearer "+s.cfg.ChapaSecretKey)
	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := s.httpClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("chapa verification network error: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read verification response body: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("chapa verification returned HTTP %d: %s", resp.StatusCode, string(respBody))
	}

	var verifyResp ChapaVerifyResponse
	if err := json.Unmarshal(respBody, &verifyResp); err != nil {
		return nil, fmt.Errorf("failed to decode verification response: %w", err)
	}

	// Distinguish between the top-level API operation status and actual transaction status
	if !strings.EqualFold(verifyResp.Status, "success") {
		return nil, fmt.Errorf("chapa API verification call failed: %s", verifyResp.Message)
	}

	return &verifyResp, nil
}

func (s *chapaServiceImpl) ValidateWebhookSignature(rawBody []byte, signature string) bool {
	if s.cfg.ChapaWebhookSecret == "" || signature == "" {
		return false
	}

	mac := hmac.New(sha256.New, []byte(s.cfg.ChapaWebhookSecret))
	mac.Write(rawBody)
	expectedSig := hex.EncodeToString(mac.Sum(nil))

	// Constant-time comparison to prevent timing attacks
	return subtle.ConstantTimeCompare([]byte(expectedSig), []byte(signature)) == 1
}
