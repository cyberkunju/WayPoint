# Task Service

The Task Service provides a comprehensive API for managing tasks in ClarityFlow using Appwrite as the backend.

## Features

- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ Advanced filtering and querying
- ✅ Batch operations for performance
- ✅ Helper methods for common use cases
- ✅ Automatic timestamp management
- ✅ Label and dependency management
- ✅ Type-safe with TypeScript

## Installation

The service is automatically available as a singleton:

```typescript
import { taskService } from '@/services/task.service';
```

## Basic Usage

### Create a Task

```typescript
import { taskService } from '@/services/task.service';

const task = await taskService.createTask(
  {
    title: 'Complete project documentation',
    description: 'Write comprehensive docs for the API',
    priority: 1,
    dueDate: '2024-12-31T23:59:59.999Z',
    projectId: 'project123',
    labels: ['documentation', 'high-priority'],
    dependencies: [],
    position: 0,
    completed: false,
  },
  userId // Current user ID
);
```

### Get a Task

```typescript
const task = await taskService.getTask('task123', userId);
```

### Update a Task

```typescript
const updatedTask = await taskService.updateTask('task123', {
  title: 'Updated title',
  priority: 2,
  completed: true,
});
```

### Delete a Task

```typescript
await taskService.deleteTask('task123');
```

## Advanced Filtering

### List Tasks with Filters

```typescript
const tasks = await taskService.listTasks({
  userId: 'user123',
  projectId: 'project123',
  completed: false,
  priority: [1, 2], // High and medium priority
  labels: ['urgent'],
  dueDateStart: '2024-01-01T00:00:00.000Z',
  dueDateEnd: '2024-12-31T23:59:59.999Z',
  search: 'documentation',
  orderBy: 'dueDate',
  orderDirection: 'asc',
  limit: 50,
  offset: 0,
});
```

### Available Filter Options

- `userId`: Filter by user (required for security)
- `projectId`: Filter by project
- `epicId`: Filter by epic
- `parentId`: Filter by parent task (for subtasks)
- `completed`: Filter by completion status
- `priority`: Filter by priority (single value or array)
- `labels`: Filter by labels (array)
- `assignee`: Filter by assignee
- `dueDateStart`: Filter tasks due after this date
- `dueDateEnd`: Filter tasks due before this date
- `search`: Full-text search in title
- `orderBy`: Sort field (dueDate, priority, createdAt, updatedAt, title, position)
- `orderDirection`: Sort direction ('asc' or 'desc')
- `limit`: Maximum number of results
- `offset`: Pagination offset

## Batch Operations

### Batch Create

```typescript
const tasks = await taskService.batchCreateTasks(
  [
    { title: 'Task 1', completed: false, priority: 1, labels: [], dependencies: [], position: 0 },
    { title: 'Task 2', completed: false, priority: 2, labels: [], dependencies: [], position: 1 },
    { title: 'Task 3', completed: false, priority: 3, labels: [], dependencies: [], position: 2 },
  ],
  userId
);
```

### Batch Update

```typescript
const updatedTasks = await taskService.batchUpdateTasks([
  { id: 'task1', data: { priority: 1 } },
  { id: 'task2', data: { completed: true } },
  { id: 'task3', data: { title: 'Updated title' } },
]);
```

### Batch Delete

```typescript
await taskService.batchDeleteTasks(['task1', 'task2', 'task3']);
```

## Helper Methods

### Get Tasks by Project

```typescript
const projectTasks = await taskService.getTasksByProject('project123', userId);
```

### Get Subtasks

```typescript
const subtasks = await taskService.getSubtasks('parentTask123', userId);
```

### Get Tasks by Epic

```typescript
const epicTasks = await taskService.getTasksByEpic('epic123', userId);
```

### Get Completed Tasks

```typescript
const completedTasks = await taskService.getCompletedTasks(userId, 10); // Limit to 10
```

### Get Incomplete Tasks

```typescript
const incompleteTasks = await taskService.getIncompleteTasks(userId);
```

### Get Tasks Due Today

```typescript
const todayTasks = await taskService.getTasksDueToday(userId);
```

### Get Overdue Tasks

```typescript
const overdueTasks = await taskService.getOverdueTasks(userId);
```

### Get Tasks by Priority

```typescript
const highPriorityTasks = await taskService.getTasksByPriority(1, userId);
const urgentTasks = await taskService.getTasksByPriority([1, 2], userId);
```

### Search Tasks

```typescript
const searchResults = await taskService.searchTasks('documentation', userId);
```

### Count Tasks

