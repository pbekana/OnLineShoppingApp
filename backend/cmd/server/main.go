package main

import (
	"log"
	"os"
	"path/filepath"

	"ecommerce-backend/internal/config"
	"ecommerce-backend/internal/database"
	"ecommerce-backend/internal/router"
	"ecommerce-backend/internal/services"
)

func main() {
	cfg := config.Load()

	log.Printf("Starting The Thrift-flip Store backend on port %s...", cfg.Port)

	// Connect to database
	pool, err := database.Connect(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Could not connect to database: %v", err)
	}
	defer pool.Close()

	// Locate migrations directory
	migrationsDir := "migrations"
	if _, err := os.Stat(migrationsDir); os.IsNotExist(err) {
		// Try relative to binary or project root
		execPath, _ := os.Executable()
		candidate := filepath.Join(filepath.Dir(execPath), "..", "..", "migrations")
		if _, err := os.Stat(candidate); err == nil {
			migrationsDir = candidate
		}
	}

	if err := database.RunMigrations(pool, migrationsDir); err != nil {
		log.Printf("Warning: error running migrations: %v", err)
	}

	chapaService := services.NewChapaService(cfg)
	if chapaService.IsTestMode() {
		log.Println("[INFO] Running with Chapa Test Mode enabled (Simulated payment flow available).")
	} else {
		log.Println("[INFO] Running with Live Chapa API credentials.")
	}

	r := router.Setup(pool, cfg, chapaService)

	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Server failed to run: %v", err)
	}
}
