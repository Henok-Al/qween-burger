import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { paymentAPI } from '../services/api';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [orderId, setOrderId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get all possible parameters from Chapa redirect
        const txRef = searchParams.get('tx_ref');
        const statusParam = searchParams.get('status');
        const trxRef = searchParams.get('trx_ref'); // Chapa might use this
        
        console.log('Payment redirect params:', { txRef, statusParam, trxRef });

        // Use whichever reference is available
        const transactionRef = txRef || trxRef;

        if (!transactionRef) {
          console.error('No transaction reference found in URL');
          throw new Error('Transaction reference not found');
        }

        // If status is explicitly 'success' or if we have a tx_ref, try to verify
        if (statusParam === 'success' || transactionRef) {
          console.log('Verifying payment with tx_ref:', transactionRef);
          
          // Verify payment with backend
          const response = await paymentAPI.verifyChapaPayment(transactionRef);
          console.log('Verification response:', response.data);
          
          if (response.data.success) {
            setOrderId(response.data.data.order._id);
            setStatus('success');
          } else {
            throw new Error(response.data.message || 'Payment verification failed');
          }
        } else {
          setStatus('failed');
          setError('Payment was not completed. Please try again.');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setStatus('failed');
        setError(error.response?.data?.message || error.message || 'Failed to verify payment');
      }
    };

    verifyPayment();
  }, [searchParams]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Verifying Payment...</h2>
          <p className="text-gray-600">Please wait while we verify your payment</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-6">Your order has been placed successfully</p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-2">Order ID:</p>
            <p className="font-mono text-sm text-gray-800">{orderId}</p>
          </div>

          <div className="space-y-3">
            <Link
              to={`/orders/${orderId}`}
              className="w-full px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors block"
            >
              View Order Details
            </Link>
            
            <Link
              to="/"
              className="w-full px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors block"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold mb-2">Payment Failed</h2>
        <p className="text-gray-600 mb-6">{error}</p>

        <div className="space-y-3">
          <Link
            to="/checkout"
            className="w-full px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors block"
          >
            Try Again
          </Link>
          
          <Link
            to="/"
            className="w-full px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors block"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
