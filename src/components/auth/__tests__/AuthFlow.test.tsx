import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthFlow } from '../AuthFlow';

// Mock the auth service
vi.mock('@/services/auth.service', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    sendPasswordRecovery: vi.fn(),
    completePasswordRecovery: vi.fn(),
    confirmEmailVerification: vi.fn(),
    sendEmailVerification: vi.fn(),
  },
}));

describe('AuthFlow', () => {
  it('renders login page by default', () => {
    render(<AuthFlow />);
    expect(screen.getByText('Welcome back')).toBeInTheDocument();
    expect(screen.getByText('Sign in to your ClarityFlow account')).toBeInTheDocument();
  });

  it('renders register page when initialView is register', () => {
    render(<AuthFlow initialView="register" />);
    expect(screen.getByText('Create an account')).toBeInTheDocument();
    expect(screen.getByText('Get started with ClarityFlow')).toBeInTheDocument();
  });

  it('renders password reset page when initialView is password-reset', () => {
    render(<AuthFlow initialView="password-reset" />);
    expect(screen.getByText('Reset your password')).toBeInTheDocument();
  });

  it('renders email verification page when initialView is email-verification', () => {
    render(<AuthFlow initialView="email-verification" />);
    expect(screen.getByText('Verify your email')).toBeInTheDocument();
  });
});
