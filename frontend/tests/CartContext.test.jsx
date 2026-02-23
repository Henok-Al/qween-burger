import React from 'react';
import { render, act } from '@testing-library/react';
import { CartProvider, useCart } from '../src/context/CartContext';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Test component to access cart context
const TestComponent = () => {
  const cart = useCart();
  return (
    <div>
      <span data-testid="totalItems">{cart.totalItems}</span>
      <span data-testid="totalPrice">{cart.totalPrice}</span>
      <span data-testid="itemCount">{cart.items.length}</span>
      <button data-testid="addBtn" onClick={() => cart.addToCart({ _id: '1', name: 'Burger', price: 10 }, 1)}>
        Add
      </button>
      <button data-testid="clearBtn" onClick={() => cart.clearCart()}>
        Clear
      </button>
    </div>
  );
};

describe('CartContext', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockClear();
    localStorageMock.clear.mockClear();
  });

  test('should provide initial cart state', () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    expect(document.querySelector('[data-testid="totalItems"]').textContent).toBe('0');
    expect(document.querySelector('[data-testid="totalPrice"]').textContent).toBe('0');
    expect(document.querySelector('[data-testid="itemCount"]').textContent).toBe('0');
  });

  test('should add item to cart', async () => {
    const { getByTestId } = render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    await act(async () => {
      getByTestId('addBtn').click();
    });

    expect(document.querySelector('[data-testid="itemCount"]').textContent).toBe('1');
    expect(document.querySelector('[data-testid="totalItems"]').textContent).toBe('1');
    expect(document.querySelector('[data-testid="totalPrice"]').textContent).toBe('10');
  });

  test('should add multiple quantities of same item', async () => {
    const { getByTestId } = render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    await act(async () => {
      getByTestId('addBtn').click();
      getByTestId('addBtn').click();
    });

    expect(document.querySelector('[data-testid="itemCount"]').textContent).toBe('1');
    expect(document.querySelector('[data-testid="totalItems"]').textContent).toBe('2');
    expect(document.querySelector('[data-testid="totalPrice"]').textContent).toBe('20');
  });

  test('should clear cart', async () => {
    const { getByTestId } = render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    await act(async () => {
      getByTestId('addBtn').click();
    });

    expect(document.querySelector('[data-testid="itemCount"]').textContent).toBe('1');

    await act(async () => {
      getByTestId('clearBtn').click();
    });

    expect(document.querySelector('[data-testid="itemCount"]').textContent).toBe('0');
    expect(document.querySelector('[data-testid="totalItems"]').textContent).toBe('0');
    expect(document.querySelector('[data-testid="totalPrice"]').textContent).toBe('0');
  });

  test('should persist cart to localStorage', async () => {
    const { getByTestId } = render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    await act(async () => {
      getByTestId('addBtn').click();
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'cart',
      expect.stringContaining('"items"')
    );
  });

  test('should throw error when useCart is used outside CartProvider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useCart must be used within a CartProvider');
    
    consoleError.mockRestore();
  });
});
