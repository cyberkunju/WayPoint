import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { authService } from '../auth.service';
import { account } from '@/lib/appwrite';

// Mock the Appwrite account module
vi.mock('@/lib/appwrite', () => ({
  account: {
    create: vi.fn(),
    createEmailPasswordSession: vi.fn(),
    get: vi.fn(),
    getSession: vi.fn(),
    listSessions: vi.fn(),
    deleteSession: vi.fn(),
    deleteSessions: vi.fn(),
    createRecovery: vi.fn(),
    updateRecovery: vi.fn(),
    createVerification: vi.fn(),
    updateVerification: vi.fn(),
    updateName: vi.fn(),
    updatePassword: vi.fn(),
    updateEmail: vi.fn(),
    getPrefs: vi.fn(),
    updatePrefs: vi.fn(),
  },
}));

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('register', () => {
    it('should register a new user and send verification email', async () => {
      const mockUser = {
        $id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        emailVerification: false,
      };

      vi.mocked(account.create).mockResolvedValue(mockUser as any);
      vi.mocked(account.createVerification).mockResolvedValue({} as any);

      const result = await authService.register(
        'test@example.com',
        'password123',
        'Test User'
      );

      expect(account.create).toHaveBeenCalledWith({
        userId: expect.any(String),
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      expect(result).toEqual(mockUser);
    });

    it('should handle registration errors', async () => {
      vi.mocked(account.create).mockRejectedValue(new Error('Registration failed'));

      await expect(
        authService.register('test@example.com', 'password123', 'Test User')
      ).rejects.toThrow('Registration failed');
    });
  });

  describe('login', () => {
    it('should login user and start session monitoring', async () => {
      const mockSession = {
        $id: 'session123',
        userId: 'user123',
        expire: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      vi.mocked(account.createEmailPasswordSession).mockResolvedValue(mockSession as any);

      const result = await authService.login('test@example.com', 'password123');

      expect(account.createEmailPasswordSession).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual(mockSession);
    });

    it('should handle login errors', async () => {
      vi.mocked(account.createEmailPasswordSession).mockRejectedValue(
        new Error('Invalid credentials')
      );

      await expect(
        authService.login('test@example.com', 'wrongpassword')
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user', async () => {
      const mockUser = {
        $id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
      };

      vi.mocked(account.get).mockResolvedValue(mockUser as any);

      const result = await authService.getCurrentUser();

      expect(result).toEqual(mockUser);
    });

    it('should return null on error', async () => {
      vi.mocked(account.get).mockRejectedValue(new Error('Not authenticated'));

      const result = await authService.getCurrentUser();

      expect(result).toBeNull();
    });
  });

  describe('logout', () => {
    it('should logout and clear client data', async () => {
      vi.mocked(account.deleteSession).mockResolvedValue({} as any);

      const localStorageSpy = vi.spyOn(Storage.prototype, 'removeItem');
      const sessionStorageSpy = vi.spyOn(Storage.prototype, 'clear');

      await authService.logout();

      expect(account.deleteSession).toHaveBeenCalledWith({
        sessionId: 'current',
      });

      expect(localStorageSpy).toHaveBeenCalled();
      expect(sessionStorageSpy).toHaveBeenCalled();
    });
  });

  describe('password reset', () => {
    it('should send password recovery email', async () => {
      const mockToken = { $id: 'token123' };

      vi.mocked(account.createRecovery).mockResolvedValue(mockToken as any);

      const result = await authService.sendPasswordRecovery(
        'test@example.com',
        'https://app.com/reset'
      );

      expect(account.createRecovery).toHaveBeenCalledWith({
        email: 'test@example.com',
        url: 'https://app.com/reset',
      });

      expect(result).toEqual(mockToken);
    });

    it('should complete password recovery', async () => {
      const mockToken = { $id: 'token123' };

      vi.mocked(account.updateRecovery).mockResolvedValue(mockToken as any);

      const result = await authService.completePasswordRecovery(
        'user123',
        'secret123',
        'newPassword123'
      );

      expect(account.updateRecovery).toHaveBeenCalledWith({
        userId: 'user123',
        secret: 'secret123',
        password: 'newPassword123',
      });

      expect(result).toEqual(mockToken);
    });
  });

  describe('email verification', () => {
    it('should send email verification', async () => {
      const mockToken = { $id: 'token123' };

      vi.mocked(account.createVerification).mockResolvedValue(mockToken as any);

      const result = await authService.sendEmailVerification('https://app.com/verify');

      expect(account.createVerification).toHaveBeenCalledWith({
        url: 'https://app.com/verify',
      });

      expect(result).toEqual(mockToken);
    });

    it('should confirm email verification', async () => {
      const mockToken = { $id: 'token123' };

      vi.mocked(account.updateVerification).mockResolvedValue(mockToken as any);

      const result = await authService.confirmEmailVerification('user123', 'secret123');

      expect(account.updateVerification).toHaveBeenCalledWith({
        userId: 'user123',
        secret: 'secret123',
      });

      expect(result).toEqual(mockToken);
    });

    it('should check if email is verified', async () => {
      const mockUser = {
        $id: 'user123',
        emailVerification: true,
      };

      vi.mocked(account.get).mockResolvedValue(mockUser as any);

      const result = await authService.isEmailVerified();

      expect(result).toBe(true);
    });
  });

  describe('session management', () => {
    it('should get current session', async () => {
      const mockSession = {
        $id: 'session123',
        expire: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      vi.mocked(account.getSession).mockResolvedValue(mockSession as any);

      const result = await authService.getCurrentSession();

      expect(result).toEqual(mockSession);
    });

    it('should list all sessions', async () => {
      const mockSessions = {
        total: 2,
        sessions: [
          { $id: 'session1' },
          { $id: 'session2' },
        ],
      };

      vi.mocked(account.listSessions).mockResolvedValue(mockSessions as any);

      const result = await authService.listSessions();

      expect(result).toEqual(mockSessions);
    });
  });

  describe('user profile updates', () => {
    it('should update user name', async () => {
      const mockUser = {
        $id: 'user123',
        name: 'New Name',
      };

      vi.mocked(account.updateName).mockResolvedValue(mockUser as any);

      const result = await authService.updateName('New Name');

      expect(account.updateName).toHaveBeenCalledWith({
        name: 'New Name',
      });

      expect(result).toEqual(mockUser);
    });

    it('should update user password', async () => {
      const mockUser = { $id: 'user123' };

      vi.mocked(account.updatePassword).mockResolvedValue(mockUser as any);

      const result = await authService.updatePassword('newPass123', 'oldPass123');

      expect(account.updatePassword).toHaveBeenCalledWith({
        password: 'newPass123',
        oldPassword: 'oldPass123',
      });

      expect(result).toEqual(mockUser);
    });

    it('should update user email', async () => {
      const mockUser = {
        $id: 'user123',
        email: 'newemail@example.com',
      };

      vi.mocked(account.updateEmail).mockResolvedValue(mockUser as any);

      const result = await authService.updateEmail('newemail@example.com', 'password123');

      expect(account.updateEmail).toHaveBeenCalledWith({
        email: 'newemail@example.com',
        password: 'password123',
      });

      expect(result).toEqual(mockUser);
    });
  });

  describe('preferences', () => {
    it('should get user preferences', async () => {
      const mockPrefs = { theme: 'dark', language: 'en' };

      vi.mocked(account.getPrefs).mockResolvedValue(mockPrefs as any);

      const result = await authService.getPreferences();

      expect(result).toEqual(mockPrefs);
    });

    it('should update user preferences', async () => {
      const mockUser = {
        $id: 'user123',
        prefs: { theme: 'dark' },
      };

      vi.mocked(account.updatePrefs).mockResolvedValue(mockUser as any);

      const result = await authService.updatePreferences({ theme: 'dark' });

      expect(account.updatePrefs).toHaveBeenCalledWith({
        prefs: { theme: 'dark' },
      });

      expect(result).toEqual(mockUser);
    });
  });
});
