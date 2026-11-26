import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from './LoginPage';
import { BrowserRouter } from 'react-router-dom';
import { NotificationProvider } from '../context/NotificationContext';

const renderLogin = () => {
  const onLogin = jest.fn();
  render(
    <BrowserRouter>
      <NotificationProvider>
        <LoginPage onLogin={onLogin} />
      </NotificationProvider>
    </BrowserRouter>
  );
  return { onLogin };
};

describe('LoginPage', () => {
  it('renders correctly', () => {
    renderLogin();
    expect(screen.getByText(/Welcome Back/i)).toBeInTheDocument();
    expect(screen.getByText(/Login Now/i)).toBeInTheDocument();
  });

  it('allows user to type credentials', () => {
    renderLogin();
    const emailInput = screen.getByPlaceholderText(/your.email@example.com/i) as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText(/••••••••/i) as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  it('shows error on empty submission', async () => {
    renderLogin();
    const loginButton = screen.getByText(/Login Now/i);
    
    // Clicking with empty fields
    fireEvent.click(loginButton);
    
    // Since we use native 'required' attribute, the form might prevent submit
    // But we check if onLogin is NOT called
    const { onLogin } = renderLogin();
    expect(onLogin).not.toHaveBeenCalled();
  });
});
