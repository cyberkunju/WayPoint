# Zustand Store with Appwrite Integration

## Overview

The Zustand store has been updated to integrate with Appwrite for cloud synchronization while maintaining offline-first capabilities through IndexedDB caching.

## Architecture

### Three-Layer Data Strategy

1. **Appwrite (Cloud)**: Source of truth for authenticated users
2. **IndexedDB (Offline Cache)**: Local persistence for offline access
3. **Zustand (Memory)**: In-memory state for fast UI updates

### Data Flow

```
User Action
    ↓
Zustand Store (Optimistic Update)
    ↓
IndexedDB Cache (Immediate)
    ↓
Appwrite Sync (If Online) → Success
    ↓                          ↓
Sync Queue (If Offline)    Complete
```

## Key Features

### 1. Offline-First Architecture

- All operations work offline
- Changes are queued in IndexedDB
- Automatic sync when connection is restored
- Optimistic UI updates for instant feedback

### 2. Automatic Synchronization

- Real-time sync to Appwrite when online
- Queued operations processed on reconnect
- Conflict resolution using last-write-wins
- Background sync without blocking UI

### 3. Performance Optimizations

- Optimistic updates for instant UI response
- Parallel loading of tasks, projects, and labels
- IndexedDB caching for fast offline access
- Minimal localStorage usage (only userId and lastSyncTime)

## API Changes

### Task Store

All CRUD operations are now **async** and return Promises:

```typescript
// Before (synchronous)
const task = addTask({ title: 'New task' });
updateTask(taskId, { completed: true });
deleteTask(taskId);

// After (async)
const task = await addTask({ title: 'New task' });
await updateTask(taskId, { completed: true });
await deleteTask(taskId);
```

### New Methods

```typescript
// Set user ID and load data
setUserId(userId: string | null): void

// Load data from Appwrite
loadFromAppwrite(): Promise<void>

// Load data from IndexedDB cache
loadFromCache(): Promise<void>

// Process sync queue
syncQueue(): Promise<void>
```

### New State Properties

```typescript
interface TaskStore {
  // ... existing properties
  userId: string | null;           // Current user ID
  isLoading: boolean;               // Loading from Appwrite
  isSyncing: boolean;               // Syncing queue
  lastSyncTime: number | null;     // Last successful sync
}
```

## Usage Examples

### Initialize Store on Login

```typescript
import { useUserStore, useTaskStore } from '@/hooks/use-store';

// After successful login
const user = await authService.login(email, password);
useUserStore.getState().setUser(user);
// This automatically triggers useTaskStore.setUserId() and loads data
```

### Create Task

```typescript
import { useTaskStore } from '@/hooks/use-store';

const addTask = useTaskStore(state => state.addTask);

// Works offline and online
const newTask = await addTask({
  title: 'Complete project',
  priority: 1,
  dueDate: '2025-01-15',
  projectId: 'project-123',
});
```

### Update Task

```typescript
const updateTask = useTaskStore(state => state.updateTask);

// Optimistic update - UI updates immediately
await updateTask(taskId, {
  completed: true,
  priority: 2,
});
```

### Manual Sync

```typescript
const syncQueue = useTaskStore(state => state.syncQueue);

// Manually trigger sync (usually automatic)
await syncQueue();
```

### Check Sync Status

```typescript
const { isSyncing, lastSyncTime } = useTaskStore();

if (isSyncing) {
  console.log('Syncing...');
} else if (lastSyncTime) {
  console.log('Last synced:', new Date(lastSyncTime));
}
```

## IndexedDB Structure

### Object Stores

1. **tasks**: Cached task documents
2. **projects**: Cached project documents
3. **labels**: Cached label documents
4. **sync_queue**: Pending operations for offline sync

### Sync Queue Schema

