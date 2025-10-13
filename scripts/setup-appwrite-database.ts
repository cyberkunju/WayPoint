#!/usr/bin/env tsx
/**
 * Appwrite Database Setup Script
 * Creates the database schema for ClarityFlow including all collections, attributes, indexes, and permissions
 */

import { Client, Databases, Permission, Role } from 'node-appwrite';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const client = new Client()
  .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.VITE_APPWRITE_PROJECT_ID || '')
  .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);
const DATABASE_ID = 'clarityflow_production';

interface AttributeConfig {
  key: string;
  type: 'string' | 'integer' | 'float' | 'boolean' | 'datetime';
  size?: number;
  required?: boolean;
  default?: any;
  array?: boolean;
  min?: number;
  max?: number;
}

interface IndexConfig {
  key: string;
  type: string;
  attributes: string[];
}

interface CollectionConfig {
  id: string;
  name: string;
  attributes: AttributeConfig[];
  indexes: IndexConfig[];
}

async function createDatabase() {
  console.log('Creating database:', DATABASE_ID);
  try {
    await databases.create(DATABASE_ID, 'ClarityFlow Production');
    console.log('✓ Database created successfully');
  } catch (error: any) {
    if (error.code === 409) {
      console.log('✓ Database already exists');
    } else {
      throw error;
    }
  }
}

async function createCollection(config: CollectionConfig) {
  console.log(`\nCreating collection: ${config.name}`);
  
  try {
    // Create collection with document security enabled
    await databases.createCollection(
      DATABASE_ID,
      config.id,
      config.name,
      [
        Permission.read(Role.user('userId')),
        Permission.create(Role.users()),
        Permission.update(Role.user('userId')),
        Permission.delete(Role.user('userId'))
      ],
      true // documentSecurity
    );
    console.log(`✓ Collection ${config.name} created`);
  } catch (error: any) {
    if (error.code === 409) {
      console.log(`✓ Collection ${config.name} already exists`);
    } else {
      throw error;
    }
  }

  // Create attributes
  for (const attr of config.attributes) {
    await createAttribute(config.id, attr);
  }

  // Wait for attributes to be available
  console.log('Waiting for attributes to be ready...');
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Create indexes
  for (const index of config.indexes) {
    await createIndex(config.id, index);
  }
}

async function createAttribute(collectionId: string, attr: AttributeConfig) {
  try {
    switch (attr.type) {
      case 'string':
        await databases.createStringAttribute(
          DATABASE_ID,
          collectionId,
          attr.key,
          attr.size || 255,
          attr.required || false,
          attr.default,
          attr.array || false
        );
        break;
      case 'integer':
        await databases.createIntegerAttribute(
          DATABASE_ID,
          collectionId,
          attr.key,
          attr.required || false,
          attr.min,
          attr.max,
          attr.default,
          attr.array || false
        );
        break;
      case 'float':
        await databases.createFloatAttribute(
          DATABASE_ID,
          collectionId,
          attr.key,
          attr.required || false,
          attr.min,
          attr.max,
          attr.default,
          attr.array || false
        );
        break;
      case 'boolean':
        await databases.createBooleanAttribute(
          DATABASE_ID,
          collectionId,
          attr.key,
          attr.required || false,
          attr.default,
          attr.array || false
        );
        break;
      case 'datetime':
        await databases.createDatetimeAttribute(
          DATABASE_ID,
          collectionId,
          attr.key,
          attr.required || false,
          attr.default,
          attr.array || false
        );
        break;
    }
    console.log(`  ✓ Attribute ${attr.key} created`);
  } catch (error: any) {
    if (error.code === 409) {
      console.log(`  ✓ Attribute ${attr.key} already exists`);
    } else {
      console.error(`  ✗ Error creating attribute ${attr.key}:`, error.message);
    }
  }
}

