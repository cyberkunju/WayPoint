import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useTaskStore, useUserStore } from '../use-store';

// Mock Appwrite services
vi.mock('@/services/database.service', () => ({
  databaseService: {
    listDocuments: vi.fn().mockResolvedValue({ documents: [], total: 0 }),
    createDocument: vi.fn().mockResolvedValue({ $id: 'test-id' }),
    updateDocument: vi.fn().mockResolvedValue({ $id: 'test-id' }),
    deleteDocument: vi.fn().mockResolvedValue({}),
  },
  Query: {
    equal: vi.fn((field, value) => `equal("${field}", "${value}")`),
  },
}));

vi.mock('@/lib/appwrite', () => ({
  COLLECTIONS: {
    TASKS: 'tasks',
    PROJECTS: 'projects',
    LABELS: 'labels',
  },
}));

// Mock IndexedDB
const mockDbInstance = {
  transaction: vi.fn().mockReturnThis(),
  objectStore: vi.fn().mockReturnThis(),
  add: vi.fn().mockImplementation(() => {
    const req = { onsuccess: null, onerror: null };
    setTimeout(() => {
      if (req.onsuccess) req.onsuccess({ target: req });
    }, 0);
    return req;
  }),
  put: vi.fn().mockImplementation(() => {
    const req = { onsuccess: null, onerror: null };
    setTimeout(() => {
      if (req.onsuccess) req.onsuccess({ target: req });
    }, 0);
    return req;
  }),
  get: vi.fn().mockImplementation(() => {
    const req = { onsuccess: null, onerror: null, result: undefined };
    setTimeout(() => {
      if (req.onsuccess) req.onsuccess({ target: req });
    }, 0);
    return req;
  }),
  getAll: vi.fn().mockImplementation(() => {
    const req = { onsuccess: null, onerror: null, result: [] };
    setTimeout(() => {
      if (req.onsuccess) req.onsuccess({ target: req });
    }, 0);
    return req;
  }),
  delete: vi.fn().mockImplementation(() => {
    const req = { onsuccess: null, onerror: null };
    setTimeout(() => {
      if (req.onsuccess) req.onsuccess({ target: req });
    }, 0);
    return req;
  }),
  createObjectStore: vi.fn(),
  objectStoreNames: {
    contains: vi.fn().mockReturnValue(true),
  },
};

const mockIDBOpenDBRequest = {
  onupgradeneeded: null,
  onsuccess: null,
  onerror: null,
  result: mockDbInstance,
};

const mockIndexedDB = {
  open: vi.fn().mockImplementation(() => {
    setTimeout(() => {
      if (mockIDBOpenDBRequest.onsuccess) {
        mockIDBOpenDBRequest.onsuccess({ target: mockIDBOpenDBRequest });
      }
    }, 0);
    return mockIDBOpenDBRequest;
  }),
  deleteDatabase: vi.fn(),
};

global.indexedDB = mockIndexedDB as any;

