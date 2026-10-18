import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import Cart from '../pages/cart/Cart';
import { CartProvider, useCart } from '../context/CartContext';
import { AuthProvider } from '../context/AuthContext';
import cartService from '../services/cartService';

jest.mock('../services/cartService');

// Helper component that populates cart items for testing
const CartWithSeededItems = ({ initialItems = [] }) => {
  const { addToCart } = useCart();
  React.useEffect(() => {
    initialItems.forEach((item) => addToCart(item, item.quantity || 1));
  }, []);

  return <Cart />;
};

describe('Shopping Cart & Coupon Component (Bhanuka)', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('renders empty cart view when cart is empty', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <CartProvider>
            <Cart />
          </CartProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByText(/Your Shopping Cart is Empty/i)).toBeInTheDocument();
    expect(screen.getByText(/Explore Catalog/i)).toBeInTheDocument();
  });

  it('renders cart with items, calculates subtotal and shipping', async () => {
    const sampleItems = [
      {
        id: 'item-1',
        title: 'Combined Maths Revision Notes',
        price: 25.0,
        quantity: 1,
        is_digital: true,
        is_physical: false,
        subject: 'Mathematics',
      },
      {
        id: 'item-2',
        title: 'Physics Practical Parcel',
        price: 15.0,
        quantity: 1,
        is_digital: false,
        is_physical: true,
        subject: 'Physics',
      },
    ];

    render(
      <MemoryRouter>
        <AuthProvider>
          <CartProvider>
            <CartWithSeededItems initialItems={sampleItems} />
          </CartProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(await screen.findByText('Combined Maths Revision Notes')).toBeInTheDocument();
    expect(screen.getByText('Physics Practical Parcel')).toBeInTheDocument();
    expect(screen.getByText(/Subtotal/i)).toBeInTheDocument();
    expect(screen.getByText(/40\.00/i)).toBeInTheDocument(); // 25 + 15 = 40
    expect(screen.getByText(/4\.50/i)).toBeInTheDocument(); // Physical shipping
    expect(screen.getByText(/Proceed to Checkout/i)).toBeInTheDocument();
  });

  it('applies promotional coupon code and deducts discount', async () => {
    cartService.validateCoupon.mockResolvedValue({
      valid: true,
      data: {
        code: 'EDUMART10',
        description: '10% discount',
        discount_type: 'percentage',
        discount_value: 10,
        discount_amount: 3.0,
      },
    });

    const sampleItems = [
      {
        id: 'item-1',
        title: 'Chemistry Past Paper Pack',
        price: 30.0,
        quantity: 1,
        is_digital: true,
      },
    ];

    render(
      <MemoryRouter>
        <AuthProvider>
          <CartProvider>
            <CartWithSeededItems initialItems={sampleItems} />
          </CartProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(await screen.findByText('Chemistry Past Paper Pack')).toBeInTheDocument();

    const input = screen.getByPlaceholderText(/e\.g\. EDUMART10/i);
    const applyBtn = screen.getByText('Apply');

    fireEvent.change(input, { target: { value: 'EDUMART10' } });
    fireEvent.click(applyBtn);

    expect(await screen.findByText(/Applied coupon 'EDUMART10'/i)).toBeInTheDocument();
    expect(screen.getByText(/Promo \(EDUMART10\)/i)).toBeInTheDocument();
    expect(screen.getAllByText(/-.*3\.00/i).length).toBeGreaterThan(0);
  });
});
