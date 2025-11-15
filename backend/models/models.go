package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// User roles.
const (
	RoleOwner    = "owner"
	RoleAdmin    = "admin"
	RoleSales    = "sales"
	RoleConsumer = "consumer"
)

// User represents the base user model.
type User struct {
	ID         uint           `json:"id" gorm:"primaryKey"`
	UUID       string         `json:"uuid" gorm:"uniqueIndex;not null"`
	Email      string         `json:"email" gorm:"uniqueIndex;not null"`
	Password   string         `json:"-" gorm:"not null"`
	Role       string         `json:"role" gorm:"not null"`
	SupplierID *uint          `json:"supplier_id"` // Foreign key for supplier employees (owner, admin, sales)
	FirstName  string         `json:"first_name"`
	LastName   string         `json:"last_name"`
	Phone      string         `json:"phone"`
	Avatar     string         `json:"avatar"`
	IsActive   bool           `json:"is_active" gorm:"default:true"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `json:"-" gorm:"index"`
}

func (u *User) BeforeCreate(tx *gorm.DB) error {
	u.UUID = uuid.New().String()
	return nil
}

// Supplier represents a supplier company/organization.
type Supplier struct {
	ID              uint           `json:"id" gorm:"primaryKey"`
	UUID            string         `json:"uuid" gorm:"uniqueIndex;not null"`
	CompanyName     string         `json:"company_name" gorm:"not null"`
	BusinessLicense string         `json:"business_license"`
	Address         string         `json:"address"`
	City            string         `json:"city"`
	Country         string         `json:"country"`
	PostalCode      string         `json:"postal_code"`
	Description     string         `json:"description"`
	Website         string         `json:"website"`
	IsVerified      bool           `json:"is_verified" gorm:"default:false"`
	IsActive        bool           `json:"is_active" gorm:"default:true"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `json:"-" gorm:"index"`

	// Relations
	Users        []User        `json:"users" gorm:"foreignKey:SupplierID"`
	Products     []Product     `json:"products"`
	Orders       []Order       `json:"orders"`
	Subscription *Subscription `json:"subscription"`
}

func (s *Supplier) BeforeCreate(tx *gorm.DB) error {
	s.UUID = uuid.New().String()
	return nil
}

// Consumer represents individual consumers.
type Consumer struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	UUID        string         `json:"uuid" gorm:"uniqueIndex;not null"`
	UserID      uint           `json:"user_id" gorm:"not null"`
	Preferences string         `json:"preferences" gorm:"type:text"`
	Gender      string         `json:"gender"`
	DateOfBirth *time.Time     `json:"date_of_birth"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`

	// Relations
	User   User    `json:"user"`
	Orders []Order `json:"orders"`
}

func (c *Consumer) BeforeCreate(tx *gorm.DB) error {
	c.UUID = uuid.New().String()
	return nil
}

// ConsumerSupplierLink represents approved connections between consumers and suppliers.
type ConsumerSupplierLink struct {
	ID          uint       `json:"id" gorm:"primaryKey"`
	SupplierID  uint       `json:"supplier_id" gorm:"not null"`
	ConsumerID  uint       `json:"consumer_id" gorm:"not null"`
	Status      string     `json:"status" gorm:"default:'pending'"` // pending, approved, denied, blocked
	RequestedAt time.Time  `json:"requested_at"`
	ApprovedAt  *time.Time `json:"approved_at"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`

	// Relations
	Supplier Supplier `json:"supplier"`
	Consumer Consumer `json:"consumer"`
}

// Category represents product categories.
type Category struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	Name        string    `json:"name" gorm:"not null;uniqueIndex"`
	Description string    `json:"description"`
	ParentID    *uint     `json:"parent_id"`
	IsActive    bool      `json:"is_active" gorm:"default:true"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`

	// Relations
	Parent   *Category  `json:"parent" gorm:"foreignKey:ParentID"`
	Children []Category `json:"children" gorm:"foreignKey:ParentID"`
	Products []Product  `json:"products"`
}

