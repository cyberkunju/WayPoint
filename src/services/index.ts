/**
 * Appwrite Services
 * Centralized export for all Appwrite service wrappers
 */

export { authService, AuthService } from './auth.service';
export { databaseService, DatabaseService, Query } from './database.service';
export { storageService, StorageService } from './storage.service';
export { functionsService, FunctionsService } from './functions.service';
export { recurringTasksService, RecurringTasksService } from './recurring-tasks.service';

// Re-export commonly used types from Appwrite
export type { Models } from 'appwrite';
