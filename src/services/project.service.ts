import { databaseService, Query } from './database.service';
import { taskService } from './task.service';
import { COLLECTIONS } from '@/lib/appwrite';
import { ID, type Models } from 'appwrite';

/**
 * Project interface matching Appwrite collection schema
 */
export interface ProjectDocument {
  userId: string;
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
}

/**
 * Project with Appwrite metadata
 */
export type Project = Models.Document & ProjectDocument;

/**
 * Project creation data (without Appwrite metadata)
 */
export type CreateProjectData = Omit<ProjectDocument, 'userId'> & {
  userId?: string; // Optional, will be set by service if not provided
};

/**
 * Project update data (partial)
 */
export type UpdateProjectData = Partial<Omit<ProjectDocument, 'userId'>>;

/**
 * Project filter options
 */
export interface ProjectFilters {
  userId?: string;
  parentId?: string;
  status?: string | string[];
  labels?: string[];
  search?: string;
  limit?: number;
  offset?: number;
  orderBy?: 'name' | 'createdAt' | 'updatedAt' | 'position' | 'startDate' | 'endDate';
  orderDirection?: 'asc' | 'desc';
}

/**
 * Project statistics
 */
export interface ProjectStatistics {
  totalTasks: number;
  completedTasks: number;
  incompleteTasks: number;
  overdueTasks: number;
  completionRate: number;
  tasksByPriority: {
    priority1: number;
    priority2: number;
    priority3: number;
    priority4: number;
  };
  tasksByStatus: {
    completed: number;
    inProgress: number;
    notStarted: number;
  };
  estimatedTime: number;
  actualTime: number;
  timeVariance: number;
}

/**
 * Project with tasks
 */
export interface ProjectWithTasks extends Project {
  tasks: Array<Models.Document & {
    userId: string;
    title: string;
    completed: boolean;
    priority: number;
    dueDate?: string;
    projectId?: string;
  }>;
  statistics: ProjectStatistics;
}

/**
 * Project Service
 * Handles all project-related operations with Appwrite
 */
export class ProjectService {
  private readonly collectionId = COLLECTIONS.PROJECTS;

  /**
   * Create a new project
   */
  async createProject(
    data: CreateProjectData,
    userId: string,
    permissions?: string[]
  ): Promise<Project> {
    try {
      const projectData: ProjectDocument = {
        userId,
        name: data.name,
        description: data.description,
        color: data.color ?? '#2E5AAC',
        status: data.status ?? 'active',
        parentId: data.parentId,
        isExpanded: data.isExpanded ?? true,
        startDate: data.startDate,
        endDate: data.endDate,
        labels: data.labels ?? [],
        position: data.position ?? 0,
      };

      // Set default permissions if not provided
      const projectPermissions = permissions || [
        `read("user:${userId}")`,
        `update("user:${userId}")`,
        `delete("user:${userId}")`,
      ];

      return await databaseService.createDocument<Record<string, unknown>>(
        this.collectionId,
        projectData as unknown as Record<string, unknown>,
        ID.unique(),
        projectPermissions
      ) as unknown as Project;
    } catch (error) {
      console.error('Create project error:', error);
      throw error;
    }
  }

  /**
   * Get a project by ID
   */
  async getProject(projectId: string, userId?: string): Promise<Project> {
    try {
      const queries = userId ? [Query.equal('userId', userId)] : undefined;
      return await databaseService.getDocument<Record<string, unknown>>(
        this.collectionId,
        projectId,
        queries
      ) as unknown as Project;
    } catch (error) {
      console.error('Get project error:', error);
      throw error;
    }
  }

  /**
   * Update a project
   */
  async updateProject(
    projectId: string,
    data: UpdateProjectData,
    permissions?: string[]
  ): Promise<Project> {
    try {
      return await databaseService.updateDocument<Record<string, unknown>>(
        this.collectionId,
        projectId,
        data as unknown as Record<string, unknown>,
        permissions
      ) as unknown as Project;
    } catch (error) {
      console.error('Update project error:', error);
      throw error;
    }
  }