async function createIndex(collectionId: string, index: IndexConfig) {
  try {
    await databases.createIndex(
      DATABASE_ID,
      collectionId,
      index.key,
      index.type as any, // Type assertion needed for node-appwrite SDK
      index.attributes
    );
    console.log(`  ✓ Index ${index.key} created`);
  } catch (error: any) {
    if (error.code === 409) {
      console.log(`  ✓ Index ${index.key} already exists`);
    } else {
      console.error(`  ✗ Error creating index ${index.key}:`, error.message);
    }
  }
}

// Collection configurations
const collections: CollectionConfig[] = [
  {
    id: 'users_preferences',
    name: 'User Preferences',
    attributes: [
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'theme', type: 'string', size: 20, default: 'light' },
      { key: 'density', type: 'string', size: 20, default: 'comfortable' },
      { key: 'primaryColor', type: 'string', size: 7, default: '#2E5AAC' },
      { key: 'fontSize', type: 'string', size: 20, default: 'medium' },
      { key: 'sidebarCollapsed', type: 'boolean', default: false },
      { key: 'defaultView', type: 'string', size: 50, default: 'list' },
      { key: 'taskReminders', type: 'boolean', default: true },
      { key: 'dailySummary', type: 'boolean', default: true },
      { key: 'overdueAlerts', type: 'boolean', default: true },
      { key: 'quietHoursStart', type: 'string', size: 5 },
      { key: 'quietHoursEnd', type: 'string', size: 5 }
    ],
    indexes: [
      { key: 'userId_idx', type: 'unique', attributes: ['userId'] }
    ]
  },
  {
    id: 'projects',
    name: 'Projects',
    attributes: [
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'name', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', size: 10000 },
      { key: 'color', type: 'string', size: 7, default: '#2E5AAC' },
      { key: 'status', type: 'string', size: 50, default: 'active' },
      { key: 'parentId', type: 'string', size: 255 },
      { key: 'isExpanded', type: 'boolean', default: true },
      { key: 'startDate', type: 'datetime' },
      { key: 'endDate', type: 'datetime' },
      { key: 'labels', type: 'string', size: 1000, array: true },
      { key: 'position', type: 'integer', default: 0 }
    ],
    indexes: [
      { key: 'userId_idx', type: 'key', attributes: ['userId'] },
      { key: 'parentId_idx', type: 'key', attributes: ['parentId'] },
      { key: 'status_idx', type: 'key', attributes: ['status'] }
    ]
  },
  {
    id: 'epics',
    name: 'Epics',
    attributes: [
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'projectId', type: 'string', size: 255 },
      { key: 'name', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', size: 10000 },
      { key: 'parentEpicId', type: 'string', size: 255 },
      { key: 'startDate', type: 'datetime' },
      { key: 'endDate', type: 'datetime' },
      { key: 'status', type: 'string', size: 50, default: 'planning' },
      { key: 'progressPercentage', type: 'integer', default: 0 }
    ],
    indexes: [
      { key: 'userId_idx', type: 'key', attributes: ['userId'] },
      { key: 'projectId_idx', type: 'key', attributes: ['projectId'] }
    ]
  },
  {
    id: 'tasks',
    name: 'Tasks',
    attributes: [
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'title', type: 'string', size: 500, required: true },
      { key: 'description', type: 'string', size: 10000 },
      { key: 'completed', type: 'boolean', default: false },
      { key: 'priority', type: 'integer', default: 4, min: 1, max: 4 },
      { key: 'dueDate', type: 'datetime' },
      { key: 'startDate', type: 'datetime' },
      { key: 'completedAt', type: 'datetime' },
      { key: 'projectId', type: 'string', size: 255 },
      { key: 'epicId', type: 'string', size: 255 },
      { key: 'parentId', type: 'string', size: 255 },
      { key: 'assignee', type: 'string', size: 255 },
      { key: 'labels', type: 'string', size: 100, array: true },
      { key: 'dependencies', type: 'string', size: 255, array: true },
      { key: 'estimatedTime', type: 'integer' },
      { key: 'actualTime', type: 'integer' },
      { key: 'position', type: 'integer', default: 0 },
      { key: 'customFields', type: 'string', size: 5000 }
    ],
    indexes: [
      { key: 'userId_idx', type: 'key', attributes: ['userId'] },
      { key: 'projectId_idx', type: 'key', attributes: ['projectId'] },
      { key: 'epicId_idx', type: 'key', attributes: ['epicId'] },
      { key: 'dueDate_idx', type: 'key', attributes: ['dueDate'] },
      { key: 'completed_idx', type: 'key', attributes: ['completed'] },
      { key: 'priority_idx', type: 'key', attributes: ['priority'] }
    ]
  }
];

