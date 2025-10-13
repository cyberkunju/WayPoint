import { useState, useEffect } from 'react';
import { getMigrationStatus, type MigrationStatus } from '@/utils/migration';
import { useUserStore } from './use-store';

/**
 * Hook to manage migration state and flow
 */
export function useMigration() {
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatus | null>(null);
  const [showMigrationPrompt, setShowMigrationPrompt] = useState(false);
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    // Only check for migration if user is logged in
    if (user?.id) {
      const status = getMigrationStatus();
      setMigrationStatus(status);

      // Show prompt if there's local data and migration not completed
      if (status.hasLocalData && !status.migrationCompleted) {
        setShowMigrationPrompt(true);
      }
    }
  }, [user?.id]);

  const handleMigrationComplete = () => {
    setShowMigrationPrompt(false);
    // Refresh migration status
    const status = getMigrationStatus();
    setMigrationStatus(status);
  };

  const handleMigrationSkip = () => {
    setShowMigrationPrompt(false);
  };

  return {
    migrationStatus,
    showMigrationPrompt,
    handleMigrationComplete,
    handleMigrationSkip,
  };
}
