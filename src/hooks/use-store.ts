import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Task, Project, Label, User, UserPreferences } from '../lib/types';
import { generateId } from '../lib/utils-tasks';
import { databaseService, Query } from '@/services/database.service';
import { COLLECTIONS } from '@/lib/appwrite';
import { ID } from 'appwrite';

// Debug logging for performance monitoring
const DEBUG = true;
const log = (message: string, data?: any) => {
  if (DEBUG) {
    const timestamp = performance.now();
    console.log(`[Store ${timestamp.toFixed(2)}ms] ${message}`, data || '');
  }
};

// IndexedDB for offline cache
const DB_NAME = 'clarityflow-offline';
const DB_VERSION = 1;
const STORES = {
  TASKS: 'tasks',
  PROJECTS: 'projects',
  LABELS: 'labels',
  SYNC_QUEUE: 'sync_queue',
};

// Initialize IndexedDB
let db: IDBDatabase | null = null;

const initIndexedDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      // Create object stores if they don't exist
      if (!database.objectStoreNames.contains(STORES.TASKS)) {
        database.createObjectStore(STORES.TASKS, { keyPath: 'id' });
      }
      if (!database.objectStoreNames.contains(STORES.PROJECTS)) {
        database.createObjectStore(STORES.PROJECTS, { keyPath: 'id' });
      }
      if (!database.objectStoreNames.contains(STORES.LABELS)) {
        database.createObjectStore(STORES.LABELS, { keyPath: 'id' });
      }
      if (!database.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
        const syncStore = database.createObjectStore(STORES.SYNC_QUEUE, { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        syncStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
};

// IndexedDB helper functions
const idbGet = async <T>(storeName: string, key: string): Promise<T | undefined> => {
  const database = await initIndexedDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const idbGetAll = async <T>(storeName: string): Promise<T[]> => {
  const database = await initIndexedDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const idbSet = async <T>(storeName: string, value: T): Promise<void> => {
  const database = await initIndexedDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(value);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

const idbDelete = async (storeName: string, key: string): Promise<void> => {
  const database = await initIndexedDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// Sync queue operations
interface SyncOperation {
  id?: number;
  type: 'create' | 'update' | 'delete';
  collection: string;
  documentId?: string;
  data?: any;
  timestamp: number;
}

const addToSyncQueue = async (operation: Omit<SyncOperation, 'id'>): Promise<void> => {
  const database = await initIndexedDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORES.SYNC_QUEUE, 'readwrite');
    const store = transaction.objectStore(STORES.SYNC_QUEUE);
    const request = store.add(operation);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

const getSyncQueue = async (): Promise<SyncOperation[]> => {
  return idbGetAll<SyncOperation>(STORES.SYNC_QUEUE);
};

const clearSyncQueue = async (): Promise<void> => {
  const database = await initIndexedDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORES.SYNC_QUEUE, 'readwrite');
    const store = transaction.objectStore(STORES.SYNC_QUEUE);
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// Online/offline detection
let isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    isOnline = true;
    log('Network status: ONLINE');
    // Trigger sync when coming back online
    window.dispatchEvent(new CustomEvent('sync-queue'));
  });
  
  window.addEventListener('offline', () => {
    isOnline = false;
    log('Network status: OFFLINE');
  });
}

// Task Store with Zustand - Enterprise-grade performance with Appwrite sync!
interface TaskStore {
  tasks: Task[];
  projects: Project[];
  labels: Label[];
  userId: string | null;
  isLoading: boolean;
  isSyncing: boolean;
  lastSyncTime: number | null;
  
  // Initialization
  setUserId: (userId: string | null) => void;
  loadFromAppwrite: () => Promise<void>;
  loadFromCache: () => Promise<void>;
  syncQueue: () => Promise<void>;
  
  // Task actions
  addTask: (task: Partial<Task>) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  addSubtask: (parentId: string, task: Partial<Task>) => Promise<Task>;
  reorderTask: (taskId: string, newPosition: number, projectId?: string, parentId?: string) => Promise<void>;
  calculateTaskProgress: (taskId: string) => Promise<number>;
  deleteTaskWithSubtasks: (taskId: string) => Promise<void>;
  
  // Project actions
  addProject: (project: Partial<Project>) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  
  // Label actions
  addLabel: (label: Partial<Label>) => Promise<Label>;
  updateLabel: (id: string, updates: Partial<Label>) => Promise<void>;
  deleteLabel: (id: string) => Promise<void>;
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      projects: [],
      labels: [],
      userId: null,
      isLoading: false,
      isSyncing: false,
      lastSyncTime: null,
      
      // Set user ID and trigger data load
      setUserId: (userId) => {
        set({ userId });
        if (userId) {
          get().loadFromAppwrite().catch(err => {
            console.error('Failed to load from Appwrite:', err);
            // Fallback to cache if Appwrite fails
            get().loadFromCache();
          });
        } else {
          // Clear data on logout
          set({ tasks: [], projects: [], labels: [] });
        }
      },
      
      // Load data from Appwrite
      loadFromAppwrite: async () => {
        const state = get();
        if (!state.userId) {
          log('Cannot load from Appwrite: no user ID');
          return;
        }
        
        set({ isLoading: true });
        const start = performance.now();
        
        try {
          // Load tasks, projects, and labels in parallel
          const [tasksResult, projectsResult, labelsResult] = await Promise.all([
            databaseService.listDocuments<Record<string, any>>(
              COLLECTIONS.TASKS,
              [Query.equal('userId', state.userId)]
            ),
            databaseService.listDocuments<Record<string, any>>(
              COLLECTIONS.PROJECTS,
              [Query.equal('userId', state.userId)]
            ),
            databaseService.listDocuments<Record<string, any>>(
              COLLECTIONS.LABELS,
              [Query.equal('userId', state.userId)]
            ),
          ]);
          
          const tasks = tasksResult.documents.map(doc => ({
            id: doc.$id,
            title: (doc as any).title,
            description: (doc as any).description,
            completed: (doc as any).completed,
            priority: (doc as any).priority,
            dueDate: (doc as any).dueDate,
            startDate: (doc as any).startDate,
            projectId: (doc as any).projectId,
            parentId: (doc as any).parentId,
            assignee: (doc as any).assignee,
            labels: (doc as any).labels || [],
            dependencies: (doc as any).dependencies || [],
            estimatedTime: (doc as any).estimatedTime,
            actualTime: (doc as any).actualTime,
            subtasks: [], // Will be populated from parentId relationships
            customFields: (doc as any).customFields,
            createdAt: doc.$createdAt,
            updatedAt: doc.$updatedAt,
          }));
          
          const projects = projectsResult.documents.map(doc => ({
            id: doc.$id,
            name: (doc as any).name,
            description: (doc as any).description,
            color: (doc as any).color,
            parentId: (doc as any).parentId,
            isExpanded: (doc as any).isExpanded,
            createdAt: doc.$createdAt,
            updatedAt: doc.$updatedAt,
          }));
          
          const labels = labelsResult.documents.map(doc => ({
            id: doc.$id,
            name: doc.name,
            color: doc.color,
            createdAt: doc.$createdAt,
            updatedAt: doc.$updatedAt,
          }));
          
          // Update state
          set({ 
            tasks, 
            projects, 
            labels, 
            isLoading: false,
            lastSyncTime: Date.now()
          });
          
          // Cache in IndexedDB
          await Promise.all([
            ...tasks.map(task => idbSet(STORES.TASKS, task)),
            ...projects.map(project => idbSet(STORES.PROJECTS, project)),
            ...labels.map(label => idbSet(STORES.LABELS, label)),
          ]);
          
          const end = performance.now();
          log(`Loaded from Appwrite in ${(end - start).toFixed(2)}ms`, {
            tasks: tasks.length,
            projects: projects.length,
            labels: labels.length,
          });
        } catch (error) {
          console.error('Failed to load from Appwrite:', error);
          set({ isLoading: false });
          throw error;
        }
      },
      
      // Load data from IndexedDB cache
      loadFromCache: async () => {
        const start = performance.now();
        
        try {
          const [tasks, projects, labels] = await Promise.all([
            idbGetAll<Task>(STORES.TASKS),
            idbGetAll<Project>(STORES.PROJECTS),
            idbGetAll<Label>(STORES.LABELS),
          ]);
          
          set({ tasks, projects, labels });
          
          const end = performance.now();
          log(`Loaded from cache in ${(end - start).toFixed(2)}ms`, {
            tasks: tasks.length,
            projects: projects.length,
            labels: labels.length,
          });
        } catch (error) {
          console.error('Failed to load from cache:', error);
        }
      },
      
      // Sync queued operations
      syncQueue: async () => {
        const state = get();
        if (!state.userId || !isOnline) {
          log('Cannot sync: offline or no user');
          return;
        }
        
        set({ isSyncing: true });
        const start = performance.now();
        
        try {
          const queue = await getSyncQueue();
          log(`Processing ${queue.length} queued operations`);
          
          for (const operation of queue) {
            try {
              switch (operation.type) {
                case 'create':
                  await databaseService.createDocument(
                    operation.collection,
                    operation.data,
                    operation.documentId
                  );
                  break;
                case 'update':
                  await databaseService.updateDocument(
                    operation.collection,
                    operation.documentId!,
                    operation.data
                  );
                  break;
                case 'delete':
                  await databaseService.deleteDocument(
                    operation.collection,
                    operation.documentId!
                  );
                  break;
              }
            } catch (error) {
              console.error('Failed to sync operation:', operation, error);
              // Continue with other operations
            }
          }
          
          // Clear queue after successful sync
          await clearSyncQueue();
          
          // Reload from Appwrite to get latest state
          await get().loadFromAppwrite();
          
          const end = performance.now();
          log(`Sync completed in ${(end - start).toFixed(2)}ms`);
        } catch (error) {
          console.error('Sync failed:', error);
        } finally {
          set({ isSyncing: false });
        }
      },
      
      // Task actions with Appwrite sync
      addTask: async (task) => {
        const start = performance.now();
        const state = get();
        
        const taskId = ID.unique();
        const newTask: Task = {
          id: taskId,
          title: task.title || '',
          description: task.description,
          completed: false,
          priority: (task.priority || 4) as 1 | 2 | 3 | 4,
          dueDate: task.dueDate,
          startDate: task.startDate,
          projectId: task.projectId,
          parentId: task.parentId,
          labels: task.labels || [],
          assignee: task.assignee,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          dependencies: task.dependencies || [],
          estimatedTime: task.estimatedTime,
          actualTime: task.actualTime,
          subtasks: task.subtasks || [],
        };
        
        // Optimistic update
        set((state) => ({ tasks: [...state.tasks, newTask] }));
        
        // Cache in IndexedDB
        await idbSet(STORES.TASKS, newTask);
        
        // Sync to Appwrite
        if (isOnline && state.userId) {
          try {
            await databaseService.createDocument(
              COLLECTIONS.TASKS,
              {
                userId: state.userId,
                title: newTask.title,
                description: newTask.description,
                completed: newTask.completed,
                priority: newTask.priority,
                dueDate: newTask.dueDate,
                startDate: newTask.startDate,
                projectId: newTask.projectId,
                parentId: newTask.parentId,
                labels: newTask.labels,
                assignee: newTask.assignee,
                dependencies: newTask.dependencies,
                estimatedTime: newTask.estimatedTime,
                actualTime: newTask.actualTime,
              },
              taskId
            );
          } catch (error) {
            console.error('Failed to create task in Appwrite:', error);
            // Queue for later sync
            await addToSyncQueue({
              type: 'create',
              collection: COLLECTIONS.TASKS,
              documentId: taskId,
              data: {
                userId: state.userId,
                title: newTask.title,
                description: newTask.description,
                completed: newTask.completed,
                priority: newTask.priority,
                dueDate: newTask.dueDate,
                startDate: newTask.startDate,
                projectId: newTask.projectId,
                parentId: newTask.parentId,
                labels: newTask.labels,
                assignee: newTask.assignee,
                dependencies: newTask.dependencies,
                estimatedTime: newTask.estimatedTime,
                actualTime: newTask.actualTime,
              },
              timestamp: Date.now(),
            });
          }
        } else {
          // Queue for later sync
          await addToSyncQueue({
            type: 'create',
            collection: COLLECTIONS.TASKS,
            documentId: taskId,
            data: {
              userId: state.userId,
              title: newTask.title,
              description: newTask.description,
              completed: newTask.completed,
              priority: newTask.priority,
              dueDate: newTask.dueDate,
              startDate: newTask.startDate,
              projectId: newTask.projectId,
              parentId: newTask.parentId,
              labels: newTask.labels,
              assignee: newTask.assignee,
              dependencies: newTask.dependencies,
              estimatedTime: newTask.estimatedTime,
              actualTime: newTask.actualTime,
            },
            timestamp: Date.now(),
          });
        }
        
        const end = performance.now();
        log(`Task added in ${(end - start).toFixed(2)}ms`, newTask.title);
        return newTask;
      },
      
      updateTask: async (id, updates) => {
        const start = performance.now();
        const state = get();
        
        // Optimistic update
        set((state) => ({
          tasks: state.tasks.map(task =>
            task.id === id
              ? { ...task, ...updates, updatedAt: new Date().toISOString() }
              : task
          ),
        }));
        
        // Update cache
        const updatedTask = state.tasks.find(t => t.id === id);
        if (updatedTask) {
          await idbSet(STORES.TASKS, { ...updatedTask, ...updates });
        }
        
        // Sync to Appwrite
        if (isOnline && state.userId) {
          try {
            await databaseService.updateDocument(COLLECTIONS.TASKS, id, updates);
          } catch (error) {
            console.error('Failed to update task in Appwrite:', error);
            await addToSyncQueue({
              type: 'update',
              collection: COLLECTIONS.TASKS,
              documentId: id,
              data: updates,
              timestamp: Date.now(),
            });
          }
        } else {
          await addToSyncQueue({
            type: 'update',
            collection: COLLECTIONS.TASKS,
            documentId: id,
            data: updates,
            timestamp: Date.now(),
          });
        }
        
        const end = performance.now();
        log(`Task updated in ${(end - start).toFixed(2)}ms`, { id, updates });
      },
      
      deleteTask: async (id) => {
        const start = performance.now();
        const state = get();
        
        // Optimistic update
        set((state) => ({
          tasks: state.tasks.filter(task => task.id !== id),
        }));
        
        // Delete from cache
        await idbDelete(STORES.TASKS, id);
        
        // Sync to Appwrite
        if (isOnline && state.userId) {
          try {
            await databaseService.deleteDocument(COLLECTIONS.TASKS, id);
          } catch (error) {
            console.error('Failed to delete task in Appwrite:', error);
            await addToSyncQueue({
              type: 'delete',
              collection: COLLECTIONS.TASKS,
              documentId: id,
              timestamp: Date.now(),
            });
          }
        } else {
          await addToSyncQueue({
            type: 'delete',
            collection: COLLECTIONS.TASKS,
            documentId: id,
            timestamp: Date.now(),
          });
        }
        
        const end = performance.now();
        log(`Task deleted in ${(end - start).toFixed(2)}ms`, id);
      },
      
      toggleTask: async (id) => {
        const start = performance.now();
        const state = get();
        const task = state.tasks.find(t => t.id === id);
        
        if (!task) return;
        
        const updates = {
          completed: !task.completed,
          completedAt: !task.completed ? new Date().toISOString() : undefined,
        };
        
        await get().updateTask(id, updates);
        
        // If this task has a parent, update parent progress
        if (task.parentId) {
          await get().calculateTaskProgress(task.parentId);
        }
        
        const end = performance.now();
        log(`Task toggled in ${(end - start).toFixed(2)}ms`, id);
      },

      addSubtask: async (parentId, task) => {
        const start = performance.now();
        const state = get();
        
        const subtaskId = ID.unique();
        const newSubtask: Task = {
          id: subtaskId,
          title: task.title || '',
          description: task.description,
          completed: false,
          priority: (task.priority || 4) as 1 | 2 | 3 | 4,
          dueDate: task.dueDate,
          startDate: task.startDate,
          projectId: task.projectId,
          parentId: parentId, // Set parent
          labels: task.labels || [],
          assignee: task.assignee,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          dependencies: task.dependencies || [],
          estimatedTime: task.estimatedTime,
          actualTime: task.actualTime,
          subtasks: [],
        };
        
        // Optimistic update - add subtask and update parent
        set((state) => {
          const parentTask = state.tasks.find(t => t.id === parentId);
          if (parentTask) {
            return {
              tasks: [
                ...state.tasks.map(t => 
                  t.id === parentId 
                    ? { ...t, subtasks: [...(t.subtasks || []), subtaskId] }
                    : t
                ),
                newSubtask
              ]
            };
          }
          return { tasks: [...state.tasks, newSubtask] };
        });
        
        // Cache in IndexedDB
        await idbSet(STORES.TASKS, newSubtask);
        
        // Sync to Appwrite
        if (isOnline && state.userId) {
          try {
            await databaseService.createDocument(
              COLLECTIONS.TASKS,
              {
                userId: state.userId,
                title: newSubtask.title,
                description: newSubtask.description,
                completed: newSubtask.completed,
                priority: newSubtask.priority,
                dueDate: newSubtask.dueDate,
                startDate: newSubtask.startDate,
                projectId: newSubtask.projectId,
                parentId: newSubtask.parentId,
                labels: newSubtask.labels,
                assignee: newSubtask.assignee,
                dependencies: newSubtask.dependencies,
                estimatedTime: newSubtask.estimatedTime,
                actualTime: newSubtask.actualTime,
              },
              subtaskId
            );
            
            // Update parent's subtasks array
            const parentTask = state.tasks.find(t => t.id === parentId);
            if (parentTask) {
              await databaseService.updateDocument(
                COLLECTIONS.TASKS,
                parentId,
                { subtasks: [...(parentTask.subtasks || []), subtaskId] }
              );
            }
          } catch (error) {
            console.error('Failed to create subtask in Appwrite:', error);
            await addToSyncQueue({
              type: 'create',
              collection: COLLECTIONS.TASKS,
              documentId: subtaskId,
              data: {
                userId: state.userId,
                title: newSubtask.title,
                description: newSubtask.description,
                completed: newSubtask.completed,
                priority: newSubtask.priority,
                dueDate: newSubtask.dueDate,
                startDate: newSubtask.startDate,
                projectId: newSubtask.projectId,
                parentId: newSubtask.parentId,
                labels: newSubtask.labels,
                assignee: newSubtask.assignee,
                dependencies: newSubtask.dependencies,
                estimatedTime: newSubtask.estimatedTime,
                actualTime: newSubtask.actualTime,
              },
              timestamp: Date.now(),
            });
          }
        } else {
          await addToSyncQueue({
            type: 'create',
            collection: COLLECTIONS.TASKS,
            documentId: subtaskId,
            data: {
              userId: state.userId,
              title: newSubtask.title,
              description: newSubtask.description,
              completed: newSubtask.completed,
              priority: newSubtask.priority,
              dueDate: newSubtask.dueDate,
              startDate: newSubtask.startDate,
              projectId: newSubtask.projectId,
              parentId: newSubtask.parentId,
              labels: newSubtask.labels,
              assignee: newSubtask.assignee,
              dependencies: newSubtask.dependencies,
              estimatedTime: newSubtask.estimatedTime,
              actualTime: newSubtask.actualTime,
            },
            timestamp: Date.now(),
          });
        }
        
        const end = performance.now();
        log(`Subtask added in ${(end - start).toFixed(2)}ms`, newSubtask.title);
        return newSubtask;
      },

      reorderTask: async (taskId, newPosition, projectId, parentId) => {
        const start = performance.now();
        const state = get();
        
        // Get tasks in the same context
        let contextTasks = state.tasks.filter(t => {
          if (projectId && t.projectId !== projectId) return false;
          if (parentId && t.parentId !== parentId) return false;
          if (!projectId && !parentId && (t.projectId || t.parentId)) return false;
          return true;
        });
        
        const taskToMove = contextTasks.find(t => t.id === taskId);
        if (!taskToMove) return;
        
        const oldPosition = taskToMove.position || 0;
        
        // Calculate new positions
        const updates: Array<{ id: string; position: number }> = [];
        
        contextTasks.forEach(task => {
          if (task.id === taskId) {
            updates.push({ id: task.id, position: newPosition });
          } else if (oldPosition < newPosition) {
            if ((task.position || 0) > oldPosition && (task.position || 0) <= newPosition) {
              updates.push({ id: task.id, position: (task.position || 0) - 1 });
            }
          } else if (oldPosition > newPosition) {
            if ((task.position || 0) >= newPosition && (task.position || 0) < oldPosition) {
              updates.push({ id: task.id, position: (task.position || 0) + 1 });
            }
          }
        });
        
        // Optimistic update
        set((state) => ({
          tasks: state.tasks.map(task => {
            const update = updates.find(u => u.id === task.id);
            return update ? { ...task, position: update.position } : task;
          }),
        }));
        
        // Sync to Appwrite
        if (isOnline && state.userId) {
          try {
            for (const update of updates) {
              await databaseService.updateDocument(
                COLLECTIONS.TASKS,
                update.id,
                { position: update.position }
              );
            }
          } catch (error) {
            console.error('Failed to reorder tasks in Appwrite:', error);
          }
        }
        
        const end = performance.now();
        log(`Task reordered in ${(end - start).toFixed(2)}ms`, { taskId, newPosition });
      },

      calculateTaskProgress: async (taskId) => {
        const state = get();
        const subtasks = state.tasks.filter(t => t.parentId === taskId);
        
        if (subtasks.length === 0) return 0;
        
        const completedSubtasks = subtasks.filter(t => t.completed).length;
        const progress = Math.round((completedSubtasks / subtasks.length) * 100);
        
        // Check if all subtasks are complete
        const allComplete = subtasks.every(t => t.completed);
        
        // Update parent task completion status
        if (allComplete && subtasks.length > 0) {
          await get().updateTask(taskId, {
            completed: true,
            completedAt: new Date().toISOString(),
          });
        } else {
          const parentTask = state.tasks.find(t => t.id === taskId);
          if (parentTask?.completed && !allComplete) {
            // If parent was complete but not all subtasks are, mark as incomplete
            await get().updateTask(taskId, {
              completed: false,
              completedAt: undefined,
            });
          }
        }
        
        return progress;
      },

      deleteTaskWithSubtasks: async (taskId) => {
        const start = performance.now();
        const state = get();
        
        // Get all subtasks recursively
        const getSubtasksRecursive = (id: string): string[] => {
          const directSubtasks = state.tasks.filter(t => t.parentId === id);
          const allSubtasks = [...directSubtasks.map(t => t.id)];
          
          directSubtasks.forEach(subtask => {
            allSubtasks.push(...getSubtasksRecursive(subtask.id));
          });
          
          return allSubtasks;
        };
        
        const subtaskIds = getSubtasksRecursive(taskId);
        const allTaskIds = [taskId, ...subtaskIds];
        
        // Optimistic update
        set((state) => ({
          tasks: state.tasks.filter(task => !allTaskIds.includes(task.id)),
        }));
        
        // Delete from cache
        for (const id of allTaskIds) {
          await idbDelete(STORES.TASKS, id);
        }
        
        // Sync to Appwrite
        if (isOnline && state.userId) {
          try {
            for (const id of allTaskIds) {
              await databaseService.deleteDocument(COLLECTIONS.TASKS, id);
            }
          } catch (error) {
            console.error('Failed to delete tasks in Appwrite:', error);
            for (const id of allTaskIds) {
              await addToSyncQueue({
                type: 'delete',
                collection: COLLECTIONS.TASKS,
                documentId: id,
                timestamp: Date.now(),
              });
            }
          }
        } else {
          for (const id of allTaskIds) {
            await addToSyncQueue({
              type: 'delete',
              collection: COLLECTIONS.TASKS,
              documentId: id,
              timestamp: Date.now(),
            });
          }
        }
        
        const end = performance.now();
        log(`Task with subtasks deleted in ${(end - start).toFixed(2)}ms`, { taskId, count: allTaskIds.length });
      },
      
      // Project actions with Appwrite sync
      addProject: async (project) => {
        const start = performance.now();
        const state = get();
        
        const projectId = ID.unique();
        const newProject: Project = {
          id: projectId,
          name: project.name || '',
          description: project.description,
          color: project.color || '#2E5AAC',
          parentId: project.parentId,
          isExpanded: project.isExpanded ?? true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        // Optimistic update
        set((state) => ({ projects: [...state.projects, newProject] }));
        
        // Cache in IndexedDB
        await idbSet(STORES.PROJECTS, newProject);
        
        // Sync to Appwrite
        if (isOnline && state.userId) {
          try {
            await databaseService.createDocument(
              COLLECTIONS.PROJECTS,
              {
                userId: state.userId,
                name: newProject.name,
                description: newProject.description,
                color: newProject.color,
                parentId: newProject.parentId,
                isExpanded: newProject.isExpanded,
              },
              projectId
            );
          } catch (error) {
            console.error('Failed to create project in Appwrite:', error);
            await addToSyncQueue({
              type: 'create',
              collection: COLLECTIONS.PROJECTS,
              documentId: projectId,
              data: {
                userId: state.userId,
                name: newProject.name,
                description: newProject.description,
                color: newProject.color,
                parentId: newProject.parentId,
                isExpanded: newProject.isExpanded,
              },
              timestamp: Date.now(),
            });
          }
        } else {
          await addToSyncQueue({
            type: 'create',
            collection: COLLECTIONS.PROJECTS,
            documentId: projectId,
            data: {
              userId: state.userId,
              name: newProject.name,
              description: newProject.description,
              color: newProject.color,
              parentId: newProject.parentId,
              isExpanded: newProject.isExpanded,
            },
            timestamp: Date.now(),
          });
        }
        
        const end = performance.now();
        log(`Project added in ${(end - start).toFixed(2)}ms`, newProject.name);
        return newProject;
      },
      
      updateProject: async (id, updates) => {
        const start = performance.now();
        const state = get();
        
        // Optimistic update
        set((state) => ({
          projects: state.projects.map(project =>
            project.id === id
              ? { ...project, ...updates, updatedAt: new Date().toISOString() }
              : project
          ),
        }));
        
        // Update cache
        const updatedProject = state.projects.find(p => p.id === id);
        if (updatedProject) {
          await idbSet(STORES.PROJECTS, { ...updatedProject, ...updates });
        }
        
        // Sync to Appwrite
        if (isOnline && state.userId) {
          try {
            await databaseService.updateDocument(COLLECTIONS.PROJECTS, id, updates);
          } catch (error) {
            console.error('Failed to update project in Appwrite:', error);
            await addToSyncQueue({
              type: 'update',
              collection: COLLECTIONS.PROJECTS,
              documentId: id,
              data: updates,
              timestamp: Date.now(),
            });
          }
        } else {
          await addToSyncQueue({
            type: 'update',
            collection: COLLECTIONS.PROJECTS,
            documentId: id,
            data: updates,
            timestamp: Date.now(),
          });
        }
        
        const end = performance.now();
        log(`Project updated in ${(end - start).toFixed(2)}ms`, { id, updates });
      },
      
      deleteProject: async (id) => {
        const start = performance.now();
        const state = get();
        
        // Optimistic update - also delete associated tasks
        set((state) => ({
          projects: state.projects.filter(project => project.id !== id),
          tasks: state.tasks.filter(task => task.projectId !== id),
        }));
        
        // Delete from cache
        await idbDelete(STORES.PROJECTS, id);
        
        // Sync to Appwrite
        if (isOnline && state.userId) {
          try {
            await databaseService.deleteDocument(COLLECTIONS.PROJECTS, id);
          } catch (error) {
            console.error('Failed to delete project in Appwrite:', error);
            await addToSyncQueue({
              type: 'delete',
              collection: COLLECTIONS.PROJECTS,
              documentId: id,
              timestamp: Date.now(),
            });
          }
        } else {
          await addToSyncQueue({
            type: 'delete',
            collection: COLLECTIONS.PROJECTS,
            documentId: id,
            timestamp: Date.now(),
          });
        }
        
        const end = performance.now();
        log(`Project deleted in ${(end - start).toFixed(2)}ms`, id);
      },
      
      // Label actions with Appwrite sync
      addLabel: async (label) => {
        const start = performance.now();
        const state = get();
        
        const labelId = ID.unique();
        const newLabel: Label = {
          id: labelId,
          name: label.name || '',
          color: label.color || '#F2994A',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        // Optimistic update
        set((state) => ({ labels: [...state.labels, newLabel] }));
        
        // Cache in IndexedDB
        await idbSet(STORES.LABELS, newLabel);
        
        // Sync to Appwrite
        if (isOnline && state.userId) {
          try {
            await databaseService.createDocument(
              COLLECTIONS.LABELS,
              {
                userId: state.userId,
                name: newLabel.name,
                color: newLabel.color,
              },
              labelId
            );
          } catch (error) {
            console.error('Failed to create label in Appwrite:', error);
            await addToSyncQueue({
              type: 'create',
              collection: COLLECTIONS.LABELS,
              documentId: labelId,
              data: {
                userId: state.userId,
                name: newLabel.name,
                color: newLabel.color,
              },
              timestamp: Date.now(),
            });
          }
        } else {
          await addToSyncQueue({
            type: 'create',
            collection: COLLECTIONS.LABELS,
            documentId: labelId,
            data: {
              userId: state.userId,
              name: newLabel.name,
              color: newLabel.color,
            },
            timestamp: Date.now(),
          });
        }
        
        const end = performance.now();
        log(`Label added in ${(end - start).toFixed(2)}ms`, newLabel.name);
        return newLabel;
      },
      
      updateLabel: async (id, updates) => {
        const start = performance.now();
        const state = get();
        
        // Optimistic update
        set((state) => ({
          labels: state.labels.map(label =>
            label.id === id
              ? { ...label, ...updates, updatedAt: new Date().toISOString() }
              : label
          ),
        }));
        
        // Update cache
        const updatedLabel = state.labels.find(l => l.id === id);
        if (updatedLabel) {
          await idbSet(STORES.LABELS, { ...updatedLabel, ...updates });
        }
        
        // Sync to Appwrite
        if (isOnline && state.userId) {
          try {
            await databaseService.updateDocument(COLLECTIONS.LABELS, id, updates);
          } catch (error) {
            console.error('Failed to update label in Appwrite:', error);
            await addToSyncQueue({
              type: 'update',
              collection: COLLECTIONS.LABELS,
              documentId: id,
              data: updates,
              timestamp: Date.now(),
            });
          }
        } else {
          await addToSyncQueue({
            type: 'update',
            collection: COLLECTIONS.LABELS,
            documentId: id,
            data: updates,
            timestamp: Date.now(),
          });
        }
        
        const end = performance.now();
        log(`Label updated in ${(end - start).toFixed(2)}ms`, { id, updates });
      },
      
      deleteLabel: async (id) => {
        const start = performance.now();
        const state = get();
        
        // Optimistic update
        set((state) => ({
          labels: state.labels.filter(label => label.id !== id),
        }));
        
        // Delete from cache
        await idbDelete(STORES.LABELS, id);
        
        // Sync to Appwrite
        if (isOnline && state.userId) {
          try {
            await databaseService.deleteDocument(COLLECTIONS.LABELS, id);
          } catch (error) {
            console.error('Failed to delete label in Appwrite:', error);
            await addToSyncQueue({
              type: 'delete',
              collection: COLLECTIONS.LABELS,
              documentId: id,
              timestamp: Date.now(),
            });
          }
        } else {
          await addToSyncQueue({
            type: 'delete',
            collection: COLLECTIONS.LABELS,
            documentId: id,
            timestamp: Date.now(),
          });
        }
        
        const end = performance.now();
        log(`Label deleted in ${(end - start).toFixed(2)}ms`, id);
      },
    }),
    {
      name: 'clarity-task-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist minimal state to localStorage
        userId: state.userId,
        lastSyncTime: state.lastSyncTime,
      }),
      onRehydrateStorage: () => (state) => {
        log('Store rehydrated', { 
          userId: state?.userId,
          lastSyncTime: state?.lastSyncTime,
        });
        
        // Set up sync queue listener
        if (typeof window !== 'undefined') {
          window.addEventListener('sync-queue', () => {
            useTaskStore.getState().syncQueue();
          });
        }
      },
    }
  )
);

