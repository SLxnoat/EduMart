import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';

import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';
import VerifyEmail from '../pages/auth/VerifyEmail';
import Profile from '../pages/profile/Profile';
import ChatWidget from '../components/chat/ChatWidget';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

jest.mock('../context/AuthContext');
jest.mock('../services/api');

const renderWithProviders = (ui, { route = '/' } = {}) => {
  return render(
    <SnackbarProvider maxSnack={3}>
      <MemoryRouter initialEntries={[route]}>
        {ui}
      </MemoryRouter>
    </SnackbarProvider>
  );
};

describe('Kushmi Modules - Auth, Profile, Sessions, GDPR & Chatbot', () => {
  const mockUser = {
    id: 'user-kushmi-123',
    _id: 'user-kushmi-123',
    firstName: 'Kushmi',
    lastName: 'Senarath',
    email: 'kushmi@edumart.com',
    role: 'student',
    isVerified: true,
    institution: 'University of Colombo',
    phone: '+94 77 123 4567',
    profileCompletion: 100,
    createdAt: '2026-01-15T08:00:00Z',
    lastLogin: '2026-10-17T10:00:00Z'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /* -------------------------------------------------------------
     1. Login Component Tests
  ------------------------------------------------------------- */
  describe('Login Component', () => {
    it('renders login fields and handles successful submission', async () => {
      const mockLogin = jest.fn().mockResolvedValue({ token: 'mock-jwt-token' });
      useAuth.mockReturnValue({
        login: mockLogin,
        user: null,
        loading: false
      });

      renderWithProviders(<Login />);

      expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const submitBtn = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'kushmi@edumart.com' } });
      fireEvent.change(passwordInput, { target: { value: 'SecurePass123!' } });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          email: 'kushmi@edumart.com',
          password: 'SecurePass123!',
          rememberMe: false
        });
      });
    });

    it('shows validation error if required fields are missing', async () => {
      const mockLogin = jest.fn();
      useAuth.mockReturnValue({
        login: mockLogin,
        user: null,
        loading: false
      });

      renderWithProviders(<Login />);

      const submitBtn = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/please provide both email and password/i)).toBeInTheDocument();
        expect(mockLogin).not.toHaveBeenCalled();
      });
    });
  });

  /* -------------------------------------------------------------
     2. Register Component Tests
  ------------------------------------------------------------- */
  describe('Register Component', () => {
    it('renders role tabs and registers user with password validation', async () => {
      const mockRegister = jest.fn().mockResolvedValue({ message: 'Registration successful' });
      useAuth.mockReturnValue({
        register: mockRegister,
        user: null,
        loading: false
      });

      renderWithProviders(<Register />);

      expect(screen.getByRole('heading', { name: /join edumart/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /student/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /tutor \/ seller/i })).toBeInTheDocument();

      // Switch role tab to Tutor / Seller
      fireEvent.click(screen.getByRole('tab', { name: /tutor \/ seller/i }));

      // Step 1: Personal Details
      fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'Kushmi' } });
      fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Senarath' } });
      fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'kushmi.tutor@edumart.com' } });

      // Click Next to advance to Step 2 (Security)
      const nextSecurityBtn = screen.getByRole('button', { name: /next: security & password/i });
      fireEvent.click(nextSecurityBtn);

      // Step 2: Credentials
      fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'StrongPass123!' } });
      fireEvent.change(screen.getByLabelText(/confirm password \*/i), { target: { value: 'StrongPass123!' } });

      // Click Next to advance to Step 3 (Review & Confirm)
      const nextReviewBtn = screen.getByRole('button', { name: /next: review & confirm/i });
      fireEvent.click(nextReviewBtn);

      // Step 3: Final Submit
      const createBtn = screen.getByRole('button', { name: /register as tutor/i });
      fireEvent.click(createBtn);

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith(
          expect.objectContaining({
            firstName: 'Kushmi',
            lastName: 'Senarath',
            email: 'kushmi.tutor@edumart.com',
            role: 'tutor'
          })
        );
      });
    });
  });

  /* -------------------------------------------------------------
     3. ForgotPassword Component Tests
  ------------------------------------------------------------- */
  describe('ForgotPassword Component', () => {
    it('dispatches reset link instructions', async () => {
      const mockForgotPassword = jest.fn().mockResolvedValue({ message: 'Reset email sent' });
      useAuth.mockReturnValue({
        forgotPassword: mockForgotPassword
      });

      renderWithProviders(<ForgotPassword />);

      expect(screen.getByRole('heading', { name: /^forgot password$/i })).toBeInTheDocument();
      const emailInput = screen.getByLabelText(/registered email/i);
      fireEvent.change(emailInput, { target: { value: 'kushmi@edumart.com' } });

      const submitBtn = screen.getByRole('button', { name: /send reset link/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(mockForgotPassword).toHaveBeenCalledWith('kushmi@edumart.com');
        expect(screen.getByText(/check your inbox/i)).toBeInTheDocument();
      });
    });
  });

  /* -------------------------------------------------------------
     4. ResetPassword Component Tests
  ------------------------------------------------------------- */
  describe('ResetPassword Component', () => {
    it('submits new password with token from query string', async () => {
      const mockResetPassword = jest.fn().mockResolvedValue({ message: 'Password reset successful' });
      useAuth.mockReturnValue({
        resetPassword: mockResetPassword
      });

      renderWithProviders(
        <Routes>
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>,
        { route: '/reset-password?token=valid-reset-token-123' }
      );

      expect(screen.getByRole('heading', { name: /set new password/i })).toBeInTheDocument();

      const newPassInput = screen.getByLabelText(/^new password/i);
      const confirmPassInput = screen.getByLabelText(/confirm new password/i);
      fireEvent.change(newPassInput, { target: { value: 'NewSuperPass123!' } });
      fireEvent.change(confirmPassInput, { target: { value: 'NewSuperPass123!' } });

      const resetBtn = screen.getByRole('button', { name: /reset password/i });
      fireEvent.click(resetBtn);

      await waitFor(() => {
        expect(mockResetPassword).toHaveBeenCalledWith('valid-reset-token-123', 'NewSuperPass123!');
      });
    });
  });

  /* -------------------------------------------------------------
     5. VerifyEmail Component Tests
  ------------------------------------------------------------- */
  describe('VerifyEmail Component', () => {
    it('verifies token and displays success banner', async () => {
      const mockVerifyEmail = jest.fn().mockResolvedValue({ message: 'Email verified' });
      useAuth.mockReturnValue({
        user: mockUser,
        verifyEmail: mockVerifyEmail,
        resendVerification: jest.fn()
      });

      renderWithProviders(
        <Routes>
          <Route path="/verify-email" element={<VerifyEmail />} />
        </Routes>,
        { route: '/verify-email?token=valid-verify-token-456' }
      );

      await waitFor(() => {
        expect(mockVerifyEmail).toHaveBeenCalledWith('valid-verify-token-456');
        expect(screen.getByText(/email verified!/i)).toBeInTheDocument();
      });
    });
  });

  /* -------------------------------------------------------------
     6. Profile Component Tests (with Sessions & GDPR)
  ------------------------------------------------------------- */
  describe('Profile Component', () => {
    const mockSessions = [
      {
        id: 'sess-1',
        device_info: 'Chrome on macOS',
        ip_address: '192.168.1.10',
        created_at: '2026-10-17T09:00:00Z',
        expires_at: '2026-10-24T09:00:00Z',
        is_current: true
      },
      {
        id: 'sess-2',
        device_info: 'Safari on iPhone',
        ip_address: '192.168.1.15',
        created_at: '2026-10-16T14:00:00Z',
        expires_at: '2026-10-23T14:00:00Z',
        is_current: false
      }
    ];

    it('renders profile completeness score and tabs', () => {
      useAuth.mockReturnValue({
        user: mockUser,
        updateProfile: jest.fn(),
        changePassword: jest.fn(),
        getUserSessions: jest.fn().mockResolvedValue({ sessions: mockSessions }),
        revokeOtherSessions: jest.fn(),
        exportUserData: jest.fn(),
        deleteAccount: jest.fn()
      });

      renderWithProviders(<Profile />);

      expect(screen.getByText(/100%/i)).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /personal details/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /active sessions/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /privacy & gdpr/i })).toBeInTheDocument();
    });

    it('displays active sessions and allows revoking other sessions', async () => {
      const mockRevoke = jest.fn().mockResolvedValue({ message: 'Other sessions revoked', count: 1 });
      const mockGetSessions = jest.fn().mockResolvedValue({ sessions: mockSessions });

      useAuth.mockReturnValue({
        user: mockUser,
        updateProfile: jest.fn(),
        changePassword: jest.fn(),
        getUserSessions: mockGetSessions,
        revokeOtherSessions: mockRevoke,
        exportUserData: jest.fn(),
        deleteAccount: jest.fn()
      });

      renderWithProviders(<Profile />);

      // Switch to Active Sessions Tab
      fireEvent.click(screen.getByRole('tab', { name: /active sessions/i }));

      await waitFor(() => {
        expect(mockGetSessions).toHaveBeenCalled();
        expect(screen.getByText(/Chrome on macOS/i)).toBeInTheDocument();
        expect(screen.getByText(/Safari on iPhone/i)).toBeInTheDocument();
      });

      const revokeBtn = screen.getByRole('button', { name: /log out other devices/i });
      fireEvent.click(revokeBtn);

      await waitFor(() => {
        expect(mockRevoke).toHaveBeenCalled();
      });
    });

    it('handles GDPR data export and shows account deactivation dialog', async () => {
      const mockExportData = jest.fn().mockResolvedValue({
        export_metadata: { user_id: 'user-kushmi-123' },
        user_profile: mockUser
      });

      // Mock URL.createObjectURL for jsdom environment
      window.URL.createObjectURL = jest.fn(() => 'blob:mock-url');

      useAuth.mockReturnValue({
        user: mockUser,
        updateProfile: jest.fn(),
        changePassword: jest.fn(),
        getUserSessions: jest.fn().mockResolvedValue({ sessions: [] }),
        revokeOtherSessions: jest.fn(),
        exportUserData: mockExportData,
        deleteAccount: jest.fn()
      });

      renderWithProviders(<Profile />);

      // Switch to Privacy & GDPR Tab
      fireEvent.click(screen.getByRole('tab', { name: /privacy & gdpr/i }));

      expect(screen.getByText(/right to data portability/i)).toBeInTheDocument();
      const downloadBtn = screen.getByRole('button', { name: /download my data \(json\)/i });
      fireEvent.click(downloadBtn);

      await waitFor(() => {
        expect(mockExportData).toHaveBeenCalled();
      });

      // Click Deactivate Account to open modal
      const deactivateBtn = screen.getByRole('button', { name: /^deactivate account$/i });
      fireEvent.click(deactivateBtn);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /deactivate your account\?/i })).toBeInTheDocument();
      });
    });
  });

  /* -------------------------------------------------------------
     7. ChatWidget Component Tests
  ------------------------------------------------------------- */
  describe('ChatWidget Component', () => {
    it('opens chat widget and sends a message to the chatbot service', async () => {
      useAuth.mockReturnValue({
        user: mockUser
      });

      api.get.mockResolvedValue({
        data: {
          success: true,
          data: []
        }
      });

      api.post.mockResolvedValue({
        data: {
          success: true,
          data: {
            reply: 'You can download purchased past papers immediately from your Dashboard orders tab.',
            quickReplies: ['Browse Materials', 'Refund Policy'],
            interactionId: 'interact-999'
          }
        }
      });

      renderWithProviders(<ChatWidget />);

      // Find floating action button with aria-label="chat"
      const openBtn = screen.getByLabelText('chat');
      fireEvent.click(openBtn);

      await waitFor(() => {
        expect(screen.getByText(/EduMart Assistant/i)).toBeInTheDocument();
      });

      // Type a message in chat input
      const input = screen.getByPlaceholderText(/ask anything\.\.\./i);
      fireEvent.change(input, { target: { value: 'How do I download past papers?' } });

      // Click send button
      const sendBtn = screen.getByTestId('SendIcon').closest('button');
      fireEvent.click(sendBtn);

      await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith(
          '/chatbot/message',
          expect.objectContaining({
            message: 'How do I download past papers?'
          })
        );
        expect(
          screen.getByText(/You can download purchased past papers immediately/i)
        ).toBeInTheDocument();
      });
    });
  });
});