```typescript
const count = await taskService.countTasks({
  userId: 'user123',
  completed: false,
  projectId: 'project123',
});
```

## Task Operations

### Toggle Completion

```typescript
const task = await taskService.toggleTaskCompletion('task123');
// Automatically sets/clears completedAt timestamp
```

### Update Position (for drag-and-drop)

```typescript
const task = await taskService.updateTaskPosition('task123', 5);
```

### Move to Project

```typescript
const task = await taskService.moveTaskToProject('task123', 'newProject123');
// Pass undefined to remove from project
```

## Label Management

### Add Label

```typescript
const task = await taskService.addLabelToTask('task123', 'urgent');
// Prevents duplicates automatically
```

### Remove Label

```typescript
const task = await taskService.removeLabelFromTask('task123', 'urgent');
```

## Dependency Management

### Add Dependency

```typescript
const task = await taskService.addDependency('task123', 'dependencyTask123');
// Prevents duplicates automatically
```

### Remove Dependency

```typescript
const task = await taskService.removeDependency('task123', 'dependencyTask123');
```

## Type Definitions

### TaskDocument

```typescript
interface TaskDocument {
  userId: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 1 | 2 | 3 | 4;
  dueDate?: string;
  startDate?: string;
  completedAt?: string;
  projectId?: string;
  epicId?: string;
  parentId?: string;
  assignee?: string;
  labels: string[];
  dependencies: string[];
  estimatedTime?: number;
  actualTime?: number;
  position: number;
  customFields?: string; // JSON string
}
```

### Task (with Appwrite metadata)

```typescript
type Task = Models.Document & TaskDocument;
```

### CreateTaskData

```typescript
type CreateTaskData = Omit<TaskDocument, 'userId'> & {
  userId?: string; // Optional, will be set by service
};
```

### UpdateTaskData

```typescript
type UpdateTaskData = Partial<Omit<TaskDocument, 'userId'>>;
```

## Automatic Features

### Completion Timestamps

When marking a task as completed, the service automatically sets the `completedAt` timestamp:

```typescript
await taskService.updateTask('task123', { completed: true });
// completedAt is automatically set to current timestamp

await taskService.updateTask('task123', { completed: false });
// completedAt is automatically cleared
```

### Default Permissions

Tasks are created with user-specific permissions by default:

```typescript
[
  `read("user:${userId}")`,
  `update("user:${userId}")`,
  `delete("user:${userId}")`,
]
```

You can override these by passing custom permissions:

```typescript
await taskService.createTask(
  taskData,
  userId,
  ['read("any")', `update("user:${userId}")`] // Custom permissions
);
```

## Error Handling

All methods include try-catch blocks and log errors to the console:

```typescript
try {
  const task = await taskService.createTask(data, userId);
} catch (error) {
  // Error is logged automatically
  // Handle error in your application
  console.error('Failed to create task:', error);
}
```

## Performance Tips

1. **Use batch operations** when creating/updating/deleting multiple tasks
2. **Use specific filters** to reduce the amount of data transferred
3. **Use pagination** (limit/offset) for large result sets
4. **Use helper methods** instead of building complex filters manually
5. **Cache results** when appropriate using TanStack Query

## Integration with Zustand Store

The task service is designed to work seamlessly with the Zustand store:

```typescript
import { taskService } from '@/services/task.service';
import { useStore } from '@/hooks/use-store';

// In your component or store action
const createTask = async (taskData: CreateTaskData) => {
  const userId = useStore.getState().user?.id;
  if (!userId) throw new Error('User not authenticated');

  const task = await taskService.createTask(taskData, userId);
  
  // Update local store
  useStore.getState().addTask(task);
  
  return task;
};
```

## Testing

The service includes comprehensive tests. Run them with:

```bash
npm test -- src/services/__tests__/task.service.test.ts --run
```

## Related Services

- `database.service.ts` - Generic database operations
- `auth.service.ts` - User authentication
- `preferences.service.ts` - User preferences
- `storage.service.ts` - File storage

## Requirements Covered

This service implements the following requirements from the spec:

- **Requirement 7.1**: Create tasks with Appwrite
- **Requirement 7.2**: Update tasks
- **Requirement 7.3**: Delete tasks
- **Requirement 7.4**: List tasks with filters
- **Requirement 7.5**: Batch operations for performance

## Next Steps

After implementing the task service, you can:

1. Integrate with the Zustand store (Task 9)
2. Implement subtasks and hierarchies (Task 11)
3. Implement task dependencies (Task 12)
4. Implement recurring tasks (Task 13)
5. Implement custom fields (Task 14)
