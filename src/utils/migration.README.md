# Migration Utility

This utility handles the migration of localStorage data to Appwrite backend when users first log in to the cloud-enabled version of ClarityFlow.

## Overview

The migration utility provides a seamless way to:
1. Detect existing localStorage data
2. Prompt users to migrate or start fresh
3. Transform localStorage data to Appwrite format
4. Batch upload data to Appwrite
5. Verify migration success
6. Mark migration as complete

## Files

- `src/utils/migration.ts` - Core migration logic
- `src/components/migration/MigrationPrompt.tsx` - UI component for migration prompt
- `src/hooks/use-migration.ts` - React hook for managing migration state

## Usage

### In Your App Component

```typescript
import { MigrationPrompt } from '@/components/migration/MigrationPrompt';
import { useMigration } from '@/hooks/use-migration';

function App() {
  const {
    showMigrationPrompt,
    handleMigrationComplete,
    handleMigrationSkip,
  } = useMigration();

  return (
    <>
      {showMigrationPrompt && (
        <MigrationPrompt
          onComplete={handleMigrationComplete}
          onSkip={handleMigrationSkip}
        />
      )}
      {/* Rest of your app */}
    </>
  );
}
```

## Migration Flow

### 1. Detection Phase

When a user logs in, the system checks for existing localStorage data:

```typescript
import { detectLocalStorageData } from '@/utils/migration';

const status = detectLocalStorageData();
// Returns: { hasLocalData, taskCount, projectCount, labelCount, migrationCompleted }
```

### 2. User Prompt

If local data is found and migration hasn't been completed, show the migration prompt:

- **Migrate to Cloud**: Uploads all data to Appwrite
- **Start Fresh**: Keeps local data but doesn't sync to cloud

### 3. Migration Process

The migration happens in stages:

1. **Labels** (no dependencies)
2. **Projects** (no dependencies)
3. **Tasks** (depends on projects and labels)

Progress is reported via callback:

```typescript
await migrateToAppwrite(userId, (message, progress) => {
  console.log(`${message} - ${progress}%`);
});
```

### 4. Verification

After migration, the system verifies:
- All items were created successfully
- Counts match between localStorage and Appwrite
- No data was lost

### 5. Completion

On successful migration:
- Migration status is marked as complete
- localStorage task data is cleared (optional)
- User can continue using the app with cloud sync

## Data Transformation

### Task Transformation

localStorage format → Appwrite format:

```typescript
{
  // Existing fields
  id, title, description, completed, priority,
  dueDate, startDate, projectId, parentId,
  labels, dependencies, estimatedTime, actualTime,
  
  // Added fields
  userId: string,           // Current user ID
  completedAt: string?,     // Set if completed
  epicId: null,            // Not in localStorage
  assignee: string?,       // From localStorage
  position: 0,             // Default position
  customFields: null       // Not in localStorage
}
```

### Project Transformation

```typescript
{
  // Existing fields
  id, name, description, color, parentId, isExpanded,
  
  // Added fields
  userId: string,          // Current user ID
  status: 'active',        // Default status
  startDate: null,         // Not in localStorage
  endDate: null,           // Not in localStorage
  labels: [],              // Not in localStorage
  position: 0              // Default position
}
```

### Label Transformation

```typescript
{
  // Existing fields
  id, name, color,
  
  // Added fields
  userId: string           // Current user ID
}
```

## Permissions

All migrated documents are created with user-only permissions:

```typescript
[
  Permission.read(Role.user(userId)),
  Permission.update(Role.user(userId)),
  Permission.delete(Role.user(userId))
]
```

This ensures data isolation between users.

## Batch Operations

Tasks are migrated in batches of 50 to avoid overwhelming the API:

```typescript
const BATCH_SIZE = 50;
for (let i = 0; i < tasks.length; i += BATCH_SIZE) {
  const batch = tasks.slice(i, i + BATCH_SIZE);
  await databaseService.batchCreateDocuments(COLLECTIONS.TASKS, batch);
}
```

## Error Handling

The migration utility handles errors gracefully:

- Individual item failures don't stop the entire migration
- All errors are collected and reported
- Verification step catches count mismatches
- Users can retry migration if it fails

## Testing Migration

### Reset Migration Status

```typescript
import { resetMigrationStatus } from '@/utils/migration';

// Clear migration status to test again
resetMigrationStatus();
```

### Check Migration Status

```typescript
import { getMigrationStatus } from '@/utils/migration';

const status = getMigrationStatus();
console.log('Migration completed:', status.migrationCompleted);
console.log('Migration date:', status.migrationDate);
```

## Requirements Satisfied

This implementation satisfies the following requirements from the spec:

- **10.1**: Detect existing localStorage data ✓
- **10.2**: Prompt user for migration or fresh start ✓
- **10.3**: Transform localStorage data to Appwrite format ✓
- **10.4**: Batch upload data to Appwrite ✓
- **10.5**: Verify migration success ✓
- **10.6**: Mark migration as complete ✓

## Performance Considerations

- **Batch Processing**: Tasks are uploaded in batches of 50
- **Progress Reporting**: Real-time progress updates for user feedback
- **Non-blocking**: Migration runs asynchronously
- **Error Recovery**: Partial failures don't block completion

## Security

- User-only permissions ensure data isolation
- No data is exposed to other users
- Migration status is stored locally
- Original localStorage data is preserved until migration succeeds

## Future Enhancements

Potential improvements for future versions:

1. **Incremental Migration**: Migrate only new/changed items
2. **Conflict Resolution**: Handle conflicts if data exists in both places
3. **Rollback**: Ability to rollback failed migrations
4. **Selective Migration**: Let users choose what to migrate
5. **Background Migration**: Migrate in background without blocking UI
