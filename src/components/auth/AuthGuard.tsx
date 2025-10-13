import { useEffect, useState } from 'react';
import { authService } from '@/services/auth.service';
import { AuthFlow } from './AuthFlow';
import type { Models } from 'appwrite';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * AuthGuard component that protects routes requiring authentication
 * Shows AuthFlow if user is not authenticated, otherwise renders children
 */
export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();

    // Listen for auth events
    const handleAuthLogout = () => {
      setUser(null);
    };

    const handleSessionExpired = () => {
      setUser(null);
    };

    window.addEventListener('auth-logout', handleAuthLogout);
    window.addEventListener('session-expired', handleSessionExpired);

    return () => {
      window.removeEventListener('auth-logout', handleAuthLogout);
      window.removeEventListener('session-expired', handleSessionExpired);
    };
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSuccess = async () => {
    await checkAuth();
  };

  if (isLoading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center space-y-4">
            <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      )
    );
  }

  if (!user) {
    return <AuthFlow onAuthSuccess={handleAuthSuccess} />;
  }

  return <>{children}</>;
}
