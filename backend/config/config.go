package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port           string
	Environment    string
	DatabaseURL    string
	JWTSecret      string
	AWSAccessKey   string
	AWSSecretKey   string
	AWSRegion      string
	S3Bucket       string
	AllowedOrigins []string
}

func Load() *Config {
	// Load .env file if it exists
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	cfg := &Config{
		Port:         getEnv("PORT", "5000"),
		Environment:  getEnv("ENVIRONMENT", "development"),
		DatabaseURL:  getEnv("DATABASE_URL", "postgres://user:password@localhost:5432/scp_platform?sslmode=disable"),
		JWTSecret:    getEnv("JWT_SECRET", "your-super-secret-jwt-key-change-in-production"),
		AWSAccessKey: getEnv("AWS_ACCESS_KEY_ID", ""),
		AWSSecretKey: getEnv("AWS_SECRET_ACCESS_KEY", ""),
		AWSRegion:    getEnv("AWS_REGION", "us-east-1"),
		S3Bucket:     getEnv("S3_BUCKET", "scp-platform-uploads"),
		AllowedOrigins: []string{
			getEnv("FRONTEND_URL", "http://localhost:3000"),
		},
	}

	return cfg
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
