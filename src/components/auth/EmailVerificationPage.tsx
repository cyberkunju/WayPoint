import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { authService } from '@/services/auth.service';
import { CheckCircle, Warning, Spinner, EnvelopeSimple } from '@phosphor-icons/react';

interface EmailVerificationPageProps {
  userId?: string;
  secret?: string;
  onSuccess?: () => void;
  onNavigateToLogin?: () => void;
}

export function EmailVerificationPage({ 
  userId, 
  secret, 
  onSuccess, 
  onNavigateToLogin 
}: EmailVerificationPageProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    // If we have userId and secret, automatically verify
    if (userId && secret) {
      verifyEmail();
    }
  }, [userId, secret]);

  const verifyEmail = async () => {
    if (!userId || !secret) {
      setError('Invalid verification link. Please check your email for the correct link.');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      await authService.confirmEmailVerification(userId, secret);
      setSuccess(true);
      
      // Auto-navigate after showing success message
      setTimeout(() => {
        onSuccess?.();
        onNavigateToLogin?.();
      }, 3000);
    } catch (err: any) {
      console.error('Email verification error:', err);
      
      // Handle specific error messages
      if (err.message?.includes('expired')) {
        setError('This verification link has expired. Please request a new verification email.');
      } else if (err.message?.includes('invalid')) {
        setError('This verification link is invalid. Please check your email for the correct link.');
      } else if (err.message?.includes('already verified')) {
        setError('This email has already been verified. You can sign in now.');
      } else {
        setError('Failed to verify email. Please try again or request a new verification link.');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendVerification = async () => {
    setIsResending(true);
    setResendSuccess(false);
    setError(null);

    try {
      const verificationUrl = `${window.location.origin}/verify-email`;
      await authService.sendEmailVerification(verificationUrl);
      setResendSuccess(true);
    } catch (err: any) {
      console.error('Resend verification error:', err);
      
      if (err.message?.includes('not authenticated')) {
        setError('Please sign in first to resend the verification email.');
      } else {
        setError('Failed to resend verification email. Please try again later.');
      }
    } finally {
      setIsResending(false);
    }
  };

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-3">
              <CheckCircle className="size-8 text-success" weight="fill" />
              <CardTitle className="text-2xl font-semibold">Email verified!</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Your email has been successfully verified. You can now access all features of ClarityFlow.
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

  // Verifying state
  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-3">
              <Spinner className="size-8 text-primary animate-spin" />
              <CardTitle className="text-2xl font-semibold">Verifying email...</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Please wait while we verify your email address.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error or waiting for verification state
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-3">
            <EnvelopeSimple className="size-8 text-primary" weight="fill" />
            <CardTitle className="text-2xl font-semibold">
              {error ? 'Verification failed' : 'Verify your email'}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="flex items-start gap-3 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive">
              <Warning className="size-5 shrink-0 mt-0.5" weight="fill" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {resendSuccess && (
            <div className="flex items-start gap-3 p-3 rounded-md bg-success/10 border border-success/20 text-success">
              <CheckCircle className="size-5 shrink-0 mt-0.5" weight="fill" />
              <p className="text-sm">
                Verification email sent! Please check your inbox.
              </p>
            </div>
          )}

          {!error && !userId && !secret && (
            <>
              <p className="text-muted-foreground">
                We've sent a verification email to your inbox. Please click the link in the email to verify your account.
              </p>
              <div className="p-3 rounded-md bg-muted/50 border">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Didn't receive the email?</strong>
                  <br />
                  Check your spam folder or request a new verification email below.
                </p>
              </div>
            </>
          )}

          {error && (
            <p className="text-sm text-muted-foreground">
              You can request a new verification email or try signing in if your email is already verified.
            </p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          {(!userId || !secret || error) && (
            <Button
              onClick={handleResendVerification}
              disabled={isResending}
              className="w-full"
              variant={error ? 'default' : 'outline'}
            >
              {isResending ? 'Sending...' : 'Resend verification email'}
            </Button>
          )}
          <Button
            onClick={onNavigateToLogin}
            variant="ghost"
            className="w-full"
          >
            Back to sign in
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
