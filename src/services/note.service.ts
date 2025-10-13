import { databaseService, Query } from './database.service';
import { COLLECTIONS } from '@/lib/appwrite';
import { ID, type Models } from 'appwrite';

/**
 * Note document interface matching Appwrite collection schema
 */
export interface NoteDocument {
  userId: string;
  title: string;
  content: string;
  contentHtml?: string;
  parentId?: string;
  projectId?: string;
  isTemplate?: boolean;
  templateType?: string;
  tags?: string[];
}

/**
 * Note type with Appwrite metadata
 */
export type Note = Models.Document & NoteDocument;

/**
 * Service for managing notes in Appwrite
 */
class NoteService {
  private collectionId = COLLECTIONS.NOTES;

  /**
   * Create a new note
   */
  async createNote(data: NoteDocument): Promise<Note> {
    try {
      const note = await databaseService.createDocument<Note>(
        this.collectionId,
        data,
        ID.unique()
      );
      return note;
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  }

  /**
   * Get a note by its ID
   */
  async getNote(noteId: string): Promise<Note> {
    try {
      const note = await databaseService.getDocument<Note>(this.collectionId, noteId);
      return note;
    } catch (error) {
      console.error('Error getting note:', error);
      throw error;
    }
  }

  /**
   * List all notes for a user
   */
  async listNotes(userId: string): Promise<Note[]> {
    try {
      const response = await databaseService.listDocuments<Note>(
        this.collectionId,
        [Query.equal('userId', userId)]
      );
      return response.documents;
    } catch (error) {
      console.error('Error listing notes:', error);
      throw error;
    }
  }

  /**
   * Update a note
   */
  async updateNote(noteId: string, data: Partial<NoteDocument>): Promise<Note> {
    try {
      const note = await databaseService.updateDocument<Note>(
        this.collectionId,
        noteId,
        data
      );
      return note;
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  }

  /**
   * Delete a note
   */
  async deleteNote(noteId: string): Promise<void> {
    try {
      await databaseService.deleteDocument(this.collectionId, noteId);
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  }
}

export const noteService = new NoteService();
