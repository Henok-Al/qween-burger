import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import CustomModal from '../components/CustomModal';

const Cart = () => {
  const { language } = useLanguage();
  const { items, totalItems, totalPrice, removeFromCart, updateQuantity, clearCart } = useCart();
  const [removeModal, setRemoveModal] = useState({ isOpen: false, productId: null });
  const [clearCartModal, setClearCartModal] = useState(false);

  const handleQuantityChange = (productId, quantity) => {
    if (quantity > 0 && quantity <= 10) {
      updateQuantity(productId, quantity);
    }
  };

  const handleRemoveItem = (productId) => {
    setRemoveModal({ isOpen: true, productId });
  };

  const confirmRemoveItem = () => {
    removeFromCart(removeModal.productId);
  };

  const handleClearCart = () => {
    setClearCartModal(true);
  };

  const confirmClearCart = () => {
    clearCart();
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">{language === 'en' ? 'Shopping Cart' : 'የሻንጉት ገነት'}</h1>
          <p className="text-gray-600">{language === 'en' ? 'Review your items and proceed to checkout' : 'የእርስዎን አይነት ይመልከቱ እና ይቀጥላል'}</p>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <i className="fas fa-shopping-cart text-gray-400 text-6xl mb-4"></i>
            <h2 className="text-2xl font-semibold mb-2">{language === 'en' ? 'Your cart is empty' : 'የእርስዎ ሻንጉት ባዶ ነው'}</h2>
            <p className="text-gray-600 mb-6">{language === 'en' ? 'Start shopping to add items to your cart' : 'አገልግሎችን ይከፍልዎን'}</p>
            <Link
              to="/products"
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              {language === 'en' ? 'Shop Now' : 'አገልግሎችን ይከፍልዎን'}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {items.map((item) => (
                  <div key={item.product._id} className="p-6 border-b border-gray-200">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-24 h-24 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/100x100?text=Product+Image';
                          }}
                        />
                      </div>

                      <div className="flex-grow">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-semibold mb-1">
                              {item.product.name}
                            </h3>
                            <div className="text-sm text-gray-500 mb-2">
                              ${item.product.price.toFixed(2)} each
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item.product._id)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>

                        <div className="flex items-center space-x-4 mt-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="w-10 h-10 flex items-center justify-center bg-primary text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors font-bold text-lg"
                            >
                              −
                            </button>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) =>
                                handleQuantityChange(item.product._id, parseInt(e.target.value))
                              }
                              min="1"
                              max="10"
                              className="w-16 px-2 py-2 text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-lg font-semibold"
                            />
                            <button
                              onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                              disabled={item.quantity >= 10}
                              className="w-10 h-10 flex items-center justify-center bg-primary text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors font-bold text-lg"
                            >
                              +
                            </button>
                          </div>

                          <div className="ml-auto font-semibold text-lg">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between mt-6">
                <Link
                  to="/products"
                  className="px-6 py-2 border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors"
                >
                  <i className="fas fa-arrow-left mr-2"></i>
                  {language === 'en' ? 'Continue Shopping' : 'ይቀጥላል ያገዛል'}
                </Link>

                <button
                  onClick={() => {
                    if (window.confirm(language === 'en' ? 'Are you sure you want to clear your cart?' : 'የእርስዎ ሻንጉትን ይሰረዝዎት?')) {
                      window.location.href = '/cart';
                    }
                  }}
                  className="px-6 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <i className="fas fa-trash mr-2"></i>
                  {language === 'en' ? 'Clear Cart' : 'የሻንጉትን ይሰረዝዎት'}
                </button>
              </div>
            </div>

            {/* Cart summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items</span>
                    <span className="font-medium">{totalItems}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">${(totalPrice * 0.08).toFixed(2)}</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span className="text-primary">
                      ${(totalPrice * 1.08).toFixed(2)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    *Includes 8% sales tax
                  </div>
                </div>

                <Link
                  to="/checkout"
                  className="w-full px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2"
                >
                  <span>Proceed to Checkout</span>
                  <i className="fas fa-arrow-right"></i>
                </Link>

                <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                  <div className="flex items-center">
                    <i className="fas fa-shipping-fast mr-2 text-primary"></i>
                    <span>Free shipping on orders over $50</span>
                  </div>
                </div>

                <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                  <div className="flex items-center">
                    <i className="fas fa-shield-alt mr-2 text-primary"></i>
                    <span>Secure checkout</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
