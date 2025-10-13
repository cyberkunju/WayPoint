import { databaseService, Query } from './database.service';
import { COLLECTIONS } from '@/lib/appwrite';
import { ID, type Models } from 'appwrite';

/**
 * Recurrence pattern types
 */
export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

export interface RecurrencePattern {
  frequency: RecurrenceFrequency;
  interval: number; // e.g., every 2 weeks
  daysOfWeek?: number[]; // 0-6 (Sunday-Saturday) for weekly
  dayOfMonth?: number; // 1-31 for monthly
  monthOfYear?: number; // 1-12 for yearly
  customRule?: string; // For complex patterns
}

/**
 * Recurring task document interface
 */
export interface RecurringTaskDocument {
  taskId: string;
  userId: string;
  recurrencePattern: string; // JSON string of RecurrencePattern
  nextOccurrence?: string; // ISO date string
  endDate?: string; // ISO date string
  maxOccurrences?: number;
  occurrencesCount: number;
}

/**
 * Recurring task with Appwrite metadata
 */
export type RecurringTask = Models.Document & RecurringTaskDocument;

/**
 * Recurring task creation data
 */
export type CreateRecurringTaskData = Omit<RecurringTaskDocument, 'userId' | 'occurrencesCount'> & {
  userId?: string;
  occurrencesCount?: number;
};

/**
 * Recurring task update data
 */
export type UpdateRecurringTaskData = Partial<Omit<RecurringTaskDocument, 'userId' | 'taskId'>>;

/**
 * Recurring Tasks Service
 * Handles recurring task operations with Appwrite
 */
export class RecurringTasksService {
  private readonly collectionId = COLLECTIONS.RECURRING_TASKS;

  /**
   * Create a recurring task configuration
   */
  async createRecurringTask(
    data: CreateRecurringTaskData,
    userId: string,
    permissions?: string[]
  ): Promise<RecurringTask> {
    try {
      const recurringTaskData: RecurringTaskDocument = {
        taskId: data.taskId,
        userId,
        recurrencePattern: data.recurrencePattern,
        nextOccurrence: data.nextOccurrence,
        endDate: data.endDate,
        maxOccurrences: data.maxOccurrences,
        occurrencesCount: data.occurrencesCount ?? 0,
      };

      // Set default permissions if not provided
      const taskPermissions = permissions || [
        `read("user:${userId}")`,
        `update("user:${userId}")`,
        `delete("user:${userId}")`,
      ];

      return await databaseService.createDocument<Record<string, unknown>>(
        this.collectionId,
        recurringTaskData as unknown as Record<string, unknown>,
        ID.unique(),
        taskPermissions
      ) as unknown as RecurringTask;
    } catch (error) {
      console.error('Create recurring task error:', error);
      throw error;
    }
  }

  /**
   * Get recurring task by task ID
   */
  async getRecurringTaskByTaskId(taskId: string, userId?: string): Promise<RecurringTask | null> {
    try {
      const queries = [Query.equal('taskId', taskId)];
      if (userId) {
        queries.push(Query.equal('userId', userId));
      }

      const result = await databaseService.listDocuments<Record<string, unknown>>(
        this.collectionId,
        queries
      );

      return result.documents.length > 0 ? result.documents[0] as unknown as RecurringTask : null;
    } catch (error) {
      console.error('Get recurring task by task ID error:', error);
      throw error;
    }
  }

  /**
   * Get recurring task by ID
   */
  async getRecurringTask(recurringTaskId: string): Promise<RecurringTask> {
    try {
      return await databaseService.getDocument<Record<string, unknown>>(
        this.collectionId,
        recurringTaskId
      ) as unknown as RecurringTask;
    } catch (error) {
      console.error('Get recurring task error:', error);
      throw error;
    }
  }

  /**
   * Update recurring task
   */
  async updateRecurringTask(
    recurringTaskId: string,
    data: UpdateRecurringTaskData,
    permissions?: string[]
  ): Promise<RecurringTask> {
    try {
      return await databaseService.updateDocument<Record<string, unknown>>(
        this.collectionId,
        recurringTaskId,
        data as unknown as Record<string, unknown>,
        permissions
      ) as unknown as RecurringTask;
    } catch (error) {
      console.error('Update recurring task error:', error);
      throw error;
    }
  }

