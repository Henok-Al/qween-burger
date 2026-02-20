const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getDashboardStats,
  getOrderStats,
  getTopProducts,
  uploadProductImage
} = require('../controllers/adminController');
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  uploadCategoryImage
} = require('../controllers/categoryController');
const { getOrders, getOrderById, updateOrderStatus } = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Multer configuration for file upload - use memoryStorage for Cloudinary
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Images only (jpeg, jpg, png, gif, webp)'));
    }
  }
});

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management operations
 */

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 *       401:
 *         description: Unauthorized - no token or invalid token
 */
router.get('/dashboard', protect, authorize('admin'), getDashboardStats);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users with pagination and filtering
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of users per page
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: User role (user or admin)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search users by name, email, or phone
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       401:
 *         description: Unauthorized - no token or invalid token
 */
router.get('/users', protect, authorize('admin'), getUsers);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       401:
 *         description: Unauthorized - no token or invalid token
 *       404:
 *         description: User not found
 */
router.get('/users/:id', protect, authorize('admin'), getUser);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   put:
 *     summary: Update user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: User's full name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *                 description: User role
 *               address:
 *                 type: string
 *                 description: User's address
 *               phone:
 *                 type: string
 *                 description: User's phone number
 *     responses:
 *       200:
 *         description: User updated successfully
 *       401:
 *         description: Unauthorized - no token or invalid token
 *       404:
 *         description: User not found
 */
router.put('/users/:id', protect, authorize('admin'), updateUser);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Delete user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized - no token or invalid token
 *       404:
 *         description: User not found
 */
router.delete('/users/:id', protect, authorize('admin'), deleteUser);

/**
 * @swagger
 * /api/admin/products:
 *   get:
 *     summary: Get all products with pagination and filtering (admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of products per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search products by name or description
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Product category
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *       401:
 *         description: Unauthorized - no token or invalid token
 */
router.get('/products', protect, authorize('admin'), getProducts);

/**
 * @swagger
 * /api/admin/products:
 *   post:
 *     summary: Create a new product (admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - price
 *               - category
 *               - image
 *             properties:
 *               name:
 *                 type: string
 *                 description: Product name
 *               description:
 *                 type: string
 *                 description: Product description
 *               price:
 *                 type: number
 *                 minimum: 0
 *                 description: Product price
 *               category:
 *                 type: string
 *                 enum: [classic, premium, veggie, chicken, beef, special]
 *                 description: Product category
 *               image:
 *                 type: string
 *                 description: Product image URL
 *               isAvailable:
 *                 type: boolean
 *                 default: true
 *                 description: Product availability
 *               stock:
 *                 type: integer
 *                 minimum: 0
 *                 default: 0
 *                 description: Stock quantity
 *               ingredients:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Product ingredients
 *               nutritionalInfo:
 *                 type: object
 *                 properties:
 *                   calories:
 *                     type: number
 *                     minimum: 0
 *                   protein:
 *                     type: number
 *                     minimum: 0
 *                   carbs:
 *                     type: number
 *                     minimum: 0
 *                   fat:
 *                     type: number
 *                     minimum: 0
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Bad request - missing or invalid fields
 *       401:
 *         description: Unauthorized - no token or invalid token
 */
router.post('/products', protect, authorize('admin'), upload.single('image'), createProduct);

/**
 * @swagger
 * /api/admin/products/{id}:
 *   get:
 *     summary: Get product by ID (admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *       401:
 *         description: Unauthorized - no token or invalid token
 *       404:
 *         description: Product not found
 */
router.get('/products/:id', protect, authorize('admin'), getProduct);

/**
 * @swagger
 * /api/admin/products/{id}:
 *   put:
 *     summary: Update product (admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Product name
 *               description:
 *                 type: string
 *                 description: Product description
 *               price:
 *                 type: number
 *                 minimum: 0
 *                 description: Product price
 *               category:
 *                 type: string
 *                 enum: [classic, premium, veggie, chicken, beef, special]
 *                 description: Product category
 *               image:
 *                 type: string
 *                 description: Product image URL
 *               isAvailable:
 *                 type: boolean
 *                 description: Product availability
 *               stock:
 *                 type: integer
 *                 minimum: 0
 *                 description: Stock quantity
 *               ingredients:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Product ingredients
 *               nutritionalInfo:
 *                 type: object
 *                 properties:
 *                   calories:
 *                     type: number
 *                     minimum: 0
 *                   protein:
 *                     type: number
 *                     minimum: 0
 *                   carbs:
 *                     type: number
 *                     minimum: 0
 *                   fat:
 *                     type: number
 *                     minimum: 0
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       401:
 *         description: Unauthorized - no token or invalid token
 *       404:
 *         description: Product not found
 */
