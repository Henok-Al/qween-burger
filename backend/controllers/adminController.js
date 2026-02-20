const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const ErrorHandler = require('../utils/errorHandler');
const asyncHandler = require('express-async-handler');
const { uploadImage, deleteImage } = require('../config/cloudinary');

/**
 * @description Get all users
 * @route GET /api/admin/users
 * @access Private/Admin
 */
exports.getUsers = asyncHandler(async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    const query = {};

    if (role) {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: users,
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
 * @description Get single user
 * @route GET /api/admin/users/:id
 * @access Private/Admin
 */
exports.getUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id).select('-password');
    if (!user) {
      return next(new ErrorHandler('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    return next(new ErrorHandler('User not found', 404));
  }
});

/**
 * @description Update user
 * @route PUT /api/admin/users/:id
 * @access Private/Admin
 */
exports.updateUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, email, role, address, phone } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      id,
      { name, email, role, address, phone },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return next(new ErrorHandler('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

/**
 * @description Delete user
 * @route DELETE /api/admin/users/:id
 * @access Private/Admin
 */
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return next(new ErrorHandler('User not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    return next(new ErrorHandler('User not found', 404));
  }
});

/**
 * @description Get all products (admin)
 * @route GET /api/admin/products
 * @access Private/Admin
 */
exports.getProducts = asyncHandler(async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, category } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      query.category = category;
    }

    const products = await Product.find(query)
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

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
 * @description Get single product (admin)
 * @route GET /api/admin/products/:id
 * @access Private/Admin
 */
exports.getProduct = asyncHandler(async (req, res, next) => {
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
 * @description Create product (admin)
 * @route POST /api/admin/products
 * @access Private/Admin
 */
exports.createProduct = asyncHandler(async (req, res, next) => {
  try {
    // Handle image upload
    if (req.file) {
      const image = await uploadImage(req.file);
      req.body.image = image.url;
      req.body.imagePublicId = image.public_id;
    }

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
 * @description Update product (admin)
 * @route PUT /api/admin/products/:id
 * @access Private/Admin
 */
exports.updateProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id);
    if (!product) {
      return next(new ErrorHandler('Product not found', 404));
    }

    // Handle image upload
    if (req.file) {
      // Delete old image if it exists
      if (product.imagePublicId) {
        await deleteImage(product.imagePublicId);
      }

      // Upload new image
      const image = await uploadImage(req.file);
      req.body.image = image.url;
      req.body.imagePublicId = image.public_id;
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: updatedProduct
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

/**
 * @description Delete product (admin)
 * @route DELETE /api/admin/products/:id
 * @access Private/Admin
 */
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  try {
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return next(new ErrorHandler('Product not found', 404));
    }

    // Delete product image from Cloudinary
    if (product.imagePublicId) {
      await deleteImage(product.imagePublicId);
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
 * @description Get dashboard statistics
 * @route GET /api/admin/dashboard
 * @access Private/Admin
 */
exports.getDashboardStats = asyncHandler(async (req, res, next) => {
  try {
    const [totalUsers, totalProducts, totalOrders, totalRevenue] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { status: 'delivered' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ])
    ]);

    const monthlyStats = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          orders: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 6 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        monthlyStats: monthlyStats.reverse()
      }
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

/**
 * @description Get order statistics
 * @route GET /api/admin/orders/stats
 * @access Private/Admin
 */
exports.getOrderStats = asyncHandler(async (req, res, next) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

/**
 * @description Get top products
 * @route GET /api/admin/products/top
 * @access Private/Admin
 */
exports.getTopProducts = asyncHandler(async (req, res, next) => {
  try {
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          count: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          product: {
            _id: 1,
            name: 1,
            image: 1,
            price: 1
          },
          count: 1,
          totalRevenue: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: topProducts
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

/**
 * @description Upload product image
 * @route POST /api/admin/upload-image
 * @access Private/Admin
 */
exports.uploadProductImage = asyncHandler(async (req, res, next) => {
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
