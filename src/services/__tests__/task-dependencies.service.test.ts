import { describe, it, expect, vi, beforeEach } from 'vitest';
import { taskDependenciesService } from '../task-dependencies.service';
import { databaseService } from '../database.service';

// Mock the database service
vi.mock('../database.service', () => ({
  databaseService: {
    createDocument: vi.fn(),
    listDocuments: vi.fn(),
    updateDocument: vi.fn(),
    deleteDocument: vi.fn()
  },
  Query: {
    equal: vi.fn((field, value) => `equal(${field}, ${value})`)
  }
}));

// Mock task service
vi.mock('../task.service', () => ({
  taskService: {
    getTask: vi.fn(),
    listTasks: vi.fn()
  }
}));

describe('TaskDependenciesService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateDependency', () => {
    it('should reject self-dependency', async () => {
      const result = await taskDependenciesService.validateDependency(
        'task1',
        'task1',
        'user1'
      );

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('cannot depend on itself');
    });

    it('should detect circular dependency', async () => {
      // Mock existing dependencies: task2 -> task3
      vi.mocked(databaseService.listDocuments).mockResolvedValue({
        documents: [
          {
            $id: 'dep1',
            taskId: 'task2',
            dependsOnTaskId: 'task3',
            dependencyType: 'finish-to-start',
            userId: 'user1'
          }
        ],
        total: 1
      } as any);

      // Try to create: task3 -> task2 (would create a cycle)
      const result = await taskDependenciesService.validateDependency(
        'task3',
        'task2',
        'user1'
      );

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('circular dependency');
    });

    it('should allow valid dependency', async () => {
      // Mock no existing dependencies
      vi.mocked(databaseService.listDocuments).mockResolvedValue({
        documents: [],
        total: 0
      } as any);

      const result = await taskDependenciesService.validateDependency(
        'task1',
        'task2',
        'user1'
      );

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe('createDependency', () => {
    it('should create dependency when valid', async () => {
      // Mock validation success
      vi.mocked(databaseService.listDocuments).mockResolvedValue({
        documents: [],
        total: 0
      } as any);

      // Mock create success
      const mockDependency = {
        $id: 'dep1',
        taskId: 'task1',
        dependsOnTaskId: 'task2',
        dependencyType: 'finish-to-start',
        userId: 'user1'
      };
      vi.mocked(databaseService.createDocument).mockResolvedValue(mockDependency as any);

      const result = await taskDependenciesService.createDependency(
        {
          taskId: 'task1',
          dependsOnTaskId: 'task2',
          dependencyType: 'finish-to-start'
        },
        'user1'
      );

      expect(result).toEqual(mockDependency);
      expect(databaseService.createDocument).toHaveBeenCalled();
    });

    it('should throw error when validation fails', async () => {
      // Mock validation failure (self-dependency)
      await expect(
        taskDependenciesService.createDependency(
          {
            taskId: 'task1',
            dependsOnTaskId: 'task1',
            dependencyType: 'finish-to-start'
          },
          'user1'
        )
      ).rejects.toThrow('cannot depend on itself');
    });
  });

  describe('getTaskDependencies', () => {
    it('should return dependencies for a task', async () => {
      const mockDependencies = [
        {
          $id: 'dep1',
          taskId: 'task1',
          dependsOnTaskId: 'task2',
          dependencyType: 'finish-to-start',
          userId: 'user1'
        }
      ];

      vi.mocked(databaseService.listDocuments).mockResolvedValue({
        documents: mockDependencies,
        total: 1
      } as any);

      const result = await taskDependenciesService.getTaskDependencies('task1', 'user1');

      expect(result).toEqual(mockDependencies);
      expect(databaseService.listDocuments).toHaveBeenCalled();
    });
  });

  describe('deleteDependency', () => {
    it('should delete a dependency', async () => {
      vi.mocked(databaseService.deleteDocument).mockResolvedValue(undefined as any);

      await taskDependenciesService.deleteDependency('dep1');

      expect(databaseService.deleteDocument).toHaveBeenCalledWith(
        expect.any(String),
        'dep1'
      );
    });
  });
});
