import { Task, Project, ParsedTask } from './types';

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function parseNaturalLanguage(input: string): ParsedTask {
  const result: ParsedTask = {
    title: input,
    labels: [],
  };

  // Parse project (#project)
  const projectMatch = input.match(/#(\w+)/);
  if (projectMatch) {
    result.projectId = projectMatch[1];
    result.title = result.title.replace(/#\w+/, '').replace(/\s\s+/g, ' ').trim();
  }

  // Parse labels (+label)
  const labelMatches = input.match(/\+(\w+)/g);
  if (labelMatches) {
    result.labels = labelMatches.map(label => label.slice(1));
    result.title = result.title.replace(/\+\w+/g, '').replace(/\s\s+/g, ' ').trim();
  }

  // Parse priority (!p1, !p2, !p3, !p4)
  const priorityMatch = input.match(/!p([1-4])/);
  if (priorityMatch) {
    result.priority = parseInt(priorityMatch[1]) as 1 | 2 | 3 | 4;
    result.title = result.title.replace(/!p[1-4]/, '').replace(/\s\s+/g, ' ').trim();
  }

  // Parse assignee (@user)
  const assigneeMatch = input.match(/@(\w+)/);
  if (assigneeMatch) {
    result.assignee = assigneeMatch[1];
    result.title = result.title.replace(/@\w+/, '').replace(/\s\s+/g, ' ').trim();
  }

  // Parse dates (basic implementation)
  const datePatterns = [
    /\btomorrow\b/i,
    /\btoday\b/i,
    /\bnext week\b/i,
    /\bnext month\b/i,
    /\d{1,2}\/\d{1,2}\/\d{4}/,
    /\d{1,2}-\d{1,2}-\d{4}/,
  ];

  for (const pattern of datePatterns) {
    const match = input.match(pattern);
    if (match) {
      const dateStr = match[0].toLowerCase();
      const now = new Date();
      
      if (dateStr === 'today') {
        result.dueDate = now.toISOString().split('T')[0];
      } else if (dateStr === 'tomorrow') {
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        result.dueDate = tomorrow.toISOString().split('T')[0];
      } else if (dateStr === 'next week') {
        const nextWeek = new Date(now);
        nextWeek.setDate(nextWeek.getDate() + 7);
        result.dueDate = nextWeek.toISOString().split('T')[0];
      } else if (dateStr === 'next month') {
        const nextMonth = new Date(now);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        result.dueDate = nextMonth.toISOString().split('T')[0];
      } else {
        // Try to parse as actual date
        const parsed = new Date(dateStr);
        if (!isNaN(parsed.getTime())) {
          result.dueDate = parsed.toISOString().split('T')[0];
        }
      }
      
      result.title = result.title.replace(pattern, '').trim();
      break;
    }
  }

  return result;
}

export function createTask(parsed: ParsedTask): Task {
  const now = new Date().toISOString();
  
  return {
    id: generateId(),
    title: parsed.title,
    completed: false,
    priority: (parsed.priority || 4) as 1 | 2 | 3 | 4,
    dueDate: parsed.dueDate,
    projectId: parsed.projectId,
    labels: parsed.labels,
    assignee: parsed.assignee,
    createdAt: now,
    updatedAt: now,
    dependencies: [],
    subtasks: [],
  };
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  } else {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
  }
}

export function isOverdue(dueDate: string): boolean {
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today;
}

export function getPriorityColor(priority: number): string {
  switch (priority) {
    case 1: return 'text-red-500 border-red-500';
    case 2: return 'text-orange-500 border-orange-500';
    case 3: return 'text-blue-500 border-blue-500';
    case 4: return 'text-gray-400 border-gray-400';
    default: return 'text-gray-400 border-gray-400';
  }
}

export function filterTasks(tasks: Task[], filter: {
  completed?: boolean;
  projectId?: string;
  search?: string;
  dueDate?: 'today' | 'overdue' | 'upcoming';
}): Task[] {
  return tasks.filter(task => {
    if (filter.completed !== undefined && task.completed !== filter.completed) {
      return false;
    }
    
    if (filter.projectId && task.projectId !== filter.projectId) {
      return false;
    }
    
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      if (!task.title.toLowerCase().includes(searchLower) &&
          !task.description?.toLowerCase().includes(searchLower)) {
        return false;
      }
    }
    
    if (filter.dueDate && task.dueDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const taskDate = new Date(task.dueDate);
      taskDate.setHours(0, 0, 0, 0);
      
      switch (filter.dueDate) {
        case 'today':
          return taskDate.getTime() === today.getTime();
        case 'overdue':
          return taskDate.getTime() < today.getTime();
        case 'upcoming':
          return taskDate.getTime() > today.getTime();
      }
    }
    
    return true;
  });
}

export function sortTasks(tasks: Task[], sortBy: 'priority' | 'dueDate' | 'title' | 'created' = 'priority'): Task[] {
  return [...tasks].sort((a, b) => {
    switch (sortBy) {
      case 'priority':
        return a.priority - b.priority;
      case 'dueDate':
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      case 'title':
        return a.title.localeCompare(b.title);
      case 'created':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return 0;
    }
  });
}