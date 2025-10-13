import { useUserStore } from './use-store';
import { UserPreferences } from '@/lib/types';
import { useCallback } from 'react';

/**
 * Hook for managing user preferences
 * Provides easy access to preferences and update functions
 * Automatically syncs with Appwrite when user is logged in
 */
export function usePreferences() {
  const preferences = useUserStore((state) => state.preferences);
  const updatePreferences = useUserStore((state) => state.updatePreferences);
  const user = useUserStore((state) => state.user);

  /**
   * Update a single preference
   */
  const updatePreference = useCallback(
    <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
      updatePreferences({ [key]: value });
    },
    [updatePreferences]
  );

  /**
   * Update multiple preferences at once
   */
  const updateMultiplePreferences = useCallback(
    (updates: Partial<UserPreferences>) => {
      updatePreferences(updates);
    },
    [updatePreferences]
  );

  /**
   * Reset preferences to defaults
   */
  const resetPreferences = useCallback(() => {
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
    updatePreferences(defaultPreferences);
  }, [updatePreferences]);

  return {
    preferences,
    updatePreference,
    updatePreferences: updateMultiplePreferences,
    resetPreferences,
    isLoggedIn: !!user,
  };
}
