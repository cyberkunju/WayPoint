import { databaseService, Query } from './database.service';
import { COLLECTIONS } from '@/lib/appwrite';
import { ID, type Models } from 'appwrite';
import { taskService, type Task } from './task.service';

/**
 * Dependency types based on project management standards
 */
export type DependencyType = 
  | 'finish-to-start'   // Task B can't start until Task A finishes (most common)
  | 'start-to-start'    // Task B can't start until Task A starts
  | 'finish-to-finish'  // Task B can't finish until Task A finishes
  | 'start-to-finish';  // Task B can't finish until Task A starts (rare)

/**
 * Task dependency interface matching Appwrite collection schema
 */
export interface TaskDependencyDocument {
  userId: string;
  taskId: string;           // The dependent task (blocked by)
  dependsOnTaskId: string;  // The task it depends on (blocks)
  dependencyType: DependencyType;
  lag?: number;             // Lag time in days (can be negative for lead time)
  notes?: string;
}

/**
 * Task dependency with Appwrite metadata
 */
export type TaskDependency = Models.Document & TaskDependencyDocument & Record<string, unknown>;

/**
 * Dependency creation data
 */
export type CreateDependencyData = Omit<TaskDependencyDocument, 'userId'> & {
  userId?: string;
};

/**
 * Dependency update data
 */
export type UpdateDependencyData = Partial<Omit<TaskDependencyDocument, 'userId' | 'taskId' | 'dependsOnTaskId'>>;

/**
 * Dependency validation result
 */
export interface DependencyValidationResult {
  isValid: boolean;
  error?: string;
  circularPath?: string[];
}

/**
 * Critical path node
 */
export interface CriticalPathNode {
  taskId: string;
  task: Task;
  earliestStart: number;
  earliestFinish: number;
  latestStart: number;
  latestFinish: number;
  slack: number;
  isCritical: boolean;
}

/**
 * Task Dependencies Service
 * Manages task dependencies with circular dependency detection and critical path calculation
 */
class TaskDependenciesService {
  private collectionId = COLLECTIONS.TASK_DEPENDENCIES;

  /**
   * Create a new task dependency
   */
  async createDependency(data: CreateDependencyData, userId: string): Promise<TaskDependency> {
    try {
      // Validate the dependency first
      const validation = await this.validateDependency(data.taskId, data.dependsOnTaskId, userId);
      if (!validation.isValid) {
        throw new Error(validation.error || 'Invalid dependency');
      }

      const dependencyData: TaskDependencyDocument = {
        ...data,
        userId,
        dependencyType: data.dependencyType || 'finish-to-start'
      };

      const dependency = await databaseService.createDocument<Record<string, unknown>>(
        this.collectionId,
        dependencyData as unknown as Record<string, unknown>,
        ID.unique()
      ) as unknown as TaskDependency;

      console.log('Created task dependency:', dependency.$id);
      return dependency;
    } catch (error) {
      console.error('Error creating task dependency:', error);
      throw error;
    }
  }

  /**
   * Get all dependencies for a task
   */
  async getTaskDependencies(taskId: string, userId: string): Promise<TaskDependency[]> {
    try {
      const dependencies = await databaseService.listDocuments<TaskDependency>(
        this.collectionId,
        [
          Query.equal('userId', userId),
          Query.equal('taskId', taskId)
        ]
      );
      return dependencies.documents;
    } catch (error) {
      console.error('Error getting task dependencies:', error);
      throw error;
    }
  }

  /**
   * Get all tasks that depend on a specific task
   */
  async getDependentTasks(taskId: string, userId: string): Promise<TaskDependency[]> {
    try {
      const dependencies = await databaseService.listDocuments<TaskDependency>(
        this.collectionId,
        [
          Query.equal('userId', userId),
          Query.equal('dependsOnTaskId', taskId)
        ]
      );
      return dependencies.documents;
    } catch (error) {
      console.error('Error getting dependent tasks:', error);
      throw error;
    }
  }

  /**
   * Delete a dependency
   */
  async deleteDependency(dependencyId: string): Promise<void> {
    try {
      await databaseService.deleteDocument(this.collectionId, dependencyId);
      console.log('Deleted task dependency:', dependencyId);
    } catch (error) {
      console.error('Error deleting task dependency:', error);
      throw error;
    }
  }

