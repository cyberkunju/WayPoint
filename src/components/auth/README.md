# Authentication UI Components

This directory contains all authentication-related UI components for ClarityFlow, implementing a complete authentication flow with Appwrite backend integration.

## Components

### AuthFlow
Main orchestrator component that manages navigation between different authentication views.

**Props:**
- `initialView?: 'login' | 'register' | 'password-reset' | 'password-reset-confirm' | 'email-verification'` - Initial view to display
- `onAuthSuccess?: () => void` - Callback when authentication is successful

**Usage:**
```tsx
import { AuthFlow } from '@/components/auth';

function App() {
  return (
    <AuthFlow 
      initialView="login"
      onAuthSuccess={() => {
        // Navigate to main app
      }}
    />
  );
}
```

### LoginPage
User login form with email and password fields.

**Features:**
- Email and password validation
- Show/hide password toggle
- Error handling with specific error messages
- Link to registration and password reset
- Loading states

**Props:**
- `onSuccess?: () => void` - Called after successful login
- `onNavigateToRegister?: () => void` - Navigate to registration
- `onNavigateToPasswordReset?: () => void` - Navigate to password reset

### RegisterPage
User registration form with email, password, and name fields.

**Features:**
- Full name, email, and password validation
- Password strength requirements (8+ chars, uppercase, lowercase, numbers)
- Password confirmation matching
- Show/hide password toggles
- Automatic email verification sending
- Success state with email confirmation message
- Link to login page

**Props:**
- `onSuccess?: () => void` - Called after successful registration
- `onNavigateToLogin?: () => void` - Navigate to login

### PasswordResetPage
Request password reset email form.

**Features:**
- Email validation
- Generic success message (prevents email enumeration)
- Link back to login
- Clear instructions for next steps

**Props:**
- `onNavigateToLogin?: () => void` - Navigate to login

### PasswordResetConfirmPage
Complete password reset with new password form.

**Features:**
- New password and confirmation fields
- Password strength validation
- Show/hide password toggles
- Automatic verification of reset token
- Success state with auto-redirect
- Error handling for expired/invalid tokens

**Props:**
- `userId: string` - User ID from reset link
- `secret: string` - Secret token from reset link
- `onSuccess?: () => void` - Called after successful reset
- `onNavigateToLogin?: () => void` - Navigate to login

### EmailVerificationPage
Email verification confirmation page.

**Features:**
- Automatic verification when userId and secret are provided
- Manual resend verification email option
- Loading states during verification
- Success state with auto-redirect
- Error handling for expired/invalid tokens
- Link back to login

**Props:**
- `userId?: string` - User ID from verification link
- `secret?: string` - Secret token from verification link
- `onSuccess?: () => void` - Called after successful verification
- `onNavigateToLogin?: () => void` - Navigate to login

## Design System

All components follow the ClarityFlow design system:

### Colors
- **Primary**: Deep Blue (oklch(0.45 0.15 250))
- **Accent**: Warm Orange (oklch(0.72 0.15 60))
- **Destructive**: Red for errors
- **Success**: Green for success states
- **Muted**: Gray for secondary text

### Typography
- **Headings**: Inter font, semibold weight
- **Body**: Inter font, regular weight
- **Sizes**: 2xl (24px) for titles, sm (14px) for body text

### Spacing
- **Card padding**: 24px (6 in Tailwind units)
- **Form spacing**: 16px (4 in Tailwind units)
- **Component gaps**: 12px (3 in Tailwind units)

### Components
- **Cards**: Rounded corners (xl), subtle shadow, border
- **Inputs**: Height 36px (9 in Tailwind), rounded corners (md)
- **Buttons**: Height 36px (9 in Tailwind), rounded corners (md)
- **Icons**: Phosphor Icons, 16px (4 in Tailwind) or 20px (5 in Tailwind)

## Form Validation

All forms implement comprehensive validation:

### Email Validation
- Required field
- Valid email format (regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`)
- Real-time validation on blur
- Error messages displayed below field

### Password Validation
- Required field
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- Real-time validation on blur
- Error messages displayed below field

### Name Validation
- Required field
- Minimum 2 characters
- Real-time validation on blur

### Password Confirmation
- Must match password field
- Real-time validation on blur

## Error Handling

Components handle various error scenarios:

### Login Errors
- Invalid credentials
- User not found
- Account blocked
- Generic fallback error

### Registration Errors
- Email already exists
- Password requirements not met
- Invalid email format
- Generic fallback error

### Password Reset Errors
- Expired/invalid token
- Password requirements not met
- Generic fallback error

### Email Verification Errors
- Expired/invalid token
- Already verified
- Not authenticated (for resend)
- Generic fallback error

## Security Features

1. **Password Visibility Toggle**: Users can show/hide passwords
2. **Email Enumeration Prevention**: Generic success messages for password reset
3. **Token Validation**: Automatic validation of reset and verification tokens
4. **Session Management**: Automatic session refresh handled by auth service
5. **Secure Error Messages**: No sensitive information exposed in error messages

## Accessibility

All components follow accessibility best practices:

- Semantic HTML elements
- Proper label associations
- ARIA attributes for invalid states
- Keyboard navigation support
- Focus management
- Screen reader friendly error messages

## Integration with Auth Service

All components use the `authService` singleton from `@/services/auth.service`:

```typescript
import { authService } from '@/services/auth.service';

// Login
await authService.login(email, password);

// Register
await authService.register(email, password, name);

// Password reset
await authService.sendPasswordRecovery(email, resetUrl);
await authService.completePasswordRecovery(userId, secret, password);

// Email verification
await authService.sendEmailVerification(verificationUrl);
await authService.confirmEmailVerification(userId, secret);
```

## URL Parameters

The AuthFlow component automatically detects URL parameters for:

### Password Reset
- Path: `/reset-password`
- Parameters: `?userId=xxx&secret=xxx`

### Email Verification
- Path: `/verify-email`
- Parameters: `?userId=xxx&secret=xxx` (optional)

## Testing

Test files are located in `__tests__/` directory:

```bash
npm test src/components/auth
```

## Future Enhancements

Potential improvements for future iterations:

1. OAuth providers (Google, GitHub, etc.)
2. Two-factor authentication (2FA)
3. Biometric authentication
4. Remember me functionality
5. Session management UI
6. Account recovery options
7. Magic link authentication
8. Passwordless authentication
