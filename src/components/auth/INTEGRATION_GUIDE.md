# Authentication Integration Guide

## Quick Start

### Option 1: Using AuthGuard (Recommended)

Wrap your main application with `AuthGuard` to automatically handle authentication:

```tsx
// src/main.tsx or src/App.tsx
import { AuthGuard } from '@/components/auth';
import { MainApp } from './MainApp';

function App() {
  return (
    <AuthGuard>
      <MainApp />
    </AuthGuard>
  );
}
```

**What this does:**
- Checks if user is authenticated on mount
- Shows `AuthFlow` if not authenticated
- Renders your app if authenticated
- Listens for logout/session-expired events
- Provides loading state during auth check

### Option 2: Using AuthFlow Directly

Use `AuthFlow` for more control over the authentication experience:

```tsx
import { useState } from 'react';
import { AuthFlow } from '@/components/auth';
import { MainApp } from './MainApp';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return (
      <AuthFlow 
        onAuthSuccess={() => setIsAuthenticated(true)}
      />
    );
  }

  return <MainApp />;
}
```

### Option 3: Individual Components

Use individual auth components for custom flows:

```tsx
import { LoginPage, RegisterPage } from '@/components/auth';

function CustomAuthFlow() {
  const [view, setView] = useState<'login' | 'register'>('login');

  if (view === 'register') {
    return (
      <RegisterPage
        onSuccess={() => {
          // Handle registration success
        }}
        onNavigateToLogin={() => setView('login')}
      />
    );
  }

  return (
    <LoginPage
      onSuccess={() => {
        // Handle login success
      }}
      onNavigateToRegister={() => setView('register')}
    />
  );
}
```

## URL Configuration

Configure your application to handle authentication URLs:

### Password Reset Flow

1. User requests password reset
2. Appwrite sends email with link: `https://yourapp.com/reset-password?userId=xxx&secret=xxx`
3. Your app should route to password reset confirmation page

**Example with React Router:**
```tsx
import { PasswordResetConfirmPage } from '@/components/auth';
import { useSearchParams } from 'react-router-dom';

function ResetPasswordRoute() {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');
  const secret = searchParams.get('secret');

  return (
    <PasswordResetConfirmPage
      userId={userId || ''}
      secret={secret || ''}
      onSuccess={() => {
        // Navigate to login
      }}
    />
  );
}
```

### Email Verification Flow

1. User registers
2. Appwrite sends email with link: `https://yourapp.com/verify-email?userId=xxx&secret=xxx`
3. Your app should route to email verification page

**Example with React Router:**
```tsx
import { EmailVerificationPage } from '@/components/auth';
import { useSearchParams } from 'react-router-dom';

function VerifyEmailRoute() {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');
  const secret = searchParams.get('secret');

  return (
    <EmailVerificationPage
      userId={userId || undefined}
      secret={secret || undefined}
      onSuccess={() => {
        // Navigate to login
      }}
    />
  );
}
```

## Environment Configuration

Ensure your Appwrite configuration is set up in `.env`:

```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your-project-id
```

The auth service will automatically use these values.

## Handling Authentication State

### Listen for Auth Events

The auth system dispatches custom events you can listen to:

```tsx
useEffect(() => {
  const handleLogout = () => {
    // User logged out
    console.log('User logged out');
  };

  const handleSessionExpired = () => {
    // Session expired
    console.log('Session expired');
  };

  window.addEventListener('auth-logout', handleLogout);
  window.addEventListener('session-expired', handleSessionExpired);

  return () => {
    window.removeEventListener('auth-logout', handleLogout);
    window.removeEventListener('session-expired', handleSessionExpired);
  };
}, []);
```

### Get Current User

```tsx
import { authService } from '@/services/auth.service';

async function getCurrentUser() {
  const user = await authService.getCurrentUser();
  if (user) {
    console.log('User:', user.name, user.email);
  }
}
```

### Logout

```tsx
import { authService } from '@/services/auth.service';

async function handleLogout() {
  try {
    await authService.logout();
    // User is logged out, auth-logout event is dispatched
  } catch (error) {
    console.error('Logout failed:', error);
  }
}
```

## Customization

### Custom Styling

All components use Tailwind CSS and can be customized via the design system:

```tsx
// Customize in your index.css or main.css
:root {
  --primary: oklch(0.45 0.15 250);  /* Deep Blue */
  --accent: oklch(0.72 0.15 60);    /* Warm Orange */
  /* ... other colors */
}
```