const moreCollections: CollectionConfig[] = [
  {
    id: 'recurring_tasks',
    name: 'Recurring Tasks',
    attributes: [
      { key: 'taskId', type: 'string', size: 255, required: true },
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'recurrencePattern', type: 'string', size: 2000, required: true },
      { key: 'nextOccurrence', type: 'datetime' },
      { key: 'endDate', type: 'datetime' },
      { key: 'maxOccurrences', type: 'integer' },
      { key: 'occurrencesCount', type: 'integer', default: 0 }
    ],
    indexes: [
      { key: 'taskId_idx', type: 'unique', attributes: ['taskId'] },
      { key: 'userId_idx', type: 'key', attributes: ['userId'] }
    ]
  },
  {
    id: 'labels',
    name: 'Labels',
    attributes: [
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'name', type: 'string', size: 100, required: true },
      { key: 'color', type: 'string', size: 7, default: '#F2994A' }
    ],
    indexes: [
      { key: 'userId_idx', type: 'key', attributes: ['userId'] }
    ]
  },
  {
    id: 'notes',
    name: 'Notes',
    attributes: [
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'title', type: 'string', size: 500, required: true },
      { key: 'content', type: 'string', size: 100000 },
      { key: 'contentHtml', type: 'string', size: 100000 },
      { key: 'parentId', type: 'string', size: 255 },
      { key: 'projectId', type: 'string', size: 255 },
      { key: 'isTemplate', type: 'boolean', default: false },
      { key: 'templateType', type: 'string', size: 50 },
      { key: 'tags', type: 'string', size: 100, array: true }
    ],
    indexes: [
      { key: 'userId_idx', type: 'key', attributes: ['userId'] },
      { key: 'projectId_idx', type: 'key', attributes: ['projectId'] },
      { key: 'parentId_idx', type: 'key', attributes: ['parentId'] }
    ]
  },
  {
    id: 'note_links',
    name: 'Note Links',
    attributes: [
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'sourceType', type: 'string', size: 50, required: true },
      { key: 'sourceId', type: 'string', size: 255, required: true },
      { key: 'targetType', type: 'string', size: 50, required: true },
      { key: 'targetId', type: 'string', size: 255, required: true },
      { key: 'linkText', type: 'string', size: 255 }
    ],
    indexes: [
      { key: 'source_idx', type: 'key', attributes: ['sourceType', 'sourceId'] },
      { key: 'target_idx', type: 'key', attributes: ['targetType', 'targetId'] }
    ]
  },
  {
    id: 'goals',
    name: 'Goals',
    attributes: [
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'title', type: 'string', size: 500, required: true },
      { key: 'description', type: 'string', size: 10000 },
      { key: 'goalType', type: 'string', size: 50, default: 'objective' },
      { key: 'parentGoalId', type: 'string', size: 255 },
      { key: 'targetValue', type: 'float' },
      { key: 'currentValue', type: 'float', default: 0 },
      { key: 'unit', type: 'string', size: 50 },
      { key: 'startDate', type: 'datetime' },
      { key: 'endDate', type: 'datetime' },
      { key: 'status', type: 'string', size: 50, default: 'active' },
      { key: 'progressPercentage', type: 'integer', default: 0 }
    ],
    indexes: [
      { key: 'userId_idx', type: 'key', attributes: ['userId'] },
      { key: 'parentGoalId_idx', type: 'key', attributes: ['parentGoalId'] }
    ]
  },
  {
    id: 'goal_links',
    name: 'Goal Links',
    attributes: [
      { key: 'goalId', type: 'string', size: 255, required: true },
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'entityType', type: 'string', size: 50, required: true },
      { key: 'entityId', type: 'string', size: 255, required: true },
      { key: 'contributionWeight', type: 'float', default: 1.0 }
    ],
    indexes: [
      { key: 'goalId_idx', type: 'key', attributes: ['goalId'] },
      { key: 'entity_idx', type: 'key', attributes: ['entityType', 'entityId'] }
    ]
  }
];

