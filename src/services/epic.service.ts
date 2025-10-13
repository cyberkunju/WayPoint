import { databaseService, Query } from './database.service';
import { taskService } from './task.service';
import { COLLECTIONS } from '@/lib/appwrite';
import { ID, type Models } from 'appwrite';

/**
 * Epic interface matching Appwrite collection schema
 */
export interface EpicDocument {
  userId: string;
  projectId?: string;
  name: string;
  description?: string;
  parentEpicId?: string;
  startDate?: string;
  endDate?: string;
  status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'archived' | 'blocked';
  progressPercentage: number;
}

/**
 * Epic with Appwrite metadata
 */
export type Epic = Models.Document & EpicDocument;

/**
 * Epic creation data (without Appwrite metadata)
 */
export type CreateEpicData = Omit<EpicDocument, 'userId' | 'progressPercentage'> & {
  userId?: string; // Optional, will be set by service if not provided
  progressPercentage?: number; // Optional, defaults to 0
};

/**
 * Epic update data (partial)
 */
export type UpdateEpicData = Partial<Omit<EpicDocument, 'userId'>>;

/**
 * Epic filter options
 */
export interface EpicFilters {
  userId?: string;
  projectId?: string;
  parentEpicId?: string;
  status?: string | string[];
  search?: string;
  limit?: number;
  offset?: number;
  orderBy?: 'name' | 'createdAt' | 'updatedAt' | 'startDate' | 'endDate' | 'progressPercentage';
  orderDirection?: 'asc' | 'desc';
}

/**
 * Epic statistics
 */
export interface EpicStatistics {
  totalTasks: number;
  completedTasks: number;
  incompleteTasks: number;
  inProgressTasks: number;
  blockedTasks: number;
  overdueTasks: number;
  completionRate: number;
  estimatedTime: number;
  actualTime: number;
  timeVariance: number;
}

/**
 * Epic with tasks
 */
export interface EpicWithTasks extends Epic {
  tasks: Array<Models.Document & {
    userId: string;
    title: string;
    completed: boolean;
    priority: number;
    dueDate?: string;
    epicId?: string;
  }>;
  statistics: EpicStatistics;
}

/**
 * Epic Service
 * Handles all epic-related operations with Appwrite
 */
export class EpicService {
  private readonly collectionId = COLLECTIONS.EPICS;

  /**
   * Create a new epic
   */
  async createEpic(
    data: CreateEpicData,
    userId: string,
    permissions?: string[]
  ): Promise<Epic> {
    try {
      const epicData: EpicDocument = {
        userId,
        projectId: data.projectId,
        name: data.name,
        description: data.description,
        parentEpicId: data.parentEpicId,
        startDate: data.startDate,
        endDate: data.endDate,
        status: data.status ?? 'planning',
        progressPercentage: data.progressPercentage ?? 0,
      };

      // Set default permissions if not provided
      const epicPermissions = permissions || [
        `read("user:${userId}")`,
        `update("user:${userId}")`,
        `delete("user:${userId}")`,
      ];

      return await databaseService.createDocument<Record<string, unknown>>(
        this.collectionId,
        epicData as unknown as Record<string, unknown>,
        ID.unique(),
        epicPermissions
      ) as unknown as Epic;
    } catch (error) {
      console.error('Create epic error:', error);
      throw error;
    }
  }

  /**
   * Get an epic by ID
   */
  async getEpic(epicId: string, userId?: string): Promise<Epic> {
    try {
      const queries = userId ? [Query.equal('userId', userId)] : undefined;
      return await databaseService.getDocument<Record<string, unknown>>(
        this.collectionId,
        epicId,
        queries
      ) as unknown as Epic;
    } catch (error) {
      console.error('Get epic error:', error);
      throw error;
    }
  }

