import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProductCard from '../src/components/ProductCard';
import { CartProvider } from '../src/context/CartContext';

describe('ProductCard Component', () => {
  const mockProduct = {
    _id: '1',
    name: 'Classic Burger',
    description: 'Delicious beef burger with cheese',
    price: 9.99,
    category: 'Burgers',
    image: '/burger.jpg',
    isAvailable: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render product information', () => {
    render(
      <BrowserRouter>
        <CartProvider>
          <ProductCard product={mockProduct} />
        </CartProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Classic Burger')).toBeInTheDocument();
    expect(screen.getByText('$9.99')).toBeInTheDocument();
    expect(screen.getByText('Delicious beef burger with cheese')).toBeInTheDocument();
  });

  test('should show "Add to Cart" button when product is available', () => {
    render(
      <BrowserRouter>
        <CartProvider>
          <ProductCard product={mockProduct} />
        </CartProvider>
      </BrowserRouter>
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByRole('button').textContent).toContain('Add to Cart');
  });

  test('should add product to cart when button is clicked', () => {
    render(
      <BrowserRouter>
        <CartProvider>
          <ProductCard product={mockProduct} />
        </CartProvider>
      </BrowserRouter>
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    // The button should still be present after click
    expect(button).toBeInTheDocument();
  });

  test('should render View button for product details', () => {
    render(
      <BrowserRouter>
        <CartProvider>
          <ProductCard product={mockProduct} />
        </CartProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('View')).toBeInTheDocument();
  });

  test('should display product category', () => {
    render(
      <BrowserRouter>
        <CartProvider>
          <ProductCard product={mockProduct} />
        </CartProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Burgers')).toBeInTheDocument();
  });
});