const additionalCollections: CollectionConfig[] = [
  {
    id: 'habits',
    name: 'Habits',
    attributes: [
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'name', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', size: 1000 },
      { key: 'frequency', type: 'string', size: 50, required: true },
      { key: 'targetCount', type: 'integer', default: 1 },
      { key: 'customSchedule', type: 'string', size: 500 },
      { key: 'currentStreak', type: 'integer', default: 0 },
      { key: 'longestStreak', type: 'integer', default: 0 },
      { key: 'archived', type: 'boolean', default: false }
    ],
    indexes: [
      { key: 'userId_idx', type: 'key', attributes: ['userId'] }
    ]
  },
  {
    id: 'habit_completions',
    name: 'Habit Completions',
    attributes: [
      { key: 'habitId', type: 'string', size: 255, required: true },
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'completedAt', type: 'datetime', required: true },
      { key: 'notes', type: 'string', size: 1000 }
    ],
    indexes: [
      { key: 'habitId_idx', type: 'key', attributes: ['habitId'] },
      { key: 'completedAt_idx', type: 'key', attributes: ['completedAt'] }
    ]
  },
  {
    id: 'wellbeing_logs',
    name: 'Wellbeing Logs',
    attributes: [
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'logDate', type: 'datetime', required: true },
      { key: 'sleepQuality', type: 'integer', min: 1, max: 5 },
      { key: 'energyLevel', type: 'integer', min: 1, max: 5 },
      { key: 'mood', type: 'integer', min: 1, max: 5 },
      { key: 'notes', type: 'string', size: 1000 }
    ],
    indexes: [
      { key: 'userId_idx', type: 'key', attributes: ['userId'] }
    ]
  },
  {
    id: 'focus_sessions',
    name: 'Focus Sessions',
    attributes: [
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'taskId', type: 'string', size: 255 },
      { key: 'startTime', type: 'datetime', required: true },
      { key: 'endTime', type: 'datetime' },
      { key: 'durationMinutes', type: 'integer' },
      { key: 'sessionType', type: 'string', size: 50, default: 'pomodoro' },
      { key: 'wasCompleted', type: 'boolean', default: false },
      { key: 'notes', type: 'string', size: 1000 }
    ],
    indexes: [
      { key: 'userId_idx', type: 'key', attributes: ['userId'] },
      { key: 'taskId_idx', type: 'key', attributes: ['taskId'] },
      { key: 'startTime_idx', type: 'key', attributes: ['startTime'] }
    ]
  },
  {
    id: 'time_entries',
    name: 'Time Entries',
    attributes: [
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'taskId', type: 'string', size: 255 },
      { key: 'projectId', type: 'string', size: 255 },
      { key: 'startTime', type: 'datetime', required: true },
      { key: 'endTime', type: 'datetime' },
      { key: 'durationMinutes', type: 'integer' },
      { key: 'description', type: 'string', size: 1000 },
      { key: 'isBillable', type: 'boolean', default: false }
    ],
    indexes: [
      { key: 'userId_idx', type: 'key', attributes: ['userId'] },
      { key: 'taskId_idx', type: 'key', attributes: ['taskId'] },
      { key: 'projectId_idx', type: 'key', attributes: ['projectId'] },
      { key: 'startTime_idx', type: 'key', attributes: ['startTime'] }
    ]
  },
  {
    id: 'automation_rules',
    name: 'Automation Rules',
    attributes: [
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'name', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', size: 1000 },
      { key: 'triggerType', type: 'string', size: 100, required: true },
      { key: 'triggerConditions', type: 'string', size: 5000 },
      { key: 'actions', type: 'string', size: 5000, required: true },
      { key: 'isEnabled', type: 'boolean', default: true },
      { key: 'priority', type: 'integer', default: 0 },
      { key: 'executionCount', type: 'integer', default: 0 },
      { key: 'lastExecutedAt', type: 'datetime' }
    ],
    indexes: [
      { key: 'userId_idx', type: 'key', attributes: ['userId'] },
      { key: 'isEnabled_idx', type: 'key', attributes: ['isEnabled'] }
    ]
  }
];

