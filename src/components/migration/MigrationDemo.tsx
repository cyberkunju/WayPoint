import { useState } from 'react';
import {
  detectLocalStorageData,
  getLocalStorageData,
  migrateToAppwrite,
  resetMigrationStatus,
  clearLocalStorageData,
  type MigrationResult,
} from '@/utils/migration';
import { useUserStore } from '@/hooks/use-store';

/**
 * Demo component for testing migration functionality
 * This is for development/testing purposes only
 */
export function MigrationDemo() {
  const [status, setStatus] = useState(detectLocalStorageData());
  const [result, setResult] = useState<MigrationResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [isMigrating, setIsMigrating] = useState(false);

  const user = useUserStore((state) => state.user);

  const handleRefreshStatus = () => {
    setStatus(detectLocalStorageData());
  };

  const handleCreateTestData = () => {
    const testData = {
      state: {
        tasks: [
          {
            id: 'test-1',
            title: 'Test Task 1',
            description: 'This is a test task',
            completed: false,
            priority: 4,
            labels: ['test'],
            dependencies: [],
            subtasks: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'test-2',
            title: 'Test Task 2',
            completed: true,
            priority: 1,
            labels: [],
            dependencies: [],
            subtasks: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        projects: [
          {
            id: 'proj-1',
            name: 'Test Project',
            description: 'A test project',
            color: '#2E5AAC',
            isExpanded: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        labels: [
          {
            id: 'label-1',
            name: 'Test Label',
            color: '#F2994A',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      },
    };

    localStorage.setItem('clarity-task-storage', JSON.stringify(testData));
    handleRefreshStatus();
    alert('Test data created in localStorage');
  };

  const handleMigrate = async () => {
    if (!user?.id) {
      alert('Please log in first');
      return;
    }

    setIsMigrating(true);
    setProgress(0);
    setProgressMessage('Starting migration...');

    try {
      const migrationResult = await migrateToAppwrite(
        user.id,
        (message, progressValue) => {
          setProgressMessage(message);
          setProgress(progressValue);
        }
      );

      setResult(migrationResult);
      handleRefreshStatus();
    } catch (error) {
      console.error('Migration error:', error);
      alert(`Migration failed: ${error}`);
    } finally {
      setIsMigrating(false);
    }
  };

  const handleReset = () => {
    resetMigrationStatus();
    handleRefreshStatus();
    setResult(null);
    alert('Migration status reset');
  };

  const handleClearData = () => {
    clearLocalStorageData();
    handleRefreshStatus();
    alert('localStorage data cleared');
  };

  const handleViewData = () => {
    const data = getLocalStorageData();
    console.log('localStorage data:', data);
    alert('Check console for localStorage data');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Migration Utility Demo
        </h1>
        <p className="text-gray-600 mb-4">
          Test the migration functionality in a controlled environment.
        </p>

        {!user && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-yellow-800">
              ⚠️ Please log in to test migration functionality
            </p>
          </div>
        )}
      </div>

      {/* Status Card */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Migration Status</h2>
          <button
            onClick={handleRefreshStatus}
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            Refresh
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Has Local Data:</span>
            <span
              className={`font-medium ${
                status.hasLocalData ? 'text-green-600' : 'text-gray-400'
              }`}
            >
              {status.hasLocalData ? 'Yes' : 'No'}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600">Tasks:</span>
            <span className="font-medium text-gray-900">{status.taskCount}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600">Projects:</span>
            <span className="font-medium text-gray-900">{status.projectCount}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600">Labels:</span>
            <span className="font-medium text-gray-900">{status.labelCount}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600">Migration Completed:</span>
            <span
              className={`font-medium ${
                status.migrationCompleted ? 'text-green-600' : 'text-gray-400'
              }`}
            >
              {status.migrationCompleted ? 'Yes' : 'No'}
            </span>
          </div>

          {status.migrationDate && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Migration Date:</span>
              <span className="font-medium text-gray-900">
                {new Date(status.migrationDate).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Actions Card */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions</h2>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleCreateTestData}
            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Test Data
          </button>

          <button
            onClick={handleViewData}
            className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
          >
            View Data (Console)
          </button>

          <button
            onClick={handleMigrate}
            disabled={!user || isMigrating || !status.hasLocalData}
            className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isMigrating ? 'Migrating...' : 'Migrate to Appwrite'}
          </button>

          <button
            onClick={handleReset}
            className="bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors"
          >
            Reset Migration Status
          </button>

          <button
            onClick={handleClearData}
            className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors col-span-2"
          >
            Clear localStorage Data
          </button>
        </div>
      </div>

      {/* Progress Card */}
      {isMigrating && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Migration Progress
          </h2>

          <div className="space-y-3">
            <p className="text-gray-600">{progressMessage}</p>

            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="text-sm text-gray-500 text-center">
              {Math.round(progress)}% complete
            </p>
          </div>
        </div>
      )}

      {/* Result Card */}
      {result && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Migration Result
          </h2>

          <div
            className={`p-4 rounded-lg mb-4 ${
              result.success
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            <p
              className={`font-medium ${
                result.success ? 'text-green-800' : 'text-red-800'
              }`}
            >
              {result.success ? '✓ Migration Successful' : '✗ Migration Failed'}
            </p>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Labels Created:</span>
              <span className="font-medium text-gray-900">
                {result.labelsCreated}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Projects Created:</span>
              <span className="font-medium text-gray-900">
                {result.projectsCreated}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Tasks Created:</span>
              <span className="font-medium text-gray-900">
                {result.tasksCreated}
              </span>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="font-medium text-red-800 mb-2">Errors:</p>
              <ul className="text-sm text-red-700 space-y-1">
                {result.errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Instructions Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">How to Test:</h3>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Click "Create Test Data" to populate localStorage</li>
          <li>Make sure you're logged in</li>
          <li>Click "Migrate to Appwrite" to start migration</li>
          <li>Watch the progress bar and status updates</li>
          <li>Check the result to see what was migrated</li>
          <li>Use "Reset Migration Status" to test again</li>
        </ol>
      </div>
    </div>
  );
}
