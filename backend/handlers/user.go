package handlers

import (
	"csci361/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type UserHandler struct {
	db *gorm.DB
}

func NewUserHandler(db *gorm.DB) *UserHandler {
	return &UserHandler{db: db}
}

// GetProfile returns current user profile
// @Summary Get user profile
// @Description Get current authenticated user profile
// @Tags users
// @Produce json
// @Security BearerAuth
// @Success 200 {object} models.User
// @Failure 401 {object} map[string]string
// @Router /profile [get]
func (h *UserHandler) GetProfile(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var user models.User
	if err := h.db.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	user.Password = "" // Remove password from response
	c.JSON(http.StatusOK, user)
}

// UpdateProfile updates user profile
// @Summary Update user profile
// @Description Update current user profile information
// @Tags users
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body models.User true "Updated user information"
// @Success 200 {object} models.User
// @Failure 400 {object} map[string]string
// @Router /profile [put]
func (h *UserHandler) UpdateProfile(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var updateData struct {
		FirstName string `json:"first_name"`
		LastName  string `json:"last_name"`
		Phone     string `json:"phone"`
	}

	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := h.db.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Update user fields
	user.FirstName = updateData.FirstName
	user.LastName = updateData.LastName
	user.Phone = updateData.Phone

	if err := h.db.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile"})
		return
	}

	user.Password = "" // Remove password from response
	c.JSON(http.StatusOK, user)
}

// UploadAvatar handles user avatar upload
// @Summary Upload user avatar
// @Description Upload and set user profile avatar
// @Tags users
// @Accept multipart/form-data
// @Produce json
// @Security BearerAuth
// @Param avatar formData file true "Avatar image file"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Router /profile/avatar [post]
func (h *UserHandler) UploadAvatar(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	file, err := c.FormFile("avatar")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
		return
	}

	// TODO: Implement file upload to S3 or local storage
	// For now, just return success with placeholder URL
	avatarURL := "/uploads/avatars/" + file.Filename

	// Update user avatar URL in database
	if err := h.db.Model(&models.User{}).Where("id = ?", userID).Update("avatar", avatarURL).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update avatar"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"avatar_url": avatarURL})
}

// GetUsers returns list of users (admin only)
// @Summary Get users list
// @Description Get list of all users (admin/owner only)
// @Tags users
// @Produce json
// @Security BearerAuth
// @Param page query int false "Page number"
// @Param limit query int false "Items per page"
// @Success 200 {object} map[string]interface{}
// @Failure 403 {object} map[string]string
// @Router /admin/users [get]
func (h *UserHandler) GetUsers(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	offset := (page - 1) * limit

	var users []models.User
	var total int64

	h.db.Model(&models.User{}).Count(&total)
	if err := h.db.Offset(offset).Limit(limit).Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch users"})
		return
	}

	// Remove passwords from response
	for i := range users {
		users[i].Password = ""
	}

	c.JSON(http.StatusOK, gin.H{
		"users":       users,
		"total":       total,
		"page":        page,
		"limit":       limit,
		"total_pages": (int(total) + limit - 1) / limit,
	})
}

// CreateUser creates a new user (admin only)
// @Summary Create new user
// @Description Create a new user account (admin/owner only)
// @Tags users
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body models.User true "User information"
// @Success 201 {object} models.User
// @Failure 400 {object} map[string]string
// @Router /admin/users [post]
func (h *UserHandler) CreateUser(c *gin.Context) {
	var user models.User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if user already exists
	var existingUser models.User
	if err := h.db.Where("email = ?", user.Email).First(&existingUser).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User already exists"})
		return
	}

	// Set default values
	user.IsActive = true

	if err := h.db.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	user.Password = "" // Remove password from response
	c.JSON(http.StatusCreated, user)
}

// UpdateUser updates user information (admin only)
// @Summary Update user
// @Description Update user information (admin/owner only)
// @Tags users
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "User ID"
// @Param request body models.User true "Updated user information"
// @Success 200 {object} models.User
// @Failure 400 {object} map[string]string
// @Router /admin/users/{id} [put]
func (h *UserHandler) UpdateUser(c *gin.Context) {
	userID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	var updateData models.User
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := h.db.First(&user, uint(userID)).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Update allowed fields
	user.FirstName = updateData.FirstName
	user.LastName = updateData.LastName
	user.Phone = updateData.Phone
	user.IsActive = updateData.IsActive

	if err := h.db.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
		return
	}

	user.Password = "" // Remove password from response
	c.JSON(http.StatusOK, user)
}

// DeleteUser deactivates a user (admin only)
// @Summary Delete user
// @Description Deactivate a user account (admin/owner only)
// @Tags users
// @Security BearerAuth
// @Param id path int true "User ID"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Router /admin/users/{id} [delete]
func (h *UserHandler) DeleteUser(c *gin.Context) {
	userID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	var user models.User
	if err := h.db.First(&user, uint(userID)).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Soft delete by setting IsActive to false
	user.IsActive = false
	if err := h.db.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User deleted successfully"})
}
