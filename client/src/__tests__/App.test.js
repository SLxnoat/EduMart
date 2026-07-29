import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; // expect(...).toBeInTheDocument() වැඩ කිරීමට මෙය අවශ්‍ය වේ
import App from '../App';
import { useAuth } from '../context/AuthContext';

// AuthContext එක mock කිරීම
jest.mock('../context/AuthContext', () => ({
  ...jest.requireActual('../context/AuthContext'),
  useAuth: jest.fn(),
  AuthProvider: ({ children }) => <>{children}</>,
}));

describe('App Component', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({
      user: { firstName: 'Test', lastName: 'User', email: 'test@example.com' },
      loading: false,
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
});