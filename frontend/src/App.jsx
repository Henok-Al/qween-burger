import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminLayout from './components/AdminLayout';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminOrders from './pages/AdminOrders';
import AdminUsers from './pages/AdminUsers';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import AdminOrderDetails from './pages/AdminOrderDetails';
import NotFound from './pages/NotFound';
import PaymentSuccess from './pages/PaymentSuccess';
import AdminCategories from './pages/AdminCategories';
import AddCategory from './pages/AddCategory';
import EditCategory from './pages/EditCategory';
import TestCartPage from './pages/TestCartPage';
import TestCart from './components/TestCart';
import Contact from './pages/Contact';
const CartTest = () => {
  const { addToCart, items, totalItems, totalPrice } = useCart();
  
  const handleTestClick = () => {
    console.log('=== CartTest Button Clicked ===');
    console.log('Current state:', { items, totalItems, totalPrice });
    const testProduct = {
      _id: 'test-123',
      name: 'Test Product',
      price: 10.99,
      image: 'https://via.placeholder.com/200',
      category: 'test',
      description: 'Test product for debugging',
      isAvailable: true,
    };
    addToCart(testProduct, 1);
  };
  
  return (
    <div>
      <button 
        onClick={handleTestClick}
        className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors mb-4"
      >
        Add Test Product
      </button>
      <div className="mb-4">
        <p className="font-medium">Items: {items.length}</p>
        <p className="font-medium">Total Items: {totalItems}</p>
        <p className="font-medium">Total Price: ${totalPrice.toFixed(2)}</p>
      </div>
      <div className="text-sm">
        <p>Items: {JSON.stringify(items)}</p>
      </div>
    </div>
  );
};

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Admin route component
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return isAuthenticated && user?.role === 'admin' ? children : <Navigate to="/" />;
};

function App() {
  return (
    <CartProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes with Navbar and Footer */}
            <Route path="/" element={
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-grow">
                  <Home />
                </main>
                <Footer />
              </div>
            } />
            <Route path="/products" element={
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-grow">
                  <Products />
                </main>
                <Footer />
              </div>
            } />
            <Route path="/products/:id" element={
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-grow">
                  <ProductDetails />
                </main>
                <Footer />
              </div>
            } />
            <Route path="/login" element={
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-grow">
                  <Login />
                </main>
                <Footer />
              </div>
            } />
            <Route path="/register" element={
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-grow">
                  <Register />
                </main>
                <Footer />
              </div>
            } />
            <Route path="/forgot-password" element={
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-grow">
                  <ForgotPassword />
                </main>
                <Footer />
              </div>
            } />
            <Route path="/reset-password/:token" element={
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-grow">
                  <ResetPassword />
                </main>
                <Footer />
              </div>
            } />
            <Route path="/cart" element={
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-grow">
                  <Cart />
                </main>
                <Footer />
              </div>
            } />
            <Route path="/contact" element={
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-grow">
                  <Contact />
                </main>
                <Footer />
              </div>
            } />
            
            {/* Payment success route (no navbar/footer for clean experience) */}
            <Route path="/payment-success" element={
              <ProtectedRoute>
                <PaymentSuccess />
              </ProtectedRoute>
            } />
            
            {/* Test route */}
            <Route path="/test-cart" element={
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-grow">
                  <div className="container mx-auto px-4 py-8">
                    <h2 className="text-2xl font-bold mb-4">Test Cart Page</h2>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                      <h3 className="text-xl font-semibold mb-4">Direct Cart Test</h3>
                      <CartTest />
                    </div>
                  </div>
                </main>
                <Footer />
              </div>
            } />
            
            {/* Protected routes with Navbar and Footer */}
            <Route path="/checkout" element={
              <ProtectedRoute>
                <div className="min-h-screen flex flex-col">
                  <Navbar />
                  <main className="flex-grow">
                    <Checkout />
                  </main>
                  <Footer />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute>
                <div className="min-h-screen flex flex-col">
                  <Navbar />
                  <main className="flex-grow">
                    <Orders />
                  </main>
                  <Footer />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/orders/:id" element={
              <ProtectedRoute>
                <div className="min-h-screen flex flex-col">
                  <Navbar />
                  <main className="flex-grow">
                    <OrderDetails />
                  </main>
                  <Footer />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <div className="min-h-screen flex flex-col">
                  <Navbar />
                  <main className="flex-grow">
                    <Profile />
                  </main>
                  <Footer />
                </div>
              </ProtectedRoute>
            } />
            
            {/* Admin routes with AdminLayout (Sidebar) */}
            <Route path="/admin" element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="products/add" element={<AddProduct />} />
              <Route path="products/:id" element={<EditProduct />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="orders/:id" element={<AdminOrderDetails />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="categories/add" element={<AddCategory />} />
              <Route path="categories/:id/edit" element={<EditCategory />} />
            </Route>
            
            {/* 404 route */}
            <Route path="*" element={
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-grow">
                  <NotFound />
                </main>
                <Footer />
              </div>
            } />
          </Routes>
        </Router>
      </AuthProvider>
    </CartProvider>
  );
}

export default App;