  /**
   * Delete a project and all its tasks (cascade deletion)
   */
  async deleteProject(projectId: string, userId: string): Promise<void> {
    try {
      // Get all tasks in this project
      const tasks = await taskService.getTasksByProject(projectId, userId);
      
      // Delete all tasks (including their subtasks)
      for (const task of tasks) {
        await taskService.deleteTaskWithSubtasks(task.$id, userId);
      }
      
      // Get all child projects
      const childProjects = await this.listProjects({ parentId: projectId, userId });
      
      // Recursively delete child projects
      for (const childProject of childProjects) {
        await this.deleteProject(childProject.$id, userId);
      }
      
      // Delete the project itself
      await databaseService.deleteDocument(this.collectionId, projectId);
    } catch (error) {
      console.error('Delete project error:', error);
      throw error;
    }
  }

  /**
   * List projects with filters
   */
  async listProjects(filters: ProjectFilters = {}): Promise<Project[]> {
    try {
      const queries: string[] = [];

      // User filter (required for security)
      if (filters.userId) {
        queries.push(Query.equal('userId', filters.userId));
      }

      // Parent filter (for nested projects)
      if (filters.parentId !== undefined) {
        if (filters.parentId === null || filters.parentId === '') {
          // Get top-level projects (no parent)
          queries.push(Query.isNull('parentId'));
        } else {
          queries.push(Query.equal('parentId', filters.parentId));
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

      // Labels filter
      if (filters.labels && filters.labels.length > 0) {
        queries.push(Query.equal('labels', filters.labels));
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

      return result.documents as unknown as Project[];
    } catch (error) {
      console.error('List projects error:', error);
      throw error;
    }
  }

  /**
   * Get project with all its tasks
   */
  async getProjectWithTasks(projectId: string, userId: string): Promise<ProjectWithTasks> {
    try {
      // Get the project
      const project = await this.getProject(projectId, userId);
      
      // Get all tasks for this project
      const tasks = await taskService.getTasksByProject(projectId, userId);
      
      // Calculate statistics
      const statistics = await this.calculateProjectStatistics(projectId, userId);
      
      return {
        ...project,
        tasks,
        statistics,
      };
    } catch (error) {
      console.error('Get project with tasks error:', error);
      throw error;
    }
  }

  /**
   * Calculate project statistics
   */
  async calculateProjectStatistics(projectId: string, userId: string): Promise<ProjectStatistics> {
    try {
      // Get all tasks for this project
      const allTasks = await taskService.getTasksByProject(projectId, userId);
      
      const totalTasks = allTasks.length;
      const completedTasks = allTasks.filter(task => task.completed).length;
      const incompleteTasks = totalTasks - completedTasks;
      
      // Calculate overdue tasks
      const now = new Date().toISOString();
      const overdueTasks = allTasks.filter(
        (task: any) => !task.completed && task.dueDate && task.dueDate < now
      ).length;
      
      // Calculate completion rate
      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      
      // Count tasks by priority
      const tasksByPriority = {
        priority1: allTasks.filter(task => task.priority === 1).length,
        priority2: allTasks.filter(task => task.priority === 2).length,
        priority3: allTasks.filter(task => task.priority === 3).length,
        priority4: allTasks.filter(task => task.priority === 4).length,
      };
      
      // Count tasks by status
      const tasksByStatus = {
        completed: completedTasks,
        inProgress: allTasks.filter(task => !task.completed && task.startDate && task.startDate <= now).length,
        notStarted: allTasks.filter(task => !task.completed && (!task.startDate || task.startDate > now)).length,
      };
      
      // Calculate time estimates
      const estimatedTime = allTasks.reduce((sum, task) => sum + (task.estimatedTime || 0), 0);
      const actualTime = allTasks.reduce((sum, task) => sum + (task.actualTime || 0), 0);
      const timeVariance = estimatedTime > 0 ? Math.round(((actualTime - estimatedTime) / estimatedTime) * 100) : 0;
      
      return {
        totalTasks,
        completedTasks,
        incompleteTasks,
        overdueTasks,
        completionRate,
        tasksByPriority,
        tasksByStatus,
        estimatedTime,
        actualTime,
        timeVariance,
      };
    } catch (error) {
      console.error('Calculate project statistics error:', error);
      throw error;
    }
  }

  /**
   * Batch create projects
   */
  async batchCreateProjects(
    projects: CreateProjectData[],
    userId: string,
    permissions?: string[]
  ): Promise<Project[]> {
    try {
      const projectDocuments: ProjectDocument[] = projects.map((project) => ({
        userId,
        name: project.name,
        description: project.description,
        color: project.color ?? '#2E5AAC',
        status: project.status ?? 'active',
        parentId: project.parentId,
        isExpanded: project.isExpanded ?? true,
        startDate: project.startDate,
        endDate: project.endDate,
        labels: project.labels ?? [],
        position: project.position ?? 0,
      }));

      // Set default permissions if not provided
      const projectPermissions = permissions || [
        `read("user:${userId}")`,
        `update("user:${userId}")`,
        `delete("user:${userId}")`,
      ];

      return await databaseService.batchCreateDocuments<Record<string, unknown>>(
        this.collectionId,
        projectDocuments as unknown as Array<Record<string, unknown>>,
        projectPermissions
      ) as unknown as Project[];
    } catch (error) {
      console.error('Batch create projects error:', error);
      throw error;
    }
  }

  /**
   * Batch update projects
   */
  async batchUpdateProjects(
    updates: Array<{ id: string; data: UpdateProjectData }>,
    permissions?: string[]
  ): Promise<Project[]> {
    try {
      return await databaseService.batchUpdateDocuments<Record<string, unknown>>(
        this.collectionId,
        updates as unknown as Array<{ id: string; data: Record<string, unknown> }>,
        permissions
      ) as unknown as Project[];
    } catch (error) {
      console.error('Batch update projects error:', error);
      throw error;
    }
  }

  /**
   * Batch delete projects (with cascade deletion of tasks)
   */
  async batchDeleteProjects(projectIds: string[], userId: string): Promise<void> {
    try {
      // Delete each project with cascade
      for (const projectId of projectIds) {
        await this.deleteProject(projectId, userId);
      }
    } catch (error) {
      console.error('Batch delete projects error:', error);
      throw error;
    }
  }

  /**
   * Get top-level projects (no parent)
   */
  async getTopLevelProjects(userId: string): Promise<Project[]> {
    return this.listProjects({ userId, parentId: null as any });
  }

  /**
   * Get child projects
   */
  async getChildProjects(parentId: string, userId: string): Promise<Project[]> {
    return this.listProjects({ userId, parentId });
  }

  /**
   * Get projects by status
   */
  async getProjectsByStatus(
    status: string | string[],
    userId: string
  ): Promise<Project[]> {
    return this.listProjects({ userId, status });
  }

  /**
   * Get projects by label
   */
  async getProjectsByLabel(labelId: string, userId: string): Promise<Project[]> {
    return this.listProjects({ userId, labels: [labelId] });
  }

  /**
   * Search projects
   */
  async searchProjects(searchQuery: string, userId: string): Promise<Project[]> {
    return this.listProjects({ userId, search: searchQuery });
  }

  /**
   * Count projects
   */
  async countProjects(filters: ProjectFilters = {}): Promise<number> {
    try {
      const queries: string[] = [];

      if (filters.userId) {
        queries.push(Query.equal('userId', filters.userId));
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
      console.error('Count projects error:', error);
      throw error;
    }
  }

  /**
   * Update project position (for drag-and-drop reordering)
   */
  async updateProjectPosition(projectId: string, newPosition: number): Promise<Project> {
    return this.updateProject(projectId, { position: newPosition });
  }

  /**
   * Add label to project
   */
  async addLabelToProject(projectId: string, labelId: string): Promise<Project> {
    try {
      const project = await this.getProject(projectId);
      const labels = [...project.labels];
      
      if (!labels.includes(labelId)) {
        labels.push(labelId);
      }

      return await this.updateProject(projectId, { labels });
    } catch (error) {
      console.error('Add label to project error:', error);
      throw error;
    }
  }

  /**
   * Remove label from project
   */
  async removeLabelFromProject(projectId: string, labelId: string): Promise<Project> {
    try {
      const project = await this.getProject(projectId);
      const labels = project.labels.filter((id) => id !== labelId);

      return await this.updateProject(projectId, { labels });
    } catch (error) {
      console.error('Remove label from project error:', error);
      throw error;
    }
  }

  /**
   * Update project status
   */
  async updateProjectStatus(
    projectId: string,
    status: ProjectDocument['status']
  ): Promise<Project> {
    return this.updateProject(projectId, { status });
  }

  /**
   * Toggle project expansion state
   */
  async toggleProjectExpansion(projectId: string): Promise<Project> {
    try {
      const project = await this.getProject(projectId);
      return await this.updateProject(projectId, { isExpanded: !project.isExpanded });
    } catch (error) {
      console.error('Toggle project expansion error:', error);
      throw error;
    }
  }

  /**
   * Move project to a new parent (or make it top-level)
   */
  async moveProjectToParent(
    projectId: string,
    parentId: string | undefined
  ): Promise<Project> {
    return this.updateProject(projectId, { parentId });
  }

  /**
   * Get project hierarchy (project with all nested child projects)
   */
  async getProjectHierarchy(projectId: string, userId: string): Promise<Project & { children: Project[] }> {
    try {
      const project = await this.getProject(projectId, userId);
      const children = await this.getChildProjects(projectId, userId);
      
      return {
        ...project,
        children,
      };
    } catch (error) {
      console.error('Get project hierarchy error:', error);
      throw error;
    }
  }

  /**
   * Get all projects with their statistics
   */
  async getAllProjectsWithStatistics(userId: string): Promise<Array<Project & { statistics: ProjectStatistics }>> {
    try {
      const projects = await this.listProjects({ userId });
      
      const projectsWithStats = await Promise.all(
        projects.map(async (project) => {
          const statistics = await this.calculateProjectStatistics(project.$id, userId);
          return {
            ...project,
            statistics,
          };
        })
      );
      
      return projectsWithStats;
    } catch (error) {
      console.error('Get all projects with statistics error:', error);
      throw error;
    }
  }

  /**
   * Archive a project (set status to archived)
   */
  async archiveProject(projectId: string): Promise<Project> {
    return this.updateProjectStatus(projectId, 'archived');
  }

  /**
   * Unarchive a project (set status to active)
   */
  async unarchiveProject(projectId: string): Promise<Project> {
    return this.updateProjectStatus(projectId, 'active');
  }

  /**
   * Get archived projects
   */
  async getArchivedProjects(userId: string): Promise<Project[]> {
    return this.getProjectsByStatus('archived', userId);
  }

  /**
   * Get active projects
   */
  async getActiveProjects(userId: string): Promise<Project[]> {
    return this.getProjectsByStatus('active', userId);
  }

  /**
   * Duplicate a project (with or without tasks)
   */
  async duplicateProject(
    projectId: string,
    userId: string,
    includeTasks: boolean = false,
    newName?: string
  ): Promise<Project> {
    try {
      // Get the original project
      const originalProject = await this.getProject(projectId, userId);
      
      // Create new project with copied data
      const newProject = await this.createProject(
        {
          name: newName || `${originalProject.name} (Copy)`,
          description: originalProject.description,
          color: originalProject.color,
          status: originalProject.status,
          parentId: originalProject.parentId,
          isExpanded: originalProject.isExpanded,
          startDate: originalProject.startDate,
          endDate: originalProject.endDate,
          labels: [...originalProject.labels],
          position: originalProject.position + 1,
        },
        userId
      );
      
      // If includeTasks is true, copy all tasks
      if (includeTasks) {
        const tasks = await taskService.getTasksByProject(projectId, userId);
        
        if (tasks.length > 0) {
          const newTasks = tasks.map(task => ({
            title: task.title,
            description: task.description,
            completed: false, // Reset completion status
            priority: task.priority,
            dueDate: task.dueDate,
            startDate: task.startDate,
            projectId: newProject.$id,
            epicId: task.epicId,
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
      
      return newProject;
    } catch (error) {
      console.error('Duplicate project error:', error);
      throw error;
    }
  }

  /**
   * Get project completion percentage
   */
  async getProjectCompletionPercentage(projectId: string, userId: string): Promise<number> {
    try {
      const statistics = await this.calculateProjectStatistics(projectId, userId);
      return statistics.completionRate;
    } catch (error) {
      console.error('Get project completion percentage error:', error);
      throw error;
    }
  }

  /**
   * Get projects with overdue tasks
   */
  async getProjectsWithOverdueTasks(userId: string): Promise<Array<Project & { overdueCount: number }>> {
    try {
      const projects = await this.listProjects({ userId });
      
      const projectsWithOverdue = await Promise.all(
        projects.map(async (project) => {
          const statistics = await this.calculateProjectStatistics(project.$id, userId);
          return {
            ...project,
            overdueCount: statistics.overdueTasks,
          };
        })
      );
      
      // Filter to only projects with overdue tasks
      return projectsWithOverdue.filter(p => p.overdueCount > 0);
    } catch (error) {
      console.error('Get projects with overdue tasks error:', error);
      throw error;
    }
  }

  /**
   * Reorder project (for drag-and-drop)
   * Updates positions of affected projects
   */
  async reorderProject(
    projectId: string,
    newPosition: number,
    userId: string,
    parentId?: string
  ): Promise<void> {
    try {
      // Get all projects in the same context (same parent)
      const filters: ProjectFilters = { userId };
      if (parentId !== undefined) {
        filters.parentId = parentId;
      } else {
        filters.parentId = null as any;
      }
      
      const projects = await this.listProjects(filters);
      const projectToMove = projects.find(p => p.$id === projectId);
      
      if (!projectToMove) {
        throw new Error('Project not found');
      }

      const oldPosition = projectToMove.position;
      
      // Update positions of affected projects
      const updates: Array<{ id: string; data: UpdateProjectData }> = [];
      
      for (const project of projects) {
        if (project.$id === projectId) {
          // Update the moved project
          updates.push({
            id: project.$id,
            data: { position: newPosition },
          });
        } else if (oldPosition < newPosition) {
          // Moving down: shift projects between old and new position up
          if (project.position > oldPosition && project.position <= newPosition) {
            updates.push({
              id: project.$id,
              data: { position: project.position - 1 },
            });
          }
        } else if (oldPosition > newPosition) {
          // Moving up: shift projects between new and old position down
          if (project.position >= newPosition && project.position < oldPosition) {
            updates.push({
              id: project.$id,
              data: { position: project.position + 1 },
            });
          }
        }
      }

      // Batch update all affected projects
      if (updates.length > 0) {
        await this.batchUpdateProjects(updates);
      }
    } catch (error) {
      console.error('Reorder project error:', error);
      throw error;
    }
  }

  /**
   * Get project progress over time (for charts)
   */
  async getProjectProgressHistory(
    projectId: string,
    userId: string,
    days: number = 30
  ): Promise<Array<{ date: string; completionRate: number; completedTasks: number; totalTasks: number }>> {
    try {
      // This is a simplified version - in production, you'd want to track historical data
      // For now, we'll just return the current statistics
      const statistics = await this.calculateProjectStatistics(projectId, userId);
      const today = new Date().toISOString().split('T')[0];
      
      return [{
        date: today,
        completionRate: statistics.completionRate,
        completedTasks: statistics.completedTasks,
        totalTasks: statistics.totalTasks,
      }];
    } catch (error) {
      console.error('Get project progress history error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const projectService = new ProjectService();

// Export Query helper for building custom queries
export { Query };
