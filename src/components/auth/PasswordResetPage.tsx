import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { authService } from '@/services/auth.service';
import { cn } from '@/lib/utils';
import { Warning, CheckCircle, ArrowLeft } from '@phosphor-icons/react';

interface PasswordResetPageProps {
  onNavigateToLogin?: () => void;
}

export function PasswordResetPage({ onNavigateToLogin }: PasswordResetPageProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validateEmail = (value: string): boolean => {
    if (!value) {
      setEmailError('Email is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate email
    if (!validateEmail(email)) {
      return;
    }

    setIsLoading(true);

    try {
      // Send password recovery email
      const resetUrl = `${window.location.origin}/reset-password`;
      await authService.sendPasswordRecovery(email, resetUrl);
      setSuccess(true);
    } catch (err: any) {
      console.error('Password reset error:', err);
      
      // For security reasons, we show a generic success message even if the email doesn't exist
      // This prevents email enumeration attacks
      setSuccess(true);
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
              <CardTitle className="text-2xl font-semibold">Check your email</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              If an account exists with{' '}
              <span className="font-medium text-foreground">{email}</span>, you will receive a password reset link shortly.
            </p>
            <p className="text-sm text-muted-foreground">
              Please check your inbox and follow the instructions to reset your password.
            </p>
            <div className="p-3 rounded-md bg-muted/50 border">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Didn't receive the email?</strong>
                <br />
                Check your spam folder or try again in a few minutes.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={onNavigateToLogin}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="size-4" />
              Back to sign in
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
          <CardTitle className="text-2xl font-semibold">Reset your password</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a link to reset your password
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
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) validateEmail(e.target.value);
                }}
                onBlur={() => validateEmail(email)}
                disabled={isLoading}
                aria-invalid={!!emailError}
                className={cn(emailError && 'border-destructive')}
                autoFocus
              />
              {emailError && (
                <p className="text-sm text-destructive">{emailError}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send reset link'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={onNavigateToLogin}
              className="w-full"
            >
              <ArrowLeft className="size-4" />
              Back to sign in
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
