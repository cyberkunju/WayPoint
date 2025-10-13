import { databaseService } from '@/services/database.service';
import { COLLECTIONS } from '@/lib/appwrite';
import { Task, Project, Label } from '@/lib/types';
import { Permission, Role } from 'appwrite';

/**
 * Migration Utility
 * Handles migration of localStorage data to Appwrite backend
 */

export interface LocalStorageData {
  tasks: Task[];
  projects: Project[];
  labels: Label[];
}

export interface MigrationStatus {
  hasLocalData: boolean;
  taskCount: number;
  projectCount: number;
  labelCount: number;
  migrationCompleted: boolean;
  migrationDate?: string;
}

export interface MigrationResult {
  success: boolean;
  tasksCreated: number;
  projectsCreated: number;
  labelsCreated: number;
  errors: string[];
}

const MIGRATION_STATUS_KEY = 'clarity-migration-status';
const TASK_STORAGE_KEY = 'clarity-task-storage';
const USER_STORAGE_KEY = 'clarity-user-storage';

/**
 * Detect if there is existing localStorage data
 */
export function detectLocalStorageData(): MigrationStatus {
  try {
    // Check if migration was already completed
    const migrationStatusStr = localStorage.getItem(MIGRATION_STATUS_KEY);
    if (migrationStatusStr) {
      const status = JSON.parse(migrationStatusStr) as MigrationStatus;
      if (status.migrationCompleted) {
        return status;
      }
    }

    // Check for task storage data
    const taskStorageStr = localStorage.getItem(TASK_STORAGE_KEY);
    if (!taskStorageStr) {
      return {
        hasLocalData: false,
        taskCount: 0,
        projectCount: 0,
        labelCount: 0,
        migrationCompleted: false,
      };
    }

    const taskStorage = JSON.parse(taskStorageStr);
    const state = taskStorage.state || {};

    return {
      hasLocalData: true,
      taskCount: state.tasks?.length || 0,
      projectCount: state.projects?.length || 0,
      labelCount: state.labels?.length || 0,
      migrationCompleted: false,
    };
  } catch (error) {
    console.error('Error detecting localStorage data:', error);
    return {
      hasLocalData: false,
      taskCount: 0,
      projectCount: 0,
      labelCount: 0,
      migrationCompleted: false,
    };
  }
}

/**
 * Get localStorage data for migration
 */
export function getLocalStorageData(): LocalStorageData | null {
  try {
    const taskStorageStr = localStorage.getItem(TASK_STORAGE_KEY);
    if (!taskStorageStr) {
      return null;
    }

    const taskStorage = JSON.parse(taskStorageStr);
    const state = taskStorage.state || {};

    return {
      tasks: state.tasks || [],
      projects: state.projects || [],
      labels: state.labels || [],
    };
  } catch (error) {
    console.error('Error getting localStorage data:', error);
    return null;
  }
}

/**
 * Transform localStorage task to Appwrite format
 */
function transformTaskToAppwrite(task: Task, userId: string) {
  return {
    userId,
    title: task.title,
    description: task.description || '',
    completed: task.completed,
    priority: task.priority,
    dueDate: task.dueDate || null,
    startDate: task.startDate || null,
    completedAt: task.completed ? task.updatedAt : null,
    projectId: task.projectId || null,
    epicId: null, // Not in localStorage format
    parentId: task.parentId || null,
    assignee: task.assignee || null,
    labels: task.labels || [],
    dependencies: task.dependencies || [],
    estimatedTime: task.estimatedTime || null,
    actualTime: task.actualTime || null,
    position: 0,
    customFields: null,
  };
}

/**
 * Transform localStorage project to Appwrite format
 */
function transformProjectToAppwrite(project: Project, userId: string) {
  return {
    userId,
    name: project.name,
    description: project.description || '',
    color: project.color,
    status: 'active',
    parentId: project.parentId || null,
    isExpanded: project.isExpanded,
    startDate: null,
    endDate: null,
    labels: [],
    position: 0,
  };
}

/**
 * Transform localStorage label to Appwrite format
 */
function transformLabelToAppwrite(label: Label, userId: string) {
  return {
    userId,
    name: label.name,
    color: label.color,
  };
}

/**
 * Migrate data to Appwrite
 */
