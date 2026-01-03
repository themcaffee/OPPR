import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthLinks } from '@/components/auth/AuthLinks';

describe('AuthLinks', () => {
  it('renders "Create one" link when mode is sign-in', () => {
    render(<AuthLinks mode="sign-in" />);

    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /create one/i })).toBeInTheDocument();
  });

  it('link points to /register when mode is sign-in', () => {
    render(<AuthLinks mode="sign-in" />);

    const link = screen.getByRole('link', { name: /create one/i });
    expect(link).toHaveAttribute('href', '/register');
  });

  it('renders "Sign in" link when mode is register', () => {
    render(<AuthLinks mode="register" />);

    expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
  });

  it('link points to /sign-in when mode is register', () => {
    render(<AuthLinks mode="register" />);

    const link = screen.getByRole('link', { name: /sign in/i });
    expect(link).toHaveAttribute('href', '/sign-in');
  });
});
