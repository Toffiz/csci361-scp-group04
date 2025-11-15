package handlers

import (
	"csci361/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type ProductHandler struct {
	db *gorm.DB
}

func NewProductHandler(db *gorm.DB) *ProductHandler {
	return &ProductHandler{db: db}
}

// GetCategories returns all product categories
// @Summary Get categories
// @Description Get list of all product categories
// @Tags products
// @Produce json
// @Success 200 {array} models.Category
// @Router /categories [get]
func (h *ProductHandler) GetCategories(c *gin.Context) {
	var categories []models.Category
	err := h.db.Where("is_active = ?", true).
		Preload("Children").
		Order("name ASC").
		Find(&categories).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch categories"})
		return
	}

	c.JSON(http.StatusOK, categories)
}

// CreateCategory creates a new product category
// @Summary Create category
// @Description Create a new product category (admin only)
// @Tags products
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body models.Category true "Category details"
// @Success 201 {object} models.Category
// @Router /admin/categories [post]
func (h *ProductHandler) CreateCategory(c *gin.Context) {
	var category models.Category
	if err := c.ShouldBindJSON(&category); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	category.IsActive = true

	if err := h.db.Create(&category).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create category"})
		return
	}

	c.JSON(http.StatusCreated, category)
}

// UpdateCategory updates a product category
// @Summary Update category
// @Description Update product category details (admin only)
// @Tags products
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Category ID"
// @Param request body models.Category true "Updated category"
// @Success 200 {object} models.Category
// @Router /admin/categories/{id} [put]
func (h *ProductHandler) UpdateCategory(c *gin.Context) {
	categoryID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid category ID"})
		return
	}

	var updateData models.Category
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var category models.Category
	if err := h.db.First(&category, uint(categoryID)).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Category not found"})
		return
	}

	category.Name = updateData.Name
	category.Description = updateData.Description
	category.IsActive = updateData.IsActive

	if err := h.db.Save(&category).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update category"})
		return
	}

	c.JSON(http.StatusOK, category)
}

// DeleteCategory soft deletes a category
// @Summary Delete category
// @Description Deactivate a product category (admin only)
// @Tags products
// @Security BearerAuth
// @Param id path int true "Category ID"
// @Success 200 {object} map[string]string
// @Router /admin/categories/{id} [delete]
func (h *ProductHandler) DeleteCategory(c *gin.Context) {
	categoryID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid category ID"})
		return
	}

	var category models.Category
	if err := h.db.First(&category, uint(categoryID)).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Category not found"})
		return
	}

	category.IsActive = false
	if err := h.db.Save(&category).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete category"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Category deleted successfully"})
}

// GetProducts returns products for admin
// @Summary Get products
// @Description Get list of products (admin only)
// @Tags products
// @Produce json
// @Security BearerAuth
// @Param page query int false "Page number"
// @Param limit query int false "Items per page"
// @Success 200 {object} map[string]interface{}
// @Router /admin/products [get]
func (h *ProductHandler) GetProducts(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	offset := (page - 1) * limit

	// TODO: Get supplier ID from user relationship
	supplierID := uint(1) // Placeholder

	var products []models.Product
	var total int64

	h.db.Model(&models.Product{}).Where("supplier_id = ?", supplierID).Count(&total)
	err := h.db.Where("supplier_id = ?", supplierID).
		Preload("Category").
		Offset(offset).
		Limit(limit).
		Order("created_at DESC").
		Find(&products).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch products"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"products":    products,
		"total":       total,
		"page":        page,
		"limit":       limit,
		"total_pages": (int(total) + limit - 1) / limit,
	})
}

