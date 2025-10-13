import { useState, useEffect } from 'react';
import { LoginPage } from './LoginPage';
import { RegisterPage } from './RegisterPage';
import { PasswordResetPage } from './PasswordResetPage';
import { PasswordResetConfirmPage } from './PasswordResetConfirmPage';
import { EmailVerificationPage } from './EmailVerificationPage';

type AuthView = 'login' | 'register' | 'password-reset' | 'password-reset-confirm' | 'email-verification';

interface AuthFlowProps {
  initialView?: AuthView;
  onAuthSuccess?: () => void;
}

export function AuthFlow({ initialView = 'login', onAuthSuccess }: AuthFlowProps) {
  const [currentView, setCurrentView] = useState<AuthView>(initialView);
  const [resetParams, setResetParams] = useState<{ userId: string; secret: string } | null>(null);
  const [verificationParams, setVerificationParams] = useState<{ userId: string; secret: string } | null>(null);

  useEffect(() => {
    // Check URL parameters for password reset or email verification
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('userId');
    const secret = params.get('secret');
    
    // Determine which flow based on the current path
    const path = window.location.pathname;
    
    if (path.includes('/reset-password') && userId && secret) {
      setResetParams({ userId, secret });
      setCurrentView('password-reset-confirm');
    } else if (path.includes('/verify-email')) {
      if (userId && secret) {
        setVerificationParams({ userId, secret });
      }
      setCurrentView('email-verification');
    }
  }, []);

  const handleLoginSuccess = () => {
    onAuthSuccess?.();
  };

  const handleRegisterSuccess = () => {
    // After successful registration, show email verification page
    setCurrentView('email-verification');
  };

  const handlePasswordResetSuccess = () => {
    // After successful password reset, go to login
    setCurrentView('login');
  };

  const handleVerificationSuccess = () => {
    // After successful verification, go to login
    setCurrentView('login');
  };

  const renderView = () => {
    switch (currentView) {
      case 'register':
        return (
          <RegisterPage
            onSuccess={handleRegisterSuccess}
            onNavigateToLogin={() => setCurrentView('login')}
          />
        );
      
      case 'password-reset':
        return (
          <PasswordResetPage
            onNavigateToLogin={() => setCurrentView('login')}
          />
        );
      
      case 'password-reset-confirm':
        return resetParams ? (
          <PasswordResetConfirmPage
            userId={resetParams.userId}
            secret={resetParams.secret}
            onSuccess={handlePasswordResetSuccess}
            onNavigateToLogin={() => setCurrentView('login')}
          />
        ) : (
          <PasswordResetPage
            onNavigateToLogin={() => setCurrentView('login')}
          />
        );
      
      case 'email-verification':
        return (
          <EmailVerificationPage
            userId={verificationParams?.userId}
            secret={verificationParams?.secret}
            onSuccess={handleVerificationSuccess}
            onNavigateToLogin={() => setCurrentView('login')}
          />
        );
      
      case 'login':
      default:
        return (
          <LoginPage
            onSuccess={handleLoginSuccess}
            onNavigateToRegister={() => setCurrentView('register')}
            onNavigateToPasswordReset={() => setCurrentView('password-reset')}
          />
        );
    }
  };

  return renderView();
}
