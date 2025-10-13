# Migration Integration Guide

This guide shows how to integrate the migration utility into your ClarityFlow application.

## Quick Start

### 1. Add Migration Prompt to App

Update your main `App.tsx` to include the migration prompt:

```typescript
import { MigrationPrompt } from '@/components/migration/MigrationPrompt';
import { useMigration } from '@/hooks/use-migration';
import { AuthGuard } from '@/components/auth/AuthGuard';

function App() {
  const {
    showMigrationPrompt,
    handleMigrationComplete,
    handleMigrationSkip,
  } = useMigration();

  return (
    <AuthGuard>
      {/* Show migration prompt after login if needed */}
      {showMigrationPrompt && (
        <MigrationPrompt
          onComplete={handleMigrationComplete}
          onSkip={handleMigrationSkip}
        />
      )}

      {/* Your main app content */}
      <div className="app">
        {/* ... */}
      </div>
    </AuthGuard>
  );
}

export default App;
```

### 2. Migration Flow

The migration flow is automatic:

1. **User logs in** → `useMigration` hook detects localStorage data
2. **Prompt appears** → User chooses "Migrate to Cloud" or "Start Fresh"
3. **Migration runs** → Progress is shown with real-time updates
4. **Verification** → System verifies all data was migrated correctly
5. **Completion** → User continues to app with cloud sync enabled

## Advanced Usage

### Manual Migration Trigger

If you want to trigger migration manually (e.g., from settings):

```typescript
import { migrateToAppwrite, getMigrationStatus } from '@/utils/migration';
import { useUserStore } from '@/hooks/use-store';

function SettingsPage() {
  const user = useUserStore((state) => state.user);
  const [isMigrating, setIsMigrating] = useState(false);

  const handleManualMigration = async () => {
    if (!user?.id) return;

    setIsMigrating(true);
    try {
      const result = await migrateToAppwrite(
        user.id,
        (message, progress) => {
          console.log(`${message} - ${progress}%`);
        }
      );

      if (result.success) {
        alert('Migration successful!');
      } else {
        alert('Migration failed: ' + result.errors.join(', '));
      }
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div>
      <button onClick={handleManualMigration} disabled={isMigrating}>
        {isMigrating ? 'Migrating...' : 'Migrate Data'}
      </button>
    </div>
  );
}
```

### Check Migration Status

Display migration status in your UI:

```typescript
import { getMigrationStatus } from '@/utils/migration';

function StatusDisplay() {
  const status = getMigrationStatus();

  if (!status.hasLocalData) {
    return <div>No local data found</div>;
  }

  if (status.migrationCompleted) {
    return (
      <div>
        ✓ Migration completed on {new Date(status.migrationDate!).toLocaleDateString()}
      </div>
    );
  }

  return (
    <div>
      Local data found: {status.taskCount} tasks, {status.projectCount} projects
    </div>
  );
}
```

### Reset Migration (Development Only)

For testing purposes, you can reset the migration status:

```typescript
import { resetMigrationStatus } from '@/utils/migration';

// In development console or test setup
resetMigrationStatus();
// Now the migration prompt will appear again
```

## Customizing the UI

### Custom Migration Prompt

You can create your own migration prompt component:

```typescript
import { useState } from 'react';
import { migrateToAppwrite, getLocalStorageData } from '@/utils/migration';

function CustomMigrationPrompt({ userId, onComplete }) {
  const [progress, setProgress] = useState(0);
  const localData = getLocalStorageData();

  const handleMigrate = async () => {
    const result = await migrateToAppwrite(
      userId,
      (message, progressValue) => {
        setProgress(progressValue);
      }
    );

    if (result.success) {
      onComplete();
    }
  };

  return (
    <div className="custom-prompt">
      <h2>Migrate {localData?.tasks.length} tasks?</h2>
      <button onClick={handleMigrate}>Yes, migrate</button>
      <div className="progress-bar" style={{ width: `${progress}%` }} />
    </div>
  );
}
```

### Custom Progress Display

```typescript
function MigrationProgress({ progress, message }) {
  return (
    <div className="migration-progress">
      <div className="progress-circle">
        <svg viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#e0e0e0"
            strokeWidth="10"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#2E5AAC"
            strokeWidth="10"
            strokeDasharray={`${progress * 2.83} 283`}
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div className="progress-text">{Math.round(progress)}%</div>
      </div>
      <p>{message}</p>
    </div>
  );
}
```

