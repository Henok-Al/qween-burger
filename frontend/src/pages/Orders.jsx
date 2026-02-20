import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { orderAPI, paymentAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import socketService from '../services/socket';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reorderingId, setReorderingId] = useState(null);
  const [payingId, setPayingId] = useState(null);
  const { reorder } = useCart();
  const navigate = useNavigate();

  const handleReorder = async (order) => {
    setReorderingId(order._id);
    
    try {
      reorder(order);
      navigate('/cart');
    } catch (error) {
      console.error('Error reordering:', error);
    } finally {
      setReorderingId(null);
    }
  };

  const handlePayNow = async (order) => {
    setPayingId(order._id);
    
    try {
      const response = await paymentAPI.initializeChapaPayment(order._id);
      const paymentUrl = response.data?.data?.paymentUrl;
      
      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        alert('Failed to initialize payment. Please try again.');
      }
    } catch (error) {
      console.error('Error initializing payment:', error);
      alert(error.response?.data?.message || 'Failed to initialize payment');
    } finally {
      setPayingId(null);
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await orderAPI.getMyOrders();
        setOrders(response.data.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

    // Listen for new orders
    const handleNewOrder = (newOrder) => {
      setOrders((prevOrders) => [newOrder, ...prevOrders]);
    };

    // Listen for order status updates
    const handleOrderStatusUpdate = (updatedOrder) => {
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === updatedOrder._id ? updatedOrder : order
        )
      );
    };

    socketService.on('newOrder', handleNewOrder);
    socketService.on('orderStatusUpdate', handleOrderStatusUpdate);

    return () => {
      socketService.off('newOrder', handleNewOrder);
      socketService.off('orderStatusUpdate', handleOrderStatusUpdate);
    };
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'processing':
        return 'Processing';
      case 'shipped':
        return 'Shipped';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'paid':
        return 'Paid';
      case 'failed':
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4 flex justify-center items-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">My Orders</h1>
          <p className="text-gray-600">View and track your orders</p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <i className="fas fa-shopping-bag text-gray-400 text-6xl mb-4"></i>
            <h2 className="text-2xl font-semibold mb-2">No orders yet</h2>
            <p className="text-gray-600 mb-6">Start shopping to create your first order</p>
            <Link
              to="/products"
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:translate-y-1"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        Order #{order._id.slice(-8).toUpperCase()}
                      </h3>
                      <div className="text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusText(order.status)}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(
                          order.paymentStatus
                        )}`}
                      >
                        {getPaymentStatusText(order.paymentStatus)}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-semibold mb-2">Items:</h4>
                    <div className="space-y-1">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>
                            {item.product.name} x{item.quantity}
                          </span>
                          <span className="font-medium">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-gray-500">Total Amount</div>
                      <div className="text-xl font-bold text-primary">
                        ${order.totalAmount.toFixed(2)}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {/* Show Pay Now button for pending payments with online payment method */}
                      {order.paymentStatus === 'pending' && order.paymentMethod === 'online' && (
                        <button
                          onClick={() => handlePayNow(order)}
                          disabled={payingId === order._id}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {payingId === order._id ? (
                            <>
                              <i className="fas fa-spinner fa-spin mr-2"></i>
                              Processing...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-credit-card mr-2"></i>
                              Pay Now
                            </>
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => handleReorder(order)}
                        disabled={reorderingId === order._id}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {reorderingId === order._id ? (
                          <>
                            <i className="fas fa-spinner fa-spin mr-2"></i>
                            Reordering...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-redo mr-2"></i>
                            Reorder
                          </>
                        )}
                      </button>
                      <Link
                        to={`/orders/${order._id}`}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
