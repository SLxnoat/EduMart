import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

// Mock the AuthContext
jest.mock('../context/AuthContext', () => ({
  ...jest.requireActual('../context/AuthContext'),
  useAuth: () => ({
    user: { firstName: 'Test', lastName: 'User', email: 'test@example.com' },
    loading: false
  })
}));

describe('App', () => {
  test('renders header and footer', async () => {
    render(<App />);

    // Check for header
    const headerElement = await screen.findByText(/EduMart/i);
    expect(headerElement).toBeInTheDocument();

    // Check for footer
    const footerElement = await screen.findByText(/EduMart/i);
    expect(footerElement).toBeInTheDocument();
  });

  test('shows loading state when auth is loading', async () => {
    // Mock the AuthContext to return loading state
    jest.mock('../context/AuthContext', () => ({
      ...jest.requireActual('../context/AuthContext'),
      useAuth: () => ({
        user: null,
        loading: true
      })
    }));

    // Re-render with updated mock
    rerender(<App />);

    // Check for loading text
    const loadingElement = await screen.findByText(/loading/i);
    expect(loadingElement).toBeInTheDocument();
  });
});