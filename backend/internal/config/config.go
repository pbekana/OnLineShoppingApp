package config

import (
	"os"
)

type Config struct {
	Port               string
	DatabaseURL        string
	JWTSecret          string
	CORSOrigin         string
	ChapaSecretKey     string
	ChapaWebhookSecret string
	ChapaBaseURL       string
	PaymentCurrency    string
	FrontendURL        string
}

func Load() *Config {
	return &Config{
		Port:               getEnv("PORT", "8080"),
		DatabaseURL:        getEnv("DATABASE_URL", "postgres://postgres:123456@localhost:5432/ecommerce?sslmode=disable"),
		JWTSecret:          getEnv("JWT_SECRET", "super-secret-jwt-key-for-thrift-flip-store-change-in-prod"),
		CORSOrigin:         getEnv("CORS_ORIGIN", "http://localhost:5173"),
		ChapaSecretKey:     getEnv("CHAPA_SECRET_KEY", ""),
		ChapaWebhookSecret: getEnv("CHAPA_WEBHOOK_SECRET", "chapa-webhook-secret-key-12345"),
		ChapaBaseURL:       getEnv("CHAPA_BASE_URL", "https://api.chapa.global/v2/payments"),
		PaymentCurrency:    getEnv("PAYMENT_CURRENCY", "ETB"),
		FrontendURL:        getEnv("FRONTEND_URL", "http://localhost:5173"),
	}
}

func getEnv(key, defaultVal string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return defaultVal
}
