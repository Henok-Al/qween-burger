import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../services/api';
import socketService from '../services/socket';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchOrders();

    // Listen for new orders
    const handleNewOrder = (newOrder) => {
      if (!filterStatus || newOrder.status === filterStatus) {
        setOrders((prevOrders) => [newOrder, ...prevOrders]);
      }
    };

    // Listen for order status updates
    const handleOrderStatusUpdate = (updatedOrder) => {
      setOrders((prevOrders) => {
        const updated = prevOrders.map((order) =>
          order._id === updatedOrder._id ? updatedOrder : order
        );

        // If filter is active and order no longer matches, remove it
        if (filterStatus && updatedOrder.status !== filterStatus) {
          return updated.filter((order) => order._id !== updatedOrder._id);
        }

        return updated;
      });
    };

    socketService.on('newOrder', handleNewOrder);
    socketService.on('orderStatusUpdate', handleOrderStatusUpdate);

    return () => {
      socketService.off('newOrder', handleNewOrder);
      socketService.off('orderStatusUpdate', handleOrderStatusUpdate);
    };
  }, [filterStatus]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getOrders({ status: filterStatus });
      setOrders(response.data.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen py-8 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Manage Orders</h1>
            <p className="text-gray-600 mt-1">View and process customer orders</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex-1 min-w-[250px]">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Filter by Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              >
                <option value="">All Orders</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders list */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <i className="fas fa-shopping-bag text-gray-400 text-6xl mb-4"></i>
            <h3 className="text-xl font-bold mb-2 text-gray-800">No orders found</h3>
            <p className="text-gray-600 mb-6">
              {filterStatus ? 'No orders with this status' : 'No orders have been placed yet'}
            </p>
            <Link
              to="/"
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <i className="fas fa-home mr-2"></i>
              Go to Home
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-2">
                        Order #{order._id.slice(-8).toUpperCase()}
                      </h3>
                      <div className="text-sm text-gray-600">
                        {formatDate(order.createdAt)}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        order.status
                      )}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Customer</div>
                      <div className="text-sm font-semibold text-gray-800">{order.user.name}</div>
                      <div className="text-xs text-gray-500">{order.user.email}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 mb-1">Total</div>
                      <div className="text-xl font-bold text-primary">
                        ${order.totalAmount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(
                        order.paymentStatus
                      )}`}>
                        {getPaymentStatusText(order.paymentStatus)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <i className="fas fa-shipping-fast mr-1"></i>
                      {order.deliveryAddress.slice(0, 30)}...
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Link
                      to={`/admin/orders/${order._id}`}
                      className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center space-x-1"
                    >
                      <i className="fas fa-eye"></i>
                      <span>View Details</span>
                    </Link>
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

export default AdminOrders;