// User Store with Zustand - Enterprise-grade performance!
interface UserStore {
  user: User | null;
  preferences: UserPreferences;
  setUser: (user: User | null) => void;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
}

const defaultPreferences: UserPreferences = {
  theme: 'light',
  density: 'comfortable',
  primaryColor: '#2E5AAC',
  fontSize: 'medium',
  sidebarCollapsed: false,
  defaultView: 'list',
  taskReminders: true,
  dailySummary: true,
  overdueAlerts: true,
};

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      preferences: defaultPreferences,
      
      setUser: (user) => {
        log('User set', user?.name || 'null');
        set({ user });
        
        // Update task store with user ID
        if (user) {
          useTaskStore.getState().setUserId(user.id);
        } else {
          useTaskStore.getState().setUserId(null);
        }
      },
      
      updatePreferences: (updates) => {
        const start = performance.now();
        set((state) => {
          const end = performance.now();
          log(`Preferences updated in ${(end - start).toFixed(2)}ms`, updates);
          return {
            preferences: { ...state.preferences, ...updates },
          };
        });

        // Sync to Appwrite if user is logged in
        const state = get();
        if (state.user?.id) {
          import('../services/auth.service').then(({ authService }) => {
            authService.saveUserPreferences(state.user!.id, updates).catch((error) => {
              console.error('Failed to sync preferences to Appwrite:', error);
            });
          });
        }
      },
    }),
    {
      name: 'clarity-user-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        log('User store rehydrated', { theme: state?.preferences.theme });
        
        // Set up event listeners for preferences sync
        if (typeof window !== 'undefined') {
          // Listen for preferences loaded from Appwrite
          window.addEventListener('preferences-loaded', ((event: CustomEvent) => {
            const preferences = event.detail as UserPreferences;
            log('Preferences loaded from Appwrite', preferences);
            useUserStore.setState({ preferences });
          }) as EventListener);

          // Listen for preferences updated in Appwrite
          window.addEventListener('preferences-updated', ((event: CustomEvent) => {
            const preferences = event.detail as UserPreferences;
            log('Preferences updated in Appwrite', preferences);
            useUserStore.setState({ preferences });
          }) as EventListener);

          // Listen for logout to reset preferences
          window.addEventListener('auth-logout', () => {
            log('Auth logout - resetting preferences to defaults');
            useUserStore.setState({ 
              user: null, 
              preferences: defaultPreferences 
            });
            // Clear task store on logout
            useTaskStore.getState().setUserId(null);
          });
        }
      },
    }
  )
);

