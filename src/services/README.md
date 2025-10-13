# Appwrite Services

This directory contains service wrappers for Appwrite backend services. These wrappers provide a clean, type-safe interface for interacting with Appwrite's Authentication, Database, Storage, and Functions services.

## Services Overview

### 1. Authentication Service (`auth.service.ts`)

Handles user authentication and account management.

**Features:**
- User registration with email/password
- Login and session management
- Password recovery and reset
- Email verification
- User profile updates
- User preferences management

**Usage Example:**
```typescript
import { authService } from '@/services';

// Register a new user
const user = await authService.register('user@example.com', 'password123', 'John Doe');

// Login
const session = await authService.login('user@example.com', 'password123');

// Get current user
const currentUser = await authService.getCurrentUser();

// Logout
await authService.logout();
```

### 2. Database Service (`database.service.ts`)

Provides CRUD operations for Appwrite database collections.

**Features:**
- Create, read, update, delete documents
- Query documents with filters
- Batch operations
- Document counting
- Type-safe operations with generics

**Usage Example:**
```typescript
import { databaseService, Query } from '@/services';
import { COLLECTIONS } from '@/lib/appwrite';

// Create a document
const task = await databaseService.createDocument(
  COLLECTIONS.TASKS,
  {
    title: 'Complete project',
    completed: false,
    priority: 1,
    userId: 'user123'
  }
);

// Query documents
const tasks = await databaseService.queryDocuments(
  COLLECTIONS.TASKS,
  [
    Query.equal('userId', 'user123'),
    Query.equal('completed', false),
    Query.orderDesc('priority')
  ]
);

// Update a document
await databaseService.updateDocument(
  COLLECTIONS.TASKS,
  task.$id,
  { completed: true }
);

// Delete a document
await databaseService.deleteDocument(COLLECTIONS.TASKS, task.$id);
```

### 3. Storage Service (`storage.service.ts`)

Manages file uploads, downloads, and storage operations.

**Features:**
- File upload with progress tracking
- File download and preview
- Batch file operations
- File metadata management
- File validation utilities
- Human-readable file size formatting

**Usage Example:**
```typescript
import { storageService } from '@/services';
import { BUCKETS } from '@/lib/appwrite';

// Upload a file
const file = document.querySelector('input[type="file"]').files[0];
const uploadedFile = await storageService.uploadFile(
  BUCKETS.ATTACHMENTS,
  file,
  undefined,
  undefined,
  (progress) => {
    console.log(`Upload progress: ${progress.progress}%`);
  }
);

// Get file download URL
const downloadUrl = storageService.getFileDownload(
  BUCKETS.ATTACHMENTS,
  uploadedFile.$id
);

// Get file preview (for images)
const previewUrl = storageService.getFilePreview(
  BUCKETS.ATTACHMENTS,
  uploadedFile.$id,
  400, // width
  300  // height
);

// Delete a file
await storageService.deleteFile(BUCKETS.ATTACHMENTS, uploadedFile.$id);
```

### 4. Functions Service (`functions.service.ts`)

Executes serverless functions on Appwrite.

**Features:**
- Synchronous and asynchronous function execution
- Execution polling
- Retry logic
- Execution history

**Usage Example:**
```typescript
import { functionsService } from '@/services';
import { FUNCTIONS_IDS } from '@/lib/appwrite';

// Execute function synchronously
const result = await functionsService.executeFunctionSync(
  FUNCTIONS_IDS.AI_ASSISTANT,
  JSON.stringify({ query: 'What tasks are due today?' })
);

// Execute function asynchronously
const execution = await functionsService.executeFunctionAsync(
  FUNCTIONS_IDS.ANALYTICS_GENERATOR,
  JSON.stringify({ userId: 'user123' })
);

// Execute with retry logic
const data = await functionsService.executeFunctionWithRetry(
  FUNCTIONS_IDS.SYNC_RESOLVER,
  JSON.stringify({ conflicts: [...] }),
  3 // max retries
);
```

## Configuration

All services use the Appwrite client configured in `src/lib/appwrite.ts`. Make sure to set up your environment variables:

```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_DATABASE_ID=clarityflow_production
```

## Error Handling

All services include error handling and logging. Errors are logged to the console and re-thrown for handling at the application level.

```typescript
try {
  const user = await authService.login(email, password);
} catch (error) {
  // Handle authentication error
  console.error('Login failed:', error);
}
```

## Type Safety

All services use TypeScript generics for type-safe operations:

```typescript
interface Task {
  title: string;
  completed: boolean;
  priority: number;
  userId: string;
}

const task = await databaseService.createDocument<Task>(
  COLLECTIONS.TASKS,
  {
    title: 'My task',
    completed: false,
    priority: 1,
    userId: 'user123'
  }
);

// task is typed as Models.Document & Task
console.log(task.title); // TypeScript knows this exists
```

## Best Practices

1. **Use singleton instances**: Import services from `@/services` to use the singleton instances
2. **Handle errors**: Always wrap service calls in try-catch blocks
3. **Type your data**: Use TypeScript interfaces with generics for type safety
4. **Use constants**: Import collection IDs, bucket IDs, and function IDs from `@/lib/appwrite`
5. **Batch operations**: Use batch methods for multiple operations to improve performance

## Testing

Services can be easily mocked for testing:

```typescript
import { vi } from 'vitest';
import { authService } from '@/services';

vi.mock('@/services', () => ({
  authService: {
    login: vi.fn().mockResolvedValue({ $id: 'session123' }),
    getCurrentUser: vi.fn().mockResolvedValue({ $id: 'user123', name: 'Test User' })
  }
}));
```

## Additional Resources

- [Appwrite Documentation](https://appwrite.io/docs)
- [Appwrite Web SDK](https://appwrite.io/docs/sdks#client)
- [Appwrite API Reference](https://appwrite.io/docs/references)
