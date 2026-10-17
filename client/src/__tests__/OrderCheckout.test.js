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
          items: [
            {
              id: 'item-dl-1',
              product_title: 'Instant Download Physics Notes',
              product_subject: 'Physics',
              product_grade_level: 'A/L',
              is_digital: true,
              is_physical: false,
              unit_price: 25.0,
            },
          ],
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

      // Step 3: Success Confirmation & Instant Download
      expect(await screen.findByText(/Payment Successful/i)).toBeInTheDocument();
      expect(screen.getByText(/EDM-20261017-123456/i)).toBeInTheDocument();
      expect(screen.getByText(/Instant Digital Downloads/i)).toBeInTheDocument();
      expect(screen.getByText('Instant Download Physics Notes')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /download pdf/i })).toBeInTheDocument();
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
            currency: 'LKR',
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
      expect(screen.getByText(/LKR\s*43\.50/i)).toBeInTheDocument();
      expect(screen.getByText(/View Details/i)).toBeInTheDocument();
    });
  });

  describe('OrderDetail Component', () => {
    const mockDetailOrder = {
      id: 'order-1',
      order_number: 'EDM-101',
      invoice_number: 'INV-20261017-9912',
      created_at: '2026-10-17T10:00:00Z',
      total_amount: 45.0,
      subtotal: 40.0,
      shipping_cost: 5.0,
      tax_amount: 0,
      discount_amount: 0,
      status: 'paid',
      payment_status: 'paid',
      carrier: 'PromptX Courier',
      tracking_number: 'PRX-88291-LK',
      estimated_delivery: '2026-10-21T10:00:00Z',
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
          is_physical: false,
          unit_price: 20.0,
          quantity: 1,
          total_price: 20.0,
        },
        {
          id: 'item-2',
          product_title: 'Physical Past Paper Book Pack',
          product_subject: 'Mathematics',
          product_grade_level: 'A/L',
          is_digital: false,
          is_physical: true,
          unit_price: 20.0,
          quantity: 1,
          total_price: 20.0,
        },
      ],
    };

    it('renders full order details, line items, and digital download option', async () => {
      orderService.getOrderById.mockResolvedValue({
        data: mockDetailOrder,
      });

      render(
        <MemoryRouter initialEntries={['/orders/order-1']}>
          <Routes>
            <Route path="/orders/:id" element={<OrderDetail />} />
          </Routes>
        </MemoryRouter>
      );

      expect(await screen.findByText(/Order #EDM-101/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Mathematics Pure Notes/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Download PDF/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Payment Breakdown/i)).toBeInTheDocument();
      expect(screen.getByText(/Parcel Delivery Tracking/i)).toBeInTheDocument();
      expect(screen.getByText(/PromptX Courier/i)).toBeInTheDocument();
    });

    it('triggers secure digital download when Download PDF is clicked', async () => {
      orderService.getOrderById.mockResolvedValue({
        data: mockDetailOrder,
      });
      orderService.downloadDigitalItem.mockResolvedValue(true);

      render(
        <MemoryRouter initialEntries={['/orders/order-1']}>
          <Routes>
            <Route path="/orders/:id" element={<OrderDetail />} />
          </Routes>
        </MemoryRouter>
      );

      const downloadBtns = await screen.findAllByRole('button', { name: /download pdf/i });
      fireEvent.click(downloadBtns[0]);

      await waitFor(() => {
        expect(orderService.downloadDigitalItem).toHaveBeenCalledWith(
          'order-1',
          'item-1',
          'Mathematics Pure Notes'
        );
      });
    });

    it('opens tax invoice dialog and displays official receipt details', async () => {
      orderService.getOrderById.mockResolvedValue({
        data: mockDetailOrder,
      });
      orderService.getOrderInvoice.mockResolvedValue({
        data: {
          invoice_number: 'INV-20261017-9912',
          order_number: 'EDM-101',
          issue_date: '2026-10-17T10:00:00Z',
          currency: 'LKR',
          seller: {
            company_name: 'EduMart Marketplace Platform Ltd.',
            tax_id: 'LK-VAT-992384',
            address: 'Colombo, Sri Lanka',
          },
          customer: {
            name: 'Charuka Silva',
            email: 'charuka@example.com',
          },
          items: [
            {
              title: 'Mathematics Pure Notes',
              subject: 'Mathematics',
              type: 'Digital E-Material',
              quantity: 1,
              unit_price: 20.0,
              total_price: 20.0,
            },
          ],
          financials: {
            subtotal: 40.0,
            tax_amount: 0,
            shipping_cost: 5.0,
            discount_amount: 0,
            total_amount: 45.0,
          },
        },
      });

      render(
        <MemoryRouter initialEntries={['/orders/order-1']}>
          <Routes>
            <Route path="/orders/:id" element={<OrderDetail />} />
          </Routes>
        </MemoryRouter>
      );

      const invoiceBtn = await screen.findByRole('button', { name: /view tax invoice/i });
      fireEvent.click(invoiceBtn);

      await waitFor(() => {
        expect(orderService.getOrderInvoice).toHaveBeenCalledWith('order-1');
        expect(screen.getByText(/Official Tax Invoice & Receipt/i)).toBeInTheDocument();
        expect(screen.getByText(/EduMart Marketplace Platform Ltd\./i)).toBeInTheDocument();
      });
    });

    it('allows admin or seller to open shipment tracking modal and update courier dispatch', async () => {
      useAuth.mockReturnValue({
        user: { id: 'admin-1', firstName: 'Admin', role: 'admin' },
        loading: false,
      });

      orderService.getOrderById.mockResolvedValue({
        data: mockDetailOrder,
      });
      orderService.updateOrderTracking.mockResolvedValue({
        success: true,
      });

      render(
        <MemoryRouter initialEntries={['/orders/order-1']}>
          <Routes>
            <Route path="/orders/:id" element={<OrderDetail />} />
          </Routes>
        </MemoryRouter>
      );

      const trackingBtn = await screen.findByRole('button', { name: /update tracking/i });
      expect(trackingBtn).toBeInTheDocument();
      fireEvent.click(trackingBtn);

      expect(screen.getByText(/Update Shipment & Delivery Tracking/i)).toBeInTheDocument();
      const saveBtn = screen.getByRole('button', { name: /save & append milestone/i });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(orderService.updateOrderTracking).toHaveBeenCalled();
      });
    });
  });
});