  /**
   * Update an epic
   */
  async updateEpic(
    epicId: string,
    data: UpdateEpicData,
    permissions?: string[]
  ): Promise<Epic> {
    try {
      return await databaseService.updateDocument<Record<string, unknown>>(
        this.collectionId,
        epicId,
        data as unknown as Record<string, unknown>,
        permissions
      ) as unknown as Epic;
    } catch (error) {
      console.error('Update epic error:', error);
      throw error;
    }
  }

  /**
   * Delete an epic and all its tasks (cascade deletion)
   */
  async deleteEpic(epicId: string, userId: string): Promise<void> {
    try {
      // Get all tasks linked to this epic
      const tasks = await taskService.getTasksByEpic(epicId, userId);
      
      // Delete all tasks (including their subtasks)
      for (const task of tasks) {
        await taskService.deleteTaskWithSubtasks(task.$id, userId);
      }
      
      // Get all child epics
      const childEpics = await this.listEpics({ parentEpicId: epicId, userId });
      
      // Recursively delete child epics
      for (const childEpic of childEpics) {
        await this.deleteEpic(childEpic.$id, userId);
      }
      
      // Delete the epic itself
      await databaseService.deleteDocument(this.collectionId, epicId);
    } catch (error) {
      console.error('Delete epic error:', error);
      throw error;
    }
  }

  /**
   * List epics with filters
   */
  async listEpics(filters: EpicFilters = {}): Promise<Epic[]> {
    try {
      const queries: string[] = [];

      // User filter (required for security)
      if (filters.userId) {
        queries.push(Query.equal('userId', filters.userId));
      }

      // Project filter
      if (filters.projectId !== undefined) {
        if (filters.projectId === null || filters.projectId === '') {
          // Get epics not linked to any project
          queries.push(Query.isNull('projectId'));
        } else {
          queries.push(Query.equal('projectId', filters.projectId));
        }
      }

      // Parent epic filter (for nested epics)
      if (filters.parentEpicId !== undefined) {
        if (filters.parentEpicId === null || filters.parentEpicId === '') {
          // Get top-level epics (no parent)
          queries.push(Query.isNull('parentEpicId'));
        } else {
          queries.push(Query.equal('parentEpicId', filters.parentEpicId));
        }
      }

      // Status filter
      if (filters.status) {
        if (Array.isArray(filters.status)) {
          queries.push(Query.equal('status', filters.status));
        } else {
          queries.push(Query.equal('status', filters.status));
        }
      }

      // Search filter (searches in name and description)
      if (filters.search) {
        queries.push(Query.search('name', filters.search));
      }

      // Ordering
      if (filters.orderBy) {
        const direction = filters.orderDirection === 'desc' ? Query.orderDesc : Query.orderAsc;
        queries.push(direction(filters.orderBy));
      } else {
        // Default ordering by creation date
        queries.push(Query.orderDesc('$createdAt'));
      }

      // Pagination
      if (filters.limit) {
        queries.push(Query.limit(filters.limit));
      }
      if (filters.offset) {
        queries.push(Query.offset(filters.offset));
      }

      const result = await databaseService.listDocuments<Record<string, unknown>>(
        this.collectionId,
        queries
      );

      return result.documents as unknown as Epic[];
    } catch (error) {
      console.error('List epics error:', error);
      throw error;
    }
  }

  /**
   * Link a task to an epic
   */
  async linkTaskToEpic(taskId: string, epicId: string): Promise<void> {
    try {
      await taskService.updateTask(taskId, { epicId });
      
      // Recalculate epic progress
      const epic = await this.getEpic(epicId);
      await this.calculateAndUpdateEpicProgress(epicId, epic.userId);
    } catch (error) {
      console.error('Link task to epic error:', error);
      throw error;
    }
  }

