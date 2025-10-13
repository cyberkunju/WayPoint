import { useState, useEffect } from 'react';
import {
  detectLocalStorageData,
  migrateToAppwrite,
  markMigrationComplete,
  clearLocalStorageData,
  type MigrationStatus,
  type MigrationResult,
} from '@/utils/migration';
import { useUserStore } from '@/hooks/use-store';

interface MigrationPromptProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function MigrationPrompt({ onComplete, onSkip }: MigrationPromptProps) {
  const [status, setStatus] = useState<MigrationStatus | null>(null);
  const [isMigrating, setIsMigrating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [result, setResult] = useState<MigrationResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  const user = useUserStore((state) => state.user);

  useEffect(() => {
    // Detect localStorage data on mount
    const migrationStatus = detectLocalStorageData();
    setStatus(migrationStatus);

    // If migration already completed, skip prompt
    if (migrationStatus.migrationCompleted) {
      onComplete();
    }
  }, [onComplete]);

  const handleMigrate = async () => {
    if (!user?.id) {
      console.error('No user ID available for migration');
      return;
    }

    setIsMigrating(true);
    setProgress(0);
    setProgressMessage('Preparing migration...');

    try {
      const migrationResult = await migrateToAppwrite(
        user.id,
        (message, progressValue) => {
          setProgressMessage(message);
          setProgress(progressValue);
        }
      );

      setResult(migrationResult);
      setShowResult(true);

      if (migrationResult.success && status) {
        // Mark migration as complete
        markMigrationComplete(status);

        // Clear localStorage data
        clearLocalStorageData();
      }
    } catch (error) {
      console.error('Migration failed:', error);
      setResult({
        success: false,
        tasksCreated: 0,
        projectsCreated: 0,
        labelsCreated: 0,
        errors: [`Migration failed: ${error}`],
      });
      setShowResult(true);
    } finally {
      setIsMigrating(false);
    }
  };

  const handleFreshStart = () => {
    if (status) {
      markMigrationComplete(status);
      clearLocalStorageData();
    }
    onSkip();
  };

  const handleResultClose = () => {
    if (result?.success) {
      onComplete();
    } else {
      setShowResult(false);
    }
  };

  // Don't show prompt if no local data or migration already completed
  if (!status || !status.hasLocalData || status.migrationCompleted) {
    return null;
  }

  // Show result screen
  if (showResult && result) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="text-center mb-6">
            {result.success ? (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Migration Successful!
                </h2>
                <p className="text-gray-600">
                  Your data has been successfully migrated to the cloud.
                </p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Migration Failed
                </h2>
                <p className="text-gray-600">
                  There were errors during the migration process.
                </p>
              </>
            )}
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Labels migrated:</span>
                <span className="font-medium text-gray-900">{result.labelsCreated}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Projects migrated:</span>
                <span className="font-medium text-gray-900">{result.projectsCreated}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tasks migrated:</span>
                <span className="font-medium text-gray-900">{result.tasksCreated}</span>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm font-medium text-red-600 mb-2">Errors:</p>
                <ul className="text-sm text-red-600 space-y-1">
                  {result.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <button
            onClick={handleResultClose}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {result.success ? 'Continue' : 'Close'}
          </button>
        </div>
      </div>
    );
  }

  // Show migration progress
  if (isMigrating) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Migrating Your Data
            </h2>
            <p className="text-gray-600 mb-4">{progressMessage}</p>

            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-500">{Math.round(progress)}% complete</p>
          </div>

          <p className="text-sm text-gray-500 text-center">
            Please don't close this window...
          </p>
        </div>
      </div>
    );
  }

  // Show migration prompt
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Welcome to ClarityFlow Cloud
          </h2>
          <p className="text-gray-600">
            We detected existing data on your device. Would you like to migrate it to the
            cloud?
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            Data found on this device:
          </h3>
          <ul className="space-y-1 text-sm text-gray-600">
            <li>• {status.taskCount} tasks</li>
            <li>• {status.projectCount} projects</li>
            <li>• {status.labelCount} labels</li>
          </ul>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleMigrate}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Migrate to Cloud
          </button>
          <button
            onClick={handleFreshStart}
            className="w-full bg-white text-gray-700 py-2 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Start Fresh
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          Starting fresh will keep your local data but won't sync it to the cloud.
        </p>
      </div>
    </div>
  );
}