  /**
   * Update a dependency
   */
  async updateDependency(dependencyId: string, data: UpdateDependencyData): Promise<TaskDependency> {
    try {
      const dependency = await databaseService.updateDocument<TaskDependency>(
        this.collectionId,
        dependencyId,
        data
      );
      console.log('Updated task dependency:', dependencyId);
      return dependency;
    } catch (error) {
      console.error('Error updating task dependency:', error);
      throw error;
    }
  }

  /**
   * Validate a dependency to prevent circular dependencies
   */
  async validateDependency(taskId: string, dependsOnTaskId: string, userId: string): Promise<DependencyValidationResult> {
    try {
      // Can't depend on itself
      if (taskId === dependsOnTaskId) {
        return {
          isValid: false,
          error: 'A task cannot depend on itself'
        };
      }

      // Check for circular dependencies using DFS
      const visited = new Set<string>();
      const recursionStack = new Set<string>();
      const path: string[] = [];

      const hasCircularDependency = async (currentTaskId: string): Promise<boolean> => {
        visited.add(currentTaskId);
        recursionStack.add(currentTaskId);
        path.push(currentTaskId);

        // Get all dependencies of the current task
        const dependencies = await this.getTaskDependencies(currentTaskId, userId);

        for (const dep of dependencies) {
          const nextTaskId = dep.dependsOnTaskId;

          if (!visited.has(nextTaskId)) {
            if (await hasCircularDependency(nextTaskId)) {
              return true;
            }
          } else if (recursionStack.has(nextTaskId)) {
            // Found a cycle
            path.push(nextTaskId);
            return true;
          }
        }

        recursionStack.delete(currentTaskId);
        path.pop();
        return false;
      };

      // Start from the task that would depend on dependsOnTaskId
      // and check if it eventually leads back to taskId
      visited.clear();
      recursionStack.clear();
      path.length = 0;

      if (await hasCircularDependency(dependsOnTaskId)) {
        return {
          isValid: false,
          error: 'This dependency would create a circular dependency',
          circularPath: path
        };
      }

      return { isValid: true };
    } catch (error) {
      console.error('Error validating dependency:', error);
      return {
        isValid: false,
        error: 'Failed to validate dependency'
      };
    }
  }

