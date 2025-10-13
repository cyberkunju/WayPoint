import { databaseService, Query } from './database.service';
import { COLLECTIONS } from '@/lib/appwrite';
import { ID, type Models } from 'appwrite';

/**
 * Task interface matching Appwrite collection schema
 */
export interface TaskDocument {
  userId: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 1 | 2 | 3 | 4;
  dueDate?: string;
  startDate?: string;
  completedAt?: string;
  projectId?: string;
  epicId?: string;
  parentId?: string;
  assignee?: string;
  labels: string[];
  dependencies: string[];
  estimatedTime?: number;
  actualTime?: number;
  position: number;
  customFields?: string; // JSON string
  subtasks?: string[]; // Array of subtask IDs
}

/**
 * Task with Appwrite metadata
 */
export type Task = Models.Document & TaskDocument;

/**
 * Task creation data (without Appwrite metadata)
 */
export type CreateTaskData = Omit<TaskDocument, 'userId'> & {
  userId?: string; // Optional, will be set by service if not provided
};

/**
 * Task update data (partial)
 */
export type UpdateTaskData = Partial<Omit<TaskDocument, 'userId'>>;

/**
 * Task filter options
 */
export interface TaskFilters {
  userId?: string;
  projectId?: string;
  epicId?: string;
  parentId?: string;
  completed?: boolean;
  priority?: number | number[];
  labels?: string[];
  assignee?: string;
  dueDateStart?: string;
  dueDateEnd?: string;
  search?: string;
  limit?: number;
  offset?: number;
  orderBy?: 'dueDate' | 'priority' | 'createdAt' | 'updatedAt' | 'title' | 'position';
  orderDirection?: 'asc' | 'desc';
}

/**
 * Task Service
 * Handles all task-related operations with Appwrite
 */
export class TaskService {
  private readonly collectionId = COLLECTIONS.TASKS;

  /**
   * Create a new task
   */
  async createTask(
    data: CreateTaskData,
    userId: string,
    permissions?: string[]
  ): Promise<Task> {
    try {
      const taskData: TaskDocument = {
        userId,
        title: data.title,
        description: data.description,
        completed: data.completed ?? false,
        priority: data.priority ?? 4,
        dueDate: data.dueDate,
        startDate: data.startDate,
        completedAt: data.completedAt,
        projectId: data.projectId,
        epicId: data.epicId,
        parentId: data.parentId,
        assignee: data.assignee,
        labels: data.labels ?? [],
        dependencies: data.dependencies ?? [],
        estimatedTime: data.estimatedTime,
        actualTime: data.actualTime,
        position: data.position ?? 0,
        customFields: data.customFields,
      };

      // Set default permissions if not provided
      const taskPermissions = permissions || [
        `read("user:${userId}")`,
        `update("user:${userId}")`,
        `delete("user:${userId}")`,
      ];

      return await databaseService.createDocument<Record<string, unknown>>(
        this.collectionId,
        taskData as unknown as Record<string, unknown>,
        ID.unique(),
        taskPermissions
      ) as unknown as Task;
    } catch (error) {
      console.error('Create task error:', error);
      throw error;
    }
  }

  /**
   * Get a task by ID
   */
  async getTask(taskId: string, userId?: string): Promise<Task> {
    try {
      const queries = userId ? [Query.equal('userId', userId)] : undefined;
      return await databaseService.getDocument<Record<string, unknown>>(
        this.collectionId,
        taskId,
        queries
      ) as unknown as Task;
    } catch (error) {
      console.error('Get task error:', error);
      throw error;
    }
  }

  /**
   * Update a task
   */
  async updateTask(
    taskId: string,
    data: UpdateTaskData,
    permissions?: string[]
  ): Promise<Task> {
    try {
      // If task is being marked as completed, set completedAt timestamp
      const updateData = { ...data };
      if (data.completed === true && !data.completedAt) {
        updateData.completedAt = new Date().toISOString();
      } else if (data.completed === false) {
        updateData.completedAt = undefined;
      }

      return await databaseService.updateDocument<Record<string, unknown>>(
        this.collectionId,
        taskId,
        updateData as unknown as Record<string, unknown>,
        permissions
      ) as unknown as Task;
    } catch (error) {
      console.error('Update task error:', error);
      throw error;
    }
  }

