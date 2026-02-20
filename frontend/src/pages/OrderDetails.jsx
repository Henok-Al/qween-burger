import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { orderAPI, paymentAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import socketService from '../services/socket';

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [paying, setPaying] = useState(false);
  const { reorder } = useCart();
  const navigate = useNavigate();

  const handleReorder = async () => {
    setReordering(true);
    
    try {
      reorder(order);
      navigate('/cart');
    } catch (error) {
      console.error('Error reordering:', error);
    } finally {
      setReordering(false);
    }
  };

  const handlePayNow = async () => {
    setPaying(true);
    
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
      setPaying(false);
    }
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await orderAPI.getOrderById(id);
        setOrder(response.data.data);
      } catch (error) {
        console.error('Error fetching order details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();

    // Listen for order status updates
    const handleOrderStatusUpdate = (updatedOrder) => {
      if (updatedOrder._id === id) {
        setOrder(updatedOrder);
      }
    };

    socketService.on('orderStatusUpdate', handleOrderStatusUpdate);

    return () => {
      socketService.off('orderStatusUpdate', handleOrderStatusUpdate);
    };
  }, [id]);

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    setCancelling(true);

    try {
      await orderAPI.cancelOrder(id);
      // Refresh order details
      const response = await orderAPI.getOrderById(id);
      setOrder(response.data.data);
    } catch (error) {
      console.error('Error cancelling order:', error);
    } finally {
      setCancelling(false);
    }
  };

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

  if (!order) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4 text-center">
          <i className="fas fa-exclamation-triangle text-6xl text-yellow-500 mb-4"></i>
          <h2 className="text-2xl font-semibold mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-4">The order you are looking for does not exist.</p>
          <Link
            to="/orders"
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">Order Details</h1>
          <p className="text-gray-600">View complete order information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Order #{order._id.slice(-8).toUpperCase()}
                    </h3>
                    <div className="text-sm text-gray-500">
                      Placed on: {formatDate(order.createdAt)}
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

                <div className="mt-4 flex flex-wrap gap-3">
                {/* Pay Now button for pending online payments */}
                {order.paymentStatus === 'pending' && order.paymentMethod === 'online' && (
                  <button
                    onClick={handlePayNow}
                    disabled={paying}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {paying ? (
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
                
                {order.status !== 'cancelled' && (
                  <button
                    onClick={handleCancelOrder}
                    disabled={cancelling || order.status === 'delivered'}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {cancelling ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Cancelling...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-times mr-2"></i>
                        Cancel Order
                      </>
                    )}
                  </button>
                )}
                
                <button
                  onClick={handleReorder}
                  disabled={reordering}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {reordering ? (
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
              </div>
              </div>

              <div className="p-6 border-b border-gray-200">
                <h4 className="text-lg font-semibold mb-4">Items</h4>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <img
                          src={item.product?.image || 'https://via.placeholder.com/100x100?text=Product+Image'}
                          alt={item.product?.name || 'Product'}
                          className="w-16 h-16 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/100x100?text=Product+Image';
                          }}
                        />
                      </div>

                      <div className="flex-grow">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-semibold mb-1">{item.product?.name || 'Unknown Product'}</h5>
                            <div className="text-sm text-gray-500">
                              ${(item.product?.price || item.price || 0).toFixed(2)} each
                            </div>
                          </div>
                          <div className="font-semibold">
                            ${((item.product?.price || item.price || 0) * item.quantity).toFixed(2)}
                          </div>
                        </div>

                        <div className="mt-2">
                          <span className="text-sm text-gray-500">
                            Quantity: {item.quantity}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6">
                <h4 className="text-lg font-semibold mb-4">Order Summary</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${(order.totalAmount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">${((order.totalAmount || 0) * 0.08).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-primary">
                    <span>Total</span>
                    <span>${((order.totalAmount || 0) * 1.08).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery information */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h4 className="text-lg font-semibold mb-4">Delivery Information</h4>

              <div className="space-y-4 mb-6">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Name</div>
                  <div className="font-medium">{order.user?.name || 'N/A'}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 mb-1">Email</div>
                  <div className="font-medium">{order.user?.email || 'N/A'}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 mb-1">Phone</div>
                  <div className="font-medium">{order.user?.phone || 'N/A'}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 mb-1">Address</div>
                  <div className="font-medium">{order.deliveryAddress || 'N/A'}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 mb-1">Payment Method</div>
                  <div className="font-medium">
                    {order.paymentMethod === 'cod' || order.paymentMethod === 'cash' ? 'Cash on Delivery' : 
                     order.paymentMethod === 'online' || order.paymentMethod === 'chapa' ? 'Online Payment (Chapa)' : 
                     order.paymentMethod === 'card' ? 'Card Payment' : 'Online Payment'}
                  </div>
                </div>
              </div>

              {order.estimatedDeliveryTime && (
                <div className="p-3 bg-blue-50 rounded-lg mb-6">
                  <div className="flex items-center">
                    <i className="fas fa-clock text-blue-600 mr-2"></i>
                    <span className="font-medium">
                      Estimated Delivery: {formatDate(order.estimatedDeliveryTime)}
                    </span>
                  </div>
                </div>
              )}

              {order.actualDeliveryTime && (
                <div className="p-3 bg-green-50 rounded-lg mb-6">
                  <div className="flex items-center">
                    <i className="fas fa-check-circle text-green-600 mr-2"></i>
                    <span className="font-medium">
                      Delivered on: {formatDate(order.actualDeliveryTime)}
                    </span>
                  </div>
                </div>
              )}

              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <i className="fas fa-truck text-primary mr-2"></i>
                  <span className="font-medium">Track Your Order</span>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  You will receive updates via SMS and email
                </div>
              </div>

              <Link
                to="/orders"
                className="w-full mt-6 px-6 py-2 border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors flex items-center justify-center space-x-2"
              >
                <i className="fas fa-arrow-left"></i>
                <span>Back to Orders</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
