import { Task, Project, Label } from './types';

export const sampleProjects: Project[] = [
  {
    id: 'project-1',
    name: 'Work Projects',
    description: 'Professional tasks and deadlines',
    color: '#2E5AAC',
    isExpanded: true,
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: 'project-2',
    name: 'Personal',
    description: 'Personal life and hobbies',
    color: '#10B981',
    isExpanded: true,
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: 'project-3',
    name: 'Learning',
    description: 'Educational goals and courses',
    color: '#8B5CF6',
    isExpanded: true,
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
  },
];

export const sampleLabels: Label[] = [
  {
    id: 'label-1',
    name: 'urgent',
    color: '#EF4444',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'label-2',
    name: 'meeting',
    color: '#F59E0B',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'label-3',
    name: 'research',
    color: '#3B82F6',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'label-4',
    name: 'review',
    color: '#8B5CF6',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const sampleTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Complete quarterly report',
    description: 'Finalize Q4 performance analysis and prepare presentation for stakeholders',
    completed: false,
    priority: 1,
    startDate: new Date().toISOString().split('T')[0], // Today
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    projectId: 'project-1',
    labels: ['urgent', 'review'],
    assignee: 'me',
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-01-15').toISOString(),
    dependencies: [],
    estimatedTime: 240,
    subtasks: [],
  },
  {
    id: 'task-2',
    title: 'Team meeting preparation',
    description: 'Prepare agenda and gather status updates from team members',
    completed: false,
    priority: 2,
    startDate: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
    dueDate: new Date().toISOString().split('T')[0], // Today
    projectId: 'project-1',
    labels: ['meeting'],
    createdAt: new Date('2024-01-16').toISOString(),
    updatedAt: new Date('2024-01-16').toISOString(),
    dependencies: [],
    estimatedTime: 60,
    subtasks: [],
  },
  {
    id: 'task-3',
    title: 'Research new productivity tools',
    description: 'Evaluate alternatives to current project management software',
    completed: false,
    priority: 3,
    startDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0], // Day after tomorrow
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0], // Next week
    projectId: 'project-1',
    labels: ['research'],
    createdAt: new Date('2024-01-10').toISOString(),
    updatedAt: new Date('2024-01-14').toISOString(),
    dependencies: [],
    estimatedTime: 120,
    subtasks: [],
  },
  {
    id: 'task-4',
    title: 'Plan weekend getaway',
    description: 'Research destinations, book accommodation, and plan activities',
    completed: false,
    priority: 4,
    startDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0], // 5 days from now
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0], // 2 weeks from now
    projectId: 'project-2',
    labels: [],
    createdAt: new Date('2024-01-12').toISOString(),
    updatedAt: new Date('2024-01-12').toISOString(),
    dependencies: [],
    subtasks: [],
  },
  {
    id: 'task-5',
    title: 'Grocery shopping',
    description: 'Buy ingredients for meal prep this week',
    completed: true,
    priority: 3,
    startDate: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0], // 2 days ago
    dueDate: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
    projectId: 'project-2',
    labels: [],
    createdAt: new Date('2024-01-17').toISOString(),
    updatedAt: new Date('2024-01-17').toISOString(),
    dependencies: [],
    subtasks: [],
  },
  {
    id: 'task-6',
    title: 'Complete React course module 5',
    description: 'Finish advanced hooks section and complete the practical exercises',
    completed: false,
    priority: 2,
    startDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0], // 3 days
    projectId: 'project-3',
    labels: [],
    createdAt: new Date('2024-01-14').toISOString(),
    updatedAt: new Date('2024-01-16').toISOString(),
    dependencies: [],
    estimatedTime: 180,
    subtasks: [],
  },
  {
    id: 'task-7',
    title: 'Set up home office ergonomics',
    description: 'Adjust monitor height, get ergonomic chair, improve lighting',
    completed: false,
    priority: 3,
    startDate: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0], // 3 days ago
    dueDate: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday (overdue)
    projectId: 'project-2',
    labels: [],
    createdAt: new Date('2024-01-13').toISOString(),
    updatedAt: new Date('2024-01-13').toISOString(),
    dependencies: [],
    subtasks: [],
  },
];