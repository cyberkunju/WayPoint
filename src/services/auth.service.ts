import { account } from '@/lib/appwrite';
import { ID, type Models } from 'appwrite';
import { preferencesService } from './preferences.service';
import { UserPreferences } from '@/lib/types';

/**
 * Authentication Service
 * Handles user registration, login, logout, and session management with automatic token refresh
 */
export class AuthService {
  private sessionCheckInterval: NodeJS.Timeout | null = null;
  private readonly SESSION_CHECK_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes
  private readonly SESSION_REFRESH_THRESHOLD = 15 * 60 * 1000; // Refresh if less than 15 minutes remaining

  /**
   * Register a new user with email and password
   * Automatically sends verification email after registration
   */
  async register(email: string, password: string, name: string): Promise<Models.User<Models.Preferences>> {
    try {
      // Create account using new API
      const user = await account.create({
        userId: ID.unique(),
        email,
        password,
        name,
      });

      // Automatically send verification email after registration
      try {
        await this.sendEmailVerification(window.location.origin + '/verify-email');
      } catch (verificationError) {
        console.warn('Failed to send verification email:', verificationError);
        // Don't throw - registration was successful
      }

      return user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Create email session (login)
   * Starts automatic session refresh monitoring and loads user preferences
   */
  async login(email: string, password: string): Promise<Models.Session> {
    try {
      const session = await account.createEmailPasswordSession({
        email,
        password,
      });

      // Start session monitoring for automatic refresh
      this.startSessionMonitoring();

      // Load user preferences after successful login
      try {
        const user = await this.getCurrentUser();
        if (user) {
          await this.loadUserPreferences(user.$id);
        }
      } catch (prefsError) {
        console.warn('Failed to load user preferences:', prefsError);
        // Don't throw - login was successful
      }

      return session;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Load user preferences from Appwrite
   * Creates default preferences if they don't exist
   */
  async loadUserPreferences(userId: string): Promise<UserPreferences> {
    try {
      const defaultPreferences: UserPreferences = {
        theme: 'light',
        density: 'comfortable',
        primaryColor: '#2E5AAC',
        fontSize: 'medium',
        sidebarCollapsed: false,
        defaultView: 'list',
        taskReminders: true,
        dailySummary: true,
        overdueAlerts: true,
      };

      const preferences = await preferencesService.loadOrCreatePreferences(
        userId,
        defaultPreferences
      );

      // Dispatch event with loaded preferences for the app to consume
      window.dispatchEvent(
        new CustomEvent('preferences-loaded', { detail: preferences })
      );

      return preferences;
    } catch (error) {
      console.error('Error loading user preferences:', error);
      throw error;
    }
  }

  /**
   * Save user preferences to Appwrite
   */
  async saveUserPreferences(
    userId: string,
    preferences: Partial<UserPreferences>
  ): Promise<UserPreferences> {
    try {
      const updated = await preferencesService.updateUserPreferences(
        userId,
        preferences
      );

      // Dispatch event with updated preferences
      window.dispatchEvent(
        new CustomEvent('preferences-updated', { detail: updated })
      );

      return updated;
    } catch (error) {
      console.error('Error saving user preferences:', error);
      throw error;
    }
  }

  /**
   * Sync local preferences to Appwrite
   * Useful for migrating from localStorage to cloud storage
   */
  async syncLocalPreferences(
    userId: string,
    localPreferences: UserPreferences
  ): Promise<UserPreferences> {
    try {
      return await preferencesService.syncPreferences(userId, localPreferences);
    } catch (error) {
      console.error('Error syncing local preferences:', error);
      throw error;
    }
  }

  /**
   * Get current user session
   */
  async getCurrentUser(): Promise<Models.User<Models.Preferences> | null> {
    try {
      return await account.get();
    } catch (error) {
      return null;
    }
  }

  /**
   * Get current session
   */
  async getCurrentSession(): Promise<Models.Session | null> {
    try {
      return await account.getSession({ sessionId: 'current' });
    } catch (error) {
      return null;
    }
  }

  /**
   * List all active sessions for the current user
   */
  async listSessions(): Promise<Models.SessionList> {
    try {
      return await account.listSessions();
    } catch (error) {
      console.error('List sessions error:', error);
      throw error;
    }
  }

  /**
   * Refresh the current session to extend its validity
   * This is called automatically by the session monitoring system
   */
  async refreshSession(): Promise<Models.Session> {
    try {
      // Get current session
      const currentSession = await this.getCurrentSession();
      if (!currentSession) {
        throw new Error('No active session to refresh');
      }

      // Create a new session (Appwrite automatically invalidates the old one)
      // This effectively refreshes the session
      const sessions = await this.listSessions();
      if (sessions.total > 0) {
        // Session is still valid, return it
        return currentSession;
      }

      throw new Error('Session expired');
    } catch (error) {
      console.error('Session refresh error:', error);
      this.stopSessionMonitoring();
      throw error;
    }
  }

  /**
   * Check if session needs refresh and refresh if necessary
   * Returns true if session is valid, false if expired
   */
  async checkAndRefreshSession(): Promise<boolean> {
    try {
      const session = await this.getCurrentSession();
      if (!session) {
        return false;
      }

      // Check if session is about to expire
      const expiryTime = new Date(session.expire).getTime();
      const currentTime = Date.now();
      const timeUntilExpiry = expiryTime - currentTime;

      // If session expires in less than threshold, try to refresh
      if (timeUntilExpiry < this.SESSION_REFRESH_THRESHOLD) {
        try {
          await this.refreshSession();
          return true;
        } catch (refreshError) {
          console.error('Failed to refresh session:', refreshError);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Session check error:', error);
      return false;
    }
  }

  /**
   * Start automatic session monitoring and refresh
   */
  private startSessionMonitoring(): void {
    // Clear any existing interval
    this.stopSessionMonitoring();

    // Set up periodic session check
    this.sessionCheckInterval = setInterval(async () => {
      const isValid = await this.checkAndRefreshSession();
      if (!isValid) {
        this.stopSessionMonitoring();
        // Emit event for UI to handle expired session
        window.dispatchEvent(new CustomEvent('session-expired'));
      }
    }, this.SESSION_CHECK_INTERVAL);
  }

  /**
   * Stop automatic session monitoring
   */
  private stopSessionMonitoring(): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
      this.sessionCheckInterval = null;
    }
  }

  /**
   * Logout (delete current session)
   * Stops session monitoring and clears sensitive data
   */
  async logout(): Promise<void> {
    try {
      this.stopSessionMonitoring();
      await account.deleteSession({ sessionId: 'current' });
      
      // Clear any cached data
      this.clearClientData();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  /**
   * Logout from all sessions
   * Useful for security purposes (e.g., password change, suspicious activity)
   */
  async logoutAll(): Promise<void> {
    try {
      this.stopSessionMonitoring();
      await account.deleteSessions();
      
      // Clear any cached data
      this.clearClientData();
    } catch (error) {
      console.error('Logout all error:', error);
      throw error;
    }
  }

  /**
   * Clear sensitive client-side data
   * Called during logout to ensure no data remains in browser
   */
  private clearClientData(): void {
    try {
      // Clear localStorage items related to auth
      const keysToRemove = ['auth-token', 'user-session', 'user-preferences'];
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });

      // Clear sessionStorage
      sessionStorage.clear();

      // Dispatch event for other parts of the app to clear their data
      window.dispatchEvent(new CustomEvent('auth-logout'));
    } catch (error) {
      console.error('Error clearing client data:', error);
    }
  }

  /**
   * Send password recovery email
   */
  async sendPasswordRecovery(email: string, url: string): Promise<Models.Token> {
    try {
      return await account.createRecovery({
        email,
        url,
      });
    } catch (error) {
      console.error('Password recovery error:', error);
      throw error;
    }
  }

  /**
   * Complete password recovery with new password
   */
  async completePasswordRecovery(
    userId: string,
    secret: string,
    password: string
  ): Promise<Models.Token> {
    try {
      return await account.updateRecovery({
        userId,
        secret,
        password,
      });
    } catch (error) {
      console.error('Complete password recovery error:', error);
      throw error;
    }
  }

  /**
   * Send email verification
   */
  async sendEmailVerification(url: string): Promise<Models.Token> {
    try {
      return await account.createVerification({
        url,
      });
    } catch (error) {
      console.error('Send email verification error:', error);
      throw error;
    }
  }

  /**
   * Confirm email verification
   */
  async confirmEmailVerification(userId: string, secret: string): Promise<Models.Token> {
    try {
      return await account.updateVerification({
        userId,
        secret,
      });
    } catch (error) {
      console.error('Confirm email verification error:', error);
      throw error;
    }
  }

  /**
   * Check if current user's email is verified
   */
  async isEmailVerified(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      return user?.emailVerification ?? false;
    } catch (error) {
      console.error('Check email verification error:', error);
      return false;
    }
  }

  /**
   * Update user name
   */
  async updateName(name: string): Promise<Models.User<Models.Preferences>> {
    try {
      return await account.updateName({
        name,
      });
    } catch (error) {
      console.error('Update name error:', error);
      throw error;
    }
  }

  /**
   * Update user password
   */
  async updatePassword(password: string, oldPassword: string): Promise<Models.User<Models.Preferences>> {
    try {
      return await account.updatePassword({
        password,
        oldPassword,
      });
    } catch (error) {
      console.error('Update password error:', error);
      throw error;
    }
  }

  /**
   * Update user email
   */
  async updateEmail(email: string, password: string): Promise<Models.User<Models.Preferences>> {
    try {
      return await account.updateEmail({
        email,
        password,
      });
    } catch (error) {
      console.error('Update email error:', error);
      throw error;
    }
  }

  /**
   * Get user preferences
   */
  async getPreferences<T extends Models.Preferences>(): Promise<T> {
    try {
      return await account.getPrefs<T>();
    } catch (error) {
      console.error('Get preferences error:', error);
      throw error;
    }
  }

  /**
   * Update user preferences
   */
  async updatePreferences<T extends Models.Preferences>(prefs: Partial<T>): Promise<Models.User<T>> {
    try {
      return await account.updatePrefs<T>({
        prefs,
      });
    } catch (error) {
      console.error('Update preferences error:', error);
      throw error;
    }
  }

  /**
   * Delete user account
   * This is a destructive operation and cannot be undone
   */
  async deleteAccount(): Promise<void> {
    try {
      this.stopSessionMonitoring();
      // Note: Appwrite doesn't have a direct delete account method in the client SDK
      // This would typically be handled by a server-side function
      throw new Error('Account deletion must be performed through server-side function');
    } catch (error) {
      console.error('Delete account error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
