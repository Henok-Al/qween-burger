const axios = require('axios');
const ErrorHandler = require('./errorHandler');

class ChapaPayment {
  constructor() {
    this.baseUrl = process.env.CHAPA_BASE_URL || 'https://api.chapa.co';
    this.secretKey = process.env.CHAPA_SECRET_KEY;
    // Use the actual frontend URL - default to 5174 since that's where Vite is running
    this.frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174';
    this.successUrl = `${this.frontendUrl}/payment-success`;
    this.failureUrl = `${this.frontendUrl}/checkout`;
  }

  /**
   * Generate a short transaction reference (max 50 characters)
   */
  generateTxRef(orderId) {
    const timestamp = Date.now().toString(36); // Convert to base36 for shorter string
    const shortOrderId = orderId.toString().slice(-8); // Last 8 chars of orderId
    return `qb-${shortOrderId}-${timestamp}`.slice(0, 50);
  }

  async initializePayment(amount, email, firstname, lastname, txRef, callbackUrl, customization = {}) {
    try {
      // Ensure amount is a valid number and properly formatted
      const formattedAmount = parseFloat(amount).toFixed(2);
      
      // Generate a short tx_ref if the provided one is too long
      const finalTxRef = txRef.length > 50 ? this.generateTxRef(txRef) : txRef;
      
      // Build the request body according to Chapa API requirements
      const requestBody = {
        amount: formattedAmount,
        currency: 'ETB',
        email: email,
        first_name: firstname || 'Customer',
        last_name: lastname || 'Customer',
        tx_ref: finalTxRef,
        callback_url: callbackUrl,
        return_url: `${this.successUrl}?tx_ref=${finalTxRef}&status=success`
      };

      // Only add customization if provided and valid
      if (customization.title || customization.description) {
        requestBody.customization = {
          // Title max 16 characters
          title: (customization.title || 'Qween Burger').slice(0, 16),
          // Description: only letters, numbers, hyphens, underscores, spaces, and dots
          description: (customization.description || 'Order payment')
            .replace(/[^a-zA-Z0-9\-_.\s]/g, '')
            .slice(0, 100)
        };
      }

      console.log('Chapa request:', JSON.stringify(requestBody, null, 2));

      // Log the return URL for debugging
      console.log('Return URL:', requestBody.return_url);

      const response = await axios.post(
        `${this.baseUrl}/v1/transaction/initialize`,
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Chapa response:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error('Chapa payment initialization error:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message 
        ? (typeof error.response.data.message === 'string' 
            ? error.response.data.message 
            : JSON.stringify(error.response.data.message))
        : 'Failed to initialize payment';
      throw new ErrorHandler(errorMessage, error.response?.status || 500);
    }
  }

  async verifyPayment(txRef) {
    try {
      const response = await axios.get(`${this.baseUrl}/v1/transaction/verify/${txRef}`, {
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Chapa verification response:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error('Chapa payment verification error:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message 
        ? (typeof error.response.data.message === 'string' 
            ? error.response.data.message 
            : JSON.stringify(error.response.data.message))
        : 'Failed to verify payment';
      throw new ErrorHandler(errorMessage, error.response?.status || 500);
    }
  }
}

module.exports = new ChapaPayment();
