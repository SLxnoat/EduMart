import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import AdminDashboard from '../pages/admin/AdminDashboard';
import NotificationList from '../pages/notifications/NotificationList';
import SellerDashboard from '../pages/seller/SellerDashboard';
import { useAuth } from '../context/AuthContext';
import adminService from '../services/adminService';
import notificationService from '../services/notificationService';
import reviewService from '../services/reviewService';
import sellerService from '../services/sellerService';

jest.mock('../context/AuthContext');
jest.mock('../services/adminService');
jest.mock('../services/notificationService');
jest.mock('../services/reviewService');
jest.mock('../services/sellerService');

describe('Malki Modules - Admin Dashboard, Notifications & Seller Hub', () => {
  const mockAdmin = {
    id: 'admin-uuid-1',
    firstName: 'Malki',
    lastName: 'Admin',
    email: 'admin@edumart.com',
    role: 'admin'
  };

  const mockTutor = {
    id: 'tutor-uuid-1',
    firstName: 'Tutor',
    lastName: 'Perera',
    email: 'tutor@edumart.com',
    role: 'tutor'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('AdminDashboard Component', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({ user: mockAdmin, loading: false });

      adminService.getMetrics.mockResolvedValue({
        users: { total: 120, active: 115, tutors: 25, students: 95 },
        products: { total: 45, pending: 3, approved: 42, lowStock: 2 },
        orders: { total: 80, grossRevenue: 4500.50 },
        reviews: { total: 60, pending: 1 }
      });

      adminService.getUsers.mockResolvedValue({
        users: [
          {
            id: 'u-1',
            first_name: 'Kasun',
            last_name: 'Bandara',
            email: 'kasun@example.com',
            role: 'student',
            is_active: true,
            created_at: '2026-01-01'
          }
        ],
        totalPages: 1
      });

      adminService.getModerationProducts.mockResolvedValue({
        products: [
          {
            id: 'prod-1',
            title: 'Physics Revision Manual',
            description: 'A/L exam notes',
            subject: 'Physics',
            grade_level: 'Grade 13',
            price: 20.0,
            format: 'digital',
            is_approved: false,
            seller: { first_name: 'Sunil', last_name: 'Perera', role: 'tutor' }
          }
        ]
      });

      reviewService.getModerationReviews.mockResolvedValue({
        reviews: []
      });

      adminService.getAdminLogs.mockResolvedValue({
        logs: []
      });
    });

    it('renders admin dashboard title, tabs, and KPI summary statistics', async () => {
      render(
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      );

      expect(screen.getByText(/Admin Central Dashboard/i)).toBeInTheDocument();
      expect(screen.getByText(/Overview & KPIs/i)).toBeInTheDocument();
      expect(screen.getByText(/User Moderation/i)).toBeInTheDocument();
      expect(screen.getByText(/Broadcast Announcement/i)).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText('120')).toBeInTheDocument(); // Total users
        expect(screen.getByText('45')).toBeInTheDocument();  // Total products
        expect(screen.getByText('80')).toBeInTheDocument();  // Total orders
      });
    });

    it('navigates to User Moderation tab and displays users table', async () => {
      render(
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      );

      const userTab = screen.getByText(/User Moderation/i);
      fireEvent.click(userTab);

      await waitFor(() => {
        expect(screen.getByText('Kasun Bandara')).toBeInTheDocument();
        expect(screen.getByText('kasun@example.com')).toBeInTheDocument();
        expect(screen.getByText('Suspend')).toBeInTheDocument();
      });
    });

    it('allows composing and dispatching a broadcast announcement', async () => {
      notificationService.broadcast.mockResolvedValue({ recipientsCount: 120 });

      render(
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      );

      const broadcastTab = screen.getByText(/Broadcast Announcement/i);
      fireEvent.click(broadcastTab);

      await waitFor(() => {
        expect(screen.getByLabelText(/Announcement Title/i)).toBeInTheDocument();
      });

      fireEvent.change(screen.getByLabelText(/Announcement Title/i), {
        target: { value: 'Platform Update 2.0' }
      });
      fireEvent.change(screen.getByLabelText(/Announcement Message/i), {
        target: { value: 'EduMart will have scheduled maintenance tonight.' }
      });

      const sendBtn = screen.getByRole('button', { name: /Send Broadcast Announcement/i });
      fireEvent.click(sendBtn);

      await waitFor(() => {
        expect(notificationService.broadcast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Platform Update 2.0',
            message: 'EduMart will have scheduled maintenance tonight.'
          })
        );
        expect(screen.getByText(/System announcement dispatched across all channels/i)).toBeInTheDocument();
      });
    });
  });

  describe('NotificationList Component', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({ user: mockTutor, loading: false });

      notificationService.getNotifications.mockResolvedValue({
        notifications: [
          {
            id: 'notif-1',
            type: 'review_reply',
            title: 'New Student Review!',
            message: 'A student left a 5-star review on your Physics manual',
            is_read: false,
            priority: 'normal',
            created_at: '2026-10-17T12:00:00Z'
          },
          {
            id: 'notif-2',
            type: 'system_announcement',
            title: 'Scheduled Maintenance',
            message: 'Platform update scheduled for midnight',
            is_read: true,
            priority: 'urgent',
            created_at: '2026-10-16T10:00:00Z'
          }
        ],
        unreadCount: 1,
        totalPages: 1
      });
    });

    it('renders notification items, icons, and unread count', async () => {
      render(
        <MemoryRouter>
          <NotificationList />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/Notifications Inbox/i)).toBeInTheDocument();
        expect(screen.getByText(/You have 1 unread message/i)).toBeInTheDocument();
        expect(screen.getByText('New Student Review!')).toBeInTheDocument();
        expect(screen.getByText('Scheduled Maintenance')).toBeInTheDocument();
        expect(screen.getByText('URGENT')).toBeInTheDocument();
      });
    });

    it('marks a notification as read when clicking mark-read button', async () => {
      notificationService.markRead.mockResolvedValue({});

      render(
        <MemoryRouter>
          <NotificationList />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTitle(/Mark as read/i)).toBeInTheDocument();
      });

      const markBtn = screen.getByTitle(/Mark as read/i);
      fireEvent.click(markBtn);

      await waitFor(() => {
        expect(notificationService.markRead).toHaveBeenCalledWith('notif-1');
      });
    });
  });

  describe('SellerDashboard Component', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({ user: mockTutor, loading: false });

      sellerService.getDashboard.mockResolvedValue({
        metrics: {
          totalProducts: 8,
          approvedProducts: 7,
          pendingProducts: 1,
          lowStockCount: 2,
          totalSalesCount: 42,
          grossSales: 1250.00,
          netEarnings: 1125.00
        },
        recentReviews: [
          {
            id: 'rev-1',
            rating: 5,
            title: 'Invaluable guide',
            comment: 'Helped me score an A in my term test.',
            created_at: '2026-10-15',
            product: { title: 'Pure Maths Calculus' },
            user: { first_name: 'Anula', last_name: 'Fernando' }
          }
        ]
      });

      sellerService.getInventory.mockResolvedValue({
        products: [
          {
            id: 'prod-item-1',
            title: 'Chemistry Organic Reaction Guide',
            subject: 'Chemistry',
            grade_level: 'Grade 12-13',
            price: 18.50,
            format: 'physical',
            stock_quantity: 4,
            is_approved: true,
            rating_average: 4.9,
            rating_count: 12
          }
        ],
        totalPages: 1
      });
    });

    it('renders tutor KPI metrics and recent student reviews', async () => {
      render(
        <MemoryRouter>
          <SellerDashboard />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/Tutor & Seller Hub/i)).toBeInTheDocument();
        expect(screen.getByText('$1125.00')).toBeInTheDocument();
        expect(screen.getByText('Invaluable guide')).toBeInTheDocument();
        expect(screen.getByText(/Helped me score an A in my term test/i)).toBeInTheDocument();
      });
    });

    it('switches to Inventory Management tab and displays physical stock items', async () => {
      render(
        <MemoryRouter>
          <SellerDashboard />
        </MemoryRouter>
      );

      const invTab = screen.getByText(/Inventory Management/i);
      fireEvent.click(invTab);

      await waitFor(() => {
        expect(screen.getByText('Chemistry Organic Reaction Guide')).toBeInTheDocument();
        expect(screen.getByText('PHYSICAL')).toBeInTheDocument();
        expect(screen.getByText('Low stock!')).toBeInTheDocument();
      });
    });
  });
});