export async function migrateToAppwrite(
  userId: string,
  onProgress?: (message: string, progress: number) => void
): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: false,
    tasksCreated: 0,
    projectsCreated: 0,
    labelsCreated: 0,
    errors: [],
  };

  try {
    onProgress?.('Starting migration...', 0);

    // Get localStorage data
    const localData = getLocalStorageData();
    if (!localData) {
      throw new Error('No localStorage data found');
    }

    const totalItems =
      localData.labels.length + localData.projects.length + localData.tasks.length;
    let processedItems = 0;

    // Set up permissions for user-only access
    const permissions = [
      Permission.read(Role.user(userId)),
      Permission.update(Role.user(userId)),
      Permission.delete(Role.user(userId)),
    ];

    // Step 1: Migrate labels first (no dependencies)
    onProgress?.('Migrating labels...', 10);
    if (localData.labels.length > 0) {
      try {
        const labelData = localData.labels.map((label) =>
          transformLabelToAppwrite(label, userId)
        );

        // Batch create labels
        const createdLabels = await databaseService.batchCreateDocuments(
          COLLECTIONS.LABELS,
          labelData,
          permissions
        );

        result.labelsCreated = createdLabels.length;
        processedItems += localData.labels.length;
        onProgress?.(
          `Migrated ${result.labelsCreated} labels`,
          (processedItems / totalItems) * 100
        );
      } catch (error) {
        const errorMsg = `Failed to migrate labels: ${error}`;
        console.error(errorMsg);
        result.errors.push(errorMsg);
      }
    }

    // Step 2: Migrate projects (no dependencies on tasks)
    onProgress?.('Migrating projects...', 30);
    if (localData.projects.length > 0) {
      try {
        const projectData = localData.projects.map((project) =>
          transformProjectToAppwrite(project, userId)
        );

        // Batch create projects
        const createdProjects = await databaseService.batchCreateDocuments(
          COLLECTIONS.PROJECTS,
          projectData,
          permissions
        );

        result.projectsCreated = createdProjects.length;
        processedItems += localData.projects.length;
        onProgress?.(
          `Migrated ${result.projectsCreated} projects`,
          (processedItems / totalItems) * 100
        );
      } catch (error) {
        const errorMsg = `Failed to migrate projects: ${error}`;
        console.error(errorMsg);
        result.errors.push(errorMsg);
      }
    }

    // Step 3: Migrate tasks (depends on projects and labels)
    onProgress?.('Migrating tasks...', 60);
    if (localData.tasks.length > 0) {
      try {
        const taskData = localData.tasks.map((task) =>
          transformTaskToAppwrite(task, userId)
        );

        // Batch create tasks in chunks to avoid overwhelming the API
        const BATCH_SIZE = 50;
        let tasksCreated = 0;

        for (let i = 0; i < taskData.length; i += BATCH_SIZE) {
          const batch = taskData.slice(i, i + BATCH_SIZE);
          const createdTasks = await databaseService.batchCreateDocuments(
            COLLECTIONS.TASKS,
            batch,
            permissions
          );

          tasksCreated += createdTasks.length;
          processedItems += batch.length;

          onProgress?.(
            `Migrated ${tasksCreated}/${taskData.length} tasks`,
            (processedItems / totalItems) * 100
          );
        }

        result.tasksCreated = tasksCreated;
      } catch (error) {
        const errorMsg = `Failed to migrate tasks: ${error}`;
        console.error(errorMsg);
        result.errors.push(errorMsg);
      }
    }

    // Step 4: Verify migration
    onProgress?.('Verifying migration...', 95);
    const verification = await verifyMigration(userId);

    if (!verification.success) {
      result.errors.push(...verification.errors);
    }

    // Mark migration as successful if no critical errors
    result.success = result.errors.length === 0;

    onProgress?.('Migration complete!', 100);

    return result;
  } catch (error) {
    console.error('Migration error:', error);
    result.errors.push(`Migration failed: ${error}`);
    return result;
  }
}

/**
 * Verify migration success
 */
export async function verifyMigration(userId: string): Promise<{
  success: boolean;
  errors: string[];
  counts: {
    tasks: number;
    projects: number;
    labels: number;
  };
}> {
  const errors: string[] = [];
  const counts = {
    tasks: 0,
    projects: 0,
    labels: 0,
  };

  try {
    // Count migrated items
    counts.labels = await databaseService.countDocuments(COLLECTIONS.LABELS, [
      `userId="${userId}"`,
    ]);

    counts.projects = await databaseService.countDocuments(COLLECTIONS.PROJECTS, [
      `userId="${userId}"`,
    ]);

    counts.tasks = await databaseService.countDocuments(COLLECTIONS.TASKS, [
      `userId="${userId}"`,
    ]);

    // Get original counts
    const localData = getLocalStorageData();
    if (localData) {
      if (counts.labels !== localData.labels.length) {
        errors.push(
          `Label count mismatch: expected ${localData.labels.length}, got ${counts.labels}`
        );
      }

      if (counts.projects !== localData.projects.length) {
        errors.push(
          `Project count mismatch: expected ${localData.projects.length}, got ${counts.projects}`
        );
      }

      if (counts.tasks !== localData.tasks.length) {
        errors.push(
          `Task count mismatch: expected ${localData.tasks.length}, got ${counts.tasks}`
        );
      }
    }

    return {
      success: errors.length === 0,
      errors,
      counts,
    };
  } catch (error) {
    console.error('Verification error:', error);
    return {
      success: false,
      errors: [`Verification failed: ${error}`],
      counts,
    };
  }
}

/**
 * Mark migration as complete
 */
export function markMigrationComplete(status: MigrationStatus): void {
  try {
    const completedStatus: MigrationStatus = {
      ...status,
      migrationCompleted: true,
      migrationDate: new Date().toISOString(),
    };

    localStorage.setItem(MIGRATION_STATUS_KEY, JSON.stringify(completedStatus));
  } catch (error) {
    console.error('Error marking migration complete:', error);
  }
}

/**
 * Clear localStorage data after successful migration
 */
export function clearLocalStorageData(): void {
  try {
    // Keep migration status but clear task data
    localStorage.removeItem(TASK_STORAGE_KEY);
    console.log('Cleared localStorage task data');
  } catch (error) {
    console.error('Error clearing localStorage data:', error);
  }
}

/**
 * Reset migration status (for testing or re-migration)
 */
export function resetMigrationStatus(): void {
  try {
    localStorage.removeItem(MIGRATION_STATUS_KEY);
    console.log('Reset migration status');
  } catch (error) {
    console.error('Error resetting migration status:', error);
  }
}

/**
 * Get migration status
 */
export function getMigrationStatus(): MigrationStatus {
  return detectLocalStorageData();
}
