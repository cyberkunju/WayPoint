import { databaseService, Query } from './database.service';
import { COLLECTIONS } from '@/lib/appwrite';
import { ID, type Models } from 'appwrite';

/**
 * Project status history entry
 */
export interface ProjectStatusHistory {
  projectId: string;
  userId: string;
  fromStatus: string;
  toStatus: string;
  notes?: string;
  changedAt: string;
  changedBy: string;
}

/**
 * Project status history with Appwrite metadata
 */
export type ProjectStatusHistoryDocument = Models.Document & ProjectStatusHistory;

/**
 * Project Status Service
 * Handles project status changes and history tracking
 */
export class ProjectStatusService {
  private readonly collectionId = COLLECTIONS.PROJECT_STATUS_HISTORY;

  /**
   * Record a status change
   */
  async recordStatusChange(
    projectId: string,
    userId: string,
    fromStatus: string,
    toStatus: string,
    notes?: string,
    permissions?: string[]
  ): Promise<ProjectStatusHistoryDocument> {
    try {
      const historyEntry: ProjectStatusHistory = {
        projectId,
        userId,
        fromStatus,
        toStatus,
        notes,
        changedAt: new Date().toISOString(),
        changedBy: userId,
      };

      const historyPermissions = permissions || [
        `read("user:${userId}")`,
        `update("user:${userId}")`,
        `delete("user:${userId}")`,
      ];

      return await databaseService.createDocument<Record<string, unknown>>(
        this.collectionId,
        historyEntry as unknown as Record<string, unknown>,
        ID.unique(),
        historyPermissions
      ) as unknown as ProjectStatusHistoryDocument;
    } catch (error) {
      console.error('Record status change error:', error);
      throw error;
    }
  }

  /**
   * Get status history for a project
   */
  async getProjectStatusHistory(
    projectId: string,
    userId?: string
  ): Promise<ProjectStatusHistoryDocument[]> {
    try {
      const queries: string[] = [
        Query.equal('projectId', projectId),
        Query.orderDesc('changedAt'),
      ];

      if (userId) {
        queries.push(Query.equal('userId', userId));
      }

      const result = await databaseService.listDocuments<Record<string, unknown>>(
        this.collectionId,
        queries
      );

      return result.documents as unknown as ProjectStatusHistoryDocument[];
    } catch (error) {
      console.error('Get project status history error:', error);
      throw error;
    }
  }

  /**
   * Get all status changes for a user
   */
  async getUserStatusHistory(
    userId: string,
    limit?: number
  ): Promise<ProjectStatusHistoryDocument[]> {
    try {
      const queries: string[] = [
        Query.equal('userId', userId),
        Query.orderDesc('changedAt'),
      ];

      if (limit) {
        queries.push(Query.limit(limit));
      }

      const result = await databaseService.listDocuments<Record<string, unknown>>(
        this.collectionId,
        queries
      );

      return result.documents as unknown as ProjectStatusHistoryDocument[];
    } catch (error) {
      console.error('Get user status history error:', error);
      throw error;
    }
  }

  /**
   * Get status changes within a date range
   */
  async getStatusHistoryByDateRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<ProjectStatusHistoryDocument[]> {
    try {
      const queries: string[] = [
        Query.equal('userId', userId),
        Query.greaterThanEqual('changedAt', startDate),
        Query.lessThanEqual('changedAt', endDate),
        Query.orderDesc('changedAt'),
      ];

      const result = await databaseService.listDocuments<Record<string, unknown>>(
        this.collectionId,
        queries
      );

      return result.documents as unknown as ProjectStatusHistoryDocument[];
    } catch (error) {
      console.error('Get status history by date range error:', error);
      throw error;
    }
  }

  /**
   * Get latest status change for a project
   */
  async getLatestStatusChange(
    projectId: string,
    userId?: string
  ): Promise<ProjectStatusHistoryDocument | null> {
    try {
      const queries: string[] = [
        Query.equal('projectId', projectId),
        Query.orderDesc('changedAt'),
        Query.limit(1),
      ];

      if (userId) {
        queries.push(Query.equal('userId', userId));
      }

      const result = await databaseService.listDocuments<Record<string, unknown>>(
        this.collectionId,
        queries
      );

      return result.documents.length > 0
        ? (result.documents[0] as unknown as ProjectStatusHistoryDocument)
        : null;
    } catch (error) {
      console.error('Get latest status change error:', error);
      throw error;
    }
  }

  /**
   * Count status changes for a project
   */
  async countStatusChanges(projectId: string, userId?: string): Promise<number> {
    try {
      const queries: string[] = [Query.equal('projectId', projectId)];

      if (userId) {
        queries.push(Query.equal('userId', userId));
      }

      return await databaseService.countDocuments(this.collectionId, queries);
    } catch (error) {
      console.error('Count status changes error:', error);
      throw error;
    }
  }

  /**
   * Delete status history for a project (when project is deleted)
   */
  async deleteProjectStatusHistory(projectId: string): Promise<void> {
    try {
      const history = await this.getProjectStatusHistory(projectId);

      for (const entry of history) {
        await databaseService.deleteDocument(this.collectionId, entry.$id);
      }
    } catch (error) {
      console.error('Delete project status history error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const projectStatusService = new ProjectStatusService();