describe('useTaskStore', () => {
  beforeEach(() => {
    // Reset store state
    useTaskStore.setState({
      tasks: [],
      projects: [],
      labels: [],
      userId: null,
      isLoading: false,
      isSyncing: false,
      lastSyncTime: null,
    });
  });

  describe('Task Operations', () => {
    it('should add a task optimistically', async () => {
      const store = useTaskStore.getState();
      
      const task = await store.addTask({
        title: 'Test Task',
        priority: 1,
      });

      expect(task).toBeDefined();
      expect(task.title).toBe('Test Task');
      expect(task.priority).toBe(1);
      expect(task.completed).toBe(false);
      
      const state = useTaskStore.getState();
      expect(state.tasks).toHaveLength(1);
      expect(state.tasks[0].id).toBe(task.id);
    });

    it('should update a task optimistically', async () => {
      const store = useTaskStore.getState();
      
      const task = await store.addTask({
        title: 'Test Task',
        completed: false,
      });

      await store.updateTask(task.id, {
        completed: true,
        title: 'Updated Task',
      });

      const state = useTaskStore.getState();
      const updatedTask = state.tasks.find(t => t.id === task.id);
      
      expect(updatedTask).toBeDefined();
      expect(updatedTask?.completed).toBe(true);
      expect(updatedTask?.title).toBe('Updated Task');
    });

    it('should delete a task optimistically', async () => {
      const store = useTaskStore.getState();
      
      const task = await store.addTask({
        title: 'Test Task',
      });

      expect(useTaskStore.getState().tasks).toHaveLength(1);

      await store.deleteTask(task.id);

      expect(useTaskStore.getState().tasks).toHaveLength(0);
    });

    it('should toggle task completion', async () => {
      const store = useTaskStore.getState();
      
      const task = await store.addTask({
        title: 'Test Task',
        completed: false,
      });

      await store.toggleTask(task.id);

      const state = useTaskStore.getState();
      const toggledTask = state.tasks.find(t => t.id === task.id);
      
      expect(toggledTask?.completed).toBe(true);

      await store.toggleTask(task.id);

      const state2 = useTaskStore.getState();
      const toggledTask2 = state2.tasks.find(t => t.id === task.id);
      
      expect(toggledTask2?.completed).toBe(false);
    });
  });

  describe('Project Operations', () => {
    it('should add a project optimistically', async () => {
      const store = useTaskStore.getState();
      
      const project = await store.addProject({
        name: 'Test Project',
        color: '#FF0000',
      });

      expect(project).toBeDefined();
      expect(project.name).toBe('Test Project');
      expect(project.color).toBe('#FF0000');
      
      const state = useTaskStore.getState();
      expect(state.projects).toHaveLength(1);
    });

    it('should update a project optimistically', async () => {
      const store = useTaskStore.getState();
      
      const project = await store.addProject({
        name: 'Test Project',
      });

      await store.updateProject(project.id, {
        name: 'Updated Project',
        color: '#00FF00',
      });

      const state = useTaskStore.getState();
      const updatedProject = state.projects.find(p => p.id === project.id);
      
      expect(updatedProject?.name).toBe('Updated Project');
      expect(updatedProject?.color).toBe('#00FF00');
    });

    it('should delete a project and its tasks', async () => {
      const store = useTaskStore.getState();
      
      const project = await store.addProject({
        name: 'Test Project',
      });

      await store.addTask({
        title: 'Task 1',
        projectId: project.id,
      });

      await store.addTask({
        title: 'Task 2',
        projectId: project.id,
      });

      expect(useTaskStore.getState().projects).toHaveLength(1);
      expect(useTaskStore.getState().tasks).toHaveLength(2);

      await store.deleteProject(project.id);

      expect(useTaskStore.getState().projects).toHaveLength(0);
      expect(useTaskStore.getState().tasks).toHaveLength(0);
    });
  });

  describe('Label Operations', () => {
    it('should add a label optimistically', async () => {
      const store = useTaskStore.getState();
      
      const label = await store.addLabel({
        name: 'Test Label',
        color: '#0000FF',
      });

      expect(label).toBeDefined();
      expect(label.name).toBe('Test Label');
      expect(label.color).toBe('#0000FF');
      
      const state = useTaskStore.getState();
      expect(state.labels).toHaveLength(1);
    });

    it('should update a label optimistically', async () => {
      const store = useTaskStore.getState();
      
      const label = await store.addLabel({
        name: 'Test Label',
      });

      await store.updateLabel(label.id, {
        name: 'Updated Label',
        color: '#FF00FF',
      });

      const state = useTaskStore.getState();
      const updatedLabel = state.labels.find(l => l.id === label.id);
      
      expect(updatedLabel?.name).toBe('Updated Label');
      expect(updatedLabel?.color).toBe('#FF00FF');
    });

    it('should delete a label optimistically', async () => {
      const store = useTaskStore.getState();
      
      const label = await store.addLabel({
        name: 'Test Label',
      });

      expect(useTaskStore.getState().labels).toHaveLength(1);

      await store.deleteLabel(label.id);

      expect(useTaskStore.getState().labels).toHaveLength(0);
    });
  });

  describe('User Integration', () => {
    it('should set user ID and trigger data load', () => {
      const store = useTaskStore.getState();
      
      store.setUserId('user-123');

      expect(useTaskStore.getState().userId).toBe('user-123');
    });

    it('should clear data on logout', () => {
      const store = useTaskStore.getState();
      
      // Add some data
      store.addTask({ title: 'Task 1' });
      store.addProject({ name: 'Project 1' });
      store.addLabel({ name: 'Label 1' });

      expect(useTaskStore.getState().tasks.length).toBeGreaterThan(0);

      // Logout
      store.setUserId(null);

      expect(useTaskStore.getState().userId).toBeNull();
      expect(useTaskStore.getState().tasks).toHaveLength(0);
      expect(useTaskStore.getState().projects).toHaveLength(0);
      expect(useTaskStore.getState().labels).toHaveLength(0);
    });
  });
});

describe('useUserStore', () => {
  beforeEach(() => {
    useUserStore.setState({
      user: null,
      preferences: {
        theme: 'light',
        density: 'comfortable',
        primaryColor: '#2E5AAC',
        fontSize: 'medium',
        sidebarCollapsed: false,
        defaultView: 'list',
        taskReminders: true,
        dailySummary: true,
        overdueAlerts: true,
      },
    });
  });

  it('should set user and trigger task store update', () => {
    const store = useUserStore.getState();
    
    const user = {
      id: 'user-123',
      name: 'Test User',
      email: 'test@example.com',
      preferences: {
        theme: 'dark' as const,
        density: 'comfortable' as const,
        primaryColor: '#2E5AAC',
        fontSize: 'medium' as const,
        sidebarCollapsed: false,
        defaultView: 'list' as const,
        taskReminders: true,
        dailySummary: true,
        overdueAlerts: true,
      },
    };

    store.setUser(user);

    expect(useUserStore.getState().user).toEqual(user);
    expect(useTaskStore.getState().userId).toBe('user-123');
  });

  it('should update preferences', () => {
    const store = useUserStore.getState();
    
    store.updatePreferences({
      theme: 'dark',
      primaryColor: '#FF0000',
    });

    const state = useUserStore.getState();
    expect(state.preferences.theme).toBe('dark');
    expect(state.preferences.primaryColor).toBe('#FF0000');
    expect(state.preferences.density).toBe('comfortable'); // unchanged
  });

  it('should clear user on logout', () => {
    const store = useUserStore.getState();
    
    store.setUser({
      id: 'user-123',
      name: 'Test User',
      email: 'test@example.com',
      preferences: {
        theme: 'dark' as const,
        density: 'comfortable' as const,
        primaryColor: '#2E5AAC',
        fontSize: 'medium' as const,
        sidebarCollapsed: false,
        defaultView: 'list' as const,
        taskReminders: true,
        dailySummary: true,
        overdueAlerts: true,
      },
    });

    expect(useUserStore.getState().user).not.toBeNull();

    store.setUser(null);

    expect(useUserStore.getState().user).toBeNull();
    expect(useTaskStore.getState().userId).toBeNull();
  });
});
