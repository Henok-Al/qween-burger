import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { adminAPI } from '../services/api';
import CustomModal from '../components/CustomModal';

const AdminOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [errors, setErrors] = useState({});
  const [statusModal, setStatusModal] = useState({ isOpen: false, newStatus: null });

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await adminAPI.getOrder(id);
        setOrder(response.data.data);
      } catch (error) {
        console.error('Error fetching order:', error);
        setErrors({
          submit: error.response?.data?.message || 'Failed to fetch order details',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const handleStatusUpdate = (newStatus) => {
    setStatusModal({ isOpen: true, newStatus });
  };

  const confirmStatusUpdate = async () => {
    setUpdating(true);

    try {
      await adminAPI.updateOrderStatus(id, { status: statusModal.newStatus });
      
      // Refresh order details
      const response = await adminAPI.getOrder(id);
      setOrder(response.data.data);
    } catch (error) {
      console.error('Error updating order status:', error);
      setErrors({
        submit: error.response?.data?.message || 'Failed to update order status',
      });
    } finally {
      setUpdating(false);
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
            to="/admin/orders"
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Order Details</h1>
            <p className="text-gray-600 mt-1">View and manage order information</p>
          </div>
          <button
            onClick={() => navigate('/admin/orders')}
            className="px-6 py-2 border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Back to Orders
          </button>
        </div>

        {errors.submit && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-500 text-sm">{errors.submit}</p>
          </div>
        )}

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

                {/* Status update buttons */}
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Update Status:</h4>
                  <div className="flex flex-wrap gap-2">
                    {order.status !== 'pending' && (
                      <button
                        onClick={() => handleStatusUpdate('pending')}
                        disabled={updating}
                        className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium hover:bg-yellow-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Mark as Pending
                      </button>
                    )}
                    {order.status !== 'processing' && (
                      <button
                        onClick={() => handleStatusUpdate('processing')}
                        disabled={updating}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Mark as Processing
                      </button>
                    )}
                    {order.status !== 'shipped' && (
                      <button
                        onClick={() => handleStatusUpdate('shipped')}
                        disabled={updating}
                        className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Mark as Shipped
                      </button>
                    )}
                    {order.status !== 'delivered' && (
                      <button
                        onClick={() => handleStatusUpdate('delivered')}
                        disabled={updating}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Mark as Delivered
                      </button>
                    )}
                    {order.status !== 'cancelled' && (
                      <button
                        onClick={() => handleStatusUpdate('cancelled')}
                        disabled={updating}
                        className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
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

          {/* Customer information */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h4 className="text-lg font-semibold mb-4">Customer Information</h4>

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
                     order.paymentMethod === 'online' ? 'Online Payment (Chapa)' : 
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
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Confirmation Modal */}
      <CustomModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal({ isOpen: false, newStatus: null })}
        onConfirm={confirmStatusUpdate}
        title="Update Order Status"
        message={`Are you sure you want to update order status to "${statusModal.newStatus}"?`}
        confirmText="Update"
        cancelText="Cancel"
        confirmButtonClass="bg-blue-600 hover:bg-blue-700"
      />
    </div>
  );
};

export default AdminOrderDetails;
