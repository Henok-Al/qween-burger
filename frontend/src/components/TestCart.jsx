import { useCart } from '../context/CartContext';

const TestCart = () => {
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
    console.log('Button clicked');
    console.log('Test product:', testProduct);
    console.log('addToCart function:', addToCart);
    addToCart(testProduct, 1);
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md text-center">
      <h3 className="text-xl font-semibold mb-4">Test Cart Component</h3>
      <button 
        onClick={handleAdd}
        className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors mb-4"
      >
        Add Test Product
      </button>
      <div className="text-lg">Cart Items: {items.length}</div>
      <div className="mt-2">{JSON.stringify(items)}</div>
    </div>
  );
};

export default TestCart;