  /**
   * Delete recurring task
   */
  async deleteRecurringTask(recurringTaskId: string): Promise<void> {
    try {
      await databaseService.deleteDocument(this.collectionId, recurringTaskId);
    } catch (error) {
      console.error('Delete recurring task error:', error);
      throw error;
    }
  }

  /**
   * Delete recurring task by task ID
   */
  async deleteRecurringTaskByTaskId(taskId: string, userId: string): Promise<void> {
    try {
      const recurringTask = await this.getRecurringTaskByTaskId(taskId, userId);
      if (recurringTask) {
        await this.deleteRecurringTask(recurringTask.$id);
      }
    } catch (error) {
      console.error('Delete recurring task by task ID error:', error);
      throw error;
    }
  }

  /**
   * List all recurring tasks for a user
   */
  async listRecurringTasks(userId: string): Promise<RecurringTask[]> {
    try {
      const queries = [Query.equal('userId', userId)];
      const result = await databaseService.listDocuments<Record<string, unknown>>(
        this.collectionId,
        queries
      );
      return result.documents as unknown as RecurringTask[];
    } catch (error) {
      console.error('List recurring tasks error:', error);
      throw error;
    }
  }

  /**
   * Get recurring tasks that need processing (nextOccurrence is in the past)
   */
  async getRecurringTasksDueForProcessing(): Promise<RecurringTask[]> {
    try {
      const now = new Date().toISOString();
      const queries = [
        Query.lessThanEqual('nextOccurrence', now),
        Query.limit(100), // Process in batches
      ];

      const result = await databaseService.listDocuments<Record<string, unknown>>(
        this.collectionId,
        queries
      );

      return result.documents as unknown as RecurringTask[];
    } catch (error) {
      console.error('Get recurring tasks due for processing error:', error);
      throw error;
    }
  }

  /**
   * Calculate next occurrence date based on recurrence pattern
   */
  calculateNextOccurrence(
    pattern: RecurrencePattern,
    fromDate: Date = new Date()
  ): Date {
    const nextDate = new Date(fromDate);

    switch (pattern.frequency) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + (pattern.interval || 1));
        break;

      case 'weekly': {
        const currentDay = nextDate.getDay();
        const daysOfWeek = pattern.daysOfWeek || [currentDay];
        
        // Find next occurrence day
        let daysToAdd = 0;
        let found = false;
        
        for (let i = 1; i <= 7; i++) {
          const checkDay = (currentDay + i) % 7;
          if (daysOfWeek.includes(checkDay)) {
            daysToAdd = i;
            found = true;
            break;
          }
        }
        
        if (!found) {
          daysToAdd = 7 * (pattern.interval || 1);
        }
        
        nextDate.setDate(nextDate.getDate() + daysToAdd);
        break;
      }

      case 'monthly': {
        const dayOfMonth = pattern.dayOfMonth || fromDate.getDate();
        nextDate.setMonth(nextDate.getMonth() + (pattern.interval || 1), dayOfMonth);
        
        break;
      }

      case 'yearly': {
        nextDate.setFullYear(nextDate.getFullYear() + (pattern.interval || 1));
        if (pattern.monthOfYear) {
          nextDate.setMonth(pattern.monthOfYear - 1);
        }
        if (pattern.dayOfMonth) {
          const lastDayOfMonth = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate();
          nextDate.setDate(Math.min(pattern.dayOfMonth, lastDayOfMonth));
        }
        break;
      }

