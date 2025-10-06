import { useKV } from '@github/spark/hooks';
import { useState } from 'react';
import { Task, Project, Label, User, UserPreferences, View } from '../lib/types';
import { generateId } from '../lib/utils-tasks';

export function useTaskStore() {
  const [tasks, setTasks] = useKV<Task[]>('clarity-tasks', []);
  const [projects, setProjects] = useKV<Project[]>('clarity-projects', []);
  const [labels, setLabels] = useKV<Label[]>('clarity-labels', []);
  const [views, setViews] = useKV<View[]>('clarity-views', []);

  const addTask = (task: Partial<Task>) => {
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

    setTasks(current => [...(current ?? []), newTask]);
    return newTask;
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(current => 
      (current ?? []).map(task => 
        task.id === id 
          ? { ...task, ...updates, updatedAt: new Date().toISOString() }
          : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks(current => (current ?? []).filter(task => task.id !== id));
  };

  const toggleTask = (id: string) => {
    setTasks(current => 
      (current ?? []).map(task => 
        task.id === id 
          ? { 
              ...task, 
              completed: !task.completed, 
              updatedAt: new Date().toISOString() 
            }
          : task
      )
    );
  };

  const addProject = (project: Partial<Project>) => {
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

    setProjects(current => [...(current ?? []), newProject]);
    return newProject;
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(current => 
      (current ?? []).map(project => 
        project.id === id 
          ? { ...project, ...updates, updatedAt: new Date().toISOString() }
          : project
      )
    );
  };

  const deleteProject = (id: string) => {
    setProjects(current => (current ?? []).filter(project => project.id !== id));
    setTasks(current => (current ?? []).filter(task => task.projectId !== id));
  };

  const addLabel = (label: Partial<Label>) => {
    const newLabel: Label = {
      id: generateId(),
      name: label.name || '',
      color: label.color || '#F2994A',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setLabels(current => [...(current ?? []), newLabel]);
    return newLabel;
  };

  const updateLabel = (id: string, updates: Partial<Label>) => {
    setLabels(current => 
      (current ?? []).map(label => 
        label.id === id 
          ? { ...label, ...updates, updatedAt: new Date().toISOString() }
          : label
      )
    );
  };

  const deleteLabel = (id: string) => {
    setLabels(current => (current ?? []).filter(label => label.id !== id));
  };

  return {
    tasks,
    projects,
    labels,
    views,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    addProject,
    updateProject,
    deleteProject,
    addLabel,
    updateLabel,
    deleteLabel,
  };
}

export function useUserStore() {
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

  const [preferences, setPreferences] = useKV<UserPreferences>('clarity-preferences', defaultPreferences);
  const [user, setUser] = useKV<User | null>('clarity-user', null);

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    setPreferences(current => ({ ...(current ?? defaultPreferences), ...updates }));
  };

  return {
    user,
    setUser,
    preferences,
    updatePreferences,
  };
}

export function useAppState() {
  // Use useKV for currentView to persist across refreshes
  const [currentView, setCurrentView] = useKV<string>('clarity-current-view', 'inbox');
  
  // Use regular React state for UI interactions that don't need persistence
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState<boolean>(false);

  return {
    selectedTaskId,
    setSelectedTaskId,
    currentView,
    setCurrentView,
    searchQuery,
    setSearchQuery,
    isDetailPanelOpen,
    setIsDetailPanelOpen,
  };
}