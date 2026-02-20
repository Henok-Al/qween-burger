const express = require('express');
const router = express.Router();
const {
  initializeChapaPayment,
  verifyChapaPayment,
  chapaCallback
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment management operations
 */

/**
 * @swagger
 * /api/payments/chapa/initialize:
 *   post:
 *     summary: Initialize Chapa payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *             properties:
 *               orderId:
 *                 type: string
 *                 description: Order ID to process payment for
 *     responses:
 *       200:
 *         description: Payment initialized successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     paymentUrl:
 *                       type: string
 *                     txRef:
 *                       type: string
 *       400:
 *         description: Bad request - Order already paid or invalid data
 *       401:
 *         description: Unauthorized - No token or invalid token
 *       404:
 *         description: Order not found
 */
router.post('/chapa/initialize', protect, initializeChapaPayment);

/**
 * @swagger
 * /api/payments/chapa/verify/{txRef}:
 *   get:
 *     summary: Verify Chapa payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: txRef
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction reference from Chapa
 *     responses:
 *       200:
 *         description: Payment verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     order:
 *                       $ref: '#/components/schemas/Order'
 *                     payment:
 *                       type: object
 *       401:
 *         description: Unauthorized - No token or invalid token
 *       404:
 *         description: Order not found
 */
router.get('/chapa/verify/:txRef', protect, verifyChapaPayment);

/**
 * @swagger
 * /api/payments/chapa/callback:
 *   post:
 *     summary: Chapa payment callback endpoint
 *     tags: [Payments]
 *     description: This endpoint is called by Chapa to notify about payment status
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tx_ref:
 *                 type: string
 *               status:
 *                 type: string
 *               data:
 *                 type: object
 *     responses:
 *       200:
 *         description: Callback processed successfully
 */
router.post('/chapa/callback', chapaCallback);

module.exports = router;
