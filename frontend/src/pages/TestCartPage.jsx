import { useCart } from '../context/CartContext';

const TestCartPage = () => {
  const { addToCart, items } = useCart();

  const testProduct = {
    _id: '1',
    name: 'Test Product',
    price: 10.99,
    image: 'https://via.placeholder.com/200',
    category: 'test',
    description: 'This is a test product',
    isAvailable: true,
  };

  const handleAdd = () => {
    console.log('Adding test product to cart');
    addToCart(testProduct, 1);
  };

  return (
    <div className="p-8">
      <h1>Test Cart Page</h1>
      <button onClick={handleAdd} className="px-4 py-2 bg-blue-500 text-white rounded">
        Add Test Product
      </button>
      <div className="mt-4">
        <h2>Cart Items: {items.length}</h2>
        <pre>{JSON.stringify(items, null, 2)}</pre>
      </div>
    </div>
  );
};

export default TestCartPage;
