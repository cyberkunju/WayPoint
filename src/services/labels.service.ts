import { databaseService, Query } from './database.service';
import { COLLECTIONS } from '@/lib/appwrite';
import { ID, type Models } from 'appwrite';

/**
 * Label interface matching Appwrite collection schema
 */
export interface LabelDocument {
  userId: string;
  name: string;
  color: string;
}

/**
 * Label with Appwrite metadata
 */
export type Label = Models.Document & LabelDocument;

/**
 * Label creation data (without Appwrite metadata)
 */
export type CreateLabelData = Omit<LabelDocument, 'userId'> & {
  userId?: string; // Optional, will be set by service if not provided
};

/**
 * Label update data (partial)
 */
export type UpdateLabelData = Partial<Omit<LabelDocument, 'userId'>>;

/**
 * Label filter options
 */
export interface LabelFilters {
  userId?: string;
  name?: string;
  search?: string;
  limit?: number;
  offset?: number;
  orderBy?: 'name' | 'createdAt' | 'updatedAt';
  orderDirection?: 'asc' | 'desc';
}

/**
 * Labels Service
 * Handles all label-related operations with Appwrite
 */
export class LabelsService {
  private readonly collectionId = COLLECTIONS.LABELS;

  /**
   * Create a new label
   */
  async createLabel(
    data: CreateLabelData,
    userId: string,
    permissions?: string[]
  ): Promise<Label> {
    try {
      const labelData: LabelDocument = {
        userId,
        name: data.name,
        color: data.color ?? '#F2994A',
      };

      // Set default permissions if not provided
      const labelPermissions = permissions || [
        `read("user:${userId}")`,
        `update("user:${userId}")`,
        `delete("user:${userId}")`,
      ];

      return await databaseService.createDocument<Record<string, unknown>>(
        this.collectionId,
        labelData as unknown as Record<string, unknown>,
        ID.unique(),
        labelPermissions
      ) as unknown as Label;
    } catch (error) {
      console.error('Create label error:', error);
      throw error;
    }
  }

  /**
   * Get a label by ID
   */
  async getLabel(labelId: string, userId?: string): Promise<Label> {
    try {
      const queries = userId ? [Query.equal('userId', userId)] : undefined;
      return await databaseService.getDocument<Record<string, unknown>>(
        this.collectionId,
        labelId,
        queries
      ) as unknown as Label;
    } catch (error) {
      console.error('Get label error:', error);
      throw error;
    }
  }

  /**
   * Update a label
   */
  async updateLabel(
    labelId: string,
    data: UpdateLabelData,
    permissions?: string[]
  ): Promise<Label> {
    try {
      return await databaseService.updateDocument<Record<string, unknown>>(
        this.collectionId,
        labelId,
        data as unknown as Record<string, unknown>,
        permissions
      ) as unknown as Label;
    } catch (error) {
      console.error('Update label error:', error);
      throw error;
    }
  }

  /**
   * Delete a label
   * Note: This will remove the label from all projects that use it
   */
  async deleteLabel(labelId: string): Promise<void> {
    try {
      await databaseService.deleteDocument(this.collectionId, labelId);
    } catch (error) {
      console.error('Delete label error:', error);
      throw error;
    }
  }

