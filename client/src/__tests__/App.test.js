import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom'; // expect(...).toBeInTheDocument() වැඩ කිරීමට මෙය අවශ්‍ය වේ
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import App from '../App';
import { Guard } from '../routes';
import Profile from '../pages/profile/Profile';
import ChatWidget from '../components/chat/ChatWidget';
import { useAuth } from '../context/AuthContext';

// AuthContext එක mock කිරීම
jest.mock('../context/AuthContext', () => ({
  ...jest.requireActual('../context/AuthContext'),
  useAuth: jest.fn(),
  AuthProvider: ({ children }) => <>{children}</>,
}));

jest.mock('../services/productService', () => ({
  getAllProducts: jest.fn().mockResolvedValue({ products: [], total: 0 }),
  getCategories: jest.fn().mockResolvedValue({ categories: [] }),
}));

jest.mock('../services/notificationService', () => ({
  getNotifications: jest.fn().mockResolvedValue({ notifications: [], unreadCount: 0 }),
}));

describe('App Component & Kushmi Modules', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    useAuth.mockReturnValue({
      user: {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        role: 'student',
        isVerified: false,
        profileCompletion: 60
      },
      loading: false,
      resendVerification: jest.fn().mockResolvedValue({ message: 'Sent' }),
      updateProfile: jest.fn(),
      changePassword: jest.fn(),
      refreshProfile: jest.fn()
    });
  });

  test('renders header and footer', async () => {
    render(<App />);

    const elements = await screen.findAllByText(/EduMart/i);
    expect(elements.length).toBeGreaterThan(0);
  });

  test('shows loading state when auth is loading', async () => {
    useAuth.mockReturnValue({
      user: null,
      loading: true,
    });

    render(<App />);

    const loadingElement = await screen.findByText(/loading/i);
    expect(loadingElement).toBeInTheDocument();
  });

  test('Guard redirects non-admin users away from admin-only routes', () => {
    useAuth.mockReturnValue({
      user: { firstName: 'Student', role: 'student' },
      loading: false,
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/" element={<div>Home Redirected</div>} />
          <Route
            path="/admin"
            element={
              <Guard roles={['admin']}>
                <div>Secret Admin Area</div>
              </Guard>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Home Redirected')).toBeInTheDocument();
    expect(screen.queryByText('Secret Admin Area')).not.toBeInTheDocument();
  });

  test('Profile displays unverified email warning banner and completion tips', async () => {
    render(
      <SnackbarProvider>
        <MemoryRouter>
          <Profile />
        </MemoryRouter>
      </SnackbarProvider>
    );

    expect(await screen.findByRole('button', { name: /resend/i })).toBeInTheDocument();
    expect(screen.getByText(/Verify your email \(\+20%\)/i)).toBeInTheDocument();
  });

  test('ChatWidget opens and renders welcome message and quick replies', () => {
    render(
      <MemoryRouter>
        <ChatWidget />
      </MemoryRouter>
    );

    const chatButton = screen.getByLabelText('chat');
    fireEvent.click(chatButton);

    expect(screen.getByText(/EduMart Assistant/i)).toBeInTheDocument();
    expect(screen.getByText(/Browse Materials/i)).toBeInTheDocument();
    expect(screen.getByText(/How to Download\?/i)).toBeInTheDocument();
  });
});