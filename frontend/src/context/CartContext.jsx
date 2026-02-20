import { createContext, useContext, useReducer, useEffect } from 'react';

// Action types
const ADD_TO_CART = 'ADD_TO_CART';
const REMOVE_FROM_CART = 'REMOVE_FROM_CART';
const UPDATE_QUANTITY = 'UPDATE_QUANTITY';
const CLEAR_CART = 'CLEAR_CART';
const HYDRATE = 'HYDRATE';

// Initial state
const initialState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
};

// Reducer function
const cartReducer = (state, action) => {
  switch (action.type) {
    case HYDRATE:
      return action.payload;
    case ADD_TO_CART: {
      const existingItem = state.items.find(item => item.product._id === action.payload.product._id);
      
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item => 
            item.product._id === action.payload.product._id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          ),
          totalItems: state.totalItems + action.payload.quantity,
          totalPrice: state.totalPrice + action.payload.product.price * action.payload.quantity,
        };
      }
      
      return {
        ...state,
        items: [...state.items, action.payload],
        totalItems: state.totalItems + action.payload.quantity,
        totalPrice: state.totalPrice + action.payload.product.price * action.payload.quantity,
      };
    }
    
    case REMOVE_FROM_CART: {
      const item = state.items.find(item => item.product._id === action.payload);
      
      return {
        ...state,
        items: state.items.filter(item => item.product._id !== action.payload),
        totalItems: state.totalItems - item.quantity,
        totalPrice: state.totalPrice - item.product.price * item.quantity,
      };
    }
    
    case UPDATE_QUANTITY: {
      const item = state.items.find(item => item.product._id === action.payload.productId);
      const quantityChange = action.payload.quantity - item.quantity;
      
      return {
        ...state,
        items: state.items.map(item => 
          item.product._id === action.payload.productId
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
        totalItems: state.totalItems + quantityChange,
        totalPrice: state.totalPrice + (item.product.price * quantityChange),
      };
    }
    
    case CLEAR_CART:
      return initialState;
    
    default:
      return state;
  }
};

// Create context
const CartContext = createContext();

// Custom hook to use the context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Provider component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      dispatch({ type: HYDRATE, payload: parsedCart });
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state));
  }, [state]);

  // Add item to cart
  const addToCart = (product, quantity = 1) => {
    console.log('=== ADD TO CART CALLED ===');
    console.log('Product ID:', product._id);
    console.log('Product Name:', product.name);
    console.log('Product Price:', product.price);
    console.log('Quantity:', quantity);
    
    // Check if product is already in cart
    const existingItemIndex = state.items.findIndex(item => item.product._id === product._id);
    if (existingItemIndex !== -1) {
      console.log('Product already in cart. Existing quantity:', state.items[existingItemIndex].quantity);
    }
    
    dispatch({
      type: ADD_TO_CART,
      payload: { product, quantity },
    });
  };

  // Remove item from cart
  const removeFromCart = (productId) => {
    dispatch({
      type: REMOVE_FROM_CART,
      payload: productId,
    });
  };

  // Update item quantity
  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    
    dispatch({
      type: UPDATE_QUANTITY,
      payload: { productId, quantity },
    });
  };

  // Clear cart
  const clearCart = () => {
    dispatch({ type: CLEAR_CART });
  };

  // Reorder functionality - add all items from an order to cart
  const reorder = (order) => {
    order.items.forEach(item => {
      dispatch({
        type: ADD_TO_CART,
        payload: { product: item.product, quantity: item.quantity },
      });
    });
  };

  // Context value
  const value = {
    ...state,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    reorder,
    // Debug method to test context accessibility
    testContext: () => {
      console.log('=== CartContext Test Method ===');
      console.log('Current state:', state);
      return true;
    },
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