  /**
   * List labels with filters
   */
  async listLabels(filters: LabelFilters = {}): Promise<Label[]> {
    try {
      const queries: string[] = [];

      // User filter (required for security)
      if (filters.userId) {
        queries.push(Query.equal('userId', filters.userId));
      }

      // Name filter (exact match)
      if (filters.name) {
        queries.push(Query.equal('name', filters.name));
      }

      // Search filter (searches in name)
      if (filters.search) {
        queries.push(Query.search('name', filters.search));
      }

      // Ordering
      if (filters.orderBy) {
        const direction = filters.orderDirection === 'desc' ? Query.orderDesc : Query.orderAsc;
        queries.push(direction(filters.orderBy));
      } else {
        // Default ordering by name
        queries.push(Query.orderAsc('name'));
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

      return result.documents as unknown as Label[];
    } catch (error) {
      console.error('List labels error:', error);
      throw error;
    }
  }

  /**
   * Get all labels for a user
   */
  async getUserLabels(userId: string): Promise<Label[]> {
    return this.listLabels({ userId });
  }

  /**
   * Search labels by name
   */
  async searchLabels(searchQuery: string, userId: string): Promise<Label[]> {
    return this.listLabels({ userId, search: searchQuery });
  }

  /**
   * Check if label name exists for user
   */
  async labelNameExists(name: string, userId: string, excludeLabelId?: string): Promise<boolean> {
    try {
      const labels = await this.listLabels({ userId, name });
      
      if (excludeLabelId) {
        return labels.some(label => label.$id !== excludeLabelId);
      }
      
      return labels.length > 0;
    } catch (error) {
      console.error('Check label name exists error:', error);
      throw error;
    }
  }

  /**
   * Count labels
   */
  async countLabels(filters: LabelFilters = {}): Promise<number> {
    try {
      const queries: string[] = [];

      if (filters.userId) {
        queries.push(Query.equal('userId', filters.userId));
      }

      return await databaseService.countDocuments(this.collectionId, queries);
    } catch (error) {
      console.error('Count labels error:', error);
      throw error;
    }
  }

  /**
   * Batch create labels
   */
  async batchCreateLabels(
    labels: CreateLabelData[],
    userId: string,
    permissions?: string[]
  ): Promise<Label[]> {
    try {
      const labelDocuments: LabelDocument[] = labels.map((label) => ({
        userId,
        name: label.name,
        color: label.color ?? '#F2994A',
      }));

      // Set default permissions if not provided
      const labelPermissions = permissions || [
        `read("user:${userId}")`,
        `update("user:${userId}")`,
        `delete("user:${userId}")`,
      ];

      return await databaseService.batchCreateDocuments<Record<string, unknown>>(
        this.collectionId,
        labelDocuments as unknown as Array<Record<string, unknown>>,
        labelPermissions
      ) as unknown as Label[];
    } catch (error) {
      console.error('Batch create labels error:', error);
      throw error;
    }
  }

  /**
   * Batch update labels
   */
  async batchUpdateLabels(
    updates: Array<{ id: string; data: UpdateLabelData }>,
    permissions?: string[]
  ): Promise<Label[]> {
    try {
      return await databaseService.batchUpdateDocuments<Record<string, unknown>>(
        this.collectionId,
        updates as unknown as Array<{ id: string; data: Record<string, unknown> }>,
        permissions
      ) as unknown as Label[];
    } catch (error) {
      console.error('Batch update labels error:', error);
      throw error;
    }
  }

  /**
   * Batch delete labels
   */
  async batchDeleteLabels(labelIds: string[]): Promise<void> {
    try {
      await databaseService.batchDeleteDocuments(this.collectionId, labelIds);
    } catch (error) {
      console.error('Batch delete labels error:', error);
      throw error;
    }
  }

  /**
   * Get labels by IDs
   */
  async getLabelsByIds(labelIds: string[], userId: string): Promise<Label[]> {
    try {
      if (labelIds.length === 0) {
        return [];
      }

      const queries = [
        Query.equal('userId', userId),
        Query.equal('$id', labelIds),
      ];

      const result = await databaseService.listDocuments<Record<string, unknown>>(
        this.collectionId,
        queries
      );

      return result.documents as unknown as Label[];
    } catch (error) {
      console.error('Get labels by IDs error:', error);
      throw error;
    }
  }

  /**
   * Get default labels (predefined labels for new users)
   */
  getDefaultLabels(): CreateLabelData[] {
    return [
      { name: 'Client', color: '#2E5AAC' },
      { name: 'Internal', color: '#27AE60' },
      { name: 'Research', color: '#9B51E0' },
      { name: 'Development', color: '#F2994A' },
      { name: 'Marketing', color: '#EB5757' },
      { name: 'Design', color: '#F2C94C' },
      { name: 'Urgent', color: '#E74C3C' },
      { name: 'Low Priority', color: '#95A5A6' },
    ];
  }

  /**
   * Create default labels for a new user
   */
  async createDefaultLabels(userId: string): Promise<Label[]> {
    const defaultLabels = this.getDefaultLabels();
    return this.batchCreateLabels(defaultLabels, userId);
  }
}

// Export singleton instance
export const labelsService = new LabelsService();

// Export Query helper for building custom queries
export { Query };
