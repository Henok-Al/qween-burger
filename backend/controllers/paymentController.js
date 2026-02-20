const Chapa = require('../utils/chapa');
const Order = require('../models/Order');
const ErrorHandler = require('../utils/errorHandler');
const asyncHandler = require('express-async-handler');

/**
 * @description Initialize Chapa payment
 * @route POST /api/payments/chapa/initialize
 * @access Private
 */
exports.initializeChapaPayment = asyncHandler(async (req, res, next) => {
  try {
    const { orderId } = req.body;

    // Find the order
    const order = await Order.findById(orderId).populate('user', 'name email phone');
    if (!order) {
      return next(new ErrorHandler('Order not found', 404));
    }

    // Check if order is already paid
    if (order.paymentStatus === 'paid') {
      return next(new ErrorHandler('Order already paid', 400));
    }

    // Generate a short transaction reference using Chapa utility
    const txRef = Chapa.generateTxRef(orderId);

    // Get the backend URL for callback (this is where Chapa sends the webhook)
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    
    // Initialize payment with Chapa
    const paymentData = await Chapa.initializePayment(
      order.totalAmount,
      order.user.email,
      order.user.name.split(' ')[0] || 'Customer',
      order.user.name.split(' ').slice(1).join(' ') || 'Customer',
      txRef,
      `${backendUrl}/api/payments/chapa/callback`,
      {
        title: 'Qween Burger',
        description: `Order ${orderId.slice(-8)}`
      }
    );

    // Update order with payment information
    order.paymentMethod = 'online'; // Use 'online' as the payment method (Chapa is the provider)
    order.paymentStatus = 'pending';
    order.paymentReference = txRef;
    await order.save();

    res.status(200).json({
      success: true,
      data: {
        paymentUrl: paymentData.data.checkout_url,
        txRef: txRef
      }
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * @description Verify Chapa payment
 * @route GET /api/payments/chapa/verify/:txRef
 * @access Private
 */
exports.verifyChapaPayment = asyncHandler(async (req, res, next) => {
  try {
    const { txRef } = req.params;

    // Find order by payment reference
    const order = await Order.findOne({ paymentReference: txRef });
    if (!order) {
      return next(new ErrorHandler('Order not found', 404));
    }

    // Verify payment with Chapa
    const verificationData = await Chapa.verifyPayment(txRef);

    if (verificationData.data.status === 'success') {
      // Update order status
      order.paymentStatus = 'paid';
      order.paymentDate = new Date(verificationData.data.paid_at);
      order.status = 'processing'; // Move to processing
      await order.save();

      res.status(200).json({
        success: true,
        data: {
          order: order,
          payment: verificationData.data
        }
      });
    } else {
      return next(new ErrorHandler('Payment verification failed', 400));
    }
  } catch (error) {
    return next(error);
  }
});

/**
 * @description Chapa payment callback
 * @route POST /api/payments/chapa/callback
 * @access Public (Chapa will call this endpoint)
 */
exports.chapaCallback = asyncHandler(async (req, res, next) => {
  try {
    // Chapa sends data in the request body
    const { tx_ref, status } = req.body;

    if (status === 'success') {
      // Find order by transaction reference
      const order = await Order.findOne({ paymentReference: tx_ref });
      if (order && order.paymentStatus !== 'paid') {
        // Verify payment
        const verificationData = await Chapa.verifyPayment(tx_ref);
        
        if (verificationData.data.status === 'success') {
          order.paymentStatus = 'paid';
          order.paymentDate = new Date(verificationData.data.paid_at);
          order.status = 'processing';
          await order.save();

          console.log(`Payment successful for order ${order._id}`);
        }
      }
    }

    // Chapa expects a 200 response
    res.status(200).json({
      success: true,
      message: 'Callback received'
    });
  } catch (error) {
    console.error('Chapa callback error:', error);
    res.status(200).json({
      success: false,
      message: 'Callback processing failed'
    });
  }
});