### Custom Callbacks

All components accept callback props for custom behavior:

```tsx
<LoginPage
  onSuccess={async () => {
    // Custom success handling
    const user = await authService.getCurrentUser();
    analytics.track('user_logged_in', { userId: user.$id });
    navigate('/dashboard');
  }}
  onNavigateToRegister={() => {
    // Custom navigation
    navigate('/register');
  }}
/>
```

### Custom Loading States

Provide custom loading UI to AuthGuard:

```tsx
<AuthGuard
  fallback={
    <div className="min-h-screen flex items-center justify-center">
      <YourCustomLoader />
    </div>
  }
>
  <MainApp />
</AuthGuard>
```

## Testing

### Demo Component

Use the `AuthDemo` component to test all auth flows in development:

```tsx
// Temporarily in your App.tsx
import { AuthDemo } from '@/components/auth/AuthDemo';

function App() {
  return <AuthDemo />;
}
```

### Unit Tests

Run the auth component tests:

```bash
npm test src/components/auth
```

### Manual Testing Checklist

- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Register new account
- [ ] Register with existing email
- [ ] Request password reset
- [ ] Complete password reset with valid token
- [ ] Complete password reset with expired token
- [ ] Verify email with valid token
- [ ] Verify email with expired token
- [ ] Resend verification email
- [ ] Show/hide password toggles
- [ ] Form validation (all fields)
- [ ] Navigation between auth pages
- [ ] Loading states
- [ ] Error messages
- [ ] Success states
- [ ] Auto-redirects

## Troubleshooting

### "Invalid credentials" error

- Check that Appwrite endpoint and project ID are correct
- Verify user exists in Appwrite console
- Check that password is correct

### Email not received

- Check spam folder
- Verify email settings in Appwrite console
- Check Appwrite logs for email sending errors
- Ensure email provider is configured

### Token expired errors

- Tokens expire after a certain time (default 1 hour)
- User needs to request a new reset/verification email
- Check Appwrite token expiration settings

### Session not persisting

- Check that cookies are enabled
- Verify Appwrite session settings
- Check browser console for errors
- Ensure HTTPS is used in production

### TypeScript errors

- Ensure all dependencies are installed: `npm install`
- Check that `@/` path alias is configured in `tsconfig.json`
- Verify Appwrite SDK types are available

## Best Practices

1. **Always use HTTPS in production** - Required for secure authentication
2. **Handle errors gracefully** - Show user-friendly error messages
3. **Validate on both client and server** - Client validation for UX, server for security
4. **Use strong password requirements** - Enforce minimum complexity
5. **Implement rate limiting** - Prevent brute force attacks (handled by Appwrite)
6. **Log authentication events** - For security monitoring
7. **Test all flows thoroughly** - Including error cases
8. **Keep auth service updated** - Follow Appwrite SDK updates

## Security Considerations

1. **Never expose API keys** - Use environment variables
2. **Use HTTPS only** - No authentication over HTTP
3. **Implement CSRF protection** - Handled by Appwrite
4. **Validate tokens server-side** - Don't trust client validation
5. **Use secure session storage** - Handled by Appwrite
6. **Implement account lockout** - After multiple failed attempts
7. **Monitor for suspicious activity** - Use Appwrite logs
8. **Keep dependencies updated** - Regular security updates

## Support

For issues or questions:

1. Check the [README.md](./README.md) for component documentation
2. Review the [auth service documentation](../../services/README.md)
3. Check [Appwrite documentation](https://appwrite.io/docs)
4. Review the demo component for examples

## Migration from Existing Auth

If migrating from an existing authentication system:

1. **Export user data** from old system
2. **Import users** to Appwrite (use Appwrite API)
3. **Update auth calls** to use new auth service
4. **Test thoroughly** with existing users
5. **Provide migration guide** for users
6. **Keep old system** running during transition
7. **Monitor for issues** during migration

## Next Steps

After integrating authentication:

1. ✅ Implement user preferences management (Task 7)
2. ✅ Set up data migration from localStorage (Task 8)
3. ✅ Update Zustand store for Appwrite sync (Task 9)
4. ✅ Implement protected routes
5. ✅ Add user profile management
6. ✅ Implement session management UI
7. ✅ Add OAuth providers (optional)
8. ✅ Implement 2FA (optional)
