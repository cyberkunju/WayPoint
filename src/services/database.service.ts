import { databases, DATABASE_ID } from '@/lib/appwrite';
import { ID, Query, type Models } from 'appwrite';

/**
 * Database Service
 * Handles all database operations with Appwrite
 */
export class DatabaseService {
  /**
   * Create a new document in a collection
   */
  async createDocument<T extends Record<string, unknown>>(
    collectionId: string,
    data: Omit<T, '$id' | '$createdAt' | '$updatedAt'>,
    documentId: string = ID.unique(),
    permissions?: string[]
  ): Promise<Models.Document & T> {
    try {
      return await databases.createDocument(
        DATABASE_ID,
        collectionId,
        documentId,
        data,
        permissions
      ) as Models.Document & T;
    } catch (error) {
      console.error(`Create document error in ${collectionId}:`, error);
      throw error;
    }
  }

  /**
   * Get a document by ID
   */
  async getDocument<T extends Record<string, unknown>>(
    collectionId: string,
    documentId: string,
    queries?: string[]
  ): Promise<Models.Document & T> {
    try {
      return await databases.getDocument(DATABASE_ID, collectionId, documentId, queries);
    } catch (error) {
      console.error(`Get document error in ${collectionId}:`, error);
      throw error;
    }
  }

  /**
   * List documents in a collection
   */
  async listDocuments<T extends Record<string, unknown>>(
    collectionId: string,
    queries?: string[]
  ): Promise<Models.DocumentList<Models.Document & T>> {
    try {
      return await databases.listDocuments(DATABASE_ID, collectionId, queries);
    } catch (error) {
      console.error(`List documents error in ${collectionId}:`, error);
      throw error;
    }
  }

  /**
   * Update a document
   */
  async updateDocument<T extends Record<string, unknown>>(
    collectionId: string,
    documentId: string,
    data: Partial<Omit<T, '$id' | '$createdAt' | '$updatedAt'>>,
    permissions?: string[]
  ): Promise<Models.Document & T> {
    try {
      return await databases.updateDocument(
        DATABASE_ID,
        collectionId,
        documentId,
        data,
        permissions
      ) as Models.Document & T;
    } catch (error) {
      console.error(`Update document error in ${collectionId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a document
   */
  async deleteDocument(collectionId: string, documentId: string): Promise<void> {
    try {
      await databases.deleteDocument(DATABASE_ID, collectionId, documentId);
    } catch (error) {
      console.error(`Delete document error in ${collectionId}:`, error);
      throw error;
    }
  }

  /**
   * Query documents with filters
   */
  async queryDocuments<T extends Record<string, unknown>>(
    collectionId: string,
    queries: string[]
  ): Promise<Models.DocumentList<Models.Document & T>> {
    try {
      return await databases.listDocuments(DATABASE_ID, collectionId, queries);
    } catch (error) {
      console.error(`Query documents error in ${collectionId}:`, error);
      throw error;
    }
  }

  /**
   * Batch create documents (using Promise.all)
   */
  async batchCreateDocuments<T extends Record<string, unknown>>(
    collectionId: string,
    documents: Array<Omit<T, '$id' | '$createdAt' | '$updatedAt'>>,
    permissions?: string[]
  ): Promise<Array<Models.Document & T>> {
    try {
      const promises = documents.map((data) =>
        this.createDocument<T>(collectionId, data, ID.unique(), permissions)
      );
      return await Promise.all(promises);
    } catch (error) {
      console.error(`Batch create documents error in ${collectionId}:`, error);
      throw error;
    }
  }

  /**
   * Batch update documents (using Promise.all)
   */
  async batchUpdateDocuments<T extends Record<string, unknown>>(
    collectionId: string,
    updates: Array<{ id: string; data: Partial<Omit<T, '$id' | '$createdAt' | '$updatedAt'>> }>,
    permissions?: string[]
  ): Promise<Array<Models.Document & T>> {
    try {
      const promises = updates.map(({ id, data }) =>
        this.updateDocument<T>(collectionId, id, data, permissions)
      );
      return await Promise.all(promises);
    } catch (error) {
      console.error(`Batch update documents error in ${collectionId}:`, error);
      throw error;
    }
  }

  /**
   * Batch delete documents (using Promise.all)
   */
  async batchDeleteDocuments(collectionId: string, documentIds: string[]): Promise<void> {
    try {
      const promises = documentIds.map((id) => this.deleteDocument(collectionId, id));
      await Promise.all(promises);
    } catch (error) {
      console.error(`Batch delete documents error in ${collectionId}:`, error);
      throw error;
    }
  }

  /**
   * Count documents in a collection
   */
  async countDocuments(collectionId: string, queries?: string[]): Promise<number> {
    try {
      const result = await databases.listDocuments(DATABASE_ID, collectionId, queries);
      return result.total;
    } catch (error) {
      console.error(`Count documents error in ${collectionId}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();

// Export Query helper for building queries
export { Query };
