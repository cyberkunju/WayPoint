import { databases, account } from '@/lib/appwrite';
import { DATABASE_ID, COLLECTIONS } from '@/lib/appwrite';
import { UserPreferences } from '@/lib/types';
import { ID, Query } from 'appwrite';

/**
 * Preferences Service
 * Handles user preferences operations with Appwrite
 */
class PreferencesService {
  /**
   * Get user preferences from Appwrite
   */
  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      console.log('[PreferencesService] Fetching preferences for user:', userId);
      
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USERS_PREFERENCES,
        [Query.equal('userId', userId), Query.limit(1)]
      );

      if (response.documents.length === 0) {
        console.log('[PreferencesService] No preferences found for user');
        return null;
      }

      const doc = response.documents[0];
      
      const preferences: UserPreferences = {
        theme: doc.theme as 'light' | 'dark' | 'auto',
        density: doc.density as 'comfortable' | 'compact' | 'spacious',
        primaryColor: doc.primaryColor,
        fontSize: doc.fontSize as 'small' | 'medium' | 'large',
        sidebarCollapsed: doc.sidebarCollapsed,
        defaultView: doc.defaultView,
        taskReminders: doc.taskReminders,
        dailySummary: doc.dailySummary,
        overdueAlerts: doc.overdueAlerts,
      };

      console.log('[PreferencesService] Preferences loaded successfully');
      return preferences;
    } catch (error) {
      console.error('[PreferencesService] Error fetching preferences:', error);
      throw error;
    }
  }

  /**
   * Create user preferences in Appwrite
   */
  async createUserPreferences(
    userId: string,
    preferences: UserPreferences
  ): Promise<UserPreferences> {
    try {
      console.log('[PreferencesService] Creating preferences for user:', userId);

      const doc = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.USERS_PREFERENCES,
        ID.unique(),
        {
          userId,
          theme: preferences.theme,
          density: preferences.density,
          primaryColor: preferences.primaryColor,
          fontSize: preferences.fontSize,
          sidebarCollapsed: preferences.sidebarCollapsed,
          defaultView: preferences.defaultView,
          taskReminders: preferences.taskReminders,
          dailySummary: preferences.dailySummary,
          overdueAlerts: preferences.overdueAlerts,
          quietHoursStart: null,
          quietHoursEnd: null,
        }
      );

      console.log('[PreferencesService] Preferences created successfully');
      return preferences;
    } catch (error) {
      console.error('[PreferencesService] Error creating preferences:', error);
      throw error;
    }
  }

  /**
   * Update user preferences in Appwrite
   */
  async updateUserPreferences(
    userId: string,
    updates: Partial<UserPreferences>
  ): Promise<UserPreferences> {
    try {
      console.log('[PreferencesService] Updating preferences for user:', userId);

      // First, find the document ID
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USERS_PREFERENCES,
        [Query.equal('userId', userId), Query.limit(1)]
      );

      if (response.documents.length === 0) {
        throw new Error('Preferences document not found');
      }

      const documentId = response.documents[0].$id;

      // Update the document
      const doc = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.USERS_PREFERENCES,
        documentId,
        updates
      );

      const preferences: UserPreferences = {
        theme: doc.theme as 'light' | 'dark' | 'auto',
        density: doc.density as 'comfortable' | 'compact' | 'spacious',
        primaryColor: doc.primaryColor,
        fontSize: doc.fontSize as 'small' | 'medium' | 'large',
        sidebarCollapsed: doc.sidebarCollapsed,
        defaultView: doc.defaultView,
        taskReminders: doc.taskReminders,
        dailySummary: doc.dailySummary,
        overdueAlerts: doc.overdueAlerts,
      };

      console.log('[PreferencesService] Preferences updated successfully');
      return preferences;
    } catch (error) {
      console.error('[PreferencesService] Error updating preferences:', error);
      throw error;
    }
  }

  /**
   * Load or create user preferences
   * This is called on login to ensure preferences exist
   */
  async loadOrCreatePreferences(
    userId: string,
    defaultPreferences: UserPreferences
  ): Promise<UserPreferences> {
    try {
      // Try to load existing preferences
      const existing = await this.getUserPreferences(userId);
      
      if (existing) {
        return existing;
      }

      // Create new preferences if they don't exist
      console.log('[PreferencesService] Creating default preferences for new user');
      return await this.createUserPreferences(userId, defaultPreferences);
    } catch (error) {
      console.error('[PreferencesService] Error loading/creating preferences:', error);
      throw error;
    }
  }

  /**
   * Sync local preferences to Appwrite
   * This is used to sync preferences from localStorage to the cloud
   */
  async syncPreferences(
    userId: string,
    localPreferences: UserPreferences
  ): Promise<UserPreferences> {
    try {
      console.log('[PreferencesService] Syncing local preferences to cloud');

      // Check if preferences exist
      const existing = await this.getUserPreferences(userId);

      if (existing) {
        // Update existing preferences
        return await this.updateUserPreferences(userId, localPreferences);
      } else {
        // Create new preferences
        return await this.createUserPreferences(userId, localPreferences);
      }
    } catch (error) {
      console.error('[PreferencesService] Error syncing preferences:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const preferencesService = new PreferencesService();
