import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AuthPage from '../components/AuthPage';

// Mock the onAuthSuccess callback
describe('AuthPage Component', () => {
  test('renders login form by default', () => {
    render(<AuthPage onAuthSuccess={jest.fn()} />);
    // Check that username and password inputs are present
    expect(screen.getByPlaceholderText(/Username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
    // Should show Login button
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
  });

  test('switches to register mode and shows extra fields', () => {
    render(<AuthPage onAuthSuccess={jest.fn()} />);
    const switchButton = screen.getByRole('button', { name: /Register/i });
    fireEvent.click(switchButton);
    // Now full name and email fields should appear
    expect(screen.getByPlaceholderText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
    // And confirm password
    expect(screen.getByPlaceholderText(/Confirm Password/i)).toBeInTheDocument();
  });

  // More tests: form validation, API call mocking, etc.
});