import { useCart } from '../context/CartContext';

const DirectCartTest = () => {
  const { addToCart, items } = useCart();
  
  const testProduct = {
    _id: 'direct-test-1',
    name: 'Direct Test Product',
    price: 19.99,
    image: 'https://via.placeholder.com/200',
    category: 'test',
    description: 'Product for direct testing',
    isAvailable: true,
    stock: 100
  };

  const handleClick = (e) => {
    e.stopPropagation();
    console.log('DirectCartTest button clicked');
    console.log('Adding product:', testProduct);
    addToCart(testProduct, 1);
  };

  return (
    <div className="bg-white p-4 rounded shadow-md mb-4">
      <h3>Direct Cart Test</h3>
      <button 
        onClick={handleClick}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Add Test Product
      </button>
      <div className="mt-2">Items in cart: {items.length}</div>
      <div className="mt-2 text-sm">
        {JSON.stringify(items)}
      </div>
    </div>
  );
};

export default DirectCartTest;
