export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  completedAt?: string;
  priority: 1 | 2 | 3 | 4;
  dueDate?: string;
  startDate?: string;
  projectId?: string;
  parentId?: string;
  labels: string[];
  assignee?: string;
  createdAt: string;
  updatedAt: string;
  dependencies: string[];
  estimatedTime?: number;
  actualTime?: number;
  subtasks: string[];
  position?: number;
  customFields?: string; // JSON string of CustomFieldValue[]
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  status: 'active' | 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'archived' | 'blocked';
  parentId?: string;
  isExpanded: boolean;
  startDate?: string;
  endDate?: string;
  labels: string[];
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface Section {
  id: string;
  name: string;
  projectId: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Label {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  density: 'comfortable' | 'compact' | 'spacious';
  primaryColor: string;
  fontSize: 'small' | 'medium' | 'large';
  sidebarCollapsed: boolean;
  defaultView: ViewType;
  taskReminders: boolean;
  dailySummary: boolean;
  overdueAlerts: boolean;
}

export type ViewType = 'list' | 'kanban' | 'calendar' | 'gantt' | 'mindmap' | 'focus' | 'custom';

export interface View {
  id: string;
  name: string;
  type: ViewType;
  filters: TaskFilter;
  layout: ViewLayout;
  isCustom: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskFilter {
  projectIds?: string[];
  labelIds?: string[];
  priority?: number[];
  completed?: boolean;
  assignee?: string;
  dueDateRange?: {
    start?: string;
    end?: string;
  };
  searchQuery?: string;
}

export interface ViewLayout {
  columns?: string[];
  groupBy?: 'project' | 'label' | 'priority' | 'assignee' | 'dueDate';
  sortBy?: 'dueDate' | 'priority' | 'createdAt' | 'updatedAt' | 'title';
  sortDirection?: 'asc' | 'desc';
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  source: 'internal' | 'google';
  taskId?: string;
  calendarId?: string;
}

export interface AIsuggestion {
  id: string;
  type: 'subtask' | 'schedule' | 'priority' | 'habit' | 'microtask';
  title: string;
  description: string;
  taskId?: string;
  actionData: any;
  confidence: number;
  createdAt: string;
  dismissed?: boolean;
}

export interface Analytics {
  completionRate: number;
  averageTaskTime: number;
  productivityScore: number;
  streakDays: number;
  tasksCompletedToday: number;
  tasksOverdue: number;
  energyLevel: 'high' | 'medium' | 'low';
  timeBlocks: {
    [hour: string]: {
      productivity: number;
      taskCount: number;
    };
  };
}

export interface ParsedTask {
  title: string;
  projectId?: string;
  labels: string[];
  priority?: number;
  dueDate?: string;
  assignee?: string;
}