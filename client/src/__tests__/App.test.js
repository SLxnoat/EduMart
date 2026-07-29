import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';
import { useAuth } from '../context/AuthContext';

// AuthContext එක mock කිරීම
jest.mock('../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

describe('App Component', () => {
  beforeEach(() => {
    // Standard logged in state by default
    useAuth.mockReturnValue({
      user: { firstName: 'Test', lastName: 'User', email: 'test@example.com' },
      loading: false,
    });
  });

  test('renders header and footer', async () => {
    render(<App />);

    // Header සහ Footer එකේ තිබෙන EduMart text සොයා ගැනීම
    const elements = await screen.findAllByText(/EduMart/i);
    expect(elements.length).toBeGreaterThan(0);
  });

  test('shows loading state when auth is loading', async () => {
    // Auth loading state එක mock කිරීම
    useAuth.mockReturnValue({
      user: null,
      loading: true,
    });

    render(<App />);

    const loadingElement = await screen.findByText(/loading/i);
    expect(loadingElement).toBeInTheDocument();
  });
});