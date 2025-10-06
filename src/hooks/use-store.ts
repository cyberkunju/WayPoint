import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Task, Project, Label, User, UserPreferences, View } from '../lib/types';
import { generateId } from '../lib/utils-tasks';

// Debug logging for performance monitoring
const DEBUG = true;
const log = (message: string, data?: any) => {
  if (DEBUG) {
    const timestamp = performance.now();
    console.log(`[Store ${timestamp.toFixed(2)}ms] ${message}`, data || '');
  }
};

// Task Store with Zustand - Enterprise-grade performance!
interface TaskStore {
  tasks: Task[];
  projects: Project[];
  labels: Label[];
  
  // Task actions
  addTask: (task: Partial<Task>) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  
  // Project actions
  addProject: (project: Partial<Project>) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  
  // Label actions
  addLabel: (label: Partial<Label>) => Label;
  updateLabel: (id: string, updates: Partial<Label>) => void;
  deleteLabel: (id: string) => void;
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      projects: [],
      labels: [],
      
      addTask: (task) => {
        const start = performance.now();
        const newTask: Task = {
          id: generateId(),
          title: task.title || '',
          description: task.description,
          completed: false,
          priority: (task.priority || 4) as 1 | 2 | 3 | 4,
          dueDate: task.dueDate,
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
        
        set((state) => {
          const end = performance.now();
          log(`Task added in ${(end - start).toFixed(2)}ms`, newTask.title);
          return { tasks: [...state.tasks, newTask] };
        });
        return newTask;
      },
      
      updateTask: (id, updates) => {
        const start = performance.now();
        set((state) => {
          const end = performance.now();
          log(`Task updated in ${(end - start).toFixed(2)}ms`, { id, updates });
          return {
            tasks: state.tasks.map(task =>
              task.id === id
                ? { ...task, ...updates, updatedAt: new Date().toISOString() }
                : task
            ),
          };
        });
      },
      
      deleteTask: (id) => {
        const start = performance.now();
        set((state) => {
          const end = performance.now();
          log(`Task deleted in ${(end - start).toFixed(2)}ms`, id);
          return {
            tasks: state.tasks.filter(task => task.id !== id),
          };
        });
      },
      
      toggleTask: (id) => {
        const start = performance.now();
        set((state) => {
          const end = performance.now();
          log(`Task toggled in ${(end - start).toFixed(2)}ms`, id);
          return {
            tasks: state.tasks.map(task =>
              task.id === id
                ? { 
                    ...task, 
                    completed: !task.completed,
                    updatedAt: new Date().toISOString() 
                  }
                : task
            ),
          };
        });
      },
      
      addProject: (project) => {
        const start = performance.now();
        const newProject: Project = {
          id: generateId(),
          name: project.name || '',
          description: project.description,
          color: project.color || '#2E5AAC',
          parentId: project.parentId,
          isExpanded: project.isExpanded ?? true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        set((state) => {
          const end = performance.now();
          log(`Project added in ${(end - start).toFixed(2)}ms`, newProject.name);
          return { projects: [...state.projects, newProject] };
        });
        return newProject;
      },
      
      updateProject: (id, updates) => {
        const start = performance.now();
        set((state) => {
          const end = performance.now();
          log(`Project updated in ${(end - start).toFixed(2)}ms`, { id, updates });
          return {
            projects: state.projects.map(project =>
              project.id === id
                ? { ...project, ...updates, updatedAt: new Date().toISOString() }
                : project
            ),
          };
        });
      },
      
      deleteProject: (id) => {
        const start = performance.now();
        set((state) => {
          const end = performance.now();
          log(`Project deleted in ${(end - start).toFixed(2)}ms`, id);
          return {
            projects: state.projects.filter(project => project.id !== id),
            tasks: state.tasks.filter(task => task.projectId !== id),
          };
        });
      },
      
      addLabel: (label) => {
        const start = performance.now();
        const newLabel: Label = {
          id: generateId(),
          name: label.name || '',
          color: label.color || '#F2994A',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        set((state) => {
          const end = performance.now();
          log(`Label added in ${(end - start).toFixed(2)}ms`, newLabel.name);
          return { labels: [...state.labels, newLabel] };
        });
        return newLabel;
      },
      
      updateLabel: (id, updates) => {
        const start = performance.now();
        set((state) => {
          const end = performance.now();
          log(`Label updated in ${(end - start).toFixed(2)}ms`, { id, updates });
          return {
            labels: state.labels.map(label =>
              label.id === id
                ? { ...label, ...updates, updatedAt: new Date().toISOString() }
                : label
            ),
          };
        });
      },
      
      deleteLabel: (id) => {
        const start = performance.now();
        set((state) => {
          const end = performance.now();
          log(`Label deleted in ${(end - start).toFixed(2)}ms`, id);
          return {
            labels: state.labels.filter(label => label.id !== id),
          };
        });
      },
    }),
    {
      name: 'clarity-task-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        log('Store rehydrated', { 
          tasks: state?.tasks.length,
          projects: state?.projects.length,
          labels: state?.labels.length 
        });
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
    (set) => ({
      user: null,
      preferences: defaultPreferences,
      
      setUser: (user) => {
        log('User set', user?.name || 'null');
        set({ user });
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
      },
    }),
    {
      name: 'clarity-user-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        log('User store rehydrated', { theme: state?.preferences.theme });
      },
    }
  )
);

