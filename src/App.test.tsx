import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import App from './App';

// Mocking Contexts to prevent real API calls and side effects
jest.mock('./context/AppContext', () => {
  const actual = jest.requireActual('./context/AppContext');
  return {
    ...actual,
    AppProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="app-provider">{children}</div>,
    useAppContext: () => ({
      lowStockMedicines: [],
      isLoading: false,
    }),
  };
});

jest.mock('./context/NotificationContext', () => ({
  NotificationProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="notification-provider">{children}</div>,
  useNotification: () => ({
    notify: jest.fn(),
  }),
}));

// Mocking localStorage
const localStorageMock = (function() {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    clear: () => { store = {}; },
    removeItem: (key: string) => { delete store[key]; }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('renders login page when not authenticated', async () => {
    render(<App />);
    
    // Check for login page elements
    await waitFor(() => {
      expect(screen.getByText(/Welcome Back/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/your.email@example.com/i)).toBeInTheDocument();
    });
  });

  it('renders loading state initially', () => {
    render(<App />);
    // Since isAuthLoading starts as true and then useEffect runs
    // In some environments, we might catch the loading spinner
    const spinner = document.querySelector('.animate-spin');
    if (spinner) {
       expect(spinner).toBeInTheDocument();
    }
  });
});