const finalCollections: CollectionConfig[] = [
  {
    id: 'saved_filters',
    name: 'Saved Filters',
    attributes: [
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'name', type: 'string', size: 255, required: true },
      { key: 'icon', type: 'string', size: 50 },
      { key: 'filterDefinition', type: 'string', size: 5000, required: true },
      { key: 'isFavorite', type: 'boolean', default: false },
      { key: 'position', type: 'integer', default: 0 }
    ],
    indexes: [
      { key: 'userId_idx', type: 'key', attributes: ['userId'] }
    ]
  },
  {
    id: 'templates',
    name: 'Templates',
    attributes: [
      { key: 'userId', type: 'string', size: 255 },
      { key: 'name', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', size: 1000 },
      { key: 'templateType', type: 'string', size: 50, required: true },
      { key: 'templateData', type: 'string', size: 50000, required: true },
      { key: 'isPublic', type: 'boolean', default: false },
      { key: 'usageCount', type: 'integer', default: 0 }
    ],
    indexes: [
      { key: 'userId_idx', type: 'key', attributes: ['userId'] },
      { key: 'isPublic_idx', type: 'key', attributes: ['isPublic'] }
    ]
  },
  {
    id: 'integrations',
    name: 'Integrations',
    attributes: [
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'integrationType', type: 'string', size: 50, required: true },
      { key: 'config', type: 'string', size: 10000, required: true },
      { key: 'isActive', type: 'boolean', default: true },
      { key: 'lastSyncAt', type: 'datetime' },
      { key: 'syncStatus', type: 'string', size: 50 },
      { key: 'errorMessage', type: 'string', size: 1000 }
    ],
    indexes: [
      { key: 'userId_idx', type: 'key', attributes: ['userId'] }
    ]
  },
  {
    id: 'weekly_reviews',
    name: 'Weekly Reviews',
    attributes: [
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'weekStartDate', type: 'datetime', required: true },
      { key: 'weekEndDate', type: 'datetime', required: true },
      { key: 'summaryData', type: 'string', size: 50000, required: true },
      { key: 'aiInsights', type: 'string', size: 10000 },
      { key: 'userNotes', type: 'string', size: 5000 }
    ],
    indexes: [
      { key: 'userId_idx', type: 'key', attributes: ['userId'] }
    ]
  }
];

async function main() {
  console.log('=== Appwrite Database Setup ===\n');
  
  // Validate environment variables
  if (!process.env.VITE_APPWRITE_ENDPOINT || !process.env.VITE_APPWRITE_PROJECT_ID || !process.env.APPWRITE_API_KEY) {
    console.error('Error: Missing required environment variables');
    console.error('Please ensure the following are set in .env.local:');
    console.error('  - VITE_APPWRITE_ENDPOINT');
    console.error('  - VITE_APPWRITE_PROJECT_ID');
    console.error('  - APPWRITE_API_KEY');
    process.exit(1);
  }

  try {
    // Create database
    await createDatabase();

    // Create all collections
    const allCollections = [
      ...collections,
      ...moreCollections,
      ...additionalCollections,
      ...finalCollections
    ];

    for (const collection of allCollections) {
      await createCollection(collection);
    }

    console.log('\n=== Setup Complete ===');
    console.log(`✓ Database: ${DATABASE_ID}`);
    console.log(`✓ Collections: ${allCollections.length}`);
    console.log('\nYou can now use the Appwrite database in your application.');
  } catch (error) {
    console.error('\n✗ Setup failed:', error);
    process.exit(1);
  }
}

main();
