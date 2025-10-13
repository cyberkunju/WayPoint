import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { authService } from '@/services/auth.service';
import { cn } from '@/lib/utils';
import { Eye, EyeSlash, Warning, CheckCircle } from '@phosphor-icons/react';

interface PasswordResetConfirmPageProps {
  userId: string;
  secret: string;
  onSuccess?: () => void;
  onNavigateToLogin?: () => void;
}

export function PasswordResetConfirmPage({ 
  userId, 
  secret, 
  onSuccess, 
  onNavigateToLogin 
}: PasswordResetConfirmPageProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);

  useEffect(() => {
    // Validate that we have the required parameters
    if (!userId || !secret) {
      setError('Invalid or expired reset link. Please request a new password reset.');
    }
  }, [userId, secret]);

  const validatePassword = (value: string): boolean => {
    if (!value) {
      setPasswordError('Password is required');
      return false;
    }
    if (value.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return false;
    }
    if (!/[A-Z]/.test(value)) {
      setPasswordError('Password must contain at least one uppercase letter');
      return false;
    }
    if (!/[a-z]/.test(value)) {
      setPasswordError('Password must contain at least one lowercase letter');
      return false;
    }
    if (!/[0-9]/.test(value)) {
      setPasswordError('Password must contain at least one number');
      return false;
    }
    setPasswordError(null);
    return true;
  };

  const validateConfirmPassword = (value: string): boolean => {
    if (!value) {
      setConfirmPasswordError('Please confirm your password');
      return false;
    }
    if (value !== password) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    }
    setConfirmPasswordError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate all fields
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);

    if (!isPasswordValid || !isConfirmPasswordValid) {
      return;
    }

    setIsLoading(true);

    try {
      await authService.completePasswordRecovery(userId, secret, password);
      setSuccess(true);
      
      // Auto-navigate after showing success message
      setTimeout(() => {
        onSuccess?.();
        onNavigateToLogin?.();
      }, 2000);
    } catch (err: any) {
      console.error('Password reset confirmation error:', err);
      
      // Handle specific error messages
      if (err.message?.includes('expired') || err.message?.includes('invalid')) {
        setError('This reset link has expired or is invalid. Please request a new password reset.');
      } else if (err.message?.includes('password')) {
        setError('Password does not meet security requirements.');
      } else {
        setError('Failed to reset password. Please try again or request a new reset link.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-3">
              <CheckCircle className="size-8 text-success" weight="fill" />
              <CardTitle className="text-2xl font-semibold">Password reset!</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Your password has been successfully reset. You can now sign in with your new password.
            </p>
          </CardContent>
          <CardFooter>
            <Button
              onClick={onNavigateToLogin}
              className="w-full"
            >
              Continue to sign in
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-semibold">Set new password</CardTitle>
          <CardDescription>
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="flex items-start gap-3 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive">
                <Warning className="size-5 shrink-0 mt-0.5" weight="fill" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) validatePassword(e.target.value);
                    if (confirmPassword) validateConfirmPassword(confirmPassword);
                  }}
                  onBlur={() => validatePassword(password)}
                  disabled={isLoading || !!error}
                  aria-invalid={!!passwordError}
                  className={cn(passwordError && 'border-destructive', 'pr-10')}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                  disabled={isLoading || !!error}
                >
                  {showPassword ? (
                    <EyeSlash className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {passwordError && (
                <p className="text-sm text-destructive">{passwordError}</p>
              )}
              {!passwordError && password && (
                <p className="text-xs text-muted-foreground">
                  Must be at least 8 characters with uppercase, lowercase, and numbers
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (confirmPasswordError) validateConfirmPassword(e.target.value);
                  }}
                  onBlur={() => validateConfirmPassword(confirmPassword)}
                  disabled={isLoading || !!error}
                  aria-invalid={!!confirmPasswordError}
                  className={cn(confirmPasswordError && 'border-destructive', 'pr-10')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                  disabled={isLoading || !!error}
                >
                  {showConfirmPassword ? (
                    <EyeSlash className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {confirmPasswordError && (
                <p className="text-sm text-destructive">{confirmPasswordError}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !!error}
            >
              {isLoading ? 'Resetting password...' : 'Reset password'}
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              Remember your password?{' '}
              <button
                type="button"
                onClick={onNavigateToLogin}
                className="text-primary hover:underline font-medium"
              >
                Sign in
              </button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
