package handlers

import (
	"csci361/config"
	"csci361/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type AuthHandler struct {
	db  *gorm.DB
	cfg *config.Config
}

func NewAuthHandler(db *gorm.DB, cfg *config.Config) *AuthHandler {
	return &AuthHandler{db: db, cfg: cfg}
}

type RegisterRequest struct {
	Email       string `json:"email" binding:"required,email"`
	Password    string `json:"password" binding:"required,min=8"`
	Role        string `json:"role" binding:"required,oneof=consumer sales admin owner"`
	FirstName   string `json:"first_name" binding:"required"`
	LastName    string `json:"last_name" binding:"required"`
	Phone       string `json:"phone"`
	CompanyName string `json:"company_name"` // Required for supplier roles
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type AuthResponse struct {
	Token        string      `json:"token"`
	RefreshToken string      `json:"refresh_token"`
	User         models.User `json:"user"`
	ExpiresIn    int64       `json:"expires_in"`
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var existingUser models.User
	if err := h.db.Where("email = ?", req.Email).First(&existingUser).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User already exists"})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	user := models.User{
		Email:     req.Email,
		Password:  string(hashedPassword),
		Role:      req.Role,
		FirstName: req.FirstName,
		LastName:  req.LastName,
		Phone:     req.Phone,
		IsActive:  true,
	}

	if err := h.db.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	if req.Role == models.RoleSales || req.Role == models.RoleAdmin || req.Role == models.RoleOwner {
		if req.CompanyName == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Company name is required for supplier roles"})
			return
		}

		supplier := models.Supplier{
			CompanyName: req.CompanyName,
			IsActive:    true,
		}

		if err := h.db.Create(&supplier).Error; err != nil {
			h.db.Delete(&user)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create supplier"})
			return
		}
	}

	if req.Role == models.RoleConsumer {
		consumer := models.Consumer{
			UserID: user.ID,
		}

		if err := h.db.Create(&consumer).Error; err != nil {
			h.db.Delete(&user)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create consumer"})
			return
		}
	}

	token, refreshToken, expiresIn, err := h.generateTokens(user.ID, user.Email, user.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate tokens"})
		return
	}

	user.Password = ""

	c.JSON(http.StatusCreated, AuthResponse{
		Token:        token,
		RefreshToken: refreshToken,
		User:         user,
		ExpiresIn:    expiresIn,
	})
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := h.db.Where("email = ? AND is_active = ?", req.Email, true).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	token, refreshToken, expiresIn, err := h.generateTokens(user.ID, user.Email, user.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate tokens"})
		return
	}

	user.Password = ""

	c.JSON(http.StatusOK, AuthResponse{
		Token:        token,
		RefreshToken: refreshToken,
		User:         user,
		ExpiresIn:    expiresIn,
	})
}

func (h *AuthHandler) RefreshToken(c *gin.Context) {
	var req struct {
		RefreshToken string `json:"refresh_token" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	claims := &jwt.MapClaims{}
	token, err := jwt.ParseWithClaims(req.RefreshToken, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(h.cfg.JWTSecret), nil
	})

	if err != nil || !token.Valid {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid refresh token"})
		return
	}

	userID, _ := (*claims)["user_id"].(float64)
	email, _ := (*claims)["email"].(string)
	role, _ := (*claims)["role"].(string)

	newToken, _, expiresIn, err := h.generateTokens(uint(userID), email, role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token":      newToken,
		"expires_in": expiresIn,
	})
}

func (h *AuthHandler) generateTokens(userID uint, email, role string) (string, string, int64, error) {
	accessExpiresIn := int64(3600)
	accessClaims := jwt.MapClaims{
		"user_id": userID,
		"email":   email,
		"role":    role,
		"exp":     time.Now().Unix() + accessExpiresIn,
		"iat":     time.Now().Unix(),
	}

	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)
	accessTokenString, err := accessToken.SignedString([]byte(h.cfg.JWTSecret))
	if err != nil {
		return "", "", 0, err
	}

	refreshClaims := jwt.MapClaims{
		"user_id": userID,
		"email":   email,
		"role":    role,
		"exp":     time.Now().Unix() + 604800,
		"iat":     time.Now().Unix(),
	}

	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
	refreshTokenString, err := refreshToken.SignedString([]byte(h.cfg.JWTSecret))
	if err != nil {
		return "", "", 0, err
	}

	return accessTokenString, refreshTokenString, accessExpiresIn, nil
}
