const Order = require('../models/Order');
const Product = require('../models/Product');
const ErrorHandler = require('../utils/errorHandler');
const asyncHandler = require('express-async-handler');
const emailService = require('../utils/emailService');
const { getIO } = require('../utils/socket');

/**
 * @description Get all orders
 * @route GET /api/orders
 * @access Private/Admin
 */
exports.getOrders = asyncHandler(async (req, res, next) => {
  try {
    // Extract query parameters
    const {
      page = 1,
      limit = 10,
      status,
      sort = '-createdAt'
    } = req.query;

    // Build query
    const query = {};
    if (status) {
      query.status = status;
    }

    // Get orders with pagination
    const orders = await Order.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('user', 'name email')
      .populate('items.product', 'name image');

    // Get total count
    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      data: orders,
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
 * @description Get user's orders
 * @route GET /api/orders/my
 * @access Private
 */
exports.getUserOrders = asyncHandler(async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort('-createdAt')
      .populate('items.product', 'name image');

    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

/**
 * @description Get single order by ID
 * @route GET /api/orders/:id
 * @access Private
 */
exports.getOrderById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  try {
    const order = await Order.findById(id)
      .populate('user', 'name email')
      .populate('items.product', 'name image');

    if (!order) {
      return next(new ErrorHandler('Order not found', 404));
    }

    // Check if user is authorized to view order
    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user.id) {
      return next(new ErrorHandler('Not authorized to view this order', 401));
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    return next(new ErrorHandler('Order not found', 404));
  }
});

/**
 * @description Create a new order
 * @route POST /api/orders
 * @access Private
 */
exports.createOrder = asyncHandler(async (req, res, next) => {
  const { items, deliveryAddress, paymentMethod, notes } = req.body;

  // Validate input
  if (!items || items.length === 0) {
    return next(new ErrorHandler('Order must contain at least one item', 400));
  }

  if (!deliveryAddress || !paymentMethod) {
    return next(new ErrorHandler('Please provide delivery address and payment method', 400));
  }

  try {
    // Calculate total amount and validate products
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return next(new ErrorHandler(`Product not found: ${item.product}`, 404));
      }

      if (!product.isAvailable) {
        return next(new ErrorHandler(`Product not available: ${product.name}`, 400));
      }

      if (product.stock < item.quantity) {
        return next(new ErrorHandler(`Insufficient stock for: ${product.name}`, 400));
      }

      // Add to order items
      orderItems.push({
        product: item.product,
        quantity: item.quantity,
        price: product.price
      });

      // Calculate total amount
      totalAmount += product.price * item.quantity;
    }

    // Create order
    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      totalAmount: totalAmount,
      deliveryAddress: deliveryAddress,
      paymentMethod: paymentMethod,
      notes: notes,
      estimatedDeliveryTime: new Date(Date.now() + 3600000 * 2) // 2 hours from now
    });

    // Update product stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    // Populate product details
    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate('items.product', 'name image');

    // Send order confirmation email
    try {
      await emailService.sendOrderConfirmation(populatedOrder);
    } catch (emailError) {
      console.error('Failed to send order confirmation email:', emailError);
    }

    // Emit order created event
    const io = getIO();
    if (io) {
      io.to(req.user.id).emit('orderCreated', populatedOrder);
      io.emit('newOrder', populatedOrder);
    }

    res.status(201).json({
      success: true,
      data: populatedOrder
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

/**
 * @description Update order status
 * @route PUT /api/orders/:id/status
 * @access Private/Admin
 */
exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  // Validate input
  if (!status) {
    return next(new ErrorHandler('Please provide order status', 400));
  }

  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return next(new ErrorHandler(`Invalid status: ${status}`, 400));
  }

  try {
    const order = await Order.findById(id);
    if (!order) {
      return next(new ErrorHandler('Order not found', 404));
    }

    // Update status
    order.status = status;

    // Update timestamps based on status
    if (status === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
      order.actualDeliveryTime = Date.now();
    }

    await order.save();

    // Populate product details
    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate('items.product', 'name image');

    // Send order status update email
    try {
      await emailService.sendOrderStatusUpdate(populatedOrder);
    } catch (emailError) {
      console.error('Failed to send order status update email:', emailError);
    }

    // Emit order status update event
    const io = getIO();
    if (io) {
      io.to(populatedOrder.user._id.toString()).emit('orderStatusUpdate', populatedOrder);
    }

    res.status(200).json({
      success: true,
      data: populatedOrder
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

/**
 * @description Cancel an order
 * @route PUT /api/orders/:id/cancel
 * @access Private
 */
exports.cancelOrder = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  try {
    const order = await Order.findById(id);
    if (!order) {
      return next(new ErrorHandler('Order not found', 404));
    }

    // Check if order can be cancelled
    if (order.status === 'shipped' || order.status === 'delivered') {
      return next(new ErrorHandler('Order cannot be cancelled', 400));
    }

    // Check if user is authorized to cancel order
    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user.id) {
      return next(new ErrorHandler('Not authorized to cancel this order', 401));
    }

    // Cancel order
    order.status = 'cancelled';
    await order.save();

    // Restock products
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity }
      });
    }

    // Populate product details
    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate('items.product', 'name image');

    // Send order status update email
    try {
      await emailService.sendOrderStatusUpdate(populatedOrder);
    } catch (emailError) {
      console.error('Failed to send order status update email:', emailError);
    }

    // Emit order status update event
    const io = getIO();
    if (io) {
      io.to(populatedOrder.user._id.toString()).emit('orderStatusUpdate', populatedOrder);
    }

    res.status(200).json({
      success: true,
      data: populatedOrder
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

/**
 * @description Get order statistics
 * @route GET /api/orders/stats
 * @access Private/Admin
 */
exports.getOrderStats = asyncHandler(async (req, res, next) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          averageOrderValue: { $avg: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});