router.put('/products/:id', protect, authorize('admin'), upload.single('image'), updateProduct);

/**
 * @swagger
 * /api/admin/products/{id}:
 *   delete:
 *     summary: Delete product (admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       401:
 *         description: Unauthorized - no token or invalid token
 *       404:
 *         description: Product not found
 */
router.delete('/products/:id', protect, authorize('admin'), deleteProduct);

/**
 * @swagger
 * /api/admin/orders:
 *   get:
 *     summary: Get all orders with pagination and filtering (admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of orders per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Order status
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 *       401:
 *         description: Unauthorized - no token or invalid token
 */
router.get('/orders', protect, authorize('admin'), getOrders);

/**
 * @swagger
 * /api/admin/orders/{id}:
 *   get:
 *     summary: Get single order by ID (admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order retrieved successfully
 *       401:
 *         description: Unauthorized - no token or invalid token
 *       404:
 *         description: Order not found
 */
router.get('/orders/:id', protect, authorize('admin'), getOrderById);

/**
 * @swagger
 * /api/admin/orders/{id}/status:
 *   put:
 *     summary: Update order status (admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, processing, shipped, delivered, cancelled]
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       401:
 *         description: Unauthorized - no token or invalid token
 *       404:
 *         description: Order not found
 */
router.put('/orders/:id/status', protect, authorize('admin'), updateOrderStatus);

/**
 * @swagger
 * /api/admin/orders/stats:
 *   get:
 *     summary: Get order statistics (admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Order statistics retrieved successfully
 *       401:
 *         description: Unauthorized - no token or invalid token
 */
router.get('/orders/stats', protect, authorize('admin'), getOrderStats);

/**
 * @swagger
 * /api/admin/categories:
 *   get:
 *     summary: Get all categories with pagination and filtering (admin)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of categories per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search categories by name or description
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: string
 *         description: Filter by active status (true/false)
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *       401:
 *         description: Unauthorized - no token or invalid token
 */
router.get('/categories', protect, authorize('admin'), getCategories);

/**
 * @swagger
 * /api/admin/categories:
 *   post:
 *     summary: Create a new category (admin)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Category name
 *               description:
 *                 type: string
 *                 description: Category description
 *               image:
 *                 type: string
 *                 description: Category image URL
 *               isActive:
 *                 type: boolean
 *                 default: true
 *                 description: Category active status
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Bad request - missing or invalid fields
 *       401:
 *         description: Unauthorized - no token or invalid token
 */
router.post('/categories', protect, authorize('admin'), upload.single('image'), createCategory);

/**
 * @swagger
 * /api/admin/categories/{id}:
 *   get:
 *     summary: Get category by ID (admin)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category retrieved successfully
 *       401:
 *         description: Unauthorized - no token or invalid token
 *       404:
 *         description: Category not found
 */
router.get('/categories/:id', protect, authorize('admin'), getCategory);

/**
 * @swagger
 * /api/admin/categories/{id}:
 *   put:
 *     summary: Update category (admin)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Category name
 *               description:
 *                 type: string
 *                 description: Category description
 *               image:
 *                 type: string
 *                 description: Category image URL
 *               isActive:
 *                 type: boolean
 *                 description: Category active status
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       401:
 *         description: Unauthorized - no token or invalid token
 *       404:
 *         description: Category not found
 */
router.put('/categories/:id', protect, authorize('admin'), upload.single('image'), updateCategory);

/**
 * @swagger
 * /api/admin/categories/{id}:
 *   delete:
 *     summary: Delete category (admin)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       401:
 *         description: Unauthorized - no token or invalid token
 *       404:
 *         description: Category not found
 */
router.delete('/categories/:id', protect, authorize('admin'), deleteCategory);

/**
 * @swagger
 * /api/admin/categories/upload-image:
 *   post:
 *     summary: Upload category image (admin)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Category image file
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *       400:
 *         description: Bad request - missing or invalid image
 *       401:
 *         description: Unauthorized - no token or invalid token
 */
router.post('/categories/upload-image', protect, authorize('admin'), upload.single('image'), uploadCategoryImage);

/**
 * @swagger
 * /api/admin/products/top:
 *   get:
 *     summary: Get top selling products (admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Top products retrieved successfully
 *       401:
 *         description: Unauthorized - no token or invalid token
 */
router.get('/products/top', protect, authorize('admin'), getTopProducts);

/**
 * @swagger
 * /api/admin/upload-image:
 *   post:
 *     summary: Upload product image
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *       400:
 *         description: No image file provided
 *       401:
 *         description: Unauthorized - no token or invalid token
 */
router.post('/upload-image', protect, authorize('admin'), upload.single('image'), uploadProductImage);

module.exports = router;

module.exports = router;