  /**
   * Calculate critical path for a project
   * Returns tasks on the critical path (longest path through the project)
   */
  async calculateCriticalPath(projectId: string, userId: string): Promise<CriticalPathNode[]> {
    try {
      // Get all tasks in the project
      const projectTasks = await taskService.listTasks({ 
        userId, 
        projectId 
      });

      if (projectTasks.length === 0) {
        return [];
      }

      // Get all dependencies for these tasks
      const allDependencies: TaskDependency[] = [];
      for (const task of projectTasks) {
        const deps = await this.getTaskDependencies(task.$id, userId);
        allDependencies.push(...deps);
      }

      // Build adjacency list
      const graph = new Map<string, string[]>();
      const inDegree = new Map<string, number>();
      
      projectTasks.forEach((task: Task) => {
        graph.set(task.$id, []);
        inDegree.set(task.$id, 0);
      });

      allDependencies.forEach(dep => {
        if (dep.dependencyType === 'finish-to-start') {
          graph.get(dep.dependsOnTaskId)?.push(dep.taskId);
          inDegree.set(dep.taskId, (inDegree.get(dep.taskId) || 0) + 1);
        }
      });

      // Forward pass - calculate earliest start and finish
      const earliestStart = new Map<string, number>();
      const earliestFinish = new Map<string, number>();
      const queue: string[] = [];

      // Initialize with tasks that have no dependencies
      projectTasks.forEach((task: Task) => {
        if (inDegree.get(task.$id) === 0) {
          earliestStart.set(task.$id, 0);
          const duration = task.estimatedTime || 1;
          earliestFinish.set(task.$id, duration);
          queue.push(task.$id);
        }
      });

      // Process queue
      while (queue.length > 0) {
        const currentId = queue.shift()!;
        const neighbors = graph.get(currentId) || [];

        neighbors.forEach(neighborId => {
          const task = projectTasks.find((t: Task) => t.$id === neighborId);
          const duration = task?.estimatedTime || 1;
          const currentFinish = earliestFinish.get(currentId) || 0;
          
          const newStart = Math.max(
            earliestStart.get(neighborId) || 0,
            currentFinish
          );
          
          earliestStart.set(neighborId, newStart);
          earliestFinish.set(neighborId, newStart + duration);

          const newInDegree = (inDegree.get(neighborId) || 0) - 1;
          inDegree.set(neighborId, newInDegree);

          if (newInDegree === 0) {
            queue.push(neighborId);
          }
        });
      }

      // Find project end time
      const projectEnd = Math.max(...Array.from(earliestFinish.values()));

      // Backward pass - calculate latest start and finish
      const latestStart = new Map<string, number>();
      const latestFinish = new Map<string, number>();

      // Initialize end tasks
      projectTasks.forEach((task: Task) => {
        const neighbors = graph.get(task.$id) || [];
        if (neighbors.length === 0) {
          latestFinish.set(task.$id, projectEnd);
          const duration = task.estimatedTime || 1;
          latestStart.set(task.$id, projectEnd - duration);
        }
      });

      // Process in reverse topological order
      const reverseGraph = new Map<string, string[]>();
      projectTasks.forEach((task: Task) => reverseGraph.set(task.$id, []));
      allDependencies.forEach(dep => {
        if (dep.dependencyType === 'finish-to-start') {
          reverseGraph.get(dep.taskId)?.push(dep.dependsOnTaskId);
        }
      });

      const visited = new Set<string>();
      const reverseTopoOrder: string[] = [];

      const dfs = (taskId: string) => {
        visited.add(taskId);
        const neighbors = graph.get(taskId) || [];
        neighbors.forEach(neighbor => {
          if (!visited.has(neighbor)) {
            dfs(neighbor);
          }
        });
        reverseTopoOrder.push(taskId);
      };

      projectTasks.forEach((task: Task) => {
        if (!visited.has(task.$id)) {
          dfs(task.$id);
        }
      });

      // Calculate latest times
      reverseTopoOrder.forEach(taskId => {
        if (!latestFinish.has(taskId)) {
          const neighbors = graph.get(taskId) || [];
          if (neighbors.length > 0) {
            const minLatestStart = Math.min(
              ...neighbors.map(n => latestStart.get(n) || projectEnd)
            );
            latestFinish.set(taskId, minLatestStart);
            const task = projectTasks.find((t: Task) => t.$id === taskId);
            const duration = task?.estimatedTime || 1;
            latestStart.set(taskId, minLatestStart - duration);
          }
        }
      });

      // Calculate slack and identify critical path
      const criticalPathNodes: CriticalPathNode[] = projectTasks.map((task: Task) => {
        const es = earliestStart.get(task.$id) || 0;
        const ef = earliestFinish.get(task.$id) || 0;
        const ls = latestStart.get(task.$id) || 0;
        const lf = latestFinish.get(task.$id) || 0;
        const slack = ls - es;

        return {
          taskId: task.$id,
          task,
          earliestStart: es,
          earliestFinish: ef,
          latestStart: ls,
          latestFinish: lf,
          slack,
          isCritical: slack === 0
        };
      });

      return criticalPathNodes.filter(node => node.isCritical);
    } catch (error) {
      console.error('Error calculating critical path:', error);
      throw error;
    }
  }

  /**
   * Get all dependencies for a user
   */
  async getAllDependencies(userId: string): Promise<TaskDependency[]> {
    try {
      const dependencies = await databaseService.listDocuments<TaskDependency>(
        this.collectionId,
        [Query.equal('userId', userId)]
      );
      return dependencies.documents;
    } catch (error) {
      console.error('Error getting all dependencies:', error);
      throw error;
    }
  }

  /**
   * Check if a task can be completed (all dependencies are complete)
   */
  async canCompleteTask(taskId: string, userId: string): Promise<boolean> {
    try {
      const dependencies = await this.getTaskDependencies(taskId, userId);
      
      for (const dep of dependencies) {
        const dependsOnTask = await taskService.getTask(dep.dependsOnTaskId);
        
        if (dep.dependencyType === 'finish-to-start' || dep.dependencyType === 'finish-to-finish') {
          if (!dependsOnTask.completed) {
            return false;
          }
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error checking if task can be completed:', error);
      return true; // Allow completion on error
    }
  }
}

export const taskDependenciesService = new TaskDependenciesService();
export default taskDependenciesService;
