import { storage } from '@/lib/appwrite';
import { ID, type Models } from 'appwrite';

/**
 * Storage Service
 * Handles file uploads, downloads, and management with Appwrite Storage
 */
export class StorageService {
  /**
   * Upload a file to a bucket
   */
  async uploadFile(
    bucketId: string,
    file: File,
    fileId: string = ID.unique(),
    permissions?: string[],
    onProgress?: (progress: { $id: string; progress: number; sizeUploaded: number; chunksTotal: number; chunksUploaded: number }) => void
  ): Promise<Models.File> {
    try {
      return await storage.createFile(bucketId, fileId, file, permissions, onProgress);
    } catch (error) {
      console.error(`Upload file error in bucket ${bucketId}:`, error);
      throw error;
    }
  }

  /**
   * Get file details
   */
  async getFile(bucketId: string, fileId: string): Promise<Models.File> {
    try {
      return await storage.getFile(bucketId, fileId);
    } catch (error) {
      console.error(`Get file error in bucket ${bucketId}:`, error);
      throw error;
    }
  }

  /**
   * List files in a bucket
   */
  async listFiles(bucketId: string, queries?: string[]): Promise<Models.FileList> {
    try {
      return await storage.listFiles(bucketId, queries);
    } catch (error) {
      console.error(`List files error in bucket ${bucketId}:`, error);
      throw error;
    }
  }

  /**
   * Get file download URL
   */
  getFileDownload(bucketId: string, fileId: string): string {
    return storage.getFileDownload(bucketId, fileId).toString();
  }

  /**
   * Get file preview URL (for images)
   */
  getFilePreview(
    bucketId: string,
    fileId: string,
    width?: number,
    height?: number,
    gravity?: string,
    quality?: number,
    borderWidth?: number,
    borderColor?: string,
    borderRadius?: number,
    opacity?: number,
    rotation?: number,
    background?: string,
    output?: string
  ): string {
    return storage.getFilePreview(
      bucketId,
      fileId,
      width,
      height,
      gravity as any,
      quality,
      borderWidth,
      borderColor,
      borderRadius,
      opacity,
      rotation,
      background,
      output as any
    ).toString();
  }

  /**
   * Get file view URL
   */
  getFileView(bucketId: string, fileId: string): string {
    return storage.getFileView(bucketId, fileId).toString();
  }

  /**
   * Update file metadata
   */
  async updateFile(
    bucketId: string,
    fileId: string,
    name?: string,
    permissions?: string[]
  ): Promise<Models.File> {
    try {
      return await storage.updateFile(bucketId, fileId, name, permissions);
    } catch (error) {
      console.error(`Update file error in bucket ${bucketId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a file
   */
  async deleteFile(bucketId: string, fileId: string): Promise<void> {
    try {
      await storage.deleteFile(bucketId, fileId);
    } catch (error) {
      console.error(`Delete file error in bucket ${bucketId}:`, error);
      throw error;
    }
  }

  /**
   * Batch upload files
   */
  async batchUploadFiles(
    bucketId: string,
    files: File[],
    permissions?: string[],
    onProgress?: (fileIndex: number, progress: { $id: string; progress: number; sizeUploaded: number; chunksTotal: number; chunksUploaded: number }) => void
  ): Promise<Models.File[]> {
    try {
      const uploadPromises = files.map((file, index) =>
        this.uploadFile(
          bucketId,
          file,
          ID.unique(),
          permissions,
          onProgress ? (progress) => onProgress(index, progress) : undefined
        )
      );
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error(`Batch upload files error in bucket ${bucketId}:`, error);
      throw error;
    }
  }

  /**
   * Batch delete files
   */
  async batchDeleteFiles(bucketId: string, fileIds: string[]): Promise<void> {
    try {
      const deletePromises = fileIds.map((fileId) => this.deleteFile(bucketId, fileId));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error(`Batch delete files error in bucket ${bucketId}:`, error);
      throw error;
    }
  }

  /**
   * Download file as blob
   */
  async downloadFile(bucketId: string, fileId: string): Promise<Blob> {
    try {
      const url = this.getFileDownload(bucketId, fileId);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`);
      }
      return await response.blob();
    } catch (error) {
      console.error(`Download file error in bucket ${bucketId}:`, error);
      throw error;
    }
  }

  /**
   * Get file size in human-readable format
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Validate file type
   */
  isValidFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.some((type) => {
      if (type.endsWith('/*')) {
        const category = type.split('/')[0];
        return file.type.startsWith(category + '/');
      }
      return file.type === type;
    });
  }

  /**
   * Validate file size
   */
  isValidFileSize(file: File, maxSizeInBytes: number): boolean {
    return file.size <= maxSizeInBytes;
  }
}

// Export singleton instance
export const storageService = new StorageService();