```typescript
interface SyncOperation {
  id?: number;                    // Auto-increment ID
  type: 'create' | 'update' | 'delete';
  collection: string;             // Appwrite collection ID
  documentId?: string;            // Document ID (for update/delete)
  data?: any;                     // Document data (for create/update)
  timestamp: number;              // Operation timestamp
}
```

## Event Listeners

### Network Status

The store automatically listens for online/offline events:

```typescript
window.addEventListener('online', () => {
  // Automatically triggers sync
});

window.addEventListener('offline', () => {
  // Switches to offline mode
});
```

### Custom Events

```typescript
// Trigger manual sync
window.dispatchEvent(new CustomEvent('sync-queue'));
```

## Error Handling

### Appwrite Failures

When Appwrite operations fail:
1. Operation is added to sync queue
2. UI shows optimistic update
3. Sync retries when connection is restored

### Sync Queue Failures

Individual operations that fail during sync:
- Logged to console
- Skipped (doesn't block other operations)
- Can be retried manually

## Migration from localStorage

The store now uses a hybrid approach:

### What's Stored Where

**localStorage** (minimal):
- `userId`: Current user ID
- `lastSyncTime`: Last successful sync timestamp

**IndexedDB** (full cache):
- All tasks, projects, labels
- Sync queue for offline operations

**Appwrite** (source of truth):
- All user data with proper permissions
- Real-time sync across devices

### Migration Path

1. Existing localStorage data remains for backward compatibility
2. On first login, data is loaded from Appwrite
3. IndexedDB cache is populated
4. localStorage is only used for minimal state

## Performance Metrics

### Target Performance

- Task creation: <100ms (optimistic)
- Appwrite sync: <500ms (background)
- Cache load: <50ms
- Full data load: <2s (first time)

### Monitoring

All operations are logged with performance metrics:

```typescript
[Store 123.45ms] Task added in 45.67ms New task
[Store 234.56ms] Loaded from Appwrite in 1234.56ms { tasks: 150, projects: 10, labels: 5 }
```

## Best Practices

### 1. Always Await Operations

```typescript
// ✅ Good
await addTask({ title: 'New task' });

// ❌ Bad - may cause race conditions
addTask({ title: 'New task' });
```

### 2. Handle Errors

```typescript
try {
  await updateTask(taskId, updates);
} catch (error) {
  console.error('Failed to update task:', error);
  // Show user-friendly error message
}
```

### 3. Check Loading State

```typescript
const { isLoading, tasks } = useTaskStore();

if (isLoading) {
  return <LoadingSpinner />;
}

return <TaskList tasks={tasks} />;
```

### 4. Monitor Sync Status

```typescript
const { isSyncing, lastSyncTime } = useTaskStore();

return (
  <div>
    {isSyncing && <SyncIndicator />}
    {lastSyncTime && <LastSynced time={lastSyncTime} />}
  </div>
);
```

## Troubleshooting

### Data Not Syncing

1. Check network connection
2. Verify user is logged in (`userId` is set)
3. Check browser console for errors
4. Manually trigger sync: `useTaskStore.getState().syncQueue()`

### Stale Data

1. Force reload from Appwrite: `useTaskStore.getState().loadFromAppwrite()`
2. Clear IndexedDB cache and reload
3. Check `lastSyncTime` to see when last sync occurred

### Performance Issues

1. Check number of queued operations
2. Monitor IndexedDB size
3. Clear old cached data if needed
4. Optimize query filters

## Future Enhancements

- [ ] Real-time subscriptions with Appwrite Realtime
- [ ] Conflict resolution UI for manual resolution
- [ ] Batch sync optimization
- [ ] Progressive sync (sync most recent first)
- [ ] Sync status notifications
- [ ] Offline indicator in UI
- [ ] Sync queue management UI

## Related Files

- `src/hooks/use-store.ts` - Main store implementation
- `src/services/database.service.ts` - Appwrite database operations
- `src/lib/appwrite.ts` - Appwrite configuration and constants
- `src/lib/types.ts` - TypeScript type definitions
