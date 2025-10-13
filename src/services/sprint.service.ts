import { ID, Query, type Models } from 'appwrite';
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite';

/**
 * Sprint status types
 */
export type SprintStatus = 'planning' | 'active' | 'completed' | 'cancelled';

/**
 * Sprint interface
 */
export interface Sprint extends Models.Document {
  userId: string;
  projectId?: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  goals?: string;
  status: SprintStatus;
  velocity?: number;
  completedPoints?: number;
  totalPoints?: number;
  taskIds: string[];
}

/**
 * Sprint creation data
 */
export interface CreateSprintData {
  userId: string;
  projectId?: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  goals?: string;
  status?: SprintStatus;
  taskIds?: string[];
}

/**
 * Sprint update data
 */
export interface UpdateSprintData {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  goals?: string;
  status?: SprintStatus;
  velocity?: number;
  completedPoints?: number;
  totalPoints?: number;
  taskIds?: string[];
}

/**
 * Sprint statistics
 */
export interface SprintStatistics {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  completionRate: number;
  totalPoints: number;
  completedPoints: number;
  remainingPoints: number;
  velocity: number;
  daysRemaining: number;
  daysElapsed: number;
  totalDays: number;
  burnDownData: Array<{
    date: string;
    ideal: number;
    actual: number;
  }>;
}

/**
 * Sprint Service
 * Handles all sprint-related operations with Appwrite
 */
