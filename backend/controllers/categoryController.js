const Category = require('../models/Category');
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
 * @description Get all categories
 * @route GET /api/admin/categories
 * @access Private/Admin
 */
exports.getCategories = asyncHandler(async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, isActive } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (isActive === 'true') {
      query.isActive = true;
    } else if (isActive === 'false') {
      query.isActive = false;
    }

    const categories = await Category.find(query)
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Category.countDocuments(query);

    res.status(200).json({
      success: true,
      data: categories,
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
 * @description Get single category
 * @route GET /api/admin/categories/:id
 * @access Private/Admin
 */
exports.getCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  try {
    const category = await Category.findById(id).populate('products');
    if (!category) {
      return next(new ErrorHandler('Category not found', 404));
    }

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    return next(new ErrorHandler('Category not found', 404));
  }
});

/**
 * @description Create category (admin)
 * @route POST /api/admin/categories
 * @access Private/Admin
 */
exports.createCategory = asyncHandler(async (req, res, next) => {
  try {
    // Handle image upload
    if (req.file) {
      const image = await uploadImage(req.file);
      req.body.image = image.url;
      req.body.imagePublicId = image.public_id;
    }

    const category = await Category.create(req.body);

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

/**
 * @description Update category (admin)
 * @route PUT /api/admin/categories/:id
 * @access Private/Admin
 */
exports.updateCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  try {
    const category = await Category.findById(id);
    if (!category) {
      return next(new ErrorHandler('Category not found', 404));
    }

    // Handle image upload
    if (req.file) {
      // Delete old image if it exists
      if (category.imagePublicId) {
        await deleteImage(category.imagePublicId);
      }

      // Upload new image
      const image = await uploadImage(req.file);
      req.body.image = image.url;
      req.body.imagePublicId = image.public_id;
    }

    const updatedCategory = await Category.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: updatedCategory
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

/**
 * @description Delete category (admin)
 * @route DELETE /api/admin/categories/:id
 * @access Private/Admin
 */
exports.deleteCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  try {
    const category = await Category.findById(id);
    if (!category) {
      return next(new ErrorHandler('Category not found', 404));
    }

    // Check if category has products
    const products = await Product.find({ category: category.name });
    if (products.length > 0) {
      return next(new ErrorHandler('Category has products. Cannot delete.', 400));
    }

    // Delete category image from Cloudinary
    if (category.imagePublicId) {
      await deleteImage(category.imagePublicId);
    }

    await Category.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

/**
 * @description Upload category image
 * @route POST /api/admin/categories/upload-image
 * @access Private/Admin
 */
exports.uploadCategoryImage = asyncHandler(async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new ErrorHandler('Please upload an image file', 400));
    }

    const image = await uploadImage(req.file);

    res.status(200).json({
      success: true,
      data: {
        url: image.url,
        public_id: image.public_id
      }
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});