// Product represents supplier products/inventory.
type Product struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	UUID        string         `json:"uuid" gorm:"uniqueIndex;not null"`
	SupplierID  uint           `json:"supplier_id" gorm:"not null"`
	CategoryID  uint           `json:"category_id" gorm:"not null"`
	Name        string         `json:"name" gorm:"not null"`
	Description string         `json:"description"`
	SKU         string         `json:"sku" gorm:"uniqueIndex"`
	Price       float64        `json:"price" gorm:"not null"`
	Unit        string         `json:"unit"` // kg, piece, liter, etc.
	Stock       int            `json:"stock" gorm:"default:0"`
	MinStock    int            `json:"min_stock" gorm:"default:0"`
	Images      string         `json:"images" gorm:"type:text"` // JSON array of image URLs
	IsActive    bool           `json:"is_active" gorm:"default:true"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`

	// Relations
	Supplier   Supplier    `json:"supplier"`
	Category   Category    `json:"category"`
	OrderItems []OrderItem `json:"order_items"`
}

func (p *Product) BeforeCreate(tx *gorm.DB) error {
	p.UUID = uuid.New().String()
	return nil
}

// Order represents customer orders.
type Order struct {
	ID         uint           `json:"id" gorm:"primaryKey"`
	UUID       string         `json:"uuid" gorm:"uniqueIndex;not null"`
	SupplierID uint           `json:"supplier_id" gorm:"not null"`
	ConsumerID uint           `json:"consumer_id" gorm:"not null"`
	Status     string         `json:"status" gorm:"default:'pending'"` // pending, confirmed, shipped, delivered, cancelled
	Total      float64        `json:"total" gorm:"not null"`
	Currency   string         `json:"currency" gorm:"default:'KZT'"`
	Notes      string         `json:"notes"`
	OrderDate  time.Time      `json:"order_date"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `json:"-" gorm:"index"`

	// Relations
	Supplier   Supplier    `json:"supplier"`
	Consumer   Consumer    `json:"consumer"`
	OrderItems []OrderItem `json:"order_items"`
}

func (o *Order) BeforeCreate(tx *gorm.DB) error {
	o.UUID = uuid.New().String()
	return nil
}

// OrderItem represents individual items in an order.
type OrderItem struct {
	ID        uint    `json:"id" gorm:"primaryKey"`
	OrderID   uint    `json:"order_id" gorm:"not null"`
	ProductID uint    `json:"product_id" gorm:"not null"`
	Quantity  int     `json:"quantity" gorm:"not null"`
	UnitPrice float64 `json:"unit_price" gorm:"not null"`
	Total     float64 `json:"total" gorm:"not null"`

	// Relations
	Order   Order   `json:"order"`
	Product Product `json:"product"`
}

// Chat represents chat conversations between consumers and suppliers.
type Chat struct {
	ID         uint      `json:"id" gorm:"primaryKey"`
	UUID       string    `json:"uuid" gorm:"uniqueIndex;not null"`
	SupplierID uint      `json:"supplier_id" gorm:"not null"`
	ConsumerID uint      `json:"consumer_id" gorm:"not null"`
	Status     string    `json:"status" gorm:"default:'active'"` // active, archived, escalated
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`

	// Relations
	Supplier Supplier  `json:"supplier"`
	Consumer Consumer  `json:"consumer"`
	Messages []Message `json:"messages"`
}

func (c *Chat) BeforeCreate(tx *gorm.DB) error {
	c.UUID = uuid.New().String()
	return nil
}

// Message represents individual chat messages.
type Message struct {
	ID          uint                `json:"id" gorm:"primaryKey"`
	UUID        string              `json:"uuid" gorm:"uniqueIndex;not null"`
	ChatID      uint                `json:"chat_id" gorm:"not null"`
	SenderID    uint                `json:"sender_id" gorm:"not null"`
	Content     string              `json:"content" gorm:"type:text"`
	MessageType string              `json:"message_type" gorm:"default:'text'"` // text, image, audio, document
	IsRead      bool                `json:"is_read" gorm:"default:false"`
	ReadAt      *time.Time          `json:"read_at"`
	CreatedAt   time.Time           `json:"created_at"`
	UpdatedAt   time.Time           `json:"updated_at"`
	Sender      User                `json:"sender"`
	Chat        Chat                `json:"chat"`
	Attachments []MessageAttachment `json:"attachments"`
}

func (m *Message) BeforeCreate(tx *gorm.DB) error {
	m.UUID = uuid.New().String()
	return nil
}