  /**
   * Delete a task
   */
  async deleteTask(taskId: string): Promise<void> {
    try {
      await databaseService.deleteDocument(this.collectionId, taskId);
    } catch (error) {
      console.error('Delete task error:', error);
      throw error;
    }
  }

  /**
   * List tasks with filters
   */
  async listTasks(filters: TaskFilters = {}): Promise<Task[]> {
    try {
      const queries: string[] = [];

      // User filter (required for security)
      if (filters.userId) {
        queries.push(Query.equal('userId', filters.userId));
      }

      // Project filter
      if (filters.projectId) {
        queries.push(Query.equal('projectId', filters.projectId));
      }

      // Epic filter
      if (filters.epicId) {
        queries.push(Query.equal('epicId', filters.epicId));
      }

      // Parent filter (for subtasks)
      if (filters.parentId) {
        queries.push(Query.equal('parentId', filters.parentId));
      }

      // Completed filter
      if (filters.completed !== undefined) {
        queries.push(Query.equal('completed', filters.completed));
      }

      // Priority filter
      if (filters.priority !== undefined) {
        if (Array.isArray(filters.priority)) {
          queries.push(Query.equal('priority', filters.priority));
        } else {
          queries.push(Query.equal('priority', filters.priority));
        }
      }

      // Labels filter
      if (filters.labels && filters.labels.length > 0) {
        queries.push(Query.equal('labels', filters.labels));
      }

      // Assignee filter
      if (filters.assignee) {
        queries.push(Query.equal('assignee', filters.assignee));
      }

      // Due date range filter
      if (filters.dueDateStart) {
        queries.push(Query.greaterThanEqual('dueDate', filters.dueDateStart));
      }
      if (filters.dueDateEnd) {
        queries.push(Query.lessThanEqual('dueDate', filters.dueDateEnd));
      }

      // Search filter (searches in title and description)
      if (filters.search) {
        queries.push(Query.search('title', filters.search));
      }

      // Ordering
      if (filters.orderBy) {
        const direction = filters.orderDirection === 'desc' ? Query.orderDesc : Query.orderAsc;
        queries.push(direction(filters.orderBy));
      } else {
        // Default ordering by position
        queries.push(Query.orderAsc('position'));
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

      return result.documents as unknown as Task[];
    } catch (error) {
      console.error('List tasks error:', error);
      throw error;
    }
  }

  /**
   * Batch create tasks
   */
  async batchCreateTasks(
    tasks: CreateTaskData[],
    userId: string,
    permissions?: string[]
  ): Promise<Task[]> {
    try {
      const taskDocuments: TaskDocument[] = tasks.map((task) => ({
        userId,
        title: task.title,
        description: task.description,
        completed: task.completed ?? false,
        priority: task.priority ?? 4,
        dueDate: task.dueDate,
        startDate: task.startDate,
        completedAt: task.completedAt,
        projectId: task.projectId,
        epicId: task.epicId,
        parentId: task.parentId,
        assignee: task.assignee,
        labels: task.labels ?? [],
        dependencies: task.dependencies ?? [],
        estimatedTime: task.estimatedTime,
        actualTime: task.actualTime,
        position: task.position ?? 0,
        customFields: task.customFields,
      }));

      // Set default permissions if not provided
      const taskPermissions = permissions || [
        `read("user:${userId}")`,
        `update("user:${userId}")`,
        `delete("user:${userId}")`,
      ];

      return await databaseService.batchCreateDocuments<Record<string, unknown>>(
        this.collectionId,
        taskDocuments as unknown as Array<Record<string, unknown>>,
        taskPermissions
      ) as unknown as Task[];
    } catch (error) {
      console.error('Batch create tasks error:', error);
      throw error;
    }
  }

  /**
   * Batch update tasks
   */
  async batchUpdateTasks(
    updates: Array<{ id: string; data: UpdateTaskData }>,
    permissions?: string[]
  ): Promise<Task[]> {
    try {
      // Process completedAt timestamps for completed tasks
      const processedUpdates = updates.map(({ id, data }) => {
        const updateData = { ...data };
        if (data.completed === true && !data.completedAt) {
          updateData.completedAt = new Date().toISOString();
        } else if (data.completed === false) {
          updateData.completedAt = undefined;
        }
        return { id, data: updateData };
      });

      return await databaseService.batchUpdateDocuments<Record<string, unknown>>(
        this.collectionId,
        processedUpdates as unknown as Array<{ id: string; data: Record<string, unknown> }>,
        permissions
      ) as unknown as Task[];
    } catch (error) {
      console.error('Batch update tasks error:', error);
      throw error;
    }
  }

  /**
   * Batch delete tasks
   */
  async batchDeleteTasks(taskIds: string[]): Promise<void> {
    try {
      await databaseService.batchDeleteDocuments(this.collectionId, taskIds);
    } catch (error) {
      console.error('Batch delete tasks error:', error);
      throw error;
    }
  }

  /**
   * Get tasks by project
   */
  async getTasksByProject(projectId: string, userId: string): Promise<Task[]> {
    return this.listTasks({ projectId, userId });
  }

  /**
   * Get subtasks (tasks with a parent)
   */
  async getSubtasks(parentId: string, userId: string): Promise<Task[]> {
    return this.listTasks({ parentId, userId });
  }

  /**
   * Get tasks by epic
   */
  async getTasksByEpic(epicId: string, userId: string): Promise<Task[]> {
    return this.listTasks({ epicId, userId });
  }

  /**
   * Get completed tasks
   */
  async getCompletedTasks(userId: string, limit?: number): Promise<Task[]> {
    return this.listTasks({ userId, completed: true, limit });
  }

  /**
   * Get incomplete tasks
   */
  async getIncompleteTasks(userId: string, limit?: number): Promise<Task[]> {
    return this.listTasks({ userId, completed: false, limit });
  }

  /**
   * Get tasks due today
   */
  async getTasksDueToday(userId: string): Promise<Task[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.listTasks({
      userId,
      completed: false,
      dueDateStart: today.toISOString(),
      dueDateEnd: tomorrow.toISOString(),
    });
  }

  /**
   * Get overdue tasks
   */
  async getOverdueTasks(userId: string): Promise<Task[]> {
    const now = new Date().toISOString();

    return this.listTasks({
      userId,
      completed: false,
      dueDateEnd: now,
    });
  }

  /**
   * Get tasks by priority
   */
  async getTasksByPriority(
    priority: number | number[],
    userId: string
  ): Promise<Task[]> {
    return this.listTasks({ userId, priority, completed: false });
  }

  /**
   * Search tasks
   */
  async searchTasks(searchQuery: string, userId: string): Promise<Task[]> {
    return this.listTasks({ userId, search: searchQuery });
  }

  /**
   * Count tasks
   */
  async countTasks(filters: TaskFilters = {}): Promise<number> {
    try {
      const queries: string[] = [];

      if (filters.userId) {
        queries.push(Query.equal('userId', filters.userId));
      }
      if (filters.projectId) {
        queries.push(Query.equal('projectId', filters.projectId));
      }
      if (filters.completed !== undefined) {
        queries.push(Query.equal('completed', filters.completed));
      }

      return await databaseService.countDocuments(this.collectionId, queries);
    } catch (error) {
      console.error('Count tasks error:', error);
      throw error;
    }
  }

  /**
   * Toggle task completion
   */
  async toggleTaskCompletion(taskId: string): Promise<Task> {
    try {
      // Get current task
      const task = await this.getTask(taskId);
      
      // Toggle completion
      return await this.updateTask(taskId, {
        completed: !task.completed,
        completedAt: !task.completed ? new Date().toISOString() : undefined,
      });
    } catch (error) {
      console.error('Toggle task completion error:', error);
      throw error;
    }
  }

  /**
   * Update task position (for drag-and-drop reordering)
   */
  async updateTaskPosition(taskId: string, newPosition: number): Promise<Task> {
    return this.updateTask(taskId, { position: newPosition });
  }

  /**
   * Move task to project
   */
  async moveTaskToProject(taskId: string, projectId: string | undefined): Promise<Task> {
    return this.updateTask(taskId, { projectId });
  }

  /**
   * Add label to task
   */
  async addLabelToTask(taskId: string, labelId: string): Promise<Task> {
    try {
      const task = await this.getTask(taskId);
      const labels = [...task.labels];
      
      if (!labels.includes(labelId)) {
        labels.push(labelId);
      }

      return await this.updateTask(taskId, { labels });
    } catch (error) {
      console.error('Add label to task error:', error);
      throw error;
    }
  }

  /**
   * Remove label from task
   */
  async removeLabelFromTask(taskId: string, labelId: string): Promise<Task> {
    try {
      const task = await this.getTask(taskId);
      const labels = task.labels.filter((id) => id !== labelId);

      return await this.updateTask(taskId, { labels });
    } catch (error) {
      console.error('Remove label from task error:', error);
      throw error;
    }
  }

  /**
   * Add dependency to task
   */
  async addDependency(taskId: string, dependencyId: string): Promise<Task> {
    try {
      const task = await this.getTask(taskId);
      const dependencies = [...task.dependencies];
      
      if (!dependencies.includes(dependencyId)) {
        dependencies.push(dependencyId);
      }

      return await this.updateTask(taskId, { dependencies });
    } catch (error) {
      console.error('Add dependency error:', error);
      throw error;
    }
  }

  /**
   * Remove dependency from task
   */
  async removeDependency(taskId: string, dependencyId: string): Promise<Task> {
    try {
      const task = await this.getTask(taskId);
      const dependencies = task.dependencies.filter((id) => id !== dependencyId);

      return await this.updateTask(taskId, { dependencies });
    } catch (error) {
      console.error('Remove dependency error:', error);
      throw error;
    }
  }

  /**
   * Create a subtask under a parent task
   */
  async createSubtask(
    parentTaskId: string,
    data: CreateTaskData,
    userId: string,
    permissions?: string[]
  ): Promise<Task> {
    try {
      // Create the subtask with parentId set
      const subtaskData: CreateTaskData = {
        ...data,
        parentId: parentTaskId,
      };

      const subtask = await this.createTask(subtaskData, userId, permissions);

      // Update parent task's subtasks array
      const parentTask = await this.getTask(parentTaskId);
      const subtasks = [...(parentTask.subtasks || []), subtask.$id];
      await this.updateTask(parentTaskId, { subtasks } as UpdateTaskData);

      return subtask;
    } catch (error) {
      console.error('Create subtask error:', error);
      throw error;
    }
  }

  /**
   * Get all subtasks for a parent task
   */
  async getSubtasksForTask(parentTaskId: string, userId: string): Promise<Task[]> {
    return this.listTasks({ parentId: parentTaskId, userId });
  }

  /**
   * Calculate progress for a parent task based on subtask completion
   */
  async calculateTaskProgress(taskId: string, userId: string): Promise<number> {
    try {
      const subtasks = await this.getSubtasksForTask(taskId, userId);
      
      if (subtasks.length === 0) {
        return 0;
      }

      const completedSubtasks = subtasks.filter(subtask => subtask.completed).length;
      return Math.round((completedSubtasks / subtasks.length) * 100);
    } catch (error) {
      console.error('Calculate task progress error:', error);
      throw error;
    }
  }

  /**
   * Update parent task completion based on subtasks
   * Automatically marks parent as complete when all subtasks are complete
   */
  async updateParentTaskProgress(parentTaskId: string, userId: string): Promise<Task> {
    try {
      const progress = await this.calculateTaskProgress(parentTaskId, userId);
      const subtasks = await this.getSubtasksForTask(parentTaskId, userId);
      
      // If all subtasks are complete, mark parent as complete
      const allComplete = subtasks.length > 0 && subtasks.every(subtask => subtask.completed);
      
      return await this.updateTask(parentTaskId, {
        completed: allComplete,
        completedAt: allComplete ? new Date().toISOString() : undefined,
      });
    } catch (error) {
      console.error('Update parent task progress error:', error);
      throw error;
    }
  }

  /**
   * Move a task to a new position (for drag-and-drop reordering)
   * Updates positions of affected tasks
   */
  async reorderTask(
    taskId: string,
    newPosition: number,
    userId: string,
    projectId?: string,
    parentId?: string
  ): Promise<void> {
    try {
      // Get all tasks in the same context (same project/parent)
      const filters: TaskFilters = { userId };
      if (projectId) filters.projectId = projectId;
      if (parentId) filters.parentId = parentId;
      
      const tasks = await this.listTasks(filters);
      const taskToMove = tasks.find(t => t.$id === taskId);
      
      if (!taskToMove) {
        throw new Error('Task not found');
      }

      const oldPosition = taskToMove.position;
      
      // Update positions of affected tasks
      const updates: Array<{ id: string; data: UpdateTaskData }> = [];
      
      for (const task of tasks) {
        if (task.$id === taskId) {
          // Update the moved task
          updates.push({
            id: task.$id,
            data: { position: newPosition },
          });
        } else if (oldPosition < newPosition) {
          // Moving down: shift tasks between old and new position up
          if (task.position > oldPosition && task.position <= newPosition) {
            updates.push({
              id: task.$id,
              data: { position: task.position - 1 },
            });
          }
        } else if (oldPosition > newPosition) {
          // Moving up: shift tasks between new and old position down
          if (task.position >= newPosition && task.position < oldPosition) {
            updates.push({
              id: task.$id,
              data: { position: task.position + 1 },
            });
          }
        }
      }

      // Batch update all affected tasks
      if (updates.length > 0) {
        await this.batchUpdateTasks(updates);
      }
    } catch (error) {
      console.error('Reorder task error:', error);
      throw error;
    }
  }

  /**
   * Convert a task to a subtask by setting its parent
   */
  async convertToSubtask(taskId: string, parentTaskId: string): Promise<Task> {
    try {
      // Update the task with new parent
      const task = await this.updateTask(taskId, { parentId: parentTaskId });

      // Update parent task's subtasks array
      const parentTask = await this.getTask(parentTaskId);
      const subtasks = [...(parentTask.subtasks || []), taskId];
      await this.updateTask(parentTaskId, { subtasks } as UpdateTaskData);

      return task;
    } catch (error) {
      console.error('Convert to subtask error:', error);
      throw error;
    }
  }

  /**
   * Remove a task from being a subtask (make it a top-level task)
   */
  async removeFromParent(taskId: string): Promise<Task> {
    try {
      const task = await this.getTask(taskId);
      
      if (task.parentId) {
        // Remove from parent's subtasks array
        const parentTask = await this.getTask(task.parentId);
        const subtasks = (parentTask.subtasks || []).filter(id => id !== taskId);
        await this.updateTask(task.parentId, { subtasks } as UpdateTaskData);
      }

      // Remove parentId from task
      return await this.updateTask(taskId, { parentId: undefined });
    } catch (error) {
      console.error('Remove from parent error:', error);
      throw error;
    }
  }

  /**
   * Delete a task and all its subtasks recursively
   */
  async deleteTaskWithSubtasks(taskId: string, userId: string): Promise<void> {
    try {
      // Get all subtasks
      const subtasks = await this.getSubtasksForTask(taskId, userId);
      
      // Recursively delete subtasks
      for (const subtask of subtasks) {
        await this.deleteTaskWithSubtasks(subtask.$id, userId);
      }
      
      // Delete the task itself
      await this.deleteTask(taskId);
    } catch (error) {
      console.error('Delete task with subtasks error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const taskService = new TaskService();

// Export Query helper for building custom queries
export { Query };