## Error Handling

### Handle Migration Errors

```typescript
const result = await migrateToAppwrite(userId, onProgress);

if (!result.success) {
  // Show errors to user
  console.error('Migration errors:', result.errors);

  // Optionally retry
  if (confirm('Migration failed. Retry?')) {
    await migrateToAppwrite(userId, onProgress);
  }
}
```

### Partial Migration Success

Even if some items fail, the migration continues:

```typescript
const result = await migrateToAppwrite(userId, onProgress);

console.log(`Migrated: ${result.tasksCreated} tasks`);
console.log(`Migrated: ${result.projectsCreated} projects`);
console.log(`Migrated: ${result.labelsCreated} labels`);

if (result.errors.length > 0) {
  console.warn('Some items failed:', result.errors);
}
```

## Testing

### Test Migration in Development

1. Create some test data in localStorage:

```typescript
// In browser console
const testData = {
  state: {
    tasks: [
      {
        id: '1',
        title: 'Test Task',
        completed: false,
        priority: 4,
        labels: [],
        dependencies: [],
        subtasks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    projects: [],
    labels: [],
  },
};

localStorage.setItem('clarity-task-storage', JSON.stringify(testData));
```

2. Reset migration status:

```typescript
import { resetMigrationStatus } from '@/utils/migration';
resetMigrationStatus();
```

3. Reload the app and the migration prompt should appear

### Test Migration Flow

```typescript
import { describe, it, expect } from 'vitest';
import { migrateToAppwrite } from '@/utils/migration';

describe('Migration Flow', () => {
  it('should migrate data successfully', async () => {
    // Setup test data
    const testData = {
      state: {
        tasks: [{ id: '1', title: 'Test' }],
        projects: [],
        labels: [],
      },
    };

    localStorage.setItem('clarity-task-storage', JSON.stringify(testData));

    // Run migration
    const result = await migrateToAppwrite('test-user-id');

    // Verify
    expect(result.success).toBe(true);
    expect(result.tasksCreated).toBe(1);
  });
});
```

## Best Practices

### 1. Show Migration Early

Show the migration prompt immediately after login, before the main app loads:

```typescript
function App() {
  const { user } = useUserStore();
  const { showMigrationPrompt } = useMigration();

  if (user && showMigrationPrompt) {
    return <MigrationPrompt />;
  }

  return <MainApp />;
}
```

### 2. Provide Clear Feedback

Always show progress and status to the user:

```typescript
await migrateToAppwrite(userId, (message, progress) => {
  // Update UI with progress
  setProgressMessage(message);
  setProgressValue(progress);
});
```

### 3. Handle Edge Cases

- No internet connection during migration
- User closes browser during migration
- Partial migration success
- Migration already completed

```typescript
try {
  const result = await migrateToAppwrite(userId, onProgress);

  if (!result.success) {
    // Handle failure
    if (result.errors.some((e) => e.includes('network'))) {
      alert('Please check your internet connection');
    }
  }
} catch (error) {
  // Handle unexpected errors
  console.error('Unexpected migration error:', error);
}
```

### 4. Don't Block the App

Allow users to skip migration and use the app:

```typescript
<MigrationPrompt
  onComplete={handleComplete}
  onSkip={() => {
    // User can still use the app
    // Migration can be triggered later from settings
    setShowPrompt(false);
  }}
/>
```

## Troubleshooting

### Migration Prompt Not Showing

Check:
1. User is logged in (`user?.id` exists)
2. localStorage has data (`detectLocalStorageData().hasLocalData`)
3. Migration not already completed (`!status.migrationCompleted`)

### Migration Fails

Common causes:
1. No internet connection
2. Invalid Appwrite credentials
3. Insufficient permissions
4. API rate limiting

### Data Not Appearing After Migration

1. Check migration result: `result.success`
2. Verify counts: `result.tasksCreated`, etc.
3. Check Appwrite console for created documents
4. Verify user permissions on collections

## Support

For issues or questions:
1. Check the migration logs in browser console
2. Verify Appwrite setup and permissions
3. Test with a small dataset first
4. Review the migration result object for errors
