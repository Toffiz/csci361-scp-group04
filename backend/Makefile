.PHONY: help build run test clean docker-build docker-run migrate

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build: ## Build the application
	@echo "Building application..."
	go build -o main .

run: ## Run the application
	@echo "Running application..."
	go run main.go

test: ## Run tests
	@echo "Running tests..."
	go test -v ./...

test-coverage: ## Run tests with coverage
	@echo "Running tests with coverage..."
	go test -v -coverprofile=coverage.out ./...
	go tool cover -html=coverage.out

clean: ## Clean build artifacts
	@echo "Cleaning..."
	rm -f main
	rm -f coverage.out

deps: ## Download dependencies
	@echo "Downloading dependencies..."
	go mod download
	go mod tidy

fmt: ## Format code
	@echo "Formatting code..."
	go fmt ./...

lint: ## Run linter
	@echo "Running linter..."
	golangci-lint run

docker-build: ## Build Docker image
	@echo "Building Docker image..."
	docker build -t scp-backend:latest .

docker-run: ## Run Docker container
	@echo "Running Docker container..."
	docker run -p 5000:5000 --env-file .env scp-backend:latest

docker-compose-up: ## Start all services with docker-compose
	@echo "Starting services..."
	cd .. && docker-compose up -d

docker-compose-down: ## Stop all services
	@echo "Stopping services..."
	cd .. && docker-compose down

dev: ## Run in development mode with auto-reload (requires air)
	@echo "Running in development mode..."
	air

install-tools: ## Install development tools
	@echo "Installing development tools..."
	go install github.com/cosmtrek/air@latest
	go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest

migrate: ## Run database migrations
	@echo "Running migrations..."
	go run main.go migrate

seed: ## Seed database with sample data
	@echo "Seeding database..."
	@echo "TODO: Implement seed command"
