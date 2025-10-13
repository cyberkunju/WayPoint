import { Client, Account, Databases, Storage, Functions, type Models } from 'appwrite';

// Validate required environment variables
const requiredEnvVars = {
  endpoint: import.meta.env?.VITE_APPWRITE_ENDPOINT,
  projectId: import.meta.env?.VITE_APPWRITE_PROJECT_ID
};

// Check for missing environment variables
const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => `VITE_APPWRITE_${key.toUpperCase()}`);

if (missingVars.length > 0) {
  console.error('Missing required Appwrite environment variables:', missingVars);
  console.error('Please copy .env.example to .env.local and configure your Appwrite credentials');
}

// Appwrite configuration
const client = new Client()
  .setEndpoint(requiredEnvVars.endpoint || 'https://cloud.appwrite.io/v1')
  .setProject(requiredEnvVars.projectId || '');

// Log configuration (only in development)
if (import.meta.env?.DEV) {
  console.log('Appwrite Configuration:', {
    endpoint: requiredEnvVars.endpoint,
    projectId: requiredEnvVars.projectId ? '***' + requiredEnvVars.projectId.slice(-4) : 'NOT_SET',
    databaseId: import.meta.env?.VITE_APPWRITE_DATABASE_ID || 'clarityflow_production'
  });
}

// Initialize Appwrite services
const accountService = new Account(client);
const databasesService = new Databases(client);
const storageService = new Storage(client);
const functionsService = new Functions(client);

// Database and collection IDs
export const DATABASE_ID = import.meta.env?.VITE_APPWRITE_DATABASE_ID || 'clarityflow_production';

// Collection IDs
export const COLLECTIONS = {
  USERS_PREFERENCES: 'users_preferences',
  PROJECTS: 'projects',
  TASKS: 'tasks',
  EPICS: 'epics',
  LABELS: 'labels',
  NOTES: 'notes',
  NOTE_LINKS: 'note_links',
  GOALS: 'goals',
  GOAL_LINKS: 'goal_links',
  HABITS: 'habits',
  HABIT_COMPLETIONS: 'habit_completions',
  WELLBEING_LOGS: 'wellbeing_logs',
  FOCUS_SESSIONS: 'focus_sessions',
  TIME_ENTRIES: 'time_entries',
  RECURRING_TASKS: 'recurring_tasks',
  AUTOMATION_RULES: 'automation_rules',
  SAVED_FILTERS: 'saved_filters',
  TEMPLATES: 'templates',
  INTEGRATIONS: 'integrations',
  WEEKLY_REVIEWS: 'weekly_reviews',
  TASK_DEPENDENCIES: 'task_dependencies',
  CUSTOM_FIELDS: 'custom_fields',
  PROJECT_STATUS_HISTORY: 'project_status_history',
  SPRINTS: 'sprints'
} as const;

// Storage bucket IDs
export const BUCKETS = {
  ATTACHMENTS: 'attachments',
  AVATARS: 'avatars'
} as const;

// Function IDs
export const FUNCTIONS_IDS = {
  AI_ASSISTANT: 'ai-assistant',
  AUTOMATION_ENGINE: 'automation-engine',
  ANALYTICS_GENERATOR: 'analytics-generator',
  SYNC_RESOLVER: 'sync-resolver',
  RECURRING_TASKS_PROCESSOR: 'recurring-tasks-processor',
  GOAL_PROGRESS_CALCULATOR: 'goal-progress-calculator',
  HABIT_STREAK_CALCULATOR: 'habit-streak-calculator'
} as const;

// Export raw services for direct access
export const account = accountService;
export const databases = databasesService;
export const storage = storageService;
export const functions = functionsService;

export default client;