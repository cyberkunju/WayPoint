import { databaseService, Query } from './database.service';
import { COLLECTIONS } from '@/lib/appwrite';
import { ID, type Models } from 'appwrite';

/**
 * Note link document interface matching Appwrite collection schema
 */
export interface NoteLinkDocument {
  userId: string;
  sourceNoteId: string;
  targetNoteId: string;
}

/**
 * Note link type with Appwrite metadata
 */
export type NoteLink = Models.Document & NoteLinkDocument;

/**
 * Service for managing note links in Appwrite
 */
class NoteLinksService {
  private collectionId = COLLECTIONS.NOTE_LINKS;

  /**
   * Create a new note link
   */
  async createNoteLink(data: NoteLinkDocument): Promise<NoteLink> {
    try {
      const noteLink = await databaseService.createDocument<NoteLink>(
        this.collectionId,
        data,
        ID.unique()
      );
      return noteLink;
    } catch (error) {
      console.error('Error creating note link:', error);
      throw error;
    }
  }

  /**
   * Get all links for a note (where the note is the source)
   */
  async getLinksFromNote(noteId: string, userId: string): Promise<NoteLink[]> {
    try {
      const response = await databaseService.listDocuments<NoteLink>(
        this.collectionId,
        [
          Query.equal('userId', userId),
          Query.equal('sourceNoteId', noteId)
        ]
      );
      return response.documents;
    } catch (error) {
      console.error('Error getting links from note:', error);
      throw error;
    }
  }

  /**
   * Get all backlinks for a note (where the note is the target)
   */
  async getBacklinksToNote(noteId: string, userId: string): Promise<NoteLink[]> {
    try {
      const response = await databaseService.listDocuments<NoteLink>(
        this.collectionId,
        [
          Query.equal('userId', userId),
          Query.equal('targetNoteId', noteId)
        ]
      );
      return response.documents;
    } catch (error) {
      console.error('Error getting backlinks to note:', error);
      throw error;
    }
  }

  /**
   * Delete a note link
   */
  async deleteNoteLink(noteLinkId: string): Promise<void> {
    try {
      await databaseService.deleteDocument(this.collectionId, noteLinkId);
    } catch (error) {
      console.error('Error deleting note link:', error);
      throw error;
    }
  }

  /**
   * Delete all links for a given note (as a source)
   */
  async deleteLinksFromNote(noteId: string, userId: string): Promise<void> {
    try {
      const links = await this.getLinksFromNote(noteId, userId);
      const linkIds = links.map(link => link.$id);
      if (linkIds.length > 0) {
        await databaseService.batchDeleteDocuments(this.collectionId, linkIds);
      }
    } catch (error) {
      console.error('Error deleting links from note:', error);
      throw error;
    }
  }
}

export const noteLinksService = new NoteLinksService();
