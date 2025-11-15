package database

import (
	"csci361/config"
	"csci361/models"
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func Initialize(cfg *config.Config) *gorm.DB {
	db, err := gorm.Open(postgres.Open(cfg.DatabaseURL), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	log.Println("Database connection established")
	return db
}

func Migrate(db *gorm.DB) {
	log.Println("Running database migrations...")

	err := db.AutoMigrate(
		&models.Supplier{},
		&models.User{},
		&models.Consumer{},
		&models.ConsumerSupplierLink{},
		&models.Category{},
		&models.Product{},
		&models.Order{},
		&models.OrderItem{},
		&models.Chat{},
		&models.Message{},
		&models.MessageAttachment{},
		&models.Incident{},
		&models.IncidentLog{},
		&models.Subscription{},
		&models.Analytics{},
		&models.Notification{},
	)

	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	log.Println("Database migrations completed successfully")
}