  /**
   * Unlink a task from an epic
   */
  async unlinkTaskFromEpic(taskId: string): Promise<void> {
    try {
      // Get the task to find its epic
      const task = await taskService.getTask(taskId);
      const epicId = task.epicId;
      
      // Remove epic link
      await taskService.updateTask(taskId, { epicId: undefined });
      
      // Recalculate epic progress if it was linked
      if (epicId) {
        const epic = await this.getEpic(epicId);
        await this.calculateAndUpdateEpicProgress(epicId, epic.userId);
      }
    } catch (error) {
      console.error('Unlink task from epic error:', error);
      throw error;
    }
  }

  /**
   * Calculate epic progress based on linked tasks
   */
  async calculateEpicProgress(epicId: string, userId: string): Promise<number> {
    try {
      // Get all tasks linked to this epic
      const tasks = await taskService.getTasksByEpic(epicId, userId);
      
      if (tasks.length === 0) {
        return 0;
      }
      
      const completedTasks = tasks.filter(task => task.completed).length;
      const progressPercentage = Math.round((completedTasks / tasks.length) * 100);
      
      return progressPercentage;
    } catch (error) {
      console.error('Calculate epic progress error:', error);
      throw error;
    }
  }

  /**
   * Calculate and update epic progress
   */
  async calculateAndUpdateEpicProgress(epicId: string, userId: string): Promise<Epic> {
    try {
      const progressPercentage = await this.calculateEpicProgress(epicId, userId);
      return await this.updateEpic(epicId, { progressPercentage });
    } catch (error) {
      console.error('Calculate and update epic progress error:', error);
      throw error;
    }
  }

  /**
   * Get epic with all its tasks
   */
  async getEpicWithTasks(epicId: string, userId: string): Promise<EpicWithTasks> {
    try {
      // Get the epic
      const epic = await this.getEpic(epicId, userId);
      
      // Get all tasks for this epic
      const tasks = await taskService.getTasksByEpic(epicId, userId);
      
      // Calculate statistics
      const statistics = await this.calculateEpicStatistics(epicId, userId);
      
      return {
        ...epic,
        tasks,
        statistics,
      };
    } catch (error) {
      console.error('Get epic with tasks error:', error);
      throw error;
    }
  }

  /**
   * Calculate epic statistics
   */
  async calculateEpicStatistics(epicId: string, userId: string): Promise<EpicStatistics> {
    try {
      // Get all tasks for this epic
      const allTasks = await taskService.getTasksByEpic(epicId, userId);
      
      const totalTasks = allTasks.length;
      const completedTasks = allTasks.filter(task => task.completed).length;
      const incompleteTasks = totalTasks - completedTasks;
      
      // Calculate in-progress tasks
      const now = new Date().toISOString();
      const inProgressTasks = allTasks.filter(
        task => !task.completed && task.startDate && task.startDate <= now
      ).length;
      
      // Calculate blocked tasks (tasks with incomplete dependencies)
      // Note: This would require checking task dependencies
      const blockedTasks = 0; // Placeholder - implement when task dependencies are available
      
      // Calculate overdue tasks
      const overdueTasks = allTasks.filter(
        task => !task.completed && task.dueDate && task.dueDate < now
      ).length;
      
      // Calculate completion rate
      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      
      // Calculate time estimates
      const estimatedTime = allTasks.reduce((sum, task) => sum + (task.estimatedTime || 0), 0);
      const actualTime = allTasks.reduce((sum, task) => sum + (task.actualTime || 0), 0);
      const timeVariance = estimatedTime > 0 ? Math.round(((actualTime - estimatedTime) / estimatedTime) * 100) : 0;
      
      return {
        totalTasks,
        completedTasks,
        incompleteTasks,
        inProgressTasks,
        blockedTasks,
        overdueTasks,
        completionRate,
        estimatedTime,
        actualTime,
        timeVariance,
      };
    } catch (error) {
      console.error('Calculate epic statistics error:', error);
      throw error;
    }
  }

