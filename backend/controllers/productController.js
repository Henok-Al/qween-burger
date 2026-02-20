const Product = require('../models/Product');
const ErrorHandler = require('../utils/errorHandler');
const asyncHandler = require('express-async-handler');
const { uploadImage, deleteImage } = require('../config/cloudinary');
const multer = require('multer');
const path = require('path');

// Multer configuration for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
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
 * @description Get all products
 * @route GET /api/products
 * @access Public
 */
exports.getProducts = asyncHandler(async (req, res, next) => {
  try {
    // Extract query parameters
    const {
      page = 1,
      limit = 10,
      category,
      search,
      sort = '-createdAt',
      minPrice,
      maxPrice,
      rating,
      inStock
    } = req.query;

    // Build query
    const query = { isAvailable: true };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { ingredients: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) {
        query.price.$gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        query.price.$lte = parseFloat(maxPrice);
      }
    }

    if (rating) {
      query.ratings = { $gte: parseFloat(rating) };
    }

    if (inStock === 'true') {
      query.stock = { $gt: 0 };
    }

    // Get products with pagination
    const products = await Product.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count
    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

/**
 * @description Get single product by ID
 * @route GET /api/products/:id
 * @access Public
 */
exports.getProductById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id);
    if (!product) {
      return next(new ErrorHandler('Product not found', 404));
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    return next(new ErrorHandler('Product not found', 404));
  }
});

/**
 * @description Create a new product
 * @route POST /api/products
 * @access Private/Admin
 */
exports.createProduct = asyncHandler(async (req, res, next) => {
  try {
    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

/**
 * @description Update a product
 * @route PUT /api/products/:id
 * @access Private/Admin
 */
exports.updateProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  try {
    const product = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    if (!product) {
      return next(new ErrorHandler('Product not found', 404));
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

/**
 * @description Delete a product
 * @route DELETE /api/products/:id
 * @access Private/Admin
 */
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  try {
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return next(new ErrorHandler('Product not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    return next(new ErrorHandler('Product not found', 404));
  }
});

/**
 * @description Get products by category
 * @route GET /api/products/category/:category
 * @access Public
 */
exports.getProductsByCategory = asyncHandler(async (req, res, next) => {
  const { category } = req.params;

  try {
    const products = await Product.find({ category, isAvailable: true });

    res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

/**
 * @description Get featured products
 * @route GET /api/products/featured
 * @access Public
 */
exports.getFeaturedProducts = asyncHandler(async (req, res, next) => {
  try {
    const products = await Product.find({ isAvailable: true })
      .sort('-ratings')
      .limit(8);

    res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

/**
 * @description Get product categories
 * @route GET /api/products/categories
 * @access Public
 */
exports.getProductCategories = asyncHandler(async (req, res, next) => {
  try {
    const categories = await Product.distinct('category', { isAvailable: true });

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

/**
 * @description Create a new product review
 * @route POST /api/products/:id/reviews
 * @access Private
 */
exports.createProductReview = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    // Validate input
    if (!rating || !comment) {
      return next(new ErrorHandler('Please provide both rating and comment', 400));
    }

    if (rating < 1 || rating > 5) {
      return next(new ErrorHandler('Rating must be between 1 and 5', 400));
    }

    if (comment.trim().length < 3 || comment.trim().length > 500) {
      return next(new ErrorHandler('Comment must be between 3 and 500 characters', 400));
    }

    // Find product
    const product = await Product.findById(id);
    if (!product) {
      return next(new ErrorHandler('Product not found', 404));
    }

    // Check if user has already reviewed this product
    const existingReview = product.reviews.find(
      review => review.user.toString() === req.user._id.toString()
    );

    if (existingReview) {
      return next(new ErrorHandler('You have already reviewed this product', 400));
    }

    // Create new review
    const review = {
      user: req.user._id,
      userName: req.user.name,
      rating: parseFloat(rating),
      comment: comment.trim(),
      createdAt: new Date()
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.ratings = product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length;
    product.ratings = parseFloat(product.ratings.toFixed(1));

    await product.save();

    // Populate user field in reviews
    const updatedProduct = await Product.findById(id).populate('reviews.user', 'name email');

    res.status(201).json({
      success: true,
      data: updatedProduct.reviews
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});
