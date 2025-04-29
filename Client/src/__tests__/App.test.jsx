import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

describe('App Component', () => {
  beforeEach(() => {
    // Clear implementation of localStorage
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(key => null);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders AuthPage by default when no token', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    // Should show login heading
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    // Username and Password inputs present
    expect(screen.getByPlaceholderText(/Username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
  });

  test('renders sidebar navigation when token exists', () => {
    // Mock token in localStorage
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(key => 'fake-token');
    render(
      <MemoryRouter initialEntries={['/chat']}>
        <App />
      </MemoryRouter>
    );
    // Sidebar links should be visible
    expect(screen.getByText(/chat/i)).toBeInTheDocument();
    expect(screen.getByText(/history/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
  });
});