  /**
   * Get top-level epics (no parent)
   */
  async getTopLevelEpics(userId: string, projectId?: string): Promise<Epic[]> {
    const filters: EpicFilters = { userId, parentEpicId: null as any };
    if (projectId) {
      filters.projectId = projectId;
    }
    return this.listEpics(filters);
  }

  /**
   * Get child epics
   */
  async getChildEpics(parentEpicId: string, userId: string): Promise<Epic[]> {
    return this.listEpics({ userId, parentEpicId });
  }

  /**
   * Get epics by project
   */
  async getEpicsByProject(projectId: string, userId: string): Promise<Epic[]> {
    return this.listEpics({ userId, projectId });
  }

  /**
   * Get epics by status
   */
  async getEpicsByStatus(
    status: string | string[],
    userId: string
  ): Promise<Epic[]> {
    return this.listEpics({ userId, status });
  }

  /**
   * Search epics
   */
  async searchEpics(searchQuery: string, userId: string): Promise<Epic[]> {
    return this.listEpics({ userId, search: searchQuery });
  }

  /**
   * Count epics
   */
  async countEpics(filters: EpicFilters = {}): Promise<number> {
    try {
      const queries: string[] = [];

      if (filters.userId) {
        queries.push(Query.equal('userId', filters.userId));
      }
      if (filters.projectId) {
        queries.push(Query.equal('projectId', filters.projectId));
      }
      if (filters.status) {
        if (Array.isArray(filters.status)) {
          queries.push(Query.equal('status', filters.status));
        } else {
          queries.push(Query.equal('status', filters.status));
        }
      }

      return await databaseService.countDocuments(this.collectionId, queries);
    } catch (error) {
      console.error('Count epics error:', error);
      throw error;
    }
  }

  /**
   * Update epic status
   */
  async updateEpicStatus(
    epicId: string,
    status: EpicDocument['status']
  ): Promise<Epic> {
    return this.updateEpic(epicId, { status });
  }

  /**
   * Move epic to a new parent (or make it top-level)
   */
  async moveEpicToParent(
    epicId: string,
    parentEpicId: string | undefined
  ): Promise<Epic> {
    return this.updateEpic(epicId, { parentEpicId });
  }

  /**
   * Get epic hierarchy (epic with all nested child epics)
   */
  async getEpicHierarchy(epicId: string, userId: string): Promise<Epic & { children: Epic[] }> {
    try {
      const epic = await this.getEpic(epicId, userId);
      const children = await this.getChildEpics(epicId, userId);
      
      return {
        ...epic,
        children,
      };
    } catch (error) {
      console.error('Get epic hierarchy error:', error);
      throw error;
    }
  }

  /**
   * Get all epics with their statistics
   */
  async getAllEpicsWithStatistics(userId: string): Promise<Array<Epic & { statistics: EpicStatistics }>> {
    try {
      const epics = await this.listEpics({ userId });
      
      const epicsWithStats = await Promise.all(
        epics.map(async (epic) => {
          const statistics = await this.calculateEpicStatistics(epic.$id, userId);
          return {
            ...epic,
            statistics,
          };
        })
      );
      
      return epicsWithStats;
    } catch (error) {
      console.error('Get all epics with statistics error:', error);
      throw error;
    }
  }

  /**
   * Archive an epic (set status to archived)
   */
  async archiveEpic(epicId: string): Promise<Epic> {
    return this.updateEpicStatus(epicId, 'archived');
  }

  /**
   * Unarchive an epic (set status to planning)
   */
  async unarchiveEpic(epicId: string): Promise<Epic> {
    return this.updateEpicStatus(epicId, 'planning');
  }

  /**
   * Get archived epics
   */
  async getArchivedEpics(userId: string): Promise<Epic[]> {
    return this.getEpicsByStatus('archived', userId);
  }

  /**
   * Get active epics (in progress)
   */
  async getActiveEpics(userId: string): Promise<Epic[]> {
    return this.getEpicsByStatus('in_progress', userId);
  }

