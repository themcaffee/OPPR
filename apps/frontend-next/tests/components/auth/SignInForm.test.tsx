import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SignInForm } from '@/components/auth/SignInForm';
import { OpprsAuthError, OpprsNetworkError } from '@opprs/rest-api-client';

const mockPush = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => mockSearchParams,
}));

const mockLogin = vi.fn();

vi.mock('@/lib/api-client', () => ({
  apiClient: {
    login: (...args: unknown[]) => mockLogin(...args),
  },
}));

describe('SignInForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset search params
    [...mockSearchParams.keys()].forEach((key) => mockSearchParams.delete(key));
  });

  it('renders email and password fields', () => {
    render(<SignInForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('renders Sign In button', () => {
    render(<SignInForm />);

    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows validation error when email is empty', async () => {
    render(<SignInForm />);

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/email/i)).toBeInTheDocument();
    });
  });

  it('calls apiClient.login with correct credentials on submit', async () => {
    mockLogin.mockResolvedValue({ user: { id: '1', email: 'test@example.com' } });

    render(<SignInForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('redirects to /profile on successful login (default)', async () => {
    mockLogin.mockResolvedValue({ user: { id: '1', email: 'test@example.com' } });

    render(<SignInForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/profile');
    });
  });

  it('redirects to specified redirect param on successful login', async () => {
    mockLogin.mockResolvedValue({ user: { id: '1', email: 'test@example.com' } });
    mockSearchParams.set('redirect', '/admin/players');

    render(<SignInForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/admin/players');
    });
  });

  it('redirects "/" to "/profile" to avoid race condition', async () => {
    mockLogin.mockResolvedValue({ user: { id: '1', email: 'test@example.com' } });
    mockSearchParams.set('redirect', '/');

    render(<SignInForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/profile');
    });
  });

  it('rejects redirect to absolute URLs (security)', async () => {
    mockLogin.mockResolvedValue({ user: { id: '1', email: 'test@example.com' } });
    mockSearchParams.set('redirect', 'https://evil.com');

    render(<SignInForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/profile');
    });
  });

  it('rejects redirect to protocol-relative URLs (security)', async () => {
    mockLogin.mockResolvedValue({ user: { id: '1', email: 'test@example.com' } });
    mockSearchParams.set('redirect', '//evil.com');

    render(<SignInForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/profile');
    });
  });

  it('shows "Invalid email or password" for OpprsAuthError', async () => {
    mockLogin.mockRejectedValue(new OpprsAuthError('Unauthorized'));

    render(<SignInForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrongpassword' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    });
  });

  it('shows network error message for OpprsNetworkError', async () => {
    mockLogin.mockRejectedValue(new OpprsNetworkError('Network error'));

    render(<SignInForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/unable to connect/i)).toBeInTheDocument();
    });
  });

  it('shows generic error for unknown errors', async () => {
    mockLogin.mockRejectedValue(new Error('Unknown error'));

    render(<SignInForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/sign in failed/i)).toBeInTheDocument();
    });
  });

  it('disables button and shows loading state during submission', async () => {
    // Create a promise that we can control
    let resolveLogin: () => void;
    mockLogin.mockReturnValue(
      new Promise((resolve) => {
        resolveLogin = () => resolve({ user: { id: '1' } });
      })
    );

    render(<SignInForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      // Button shows "Loading..." when submitting and is disabled
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    // Resolve the promise
    resolveLogin!();

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalled();
    });
  });
});
