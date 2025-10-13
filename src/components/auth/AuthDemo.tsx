/**
 * AuthDemo Component
 * 
 * This is a demo/example component showing how to use the authentication components.
 * This file is for reference only and should not be imported in production code.
 * 
 * To test the auth flow in development:
 * 1. Import this component in your App.tsx temporarily
 * 2. Replace the main App content with <AuthDemo />
 * 3. Test all authentication flows
 * 4. Remove when done testing
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginPage } from './LoginPage';
import { RegisterPage } from './RegisterPage';
import { PasswordResetPage } from './PasswordResetPage';
import { PasswordResetConfirmPage } from './PasswordResetConfirmPage';
import { EmailVerificationPage } from './EmailVerificationPage';
import { AuthFlow } from './AuthFlow';

type DemoView = 'menu' | 'login' | 'register' | 'password-reset' | 'password-reset-confirm' | 'email-verification' | 'auth-flow';

export function AuthDemo() {
  const [currentView, setCurrentView] = useState<DemoView>('menu');

  const renderView = () => {
    switch (currentView) {
      case 'login':
        return (
          <LoginPage
            onSuccess={() => alert('Login successful!')}
            onNavigateToRegister={() => setCurrentView('register')}
            onNavigateToPasswordReset={() => setCurrentView('password-reset')}
          />
        );
      
      case 'register':
        return (
          <RegisterPage
            onSuccess={() => alert('Registration successful!')}
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
        return (
          <PasswordResetConfirmPage
            userId="demo-user-id"
            secret="demo-secret"
            onSuccess={() => alert('Password reset successful!')}
            onNavigateToLogin={() => setCurrentView('login')}
          />
        );
      
      case 'email-verification':
        return (
          <EmailVerificationPage
            userId="demo-user-id"
            secret="demo-secret"
            onSuccess={() => alert('Email verified!')}
            onNavigateToLogin={() => setCurrentView('login')}
          />
        );
      
      case 'auth-flow':
        return (
          <AuthFlow
            onAuthSuccess={() => alert('Authentication successful!')}
          />
        );
      
      case 'menu':
      default:
        return (
          <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-2xl">
              <CardHeader>
                <CardTitle className="text-2xl">Authentication Components Demo</CardTitle>
                <CardDescription>
                  Select a component to preview. This is for development/testing only.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button
                    onClick={() => setCurrentView('login')}
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-start gap-1"
                  >
                    <span className="font-semibold">Login Page</span>
                    <span className="text-xs text-muted-foreground font-normal">
                      Email and password login form
                    </span>
                  </Button>

                  <Button
                    onClick={() => setCurrentView('register')}
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-start gap-1"
                  >
                    <span className="font-semibold">Register Page</span>
                    <span className="text-xs text-muted-foreground font-normal">
                      New user registration form
                    </span>
                  </Button>

                  <Button
                    onClick={() => setCurrentView('password-reset')}
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-start gap-1"
                  >
                    <span className="font-semibold">Password Reset</span>
                    <span className="text-xs text-muted-foreground font-normal">
                      Request password reset email
                    </span>
                  </Button>

                  <Button
                    onClick={() => setCurrentView('password-reset-confirm')}
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-start gap-1"
                  >
                    <span className="font-semibold">Reset Confirmation</span>
                    <span className="text-xs text-muted-foreground font-normal">
                      Set new password form
                    </span>
                  </Button>

                  <Button
                    onClick={() => setCurrentView('email-verification')}
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-start gap-1"
                  >
                    <span className="font-semibold">Email Verification</span>
                    <span className="text-xs text-muted-foreground font-normal">
                      Verify email address page
                    </span>
                  </Button>

                  <Button
                    onClick={() => setCurrentView('auth-flow')}
                    variant="default"
                    className="h-auto py-4 flex flex-col items-start gap-1"
                  >
                    <span className="font-semibold">Complete Auth Flow</span>
                    <span className="text-xs text-primary-foreground/80 font-normal">
                      Full authentication experience
                    </span>
                  </Button>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-2">Features Demonstrated:</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Form validation with real-time error messages</li>
                    <li>Password visibility toggles</li>
                    <li>Loading states and disabled inputs</li>
                    <li>Success and error states</li>
                    <li>Navigation between auth flows</li>
                    <li>ClarityFlow design system compliance</li>
                    <li>Accessibility features (ARIA, keyboard nav)</li>
                    <li>Integration with Appwrite auth service</li>
                  </ul>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-2">Integration Example:</h3>
                  <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto">
{`import { AuthFlow } from '@/components/auth';

function App() {
  return (
    <AuthFlow 
      onAuthSuccess={() => {
        // Navigate to main app
      }}
    />
  );
}`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="relative">
      {currentView !== 'menu' && (
        <div className="fixed top-4 left-4 z-50">
          <Button
            onClick={() => setCurrentView('menu')}
            variant="outline"
            size="sm"
          >
            ← Back to Menu
          </Button>
        </div>
      )}
      {renderView()}
    </div>
  );
}