  /**
   * Batch create epics
   */
  async batchCreateEpics(
    epics: CreateEpicData[],
    userId: string,
    permissions?: string[]
  ): Promise<Epic[]> {
    try {
      const epicDocuments: EpicDocument[] = epics.map((epic) => ({
        userId,
        projectId: epic.projectId,
        name: epic.name,
        description: epic.description,
        parentEpicId: epic.parentEpicId,
        startDate: epic.startDate,
        endDate: epic.endDate,
        status: epic.status ?? 'planning',
        progressPercentage: epic.progressPercentage ?? 0,
      }));

      // Set default permissions if not provided
      const epicPermissions = permissions || [
        `read("user:${userId}")`,
        `update("user:${userId}")`,
        `delete("user:${userId}")`,
      ];

      return await databaseService.batchCreateDocuments<Record<string, unknown>>(
        this.collectionId,
        epicDocuments as unknown as Array<Record<string, unknown>>,
        epicPermissions
      ) as unknown as Epic[];
    } catch (error) {
      console.error('Batch create epics error:', error);
      throw error;
    }
  }

  /**
   * Batch update epics
   */
  async batchUpdateEpics(
    updates: Array<{ id: string; data: UpdateEpicData }>,
    permissions?: string[]
  ): Promise<Epic[]> {
    try {
      return await databaseService.batchUpdateDocuments<Record<string, unknown>>(
        this.collectionId,
        updates as unknown as Array<{ id: string; data: Record<string, unknown> }>,
        permissions
      ) as unknown as Epic[];
    } catch (error) {
      console.error('Batch update epics error:', error);
      throw error;
    }
  }

  /**
   * Batch delete epics (with cascade deletion of tasks)
   */
  async batchDeleteEpics(epicIds: string[], userId: string): Promise<void> {
    try {
      // Delete each epic with cascade
      for (const epicId of epicIds) {
        await this.deleteEpic(epicId, userId);
      }
    } catch (error) {
      console.error('Batch delete epics error:', error);
      throw error;
    }
  }

  /**
   * Duplicate an epic (with or without tasks)
   */
  async duplicateEpic(
    epicId: string,
    userId: string,
    includeTasks: boolean = false,
    newName?: string
  ): Promise<Epic> {
    try {
      // Get the original epic
      const originalEpic = await this.getEpic(epicId, userId);
      
      // Create new epic with copied data
      const newEpic = await this.createEpic(
        {
          name: newName || `${originalEpic.name} (Copy)`,
          description: originalEpic.description,
          projectId: originalEpic.projectId,
          parentEpicId: originalEpic.parentEpicId,
          startDate: originalEpic.startDate,
          endDate: originalEpic.endDate,
          status: originalEpic.status,
        },
        userId
      );
      
      // If includeTasks is true, copy all tasks
      if (includeTasks) {
        const tasks = await taskService.getTasksByEpic(epicId, userId);
        
        if (tasks.length > 0) {
          const newTasks = tasks.map(task => ({
            title: task.title,
            description: task.description,
            completed: false, // Reset completion status
            priority: task.priority,
            dueDate: task.dueDate,
            startDate: task.startDate,
            projectId: task.projectId,
            epicId: newEpic.$id,
            parentId: task.parentId,
            assignee: task.assignee,
            labels: task.labels,
            dependencies: [], // Clear dependencies
            estimatedTime: task.estimatedTime,
            position: task.position,
            customFields: task.customFields,
          }));
          
          await taskService.batchCreateTasks(newTasks, userId);
        }
      }
      
      return newEpic;
    } catch (error) {
      console.error('Duplicate epic error:', error);
      throw error;
    }
  }

  /**
   * Get epic completion percentage
   */
  async getEpicCompletionPercentage(epicId: string, userId: string): Promise<number> {
    try {
      const statistics = await this.calculateEpicStatistics(epicId, userId);
      return statistics.completionRate;
    } catch (error) {
      console.error('Get epic completion percentage error:', error);
      throw error;
    }
  }