// GetProductsForConsumer returns products visible to consumer
// @Summary Get products for consumer
// @Description Get list of products from linked suppliers
// @Tags products
// @Produce json
// @Security BearerAuth
// @Param supplier_id query int false "Filter by supplier ID"
// @Param category_id query int false "Filter by category ID"
// @Success 200 {array} models.Product
// @Router /consumer/products [get]
func (h *ProductHandler) GetProductsForConsumer(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Get consumer record
	var consumer models.Consumer
	if err := h.db.Where("user_id = ?", userID).First(&consumer).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Consumer not found"})
		return
	}

	// Get approved supplier links
	var links []models.ConsumerSupplierLink
	h.db.Where("consumer_id = ? AND status = ?", consumer.ID, "approved").Find(&links)

	if len(links) == 0 {
		c.JSON(http.StatusOK, []models.Product{})
		return
	}

	// Extract supplier IDs
	supplierIDs := make([]uint, len(links))
	for i, link := range links {
		supplierIDs[i] = link.SupplierID
	}

	query := h.db.Where("supplier_id IN ? AND is_active = ?", supplierIDs, true)

	// Apply filters
	if supplierIDStr := c.Query("supplier_id"); supplierIDStr != "" {
		supplierID, _ := strconv.ParseUint(supplierIDStr, 10, 32)
		query = query.Where("supplier_id = ?", supplierID)
	}

	if categoryIDStr := c.Query("category_id"); categoryIDStr != "" {
		categoryID, _ := strconv.ParseUint(categoryIDStr, 10, 32)
		query = query.Where("category_id = ?", categoryID)
	}

	var products []models.Product
	err := query.Preload("Category").
		Preload("Supplier").
		Order("name ASC").
		Find(&products).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch products"})
		return
	}

	c.JSON(http.StatusOK, products)
}

// CreateProduct creates a new product
// @Summary Create product
// @Description Create a new product (admin only)
// @Tags products
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body models.Product true "Product details"
// @Success 201 {object} models.Product
// @Router /admin/products [post]
func (h *ProductHandler) CreateProduct(c *gin.Context) {
	// TODO: Get supplier ID from user relationship
	supplierID := uint(1) // Placeholder

	var product models.Product
	if err := c.ShouldBindJSON(&product); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	product.SupplierID = supplierID
	product.IsActive = true

	if err := h.db.Create(&product).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create product"})
		return
	}

	h.db.Preload("Category").First(&product, product.ID)

	c.JSON(http.StatusCreated, product)
}

// UpdateProduct updates a product
// @Summary Update product
// @Description Update product details (admin only)
// @Tags products
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Product ID"
// @Param request body models.Product true "Updated product"
// @Success 200 {object} models.Product
// @Router /admin/products/{id} [put]
func (h *ProductHandler) UpdateProduct(c *gin.Context) {
	productID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
		return
	}

	var updateData models.Product
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var product models.Product
	if err := h.db.First(&product, uint(productID)).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	// Update fields
	product.Name = updateData.Name
	product.Description = updateData.Description
	product.Price = updateData.Price
	product.Stock = updateData.Stock
	product.MinStock = updateData.MinStock
	product.Unit = updateData.Unit
	product.CategoryID = updateData.CategoryID
	product.IsActive = updateData.IsActive

	if err := h.db.Save(&product).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update product"})
		return
	}

	h.db.Preload("Category").First(&product, product.ID)

	c.JSON(http.StatusOK, product)
}

// DeleteProduct soft deletes a product
// @Summary Delete product
// @Description Deactivate a product (admin only)
// @Tags products
// @Security BearerAuth
// @Param id path int true "Product ID"
// @Success 200 {object} map[string]string
// @Router /admin/products/{id} [delete]
func (h *ProductHandler) DeleteProduct(c *gin.Context) {
	productID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
		return
	}

	var product models.Product
	if err := h.db.First(&product, uint(productID)).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	product.IsActive = false
	if err := h.db.Save(&product).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete product"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Product deleted successfully"})
}

// UploadProductImages handles product image uploads
// @Summary Upload product images
// @Description Upload images for a product (admin only)
// @Tags products
// @Accept multipart/form-data
// @Produce json
// @Security BearerAuth
// @Param id path int true "Product ID"
// @Param images formData file true "Product images"
// @Success 200 {object} map[string]interface{}
// @Router /admin/products/{id}/images [post]
func (h *ProductHandler) UploadProductImages(c *gin.Context) {
	productID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
		return
	}

	var product models.Product
	if err := h.db.First(&product, uint(productID)).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	form, err := c.MultipartForm()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No files uploaded"})
		return
	}

	files := form.File["images"]
	imageURLs := []string{}

	for _, file := range files {
		// TODO: Implement actual file upload to S3 or local storage
		imageURL := "/uploads/products/" + file.Filename
		imageURLs = append(imageURLs, imageURL)
	}

	// TODO: Store image URLs in product.Images as JSON
	// For now, just return success
	c.JSON(http.StatusOK, gin.H{
		"message":    "Images uploaded successfully",
		"image_urls": imageURLs,
	})
}
