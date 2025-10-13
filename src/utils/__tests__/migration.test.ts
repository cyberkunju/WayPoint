import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  detectLocalStorageData,
  getLocalStorageData,
  markMigrationComplete,
  clearLocalStorageData,
  resetMigrationStatus,
  getMigrationStatus,
} from '../migration';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Migration Utility', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('detectLocalStorageData', () => {
    it('should return no data when localStorage is empty', () => {
      const status = detectLocalStorageData();

      expect(status.hasLocalData).toBe(false);
      expect(status.taskCount).toBe(0);
      expect(status.projectCount).toBe(0);
      expect(status.labelCount).toBe(0);
      expect(status.migrationCompleted).toBe(false);
    });

    it('should detect existing localStorage data', () => {
      const mockData = {
        state: {
          tasks: [
            { id: '1', title: 'Task 1' },
            { id: '2', title: 'Task 2' },
          ],
          projects: [{ id: 'p1', name: 'Project 1' }],
          labels: [{ id: 'l1', name: 'Label 1' }],
        },
      };

      localStorageMock.setItem('clarity-task-storage', JSON.stringify(mockData));

      const status = detectLocalStorageData();

      expect(status.hasLocalData).toBe(true);
      expect(status.taskCount).toBe(2);
      expect(status.projectCount).toBe(1);
      expect(status.labelCount).toBe(1);
      expect(status.migrationCompleted).toBe(false);
    });

    it('should return migration completed status if already migrated', () => {
      const completedStatus = {
        hasLocalData: true,
        taskCount: 5,
        projectCount: 2,
        labelCount: 3,
        migrationCompleted: true,
        migrationDate: '2024-01-01T00:00:00.000Z',
      };

      localStorageMock.setItem(
        'clarity-migration-status',
        JSON.stringify(completedStatus)
      );

      const status = detectLocalStorageData();

      expect(status.migrationCompleted).toBe(true);
      expect(status.migrationDate).toBe('2024-01-01T00:00:00.000Z');
    });
  });

  describe('getLocalStorageData', () => {
    it('should return null when no data exists', () => {
      const data = getLocalStorageData();
      expect(data).toBeNull();
    });

    it('should return localStorage data', () => {
      const mockData = {
        state: {
          tasks: [
            {
              id: '1',
              title: 'Task 1',
              completed: false,
              priority: 4,
              labels: [],
              dependencies: [],
              subtasks: [],
              createdAt: '2024-01-01',
              updatedAt: '2024-01-01',
            },
          ],
          projects: [
            {
              id: 'p1',
              name: 'Project 1',
              color: '#2E5AAC',
              isExpanded: true,
              createdAt: '2024-01-01',
              updatedAt: '2024-01-01',
            },
          ],
          labels: [
            {
              id: 'l1',
              name: 'Label 1',
              color: '#F2994A',
              createdAt: '2024-01-01',
              updatedAt: '2024-01-01',
            },
          ],
        },
      };

      localStorageMock.setItem('clarity-task-storage', JSON.stringify(mockData));

      const data = getLocalStorageData();

      expect(data).not.toBeNull();
      expect(data?.tasks).toHaveLength(1);
      expect(data?.projects).toHaveLength(1);
      expect(data?.labels).toHaveLength(1);
      expect(data?.tasks[0].title).toBe('Task 1');
    });
  });

  describe('markMigrationComplete', () => {
    it('should mark migration as complete', () => {
      const status = {
        hasLocalData: true,
        taskCount: 5,
        projectCount: 2,
        labelCount: 3,
        migrationCompleted: false,
      };

      markMigrationComplete(status);

      const savedStatus = JSON.parse(
        localStorageMock.getItem('clarity-migration-status') || '{}'
      );

      expect(savedStatus.migrationCompleted).toBe(true);
      expect(savedStatus.migrationDate).toBeDefined();
      expect(savedStatus.taskCount).toBe(5);
    });
  });

  describe('clearLocalStorageData', () => {
    it('should clear task storage data', () => {
      localStorageMock.setItem('clarity-task-storage', JSON.stringify({ data: 'test' }));

      clearLocalStorageData();

      expect(localStorageMock.getItem('clarity-task-storage')).toBeNull();
    });

    it('should keep migration status when clearing data', () => {
      localStorageMock.setItem('clarity-task-storage', JSON.stringify({ data: 'test' }));
      localStorageMock.setItem(
        'clarity-migration-status',
        JSON.stringify({ migrationCompleted: true })
      );

      clearLocalStorageData();

      expect(localStorageMock.getItem('clarity-task-storage')).toBeNull();
      expect(localStorageMock.getItem('clarity-migration-status')).not.toBeNull();
    });
  });

  describe('resetMigrationStatus', () => {
    it('should reset migration status', () => {
      localStorageMock.setItem(
        'clarity-migration-status',
        JSON.stringify({ migrationCompleted: true })
      );

      resetMigrationStatus();

      expect(localStorageMock.getItem('clarity-migration-status')).toBeNull();
    });
  });

  describe('getMigrationStatus', () => {
    it('should return current migration status', () => {
      const mockData = {
        state: {
          tasks: [{ id: '1' }],
          projects: [],
          labels: [],
        },
      };

      localStorageMock.setItem('clarity-task-storage', JSON.stringify(mockData));

      const status = getMigrationStatus();

      expect(status.hasLocalData).toBe(true);
      expect(status.taskCount).toBe(1);
    });
  });
});
