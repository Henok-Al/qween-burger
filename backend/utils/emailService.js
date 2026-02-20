const nodemailer = require('nodemailer');
const ErrorHandler = require('./errorHandler');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async sendEmail(to, subject, text, html) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'Qween Burger <noreply@qweenburger.com>',
        to: to,
        subject: subject,
        text: text,
        html: html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Email sending error:', error);
      throw new ErrorHandler('Failed to send email', 500);
    }
  }

  async sendOrderConfirmation(order) {
    const subject = `Order Confirmation #${order._id}`;
    const text = `Your order has been placed successfully! Order ID: ${order._id}`;
    const html = `
      <h1>Order Confirmation</h1>
      <p>Thank you for your order!</p>
      <p>Order ID: ${order._id}</p>
      <h2>Order Details</h2>
      <ul>
        ${order.items.map(item => `<li>${item.product.name} x ${item.quantity} - $${item.price.toFixed(2)}</li>`).join('')}
      </ul>
      <p>Total Amount: $${order.totalAmount.toFixed(2)}</p>
      <h2>Delivery Information</h2>
      <p>Address: ${order.deliveryAddress}</p>
      <p>Estimated Delivery: ${new Date(order.estimatedDeliveryTime).toLocaleString()}</p>
      <h2>Payment Information</h2>
      <p>Method: ${order.paymentMethod}</p>
      <p>Status: ${order.paymentStatus}</p>
    `;

    return this.sendEmail(order.user.email, subject, text, html);
  }

  async sendPasswordReset(email, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const subject = 'Password Reset Request';
    const text = `Click this link to reset your password: ${resetUrl}`;
    const html = `
      <h1>Password Reset Request</h1>
      <p>You requested a password reset for your Qween Burger account.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}" style="background-color: #ff6b35; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    return this.sendEmail(email, subject, text, html);
  }

  async sendOrderStatusUpdate(order) {
    const subject = `Order Status Update #${order._id}`;
    const text = `Your order status has been updated to: ${order.status}`;
    const html = `
      <h1>Order Status Update</h1>
      <p>Your order status has been updated!</p>
      <p>Order ID: ${order._id}</p>
      <p>New Status: ${order.status}</p>
      <h2>Order Details</h2>
      <ul>
        ${order.items.map(item => `<li>${item.product.name} x ${item.quantity} - $${item.price.toFixed(2)}</li>`).join('')}
      </ul>
      <p>Total Amount: $${order.totalAmount.toFixed(2)}</p>
      ${order.deliveredAt ? `<p>Delivered At: ${new Date(order.deliveredAt).toLocaleString()}</p>` : ''}
    `;

    return this.sendEmail(order.user.email, subject, text, html);
  }
}

module.exports = new EmailService();
