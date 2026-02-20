import { useCart } from '../context/CartContext';

const SimpleCartTest = () => {
  const cartContext = useCart();
  console.log('=== SimpleCartTest Component Rendered ===');
  console.log('CartContext value:', cartContext);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Simple Cart Test</h3>
      <div className="mb-4">
        <p className="font-medium">Context Available:</p>
        <p>{cartContext ? 'Yes' : 'No'}</p>
      </div>
      <div className="mb-4">
        <p className="font-medium">Items:</p>
        <p>{cartContext?.items?.length}</p>
      </div>
      <div className="mb-4">
        <p className="font-medium">Total Items:</p>
        <p>{cartContext?.totalItems}</p>
      </div>
      <div className="mb-4">
        <p className="font-medium">Total Price:</p>
        <p>${cartContext?.totalPrice?.toFixed(2)}</p>
      </div>
      <button 
        onClick={(e) => {
          console.log('=== Button Click Event ===');
          console.log('Event object:', e);
          console.log('Add to cart clicked');
          const testProduct = {
            _id: '1',
            name: 'Test Product',
            price: 10.99,
            image: 'https://via.placeholder.com/200',
            category: 'test',
            description: 'This is a test product',
            isAvailable: true,
          };
          console.log('Test product:', testProduct);
          console.log('addToCart function:', cartContext?.addToCart);
          cartContext?.addToCart(testProduct, 1);
        }}
        className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
      >
        Add Test Product
      </button>
    </div>
  );
};

export default SimpleCartTest;