  /**
   * Get epics with overdue tasks
   */
  async getEpicsWithOverdueTasks(userId: string): Promise<Array<Epic & { overdueCount: number }>> {
    try {
      const epics = await this.listEpics({ userId });
      
      const epicsWithOverdue = await Promise.all(
        epics.map(async (epic) => {
          const statistics = await this.calculateEpicStatistics(epic.$id, userId);
          return {
            ...epic,
            overdueCount: statistics.overdueTasks,
          };
        })
      );
      
      // Filter to only epics with overdue tasks
      return epicsWithOverdue.filter(e => e.overdueCount > 0);
    } catch (error) {
      console.error('Get epics with overdue tasks error:', error);
      throw error;
    }
  }

  /**
   * Auto-complete epic when all tasks are done
   */
  async autoCompleteEpicIfAllTasksDone(epicId: string, userId: string): Promise<void> {
    try {
      const statistics = await this.calculateEpicStatistics(epicId, userId);
      
      // If all tasks are completed and epic is not already completed
      if (statistics.totalTasks > 0 && statistics.completionRate === 100) {
        const epic = await this.getEpic(epicId, userId);
        if (epic.status !== 'completed') {
          await this.updateEpicStatus(epicId, 'completed');
        }
      }
    } catch (error) {
      console.error('Auto-complete epic error:', error);
      throw error;
    }
  }

  /**
   * Get epic roadmap data (for timeline visualization)
   */
  async getEpicRoadmapData(userId: string, projectId?: string): Promise<Array<Epic & { statistics: EpicStatistics }>> {
    try {
      const filters: EpicFilters = { 
        userId,
        orderBy: 'startDate',
        orderDirection: 'asc'
      };
      
      if (projectId) {
        filters.projectId = projectId;
      }
      
      const epics = await this.listEpics(filters);
      
      const epicsWithStats = await Promise.all(
        epics.map(async (epic) => {
          const statistics = await this.calculateEpicStatistics(epic.$id, userId);
          return {
            ...epic,
            statistics,
          };
        })
      );
      
      return epicsWithStats;
    } catch (error) {
      console.error('Get epic roadmap data error:', error);
      throw error;
    }
  }

  /**
   * Link multiple tasks to an epic
   */
  async linkTasksToEpic(taskIds: string[], epicId: string): Promise<void> {
    try {
      // Update all tasks to link them to the epic
      const updates = taskIds.map(taskId => ({
        id: taskId,
        data: { epicId }
      }));
      
      await taskService.batchUpdateTasks(updates);
      
      // Recalculate epic progress
      const epic = await this.getEpic(epicId);
      await this.calculateAndUpdateEpicProgress(epicId, epic.userId);
    } catch (error) {
      console.error('Link tasks to epic error:', error);
      throw error;
    }
  }

  /**
   * Unlink multiple tasks from their epics
   */
  async unlinkTasksFromEpics(taskIds: string[]): Promise<void> {
    try {
      // Get all tasks to find their epics
      const tasks = await Promise.all(
        taskIds.map(taskId => taskService.getTask(taskId))
      );
      
      // Collect unique epic IDs
      const epicIds = [...new Set(tasks.map(task => task.epicId).filter(Boolean))] as string[];
      
      // Update all tasks to remove epic links
      const updates = taskIds.map(taskId => ({
        id: taskId,
        data: { epicId: undefined }
      }));
      
      await taskService.batchUpdateTasks(updates);
      
      // Recalculate progress for all affected epics
      for (const epicId of epicIds) {
        const epic = await this.getEpic(epicId);
        await this.calculateAndUpdateEpicProgress(epicId, epic.userId);
      }
    } catch (error) {
      console.error('Unlink tasks from epics error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const epicService = new EpicService();

// Export Query helper for building custom queries
export { Query };
