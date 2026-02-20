import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../services/api';
import CustomModal from '../components/CustomModal';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, productId: null });

  useEffect(() => {
    fetchProducts();
  }, [searchTerm]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getProducts({ search: searchTerm });
      setProducts(response.data.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = (id) => {
    setDeleteModal({ isOpen: true, productId: id });
  };

  const confirmDeleteProduct = async () => {
    try {
      await adminAPI.deleteProduct(deleteModal.productId);
      fetchProducts(); // Refresh products after deletion
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleProductStatus = async (id, currentStatus) => {
    try {
      await adminAPI.updateProduct(id, { isAvailable: !currentStatus });
      fetchProducts(); // Refresh products after status change
    } catch (error) {
      console.error('Error updating product status:', error);
    }
  };

  return (
    <div className="min-h-screen py-8 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Manage Products</h1>
            <p className="text-gray-600 mt-1">Add, edit, and delete products</p>
          </div>
          <Link
            to="/admin/products/add"
            className="px-6 py-3 bg-gradient-to-r from-primary to-primary/90 text-white rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
          >
            <i className="fas fa-plus"></i>
            <span>Add Product</span>
          </Link>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
            />
            <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg"></i>
          </div>
        </div>

        {/* Products list */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <i className="fas fa-search text-gray-400 text-6xl mb-4"></i>
            <h3 className="text-xl font-bold mb-2 text-gray-800">No products found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search or add a new product</p>
            <Link
              to="/admin/products/add"
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <i className="fas fa-plus mr-2"></i>
              Add Product
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x300?text=Product+Image';
                    }}
                  />
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      product.isAvailable
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-2">{product.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{product.description.slice(0, 100)}...</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 mb-1">Price</div>
                      <div className="text-xl font-bold text-primary">${product.price.toFixed(2)}</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">
                        {product.category}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <i className="fas fa-box mr-1"></i>
                      Stock: {product.stock}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Link
                      to={`/admin/products/${product._id}`}
                      className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center space-x-1"
                    >
                      <i className="fas fa-edit"></i>
                      <span>Edit</span>
                    </Link>
                    <button
                      onClick={() => handleProductStatus(product._id, product.isAvailable)}
                      className={`px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-1 ${
                        product.isAvailable
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : 'bg-green-500 text-white hover:bg-green-600'
                      }`}
                    >
                      <i className={product.isAvailable ? 'fas fa-times' : 'fas fa-check'}></i>
                      <span>{product.isAvailable ? 'Disable' : 'Enable'}</span>
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product._id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <CustomModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, productId: null })}
        onConfirm={confirmDeleteProduct}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default AdminProducts;