// MessageAttachment represents file attachments in messages.
type MessageAttachment struct {
	ID        uint   `json:"id" gorm:"primaryKey"`
	MessageID uint   `json:"message_id" gorm:"not null"`
	FileName  string `json:"file_name" gorm:"not null"`
	FileURL   string `json:"file_url" gorm:"not null"`
	FileType  string `json:"file_type"`
	FileSize  int64  `json:"file_size"`

	// Relations
	Message Message `json:"message"`
}

// Incident represents customer complaints and issues.
type Incident struct {
	ID          uint       `json:"id" gorm:"primaryKey"`
	UUID        string     `json:"uuid" gorm:"uniqueIndex;not null"`
	ConsumerID  uint       `json:"consumer_id" gorm:"not null"`
	SupplierID  uint       `json:"supplier_id" gorm:"not null"`
	OrderID     *uint      `json:"order_id"`
	ChatID      uint       `json:"chat_id" gorm:"not null"`
	Title       string     `json:"title" gorm:"not null"`
	Description string     `json:"description" gorm:"type:text"`
	Priority    string     `json:"priority" gorm:"default:'medium'"` // low, medium, high, urgent
	Status      string     `json:"status" gorm:"default:'open'"`     // open, in_progress, escalated, resolved, closed
	AssignedTo  *uint      `json:"assigned_to"`
	ResolvedAt  *time.Time `json:"resolved_at"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`

	// Relations
	Consumer     Consumer      `json:"consumer"`
	Supplier     Supplier      `json:"supplier"`
	Order        *Order        `json:"order"`
	Chat         Chat          `json:"chat"`
	AssignedUser *User         `json:"assigned_user" gorm:"foreignKey:AssignedTo"`
	Logs         []IncidentLog `json:"logs"`
}

func (i *Incident) BeforeCreate(tx *gorm.DB) error {
	i.UUID = uuid.New().String()
	return nil
}

// IncidentLog represents status changes and updates to incidents.
type IncidentLog struct {
	ID         uint      `json:"id" gorm:"primaryKey"`
	IncidentID uint      `json:"incident_id" gorm:"not null"`
	UserID     uint      `json:"user_id" gorm:"not null"`
	Action     string    `json:"action" gorm:"not null"` // created, assigned, escalated, resolved, etc.
	OldValue   string    `json:"old_value"`
	NewValue   string    `json:"new_value"`
	Notes      string    `json:"notes"`
	CreatedAt  time.Time `json:"created_at"`

	// Relations
	Incident Incident `json:"incident"`
	User     User     `json:"user"`
}

// Subscription represents supplier subscription plans.
type Subscription struct {
	ID           uint       `json:"id" gorm:"primaryKey"`
	SupplierID   uint       `json:"supplier_id" gorm:"uniqueIndex;not null"`
	PlanName     string     `json:"plan_name" gorm:"not null"`
	Status       string     `json:"status" gorm:"default:'active'"` // active, suspended, cancelled
	StartDate    time.Time  `json:"start_date"`
	EndDate      *time.Time `json:"end_date"`
	Price        float64    `json:"price"`
	Currency     string     `json:"currency" gorm:"default:'KZT'"`
	BillingCycle string     `json:"billing_cycle" gorm:"default:'monthly'"` // monthly, yearly
	Features     string     `json:"features" gorm:"type:text"`              // JSON array of features
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`

	// Relations
	Supplier Supplier `json:"supplier"`
}

// Analytics represents KPI and metrics data.
type Analytics struct {
	ID         uint      `json:"id" gorm:"primaryKey"`
	SupplierID uint      `json:"supplier_id" gorm:"not null"`
	Date       time.Time `json:"date" gorm:"index"`
	MetricType string    `json:"metric_type" gorm:"not null"` // order_count, gmv, avg_order_value, etc.
	Value      float64   `json:"value"`
	Currency   string    `json:"currency"`
	CreatedAt  time.Time `json:"created_at"`

	// Relations
	Supplier Supplier `json:"supplier"`
}

// Notification represents system notifications.
type Notification struct {
	ID        uint       `json:"id" gorm:"primaryKey"`
	UserID    uint       `json:"user_id" gorm:"not null"`
	Title     string     `json:"title" gorm:"not null"`
	Content   string     `json:"content" gorm:"type:text"`
	Type      string     `json:"type" gorm:"not null"` // info, warning, error, success
	IsRead    bool       `json:"is_read" gorm:"default:false"`
	ReadAt    *time.Time `json:"read_at"`
	CreatedAt time.Time  `json:"created_at"`

	// Relations
	User User `json:"user"`
}