class SprintService {
  /**
   * Create a new sprint
   */
  async createSprint(data: CreateSprintData): Promise<Sprint> {
    try {
      const sprintData = {
        userId: data.userId,
        projectId: data.projectId || null,
        name: data.name,
        description: data.description || '',
        startDate: data.startDate,
        endDate: data.endDate,
        goals: data.goals || '',
        status: data.status || 'planning',
        velocity: 0,
        completedPoints: 0,
        totalPoints: 0,
        taskIds: data.taskIds || []
      };

      const sprint = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.SPRINTS,
        ID.unique(),
        sprintData
      );

      return sprint as unknown as Sprint;
    } catch (error) {
      console.error('Error creating sprint:', error);
      throw error;
    }
  }

  /**
   * Get sprint by ID
   */
  async getSprint(sprintId: string): Promise<Sprint> {
    try {
      const sprint = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.SPRINTS,
        sprintId
      );

      return sprint as unknown as Sprint;
    } catch (error) {
      console.error('Error getting sprint:', error);
      throw error;
    }
  }

  /**
   * List sprints for a user
   */
  async listSprints(userId: string, projectId?: string): Promise<Sprint[]> {
    try {
      const queries = [
        Query.equal('userId', userId),
        Query.orderDesc('$createdAt')
      ];

      if (projectId) {
        queries.push(Query.equal('projectId', projectId));
      }

      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.SPRINTS,
        queries
      );

      return response.documents as unknown as Sprint[];
    } catch (error) {
      console.error('Error listing sprints:', error);
      throw error;
    }
  }

  /**
   * Get active sprint for a project
   */
  async getActiveSprint(userId: string, projectId?: string): Promise<Sprint | null> {
    try {
      const queries = [
        Query.equal('userId', userId),
        Query.equal('status', 'active'),
        Query.limit(1)
      ];

      if (projectId) {
        queries.push(Query.equal('projectId', projectId));
      }

      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.SPRINTS,
        queries
      );

      return response.documents.length > 0 ? (response.documents[0] as unknown as Sprint) : null;
    } catch (error) {
      console.error('Error getting active sprint:', error);
      throw error;
    }
  }

  /**
   * Update sprint
   */
  async updateSprint(sprintId: string, data: UpdateSprintData): Promise<Sprint> {
    try {
      const sprint = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.SPRINTS,
        sprintId,
        data
      );

      return sprint as unknown as Sprint;
    } catch (error) {
      console.error('Error updating sprint:', error);
      throw error;
    }
  }

  /**
   * Delete sprint
   */
  async deleteSprint(sprintId: string): Promise<void> {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTIONS.SPRINTS,
        sprintId
      );
    } catch (error) {
      console.error('Error deleting sprint:', error);
      throw error;
    }
  }

  /**
   * Add task to sprint
   */
  async addTaskToSprint(sprintId: string, taskId: string): Promise<Sprint> {
    try {
      const sprint = await this.getSprint(sprintId);
      const taskIds = [...(sprint.taskIds || [])];
      
      if (!taskIds.includes(taskId)) {
        taskIds.push(taskId);
      }

      return await this.updateSprint(sprintId, { taskIds });
    } catch (error) {
      console.error('Error adding task to sprint:', error);
      throw error;
    }
  }

  /**
   * Remove task from sprint
   */
  async removeTaskFromSprint(sprintId: string, taskId: string): Promise<Sprint> {
    try {
      const sprint = await this.getSprint(sprintId);
      const taskIds = (sprint.taskIds || []).filter(id => id !== taskId);

      return await this.updateSprint(sprintId, { taskIds });
    } catch (error) {
      console.error('Error removing task from sprint:', error);
      throw error;
    }
  }

  /**
   * Start sprint (change status to active)
   */
  async startSprint(sprintId: string): Promise<Sprint> {
    try {
      return await this.updateSprint(sprintId, { status: 'active' });
    } catch (error) {
      console.error('Error starting sprint:', error);
      throw error;
    }
  }

  /**
   * Complete sprint
   */
  async completeSprint(sprintId: string): Promise<Sprint> {
    try {
      return await this.updateSprint(sprintId, { status: 'completed' });
    } catch (error) {
      console.error('Error completing sprint:', error);
      throw error;
    }
  }

  /**
   * Calculate sprint statistics
   */
  async calculateSprintStatistics(sprintId: string, tasks: any[]): Promise<SprintStatistics> {
    try {
      const sprint = await this.getSprint(sprintId);
      const sprintTasks = tasks.filter(task => sprint.taskIds?.includes(task.$id));

      const totalTasks = sprintTasks.length;
      const completedTasks = sprintTasks.filter(task => task.completed).length;
      const inProgressTasks = sprintTasks.filter(task => !task.completed && task.startDate).length;
      const todoTasks = totalTasks - completedTasks - inProgressTasks;

      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      // Calculate points (using estimatedTime as story points)
      const totalPoints = sprintTasks.reduce((sum, task) => sum + (task.estimatedTime || 0), 0);
      const completedPoints = sprintTasks
        .filter(task => task.completed)
        .reduce((sum, task) => sum + (task.estimatedTime || 0), 0);
      const remainingPoints = totalPoints - completedPoints;

      // Calculate days
      const startDate = new Date(sprint.startDate);
      const endDate = new Date(sprint.endDate);
      const today = new Date();
      
      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const daysElapsed = Math.max(0, Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
      const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

      // Calculate velocity (points per day)
      const velocity = daysElapsed > 0 ? completedPoints / daysElapsed : 0;

      // Generate burn-down data
      const burnDownData = this.generateBurnDownData(
        startDate,
        endDate,
        totalPoints,
        sprintTasks
      );

      return {
        totalTasks,
        completedTasks,
        inProgressTasks,
        todoTasks,
        completionRate,
        totalPoints,
        completedPoints,
        remainingPoints,
        velocity,
        daysRemaining,
        daysElapsed,
        totalDays,
        burnDownData
      };
    } catch (error) {
      console.error('Error calculating sprint statistics:', error);
      throw error;
    }
  }

  /**
   * Generate burn-down chart data
   */
  private generateBurnDownData(
    startDate: Date,
    endDate: Date,
    totalPoints: number,
    tasks: any[]
  ): Array<{ date: string; ideal: number; actual: number }> {
    const data: Array<{ date: string; ideal: number; actual: number }> = [];
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const idealBurnRate = totalPoints / totalDays;

    let currentDate = new Date(startDate);
    let remainingPoints = totalPoints;

    for (let day = 0; day <= totalDays; day++) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const idealRemaining = Math.max(0, totalPoints - (idealBurnRate * day));

      // Calculate actual remaining points for this date
      const completedByDate = tasks.filter(task => {
        if (!task.completed || !task.completedAt) return false;
        const completedDate = new Date(task.completedAt);
        return completedDate <= currentDate;
      });

      const completedPoints = completedByDate.reduce(
        (sum, task) => sum + (task.estimatedTime || 0),
        0
      );
      const actualRemaining = Math.max(0, totalPoints - completedPoints);

      data.push({
        date: dateStr,
        ideal: Math.round(idealRemaining * 10) / 10,
        actual: Math.round(actualRemaining * 10) / 10
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return data;
  }
}

// Export singleton instance
export const sprintService = new SprintService();
export default sprintService;
