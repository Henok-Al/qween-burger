import { useCart } from '../context/CartContext';

const MinimalCartTest = () => {
  console.log('=== MinimalCartTest Rendered ===');
  const { addToCart, items, totalItems, totalPrice, testContext } = useCart();
  console.log('Cart state:', { items, totalItems, totalPrice });
  
  // Call test method to verify context is working
  const contextWorking = testContext();
  console.log('Context test result:', contextWorking);

  const handleClick = () => {
    console.log('=== Button Clicked ===');
    addToCart(
      {
        _id: 'test-product-1',
        name: 'Test Product',
        price: 10.99,
        image: 'https://via.placeholder.com/200',
        category: 'test',
        description: 'This is a minimal test product',
        isAvailable: true,
      },
      1
    );
  };

  return (
    <div style={{
      border: '1px solid gray',
      padding: '20px',
      margin: '20px',
      backgroundColor: 'white'
    }}>
      <h3>Minimal Cart Test</h3>
      <button 
        onClick={handleClick}
        style={{
          backgroundColor: '#ff6b00',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          fontSize: '16px',
          cursor: 'pointer',
          borderRadius: '5px'
        }}
      >
        Add Test Product
      </button>
      <div style={{ marginTop: '10px' }}>
        Items: {items.length} - Total Price: ${totalPrice.toFixed(2)}
      </div>
      <div style={{ marginTop: '10px', fontSize: '12px' }}>
        {JSON.stringify(items)}
      </div>
    </div>
  );
};

export default MinimalCartTest;