      case 'custom':
        // For custom patterns, implement specific logic based on customRule
        // This is a placeholder for complex patterns
        console.warn('Custom recurrence patterns not fully implemented');
        nextDate.setDate(nextDate.getDate() + 1);
        break;
    }

    return nextDate;
  }

  /**
   * Parse recurrence pattern from JSON string
   */
  parseRecurrencePattern(patternJson: string): RecurrencePattern {
    try {
      return JSON.parse(patternJson) as RecurrencePattern;
    } catch (error) {
      console.error('Parse recurrence pattern error:', error);
      throw new Error('Invalid recurrence pattern JSON');
    }
  }

  /**
   * Stringify recurrence pattern to JSON
   */
  stringifyRecurrencePattern(pattern: RecurrencePattern): string {
    return JSON.stringify(pattern);
  }

  /**
   * Check if recurring task should continue (not reached end date or max occurrences)
   */
  shouldContinueRecurrence(recurringTask: RecurringTask): boolean {
    // Check max occurrences
    if (recurringTask.maxOccurrences && recurringTask.occurrencesCount >= recurringTask.maxOccurrences) {
      return false;
    }

    // Check end date
    if (recurringTask.endDate) {
      const endDate = new Date(recurringTask.endDate);
      const now = new Date();
      if (now > endDate) {
        return false;
      }
    }

    return true;
  }

  /**
   * Increment occurrence count
   */
  async incrementOccurrenceCount(recurringTaskId: string): Promise<RecurringTask> {
    try {
      const recurringTask = await this.getRecurringTask(recurringTaskId);
      return await this.updateRecurringTask(recurringTaskId, {
        occurrencesCount: recurringTask.occurrencesCount + 1,
      });
    } catch (error) {
      console.error('Increment occurrence count error:', error);
      throw error;
    }
  }

  /**
   * Update next occurrence date
   */
  async updateNextOccurrence(recurringTaskId: string, nextOccurrence: Date): Promise<RecurringTask> {
    try {
      return await this.updateRecurringTask(recurringTaskId, {
        nextOccurrence: nextOccurrence.toISOString(),
      });
    } catch (error) {
      console.error('Update next occurrence error:', error);
      throw error;
    }
  }

  /**
   * Create a human-readable description of the recurrence pattern
   */
  getRecurrenceDescription(pattern: RecurrencePattern): string {
    const interval = pattern.interval || 1;
    const intervalText = interval > 1 ? `every ${interval}` : 'every';

    switch (pattern.frequency) {
      case 'daily':
        return interval === 1 ? 'Daily' : `Every ${interval} days`;

      case 'weekly': {
        if (!pattern.daysOfWeek || pattern.daysOfWeek.length === 0) {
          return interval === 1 ? 'Weekly' : `Every ${interval} weeks`;
        }
        
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const days = pattern.daysOfWeek.map(d => dayNames[d]).join(', ');
        return `${intervalText === 'every' ? 'Every' : intervalText} week on ${days}`;
      }

      case 'monthly': {
        const day = pattern.dayOfMonth || 1;
        const suffix = day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th';
        return `${intervalText === 'every' ? 'Every' : intervalText} month on the ${day}${suffix}`;
      }

      case 'yearly': {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                           'July', 'August', 'September', 'October', 'November', 'December'];
        const month = pattern.monthOfYear ? monthNames[pattern.monthOfYear - 1] : '';
        const day = pattern.dayOfMonth || 1;
        const suffix = day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th';
        return `${intervalText === 'every' ? 'Every' : intervalText} year${month ? ` on ${month} ${day}${suffix}` : ''}`;
      }

      case 'custom':
        return pattern.customRule || 'Custom recurrence';

      default:
        return 'Unknown recurrence';
    }
  }

  /**
   * Validate recurrence pattern
   */
  validateRecurrencePattern(pattern: RecurrencePattern): { valid: boolean; error?: string } {
    if (!pattern.frequency) {
      return { valid: false, error: 'Frequency is required' };
    }

    if (pattern.interval < 1) {
      return { valid: false, error: 'Interval must be at least 1' };
    }

    if (pattern.frequency === 'weekly' && pattern.daysOfWeek) {
      if (pattern.daysOfWeek.some(d => d < 0 || d > 6)) {
        return { valid: false, error: 'Days of week must be between 0 and 6' };
      }
    }

    if (pattern.frequency === 'monthly' && pattern.dayOfMonth) {
      if (pattern.dayOfMonth < 1 || pattern.dayOfMonth > 31) {
        return { valid: false, error: 'Day of month must be between 1 and 31' };
      }
    }

    if (pattern.frequency === 'yearly') {
      if (pattern.monthOfYear && (pattern.monthOfYear < 1 || pattern.monthOfYear > 12)) {
        return { valid: false, error: 'Month of year must be between 1 and 12' };
      }
      if (pattern.dayOfMonth && (pattern.dayOfMonth < 1 || pattern.dayOfMonth > 31)) {
        return { valid: false, error: 'Day of month must be between 1 and 31' };
      }
    }

    return { valid: true };
  }
}

// Export singleton instance
export const recurringTasksService = new RecurringTasksService();
