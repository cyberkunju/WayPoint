import { describe, it, expect, vi, beforeEach } from 'vitest';
import { preferencesService } from '../preferences.service';
import { databases } from '@/lib/appwrite';
import { UserPreferences } from '@/lib/types';

// Mock Appwrite
vi.mock('@/lib/appwrite', () => ({
  databases: {
    listDocuments: vi.fn(),
    createDocument: vi.fn(),
    updateDocument: vi.fn(),
  },
  account: {},
  DATABASE_ID: 'test-db',
  COLLECTIONS: {
    USERS_PREFERENCES: 'users_preferences',
  },
}));

describe('PreferencesService', () => {
  const mockUserId = 'user123';
  const mockPreferences: UserPreferences = {
    theme: 'dark',
    density: 'compact',
    primaryColor: '#FF5733',
    fontSize: 'large',
    sidebarCollapsed: true,
    defaultView: 'kanban',
    taskReminders: false,
    dailySummary: false,
    overdueAlerts: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserPreferences', () => {
    it('should fetch user preferences successfully', async () => {
      const mockDoc = {
        $id: 'pref123',
        userId: mockUserId,
        ...mockPreferences,
      };

      vi.mocked(databases.listDocuments).mockResolvedValue({
        documents: [mockDoc],
        total: 1,
      } as any);

      const result = await preferencesService.getUserPreferences(mockUserId);

      expect(result).toEqual(mockPreferences);
      expect(databases.listDocuments).toHaveBeenCalledWith(
        'test-db',
        'users_preferences',
        expect.any(Array)
      );
    });

    it('should return null when no preferences found', async () => {
      vi.mocked(databases.listDocuments).mockResolvedValue({
        documents: [],
        total: 0,
      } as any);

      const result = await preferencesService.getUserPreferences(mockUserId);

      expect(result).toBeNull();
    });

    it('should throw error on failure', async () => {
      vi.mocked(databases.listDocuments).mockRejectedValue(
        new Error('Database error')
      );

      await expect(
        preferencesService.getUserPreferences(mockUserId)
      ).rejects.toThrow('Database error');
    });
  });

  describe('createUserPreferences', () => {
    it('should create user preferences successfully', async () => {
      const mockDoc = {
        $id: 'pref123',
        userId: mockUserId,
        ...mockPreferences,
      };

      vi.mocked(databases.createDocument).mockResolvedValue(mockDoc as any);

      const result = await preferencesService.createUserPreferences(
        mockUserId,
        mockPreferences
      );

      expect(result).toEqual(mockPreferences);
      expect(databases.createDocument).toHaveBeenCalledWith(
        'test-db',
        'users_preferences',
        expect.any(String),
        expect.objectContaining({
          userId: mockUserId,
          theme: mockPreferences.theme,
          density: mockPreferences.density,
        })
      );
    });

    it('should throw error on failure', async () => {
      vi.mocked(databases.createDocument).mockRejectedValue(
        new Error('Create error')
      );

      await expect(
        preferencesService.createUserPreferences(mockUserId, mockPreferences)
      ).rejects.toThrow('Create error');
    });
  });

  describe('updateUserPreferences', () => {
    it('should update user preferences successfully', async () => {
      const mockDoc = {
        $id: 'pref123',
        userId: mockUserId,
        ...mockPreferences,
      };

      vi.mocked(databases.listDocuments).mockResolvedValue({
        documents: [mockDoc],
        total: 1,
      } as any);

      vi.mocked(databases.updateDocument).mockResolvedValue(mockDoc as any);

      const updates = { theme: 'light' as const };
      const result = await preferencesService.updateUserPreferences(
        mockUserId,
        updates
      );

      expect(databases.updateDocument).toHaveBeenCalledWith(
        'test-db',
        'users_preferences',
        'pref123',
        updates
      );
      expect(result).toBeDefined();
    });

    it('should throw error when preferences not found', async () => {
      vi.mocked(databases.listDocuments).mockResolvedValue({
        documents: [],
        total: 0,
      } as any);

      await expect(
        preferencesService.updateUserPreferences(mockUserId, {
          theme: 'light',
        })
      ).rejects.toThrow('Preferences document not found');
    });
  });

  describe('loadOrCreatePreferences', () => {
    it('should load existing preferences', async () => {
      const mockDoc = {
        $id: 'pref123',
        userId: mockUserId,
        ...mockPreferences,
      };

      vi.mocked(databases.listDocuments).mockResolvedValue({
        documents: [mockDoc],
        total: 1,
      } as any);

      const result = await preferencesService.loadOrCreatePreferences(
        mockUserId,
        mockPreferences
      );

      expect(result).toEqual(mockPreferences);
      expect(databases.createDocument).not.toHaveBeenCalled();
    });

    it('should create preferences when they do not exist', async () => {
      vi.mocked(databases.listDocuments).mockResolvedValue({
        documents: [],
        total: 0,
      } as any);

      const mockDoc = {
        $id: 'pref123',
        userId: mockUserId,
        ...mockPreferences,
      };

      vi.mocked(databases.createDocument).mockResolvedValue(mockDoc as any);

      const result = await preferencesService.loadOrCreatePreferences(
        mockUserId,
        mockPreferences
      );

      expect(result).toEqual(mockPreferences);
      expect(databases.createDocument).toHaveBeenCalled();
    });
  });

  describe('syncPreferences', () => {
    it('should update existing preferences', async () => {
      const mockDoc = {
        $id: 'pref123',
        userId: mockUserId,
        ...mockPreferences,
      };

      vi.mocked(databases.listDocuments).mockResolvedValue({
        documents: [mockDoc],
        total: 1,
      } as any);

      vi.mocked(databases.updateDocument).mockResolvedValue(mockDoc as any);

      const result = await preferencesService.syncPreferences(
        mockUserId,
        mockPreferences
      );

      expect(databases.updateDocument).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should create preferences when they do not exist', async () => {
      vi.mocked(databases.listDocuments).mockResolvedValue({
        documents: [],
        total: 0,
      } as any);

      const mockDoc = {
        $id: 'pref123',
        userId: mockUserId,
        ...mockPreferences,
      };

      vi.mocked(databases.createDocument).mockResolvedValue(mockDoc as any);

      const result = await preferencesService.syncPreferences(
        mockUserId,
        mockPreferences
      );

      expect(databases.createDocument).toHaveBeenCalled();
      expect(result).toEqual(mockPreferences);
    });
  });
});
