# Integration Guide: Updated Zustand Store with Appwrite

## Quick Start

### 1. Initialize on App Load

```typescript
// src/App.tsx or main component
import { useEffect } from 'react';
import { useUserStore, useTaskStore } from '@/hooks/use-store';
import { authService } from '@/services/auth.service';

function App() {
  const setUser = useUserStore(state => state.setUser);
  const { isLoading } = useTaskStore();

  useEffect(() => {
    // Check for existing session on app load
    const initAuth = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (user) {
          setUser(user); // This automatically loads data
        }
      } catch (error) {
        console.log('No active session');
      }
    };

    initAuth();
  }, [setUser]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return <MainApp />;
}
```

### 2. Login Flow

```typescript
// src/components/auth/LoginPage.tsx
import { useState } from 'react';
import { useUserStore } from '@/hooks/use-store';
import { authService } from '@/services/auth.service';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const setUser = useUserStore(state => state.setUser);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authService.login(email, password);
      const user = await authService.getCurrentUser();
      
      // This triggers automatic data load from Appwrite
      setUser(user);
      
      // Navigate to app
      window.location.href = '/app';
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

### 3. Task List Component

```typescript
// src/components/TaskList.tsx
import { useTaskStore } from '@/hooks/use-store';

function TaskList() {
  const { tasks, isLoading, updateTask, deleteTask } = useTaskStore();

  const handleToggle = async (taskId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        await updateTask(taskId, { completed: !task.completed });
      }
    } catch (error) {
      console.error('Failed to toggle task:', error);
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm('Delete this task?')) return;
    
    try {
      await deleteTask(taskId);
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  if (isLoading) {
    return <div>Loading tasks...</div>;
  }

  return (
    <div>
      {tasks.map(task => (
        <div key={task.id}>
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => handleToggle(task.id)}
          />
          <span>{task.title}</span>
          <button onClick={() => handleDelete(task.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

### 4. Add Task Component

```typescript
// src/components/AddTask.tsx
import { useState } from 'react';
import { useTaskStore } from '@/hooks/use-store';

function AddTask() {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const addTask = useTaskStore(state => state.addTask);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      await addTask({
        title: title.trim(),
        priority: 4,
      });
      setTitle('');
    } catch (error) {
      console.error('Failed to add task:', error);
      alert('Failed to add task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add a task..."
        disabled={loading}
      />
      <button type="submit" disabled={loading || !title.trim()}>
        {loading ? 'Adding...' : 'Add'}
      </button>
    </form>
  );
}
```

### 5. Sync Status Indicator

```typescript
// src/components/SyncStatus.tsx
import { useTaskStore } from '@/hooks/use-store';

function SyncStatus() {
  const { isSyncing, lastSyncTime, syncQueue } = useTaskStore();

  const handleManualSync = async () => {
    try {
      await syncQueue();
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  return (
    <div className="sync-status">
      {isSyncing ? (
        <span>🔄 Syncing...</span>
      ) : lastSyncTime ? (
        <span>
          ✓ Synced {new Date(lastSyncTime).toLocaleTimeString()}
        </span>
      ) : (
        <span>⚠️ Not synced</span>
      )}
      
      <button onClick={handleManualSync} disabled={isSyncing}>
        Sync Now
      </button>
    </div>
  );
}
```

### 6. Offline Indicator

```typescript
// src/components/OfflineIndicator.tsx
import { useEffect, useState } from 'react';

function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="offline-banner">
      ⚠️ You're offline. Changes will sync when you're back online.
    </div>
  );
}
```

### 7. Project Selector

```typescript
// src/components/ProjectSelector.tsx
import { useTaskStore } from '@/hooks/use-store';

function ProjectSelector({ value, onChange }: {
  value?: string;
  onChange: (projectId: string) => void;
}) {
  const projects = useTaskStore(state => state.projects);

  return (
    <select value={value || ''} onChange={(e) => onChange(e.target.value)}>
      <option value="">No Project</option>
      {projects.map(project => (
        <option key={project.id} value={project.id}>
          {project.name}
        </option>
      ))}
    </select>
  );
}
```

### 8. Logout Flow

```typescript
// src/components/LogoutButton.tsx
import { useUserStore, useTaskStore } from '@/hooks/use-store';
import { authService } from '@/services/auth.service';

function LogoutButton() {
  const setUser = useUserStore(state => state.setUser);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      
      // Clear user and task data
      setUser(null);
      
      // Navigate to login
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleLogout} disabled={loading}>
      {loading ? 'Logging out...' : 'Logout'}
    </button>
  );
}
```

## Advanced Usage

### Custom Hooks for Common Patterns

```typescript
// src/hooks/use-tasks-by-project.ts
import { useMemo } from 'react';
import { useTaskStore } from './use-store';

export function useTasksByProject(projectId?: string) {
  const tasks = useTaskStore(state => state.tasks);
  
  return useMemo(() => {
    if (!projectId) {
      return tasks.filter(task => !task.projectId);
    }
    return tasks.filter(task => task.projectId === projectId);
  }, [tasks, projectId]);
}

// Usage
function ProjectTasks({ projectId }: { projectId: string }) {
  const tasks = useTasksByProject(projectId);
  
  return (
    <div>
      {tasks.map(task => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  );
}
```

```typescript
// src/hooks/use-incomplete-tasks.ts
import { useMemo } from 'react';
import { useTaskStore } from './use-store';

export function useIncompleteTasks() {
  const tasks = useTaskStore(state => state.tasks);
  
  return useMemo(() => {
    return tasks.filter(task => !task.completed);
  }, [tasks]);
}
```

```typescript
// src/hooks/use-overdue-tasks.ts
import { useMemo } from 'react';
import { useTaskStore } from './use-store';

export function useOverdueTasks() {
  const tasks = useTaskStore(state => state.tasks);
  
  return useMemo(() => {
    const now = new Date().toISOString();
    return tasks.filter(task => 
      !task.completed && 
      task.dueDate && 
      task.dueDate < now
    );
  }, [tasks]);
}
```

### Error Handling Pattern

```typescript
// src/utils/task-operations.ts
import { useTaskStore } from '@/hooks/use-store';

export async function safeTaskOperation<T>(
  operation: () => Promise<T>,
  errorMessage: string
): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    console.error(errorMessage, error);
    
    // Show user-friendly error
    if (error instanceof Error) {
      alert(`${errorMessage}: ${error.message}`);
    } else {
      alert(errorMessage);
    }
    
    return null;
  }
}

// Usage
async function handleAddTask(title: string) {
  const addTask = useTaskStore.getState().addTask;
  
  const task = await safeTaskOperation(
    () => addTask({ title }),
    'Failed to add task'
  );
  
  if (task) {
    console.log('Task added:', task.id);
  }
}
```

### Batch Operations

```typescript
// src/utils/batch-operations.ts
import { useTaskStore } from '@/hooks/use-store';

export async function batchAddTasks(tasks: Array<{ title: string }>) {
  const addTask = useTaskStore.getState().addTask;
  
  const results = await Promise.allSettled(
    tasks.map(task => addTask(task))
  );
  
  const succeeded = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;
  
  console.log(`Batch add: ${succeeded} succeeded, ${failed} failed`);
  
  return { succeeded, failed };
}

export async function batchDeleteTasks(taskIds: string[]) {
  const deleteTask = useTaskStore.getState().deleteTask;
  
  await Promise.all(taskIds.map(id => deleteTask(id)));
}
```

## Testing Components

```typescript
// src/components/__tests__/TaskList.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useTaskStore } from '@/hooks/use-store';
import TaskList from '../TaskList';

describe('TaskList', () => {
  beforeEach(() => {
    // Reset store
    useTaskStore.setState({
      tasks: [],
      projects: [],
      labels: [],
      userId: 'test-user',
      isLoading: false,
      isSyncing: false,
      lastSyncTime: null,
    });
  });

  it('should display tasks', async () => {
    // Add test tasks
    await useTaskStore.getState().addTask({ title: 'Test Task 1' });
    await useTaskStore.getState().addTask({ title: 'Test Task 2' });

    render(<TaskList />);

    expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    expect(screen.getByText('Test Task 2')).toBeInTheDocument();
  });

  it('should toggle task completion', async () => {
    const task = await useTaskStore.getState().addTask({ 
      title: 'Test Task',
      completed: false 
    });

    render(<TaskList />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();

    await userEvent.click(checkbox);

    await waitFor(() => {
      const updatedTask = useTaskStore.getState().tasks.find(t => t.id === task.id);
      expect(updatedTask?.completed).toBe(true);
    });
  });
});
```

## Common Patterns

### Loading States

```typescript
function MyComponent() {
  const { isLoading, isSyncing } = useTaskStore();
  
  if (isLoading) {
    return <FullPageLoader />;
  }
  
  return (
    <div>
      {isSyncing && <SyncIndicator />}
      <Content />
    </div>
  );
}
```

### Optimistic Updates with Rollback

```typescript
async function handleUpdate(taskId: string, updates: Partial<Task>) {
  const store = useTaskStore.getState();
  const originalTask = store.tasks.find(t => t.id === taskId);
  
  try {
    await store.updateTask(taskId, updates);
  } catch (error) {
    // Rollback on error
    if (originalTask) {
      await store.updateTask(taskId, originalTask);
    }
    throw error;
  }
}
```

### Debounced Updates

```typescript
import { debounce } from 'lodash';

const debouncedUpdate = debounce(async (taskId: string, updates: Partial<Task>) => {
  await useTaskStore.getState().updateTask(taskId, updates);
}, 500);

function TaskEditor({ taskId }: { taskId: string }) {
  const [title, setTitle] = useState('');
  
  const handleChange = (newTitle: string) => {
    setTitle(newTitle);
    debouncedUpdate(taskId, { title: newTitle });
  };
  
  return <input value={title} onChange={(e) => handleChange(e.target.value)} />;
}
```

## Troubleshooting

### Data Not Loading
```typescript
// Check if user is set
const userId = useTaskStore(state => state.userId);
console.log('User ID:', userId);

// Manually trigger load
await useTaskStore.getState().loadFromAppwrite();
```

### Sync Issues
```typescript
// Check sync queue
const queue = await getSyncQueue();
console.log('Pending operations:', queue.length);

// Manually trigger sync
await useTaskStore.getState().syncQueue();
```

### Performance Issues
```typescript
// Check store size
const state = useTaskStore.getState();
console.log('Tasks:', state.tasks.length);
console.log('Projects:', state.projects.length);
console.log('Labels:', state.labels.length);
```

## Best Practices

1. ✅ Always await async operations
2. ✅ Handle errors gracefully
3. ✅ Show loading states
4. ✅ Display sync status
5. ✅ Use optimistic updates
6. ✅ Test with offline mode
7. ✅ Monitor performance
8. ✅ Clear data on logout

## Next Steps

1. Update all existing components to use async operations
2. Add loading and sync indicators to UI
3. Test offline functionality thoroughly
4. Implement real-time subscriptions (future)
5. Add conflict resolution UI (future)
