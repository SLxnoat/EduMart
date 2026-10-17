import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Checkout from '../pages/checkout/Checkout';
import OrderList from '../pages/orders/OrderList';
import OrderDetail from '../pages/orders/OrderDetail';
import { useAuth } from '../context/AuthContext';
import orderService from '../../src/services/orderService';
import paymentService from '../../src/services/paymentService';

jest.mock('../context/AuthContext');
jest.mock('../../src/services/orderService');
jest.mock('../../src/services/paymentService');

describe('Order & Checkout Modules (Charuka)', () => {
  const mockUser = {
    id: 'user-uuid-1',
    firstName: 'Charuka',
    lastName: 'Silva',
    email: 'charuka@example.com',
    role: 'student',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({
      user: mockUser,
      loading: false,
    });
  });

  describe('Checkout Component', () => {
    it('renders checkout shipping step, items summary, and total calculation', () => {
      render(
        <MemoryRouter>
          <Checkout />
        </MemoryRouter>
      );

      expect(screen.getByText(/EduMart Secure Checkout/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Street Address/i)).toBeInTheDocument();
      expect(screen.getByText(/Order Summary/i)).toBeInTheDocument();
      expect(screen.getByText(/Proceed to Payment/i)).toBeInTheDocument();
    });

    it('navigates to payment step and completes checkout flow successfully', async () => {
      orderService.createOrder.mockResolvedValue({
        data: {
          id: 'order-uuid-99',
          order_number: 'EDM-20261017-123456',
          status: 'pending',
          total_amount: 50.18,
        },
      });

      paymentService.createPaymentIntent.mockResolvedValue({
        clientSecret: 'secret_123',
        paymentIntentId: 'pi_123',
      });

      paymentService.simulatePaymentSuccess.mockResolvedValue({
        success: true,
        orderId: 'order-uuid-99',
        status: 'completed',
      });

      orderService.getOrderById.mockResolvedValue({
        data: {
          id: 'order-uuid-99',
          order_number: 'EDM-20261017-123456',
          status: 'paid',
          payment_status: 'paid',
          total_amount: 50.18,
        },
      });

      render(
        <MemoryRouter>
          <Checkout />
        </MemoryRouter>
      );

      // Step 1: Proceed to Payment
      const proceedBtn = screen.getByText(/Proceed to Payment/i);
      fireEvent.click(proceedBtn);

      // Step 2: Payment step
      expect(await screen.findByText(/Payment Method/i)).toBeInTheDocument();
      const payNowBtn = screen.getByText(/Pay .* Now/i);
      expect(payNowBtn).toBeInTheDocument();

      // Submit payment
      fireEvent.click(payNowBtn);

      // Step 3: Success Confirmation
      expect(await screen.findByText(/Payment Successful!/i)).toBeInTheDocument();
      expect(screen.getByText(/EDM-20261017-123456/i)).toBeInTheDocument();
      expect(screen.getByText(/View Order Details/i)).toBeInTheDocument();
    });
  });

  describe('OrderList Component', () => {
    it('renders user orders table with status chips', async () => {
      orderService.getMyOrders.mockResolvedValue({
        data: [
          {
            id: 'order-1',
            order_number: 'EDM-101',
            created_at: '2026-10-17T10:00:00Z',
            total_amount: 43.5,
            currency: 'USD',
            status: 'paid',
            payment_status: 'paid',
            items: [{ id: 'item-1' }],
          },
        ],
        pagination: { page: 1, pages: 1, total: 1 },
      });

      render(
        <MemoryRouter>
          <OrderList />
        </MemoryRouter>
      );

      expect(await screen.findByText('EDM-101')).toBeInTheDocument();
      expect(screen.getByText(/\$43.50 USD/i)).toBeInTheDocument();
      expect(screen.getByText(/View Details/i)).toBeInTheDocument();
    });
  });

  describe('OrderDetail Component', () => {
    it('renders full order details, line items, and digital download option', async () => {
      orderService.getOrderById.mockResolvedValue({
        data: {
          id: 'order-1',
          order_number: 'EDM-101',
          created_at: '2026-10-17T10:00:00Z',
          total_amount: 25.0,
          subtotal: 25.0,
          shipping_cost: 0,
          tax_amount: 0,
          discount_amount: 0,
          status: 'paid',
          payment_status: 'paid',
          shipping_address: {
            fullName: 'Charuka Silva',
            street: '75 Galle Road',
            city: 'Colombo',
            country: 'Sri Lanka',
          },
          items: [
            {
              id: 'item-1',
              product_title: 'Mathematics Pure Notes',
              product_subject: 'Mathematics',
              product_grade_level: 'A/L',
              is_digital: true,
              unit_price: 25.0,
              quantity: 1,
              total_price: 25.0,
            },
          ],
        },
      });

      render(
        <MemoryRouter initialEntries={['/orders/order-1']}>
          <Routes>
            <Route path="/orders/:id" element={<OrderDetail />} />
          </Routes>
        </MemoryRouter>
      );

      expect(await screen.findByText(/Order #EDM-101/i)).toBeInTheDocument();
      expect(screen.getByText(/Mathematics Pure Notes/i)).toBeInTheDocument();
      expect(screen.getByText(/Download PDF/i)).toBeInTheDocument();
      expect(screen.getByText(/Payment Breakdown/i)).toBeInTheDocument();
    });
  });
});
