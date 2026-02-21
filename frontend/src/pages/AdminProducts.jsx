import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../services/api';
import CustomModal from '../components/CustomModal';
import { toast, ToastContainer } from 'react-toastify';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, productId: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const productsPerPage = 9;

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, currentPage]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getProducts({ 
        search: searchTerm,
        page: currentPage,
        limit: productsPerPage
      });
      setProducts(response.data.data);
      if (response.data.pagination) {
        setTotalPages(response.data.pagination.pages);
        setTotalProducts(response.data.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
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
      toast.success('Product deleted successfully!');
      fetchProducts(); // Refresh products after deletion
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(error.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleProductStatus = async (id, currentStatus) => {
    try {
      await adminAPI.updateProduct(id, { isAvailable: !currentStatus });
      toast.success(`Product ${!currentStatus ? 'enabled' : 'disabled'} successfully!`);
      fetchProducts(); // Refresh products after status change
    } catch (error) {
      console.error('Error updating product status:', error);
      toast.error('Failed to update product status');
    }
  };

  const handleFeaturedStatus = async (id, currentStatus) => {
    try {
      await adminAPI.updateProduct(id, { isFeatured: !currentStatus });
      toast.success(`Product ${!currentStatus ? 'marked as featured' : 'removed from featured'} successfully!`);
      fetchProducts(); // Refresh products after status change
    } catch (error) {
      console.error('Error updating featured status:', error);
      toast.error('Failed to update featured status');
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
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    {product.isFeatured && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 flex items-center gap-1">
                        <i className="fas fa-star"></i> Featured
                      </span>
                    )}
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
                  
                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={`/admin/products/${product._id}`}
                      className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center space-x-1"
                    >
                      <i className="fas fa-edit"></i>
                      <span>Edit</span>
                    </Link>
                    <button
                      onClick={() => handleFeaturedStatus(product._id, product.isFeatured)}
                      className={`px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-1 ${
                        product.isFeatured
                          ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      title={product.isFeatured ? 'Remove from Featured' : 'Mark as Featured'}
                    >
                      <i className="fas fa-star"></i>
                      <span>{product.isFeatured ? 'Unfeature' : 'Feature'}</span>
                    </button>
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
                       className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center space-x-1"
                     >
                       <i className="fas fa-trash"></i>
                       <span>Delete</span>
                     </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-8 space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentPage === 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-primary/90'
              }`}
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => setCurrentPage(index + 1)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentPage === index + 1
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {index + 1}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentPage === totalPages
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-primary/90'
              }`}
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        )}

        {/* Products count */}
        {totalProducts > 0 && (
          <div className="text-center mt-4 text-gray-600">
            Showing {products.length} of {totalProducts} products
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
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default AdminProducts;
