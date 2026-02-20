import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  console.log('ProductCard received product:', product);
  console.log('Product isAvailable:', product.isAvailable);

  const handleAddToCart = () => {
    console.log('handleAddToCart called with:', product);
    addToCart(product, 1);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:translate-y-2">
      <Link to={`/products/${product._id}`}>
        <div className="relative">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-48 object-cover"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x300?text=Product+Image';
            }}
          />
          {!product.isAvailable || product.stock <= 0 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white font-medium px-4 py-2 rounded-full bg-red-500">
                Out of Stock
              </span>
            </div>
          )}
          {product.ratings > 0 && (
            <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-sm flex items-center">
              <i className="fas fa-star mr-1"></i>
              <span>{product.ratings}</span>
            </div>
          )}
        </div>
      </Link>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="text-sm text-gray-500">{product.category}</div>
          <div className="text-lg font-bold text-primary">${product.price.toFixed(2)}</div>
        </div>
        
        <Link to={`/products/${product._id}`}>
          <h3 className="text-lg font-semibold mb-2 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>
        
        <div className="flex space-x-2">
          <button
            onClick={handleAddToCart}
            disabled={!product.isAvailable || product.stock <= 0}
            className="flex-1 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-1"
          >
            <i className="fas fa-shopping-cart"></i>
            <span>Add to Cart</span>
          </button>
          
          <Link
            to={`/products/${product._id}`}
            className="px-4 py-2 border border-primary text-primary rounded hover:bg-primary/5 transition-colors"
          >
            View
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
