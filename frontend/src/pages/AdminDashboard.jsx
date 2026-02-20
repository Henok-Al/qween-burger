import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../services/api';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await adminAPI.getDashboardStats();
        setStats(response.data.data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4 flex justify-center items-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const chartData = stats.monthlyStats.map(stat => ({
    month: stat._id,
    orders: stat.orders,
    revenue: stat.revenue.toFixed(2)
  }));

  return (
    <div className="min-h-screen py-8 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4 text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your burger store with powerful analytics</p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-users text-white text-2xl"></i>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Users</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-hamburger text-white text-2xl"></i>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Products</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalProducts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-shopping-cart text-white text-2xl"></i>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Orders</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-dollar-sign text-white text-2xl"></i>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-800">${stats.totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-6 text-gray-800">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/admin/products"
              className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg hover:bg-primary/15 transition-all duration-300 transform hover:scale-105"
            >
              <i className="fas fa-hamburger text-primary text-3xl mb-3"></i>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Manage Products</h3>
              <p className="text-sm text-gray-600">Add, edit, or delete products</p>
            </Link>

            <Link
              to="/admin/orders"
              className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg hover:bg-primary/15 transition-all duration-300 transform hover:scale-105"
            >
              <i className="fas fa-shopping-cart text-primary text-3xl mb-3"></i>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Manage Orders</h3>
              <p className="text-sm text-gray-600">View and process orders</p>
            </Link>

            <Link
              to="/admin/users"
              className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg hover:bg-primary/15 transition-all duration-300 transform hover:scale-105"
            >
              <i className="fas fa-users text-primary text-3xl mb-3"></i>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Manage Users</h3>
              <p className="text-sm text-gray-600">View and manage customer accounts</p>
            </Link>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold mb-6 text-gray-800">Monthly Revenue</h3>
            <div className="h-80 min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', r: 4 }}
                    activeDot={{ r: 6 }}
                    fill="#dbeafe"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Orders Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold mb-6 text-gray-800">Monthly Orders</h3>
            <div className="h-80 min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="orders" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Monthly statistics table */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Detailed Monthly Statistics</h2>
          {stats.monthlyStats.length === 0 ? (
            <div className="text-center py-12">
              <i className="fas fa-chart-line text-gray-400 text-6xl mb-4"></i>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">No monthly data available</h3>
              <p className="text-gray-600">Start taking orders to see monthly statistics</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-800">Month</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-800">Orders</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-800">Revenue</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-800">Avg Order Value</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.monthlyStats.map((stat, index) => {
                    const avgOrderValue = stat.revenue / stat.orders || 0;
                    return (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 font-medium text-gray-800">{stat._id}</td>
                        <td className="py-3 px-4 text-gray-700">{stat.orders}</td>
                        <td className="py-3 px-4 text-gray-700">${stat.revenue.toFixed(2)}</td>
                        <td className="py-3 px-4 text-gray-700">${avgOrderValue.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
