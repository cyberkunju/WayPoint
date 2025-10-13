import { describe, it, expect, beforeEach, vi } from 'vitest';
import { epicService, type CreateEpicData, type UpdateEpicData } from '../epic.service';
import { databaseService } from '../database.service';
import { taskService } from '../task.service';

// Mock the database service
vi.mock('../database.service', () => ({
  databaseService: {
    createDocument: vi.fn(),
    getDocument: vi.fn(),
    updateDocument: vi.fn(),
    deleteDocument: vi.fn(),
    listDocuments: vi.fn(),
    countDocuments: vi.fn(),
    batchCreateDocuments: vi.fn(),
    batchUpdateDocuments: vi.fn(),
  },
  Query: {
    equal: vi.fn((field: string, value: unknown) => `equal(${field}, ${value})`),
    isNull: vi.fn((field: string) => `isNull(${field})`),
    search: vi.fn((field: string, value: string) => `search(${field}, ${value})`),
    orderAsc: vi.fn((field: string) => `orderAsc(${field})`),
    orderDesc: vi.fn((field: string) => `orderDesc(${field})`),
    limit: vi.fn((value: number) => `limit(${value})`),
    offset: vi.fn((value: number) => `offset(${value})`),
  },
}));

// Mock the task service
vi.mock('../task.service', () => ({
  taskService: {
    getTasksByEpic: vi.fn(),
    updateTask: vi.fn(),
    deleteTaskWithSubtasks: vi.fn(),
    getTask: vi.fn(),
    batchCreateTasks: vi.fn(),
    batchUpdateTasks: vi.fn(),
  },
}));

describe('EpicService', () => {
  const mockUserId = 'user123';
  const mockEpicId = 'epic123';
  const mockProjectId = 'project123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createEpic', () => {
    it('should create an epic with all fields', async () => {
      const epicData: CreateEpicData = {
        name: 'Test Epic',
        description: 'Test Description',
        projectId: mockProjectId,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        status: 'planning',
      };

      const mockEpic = {
        $id: mockEpicId,
        ...epicData,
        userId: mockUserId,
        progressPercentage: 0,
      };

      vi.mocked(databaseService.createDocument).mockResolvedValue(mockEpic as any);

      const result = await epicService.createEpic(epicData, mockUserId);

      expect(result).toEqual(mockEpic);
      expect(databaseService.createDocument).toHaveBeenCalledWith(
        'epics',
        expect.objectContaining({
          userId: mockUserId,
          name: epicData.name,
          description: epicData.description,
          projectId: epicData.projectId,
          status: 'planning',
          progressPercentage: 0,
        }),
        expect.any(String),
        expect.arrayContaining([
          `read("user:${mockUserId}")`,
          `update("user:${mockUserId}")`,
          `delete("user:${mockUserId}")`,
        ])
      );
    });

    it('should create an epic with default values', async () => {
      const epicData: CreateEpicData = {
        name: 'Minimal Epic',
        status: 'planning',
      };

      const mockEpic = {
        $id: mockEpicId,
        name: epicData.name,
        userId: mockUserId,
        status: 'planning',
        progressPercentage: 0,
      };

      vi.mocked(databaseService.createDocument).mockResolvedValue(mockEpic as any);

      const result = await epicService.createEpic(epicData, mockUserId);

      expect(result).toEqual(mockEpic);
      expect(databaseService.createDocument).toHaveBeenCalledWith(
        'epics',
        expect.objectContaining({
          status: 'planning',
          progressPercentage: 0,
        }),
        expect.any(String),
        expect.any(Array)
      );
    });

    it('should handle nested epics with parentEpicId', async () => {
      const epicData: CreateEpicData = {
        name: 'Child Epic',
        parentEpicId: 'parent-epic-123',
        status: 'planning',
      };

      const mockEpic = {
        $id: mockEpicId,
        ...epicData,
        userId: mockUserId,
        status: 'planning',
        progressPercentage: 0,
      };

      vi.mocked(databaseService.createDocument).mockResolvedValue(mockEpic as any);

      const result = await epicService.createEpic(epicData, mockUserId);

      expect(result.parentEpicId).toBe('parent-epic-123');
    });
  });

  describe('getEpic', () => {
    it('should get an epic by ID', async () => {
      const mockEpic = {
        $id: mockEpicId,
        name: 'Test Epic',
        userId: mockUserId,
        status: 'planning',
        progressPercentage: 0,
      };

      vi.mocked(databaseService.getDocument).mockResolvedValue(mockEpic as any);

      const result = await epicService.getEpic(mockEpicId, mockUserId);

      expect(result).toEqual(mockEpic);
      expect(databaseService.getDocument).toHaveBeenCalledWith(
        'epics',
        mockEpicId,
        expect.any(Array)
      );
    });
  });

  describe('updateEpic', () => {
    it('should update an epic', async () => {
      const updateData: UpdateEpicData = {
        name: 'Updated Epic',
        status: 'in_progress',
        progressPercentage: 50,
      };

      const mockUpdatedEpic = {
        $id: mockEpicId,
        ...updateData,
        userId: mockUserId,
      };

      vi.mocked(databaseService.updateDocument).mockResolvedValue(mockUpdatedEpic as any);

      const result = await epicService.updateEpic(mockEpicId, updateData);

      expect(result).toEqual(mockUpdatedEpic);
      expect(databaseService.updateDocument).toHaveBeenCalledWith(
        'epics',
        mockEpicId,
        updateData,
        undefined
      );
    });
  });

  describe('deleteEpic', () => {
    it('should delete an epic with cascade deletion of tasks and child epics', async () => {
      const mockTasks = [
        { $id: 'task1', title: 'Task 1' },
        { $id: 'task2', title: 'Task 2' },
      ];

      const mockChildEpics = [
        { $id: 'child-epic-1', name: 'Child Epic 1' },
      ];

      vi.mocked(taskService.getTasksByEpic).mockResolvedValue(mockTasks as any);
      vi.mocked(databaseService.listDocuments).mockResolvedValue({
        documents: mockChildEpics,
        total: 1,
      } as any);

      await epicService.deleteEpic(mockEpicId, mockUserId);

      // Should delete all tasks
      expect(taskService.deleteTaskWithSubtasks).toHaveBeenCalledTimes(2);
      expect(taskService.deleteTaskWithSubtasks).toHaveBeenCalledWith('task1', mockUserId);
      expect(taskService.deleteTaskWithSubtasks).toHaveBeenCalledWith('task2', mockUserId);

      // Should delete the epic itself
      expect(databaseService.deleteDocument).toHaveBeenCalledWith('epics', mockEpicId);
    });
  });

  describe('listEpics', () => {
    it('should list epics with filters', async () => {
      const mockEpics = [
        { $id: 'epic1', name: 'Epic 1', userId: mockUserId },
        { $id: 'epic2', name: 'Epic 2', userId: mockUserId },
      ];

      vi.mocked(databaseService.listDocuments).mockResolvedValue({
        documents: mockEpics,
        total: 2,
      } as any);

      const result = await epicService.listEpics({
        userId: mockUserId,
        projectId: mockProjectId,
        status: 'planning',
      });

      expect(result).toEqual(mockEpics);
      expect(databaseService.listDocuments).toHaveBeenCalledWith(
        'epics',
        expect.arrayContaining([
          expect.stringContaining('userId'),
          expect.stringContaining('projectId'),
          expect.stringContaining('status'),
        ])
      );
    });

    it('should filter top-level epics (no parent)', async () => {
      const mockEpics = [
        { $id: 'epic1', name: 'Top Epic 1', userId: mockUserId, parentEpicId: null },
      ];

      vi.mocked(databaseService.listDocuments).mockResolvedValue({
        documents: mockEpics,
        total: 1,
      } as any);

      await epicService.listEpics({
        userId: mockUserId,
        parentEpicId: null as any,
      });

      expect(databaseService.listDocuments).toHaveBeenCalledWith(
        'epics',
        expect.arrayContaining([
          expect.stringContaining('isNull'),
        ])
      );
    });

    it('should support search', async () => {
      const mockEpics = [
        { $id: 'epic1', name: 'Searchable Epic', userId: mockUserId },
      ];

      vi.mocked(databaseService.listDocuments).mockResolvedValue({
        documents: mockEpics,
        total: 1,
      } as any);

      await epicService.listEpics({
        userId: mockUserId,
        search: 'Searchable',
      });

      expect(databaseService.listDocuments).toHaveBeenCalledWith(
        'epics',
        expect.arrayContaining([
          expect.stringContaining('search'),
        ])
      );
    });
  });

  describe('linkTaskToEpic', () => {
    it('should link a task to an epic and recalculate progress', async () => {
      const mockTaskId = 'task123';
      const mockEpic = {
        $id: mockEpicId,
        name: 'Test Epic',
        userId: mockUserId,
        status: 'planning',
        progressPercentage: 0,
      };

      const mockTasks = [
        { $id: mockTaskId, title: 'Task 1', completed: false },
      ];

      vi.mocked(databaseService.getDocument).mockResolvedValue(mockEpic as any);
      vi.mocked(taskService.getTasksByEpic).mockResolvedValue(mockTasks as any);
      vi.mocked(databaseService.updateDocument).mockResolvedValue(mockEpic as any);

      await epicService.linkTaskToEpic(mockTaskId, mockEpicId);

      expect(taskService.updateTask).toHaveBeenCalledWith(mockTaskId, { epicId: mockEpicId });
      expect(databaseService.updateDocument).toHaveBeenCalled();
    });
  });

  describe('unlinkTaskFromEpic', () => {
    it('should unlink a task from an epic and recalculate progress', async () => {
      const mockTaskId = 'task123';
      const mockTask = {
        $id: mockTaskId,
        title: 'Task 1',
        epicId: mockEpicId,
      };

      const mockEpic = {
        $id: mockEpicId,
        name: 'Test Epic',
        userId: mockUserId,
        status: 'planning',
        progressPercentage: 50,
      };

      vi.mocked(taskService.getTask).mockResolvedValue(mockTask as any);
      vi.mocked(databaseService.getDocument).mockResolvedValue(mockEpic as any);
      vi.mocked(taskService.getTasksByEpic).mockResolvedValue([]);
      vi.mocked(databaseService.updateDocument).mockResolvedValue(mockEpic as any);

      await epicService.unlinkTaskFromEpic(mockTaskId);

      expect(taskService.updateTask).toHaveBeenCalledWith(mockTaskId, { epicId: undefined });
      expect(databaseService.updateDocument).toHaveBeenCalled();
    });
  });

  describe('calculateEpicProgress', () => {
    it('should calculate 0% progress when no tasks', async () => {
      vi.mocked(taskService.getTasksByEpic).mockResolvedValue([]);

      const progress = await epicService.calculateEpicProgress(mockEpicId, mockUserId);

      expect(progress).toBe(0);
    });

    it('should calculate 50% progress when half tasks completed', async () => {
      const mockTasks = [
        { $id: 'task1', title: 'Task 1', completed: true },
        { $id: 'task2', title: 'Task 2', completed: false },
      ];

      vi.mocked(taskService.getTasksByEpic).mockResolvedValue(mockTasks as any);

      const progress = await epicService.calculateEpicProgress(mockEpicId, mockUserId);

      expect(progress).toBe(50);
    });

    it('should calculate 100% progress when all tasks completed', async () => {
      const mockTasks = [
        { $id: 'task1', title: 'Task 1', completed: true },
        { $id: 'task2', title: 'Task 2', completed: true },
      ];

      vi.mocked(taskService.getTasksByEpic).mockResolvedValue(mockTasks as any);

      const progress = await epicService.calculateEpicProgress(mockEpicId, mockUserId);

      expect(progress).toBe(100);
    });
  });

  describe('getEpicWithTasks', () => {
    it('should get epic with tasks and statistics', async () => {
      const mockEpic = {
        $id: mockEpicId,
        name: 'Test Epic',
        userId: mockUserId,
        status: 'planning',
        progressPercentage: 50,
      };

      const mockTasks = [
        { $id: 'task1', title: 'Task 1', completed: true, priority: 1 },
        { $id: 'task2', title: 'Task 2', completed: false, priority: 2 },
      ];

      vi.mocked(databaseService.getDocument).mockResolvedValue(mockEpic as any);
      vi.mocked(taskService.getTasksByEpic).mockResolvedValue(mockTasks as any);

      const result = await epicService.getEpicWithTasks(mockEpicId, mockUserId);

      expect(result).toMatchObject({
        ...mockEpic,
        tasks: mockTasks,
        statistics: expect.objectContaining({
          totalTasks: 2,
          completedTasks: 1,
          incompleteTasks: 1,
          completionRate: 50,
        }),
      });
    });
  });

  describe('calculateEpicStatistics', () => {
    it('should calculate comprehensive statistics', async () => {
      const now = new Date().toISOString();
      const yesterday = new Date(Date.now() - 86400000).toISOString();

      const mockTasks = [
        { 
          $id: 'task1', 
          title: 'Task 1', 
          completed: true, 
          priority: 1,
          estimatedTime: 60,
          actualTime: 50,
        },
        { 
          $id: 'task2', 
          title: 'Task 2', 
          completed: false, 
          priority: 2,
          dueDate: yesterday, // Overdue
          startDate: now,
          estimatedTime: 120,
          actualTime: 0,
        },
      ];

      vi.mocked(taskService.getTasksByEpic).mockResolvedValue(mockTasks as any);

      const statistics = await epicService.calculateEpicStatistics(mockEpicId, mockUserId);

      expect(statistics).toMatchObject({
        totalTasks: 2,
        completedTasks: 1,
        incompleteTasks: 1,
        inProgressTasks: 1,
        overdueTasks: 1,
        completionRate: 50,
        estimatedTime: 180,
        actualTime: 50,
      });
    });
  });

  describe('getTopLevelEpics', () => {
    it('should get top-level epics without parent', async () => {
      const mockEpics = [
        { $id: 'epic1', name: 'Top Epic 1', userId: mockUserId, parentEpicId: null },
      ];

      vi.mocked(databaseService.listDocuments).mockResolvedValue({
        documents: mockEpics,
        total: 1,
      } as any);

      const result = await epicService.getTopLevelEpics(mockUserId);

      expect(result).toEqual(mockEpics);
    });

    it('should get top-level epics for a specific project', async () => {
      const mockEpics = [
        { $id: 'epic1', name: 'Project Epic', userId: mockUserId, projectId: mockProjectId, parentEpicId: null },
      ];

      vi.mocked(databaseService.listDocuments).mockResolvedValue({
        documents: mockEpics,
        total: 1,
      } as any);

      const result = await epicService.getTopLevelEpics(mockUserId, mockProjectId);

      expect(result).toEqual(mockEpics);
    });
  });

  describe('getChildEpics', () => {
    it('should get child epics of a parent epic', async () => {
      const parentEpicId = 'parent-epic-123';
      const mockChildEpics = [
        { $id: 'child1', name: 'Child Epic 1', userId: mockUserId, parentEpicId },
        { $id: 'child2', name: 'Child Epic 2', userId: mockUserId, parentEpicId },
      ];

      vi.mocked(databaseService.listDocuments).mockResolvedValue({
        documents: mockChildEpics,
        total: 2,
      } as any);

      const result = await epicService.getChildEpics(parentEpicId, mockUserId);

      expect(result).toEqual(mockChildEpics);
    });
  });

  describe('autoCompleteEpicIfAllTasksDone', () => {
    it('should auto-complete epic when all tasks are done', async () => {
      const mockEpic = {
        $id: mockEpicId,
        name: 'Test Epic',
        userId: mockUserId,
        status: 'in_progress',
        progressPercentage: 100,
      };

      const mockTasks = [
        { $id: 'task1', title: 'Task 1', completed: true },
        { $id: 'task2', title: 'Task 2', completed: true },
      ];

      vi.mocked(taskService.getTasksByEpic).mockResolvedValue(mockTasks as any);
      vi.mocked(databaseService.getDocument).mockResolvedValue(mockEpic as any);
      vi.mocked(databaseService.updateDocument).mockResolvedValue({
        ...mockEpic,
        status: 'completed',
      } as any);

      await epicService.autoCompleteEpicIfAllTasksDone(mockEpicId, mockUserId);

      expect(databaseService.updateDocument).toHaveBeenCalledWith(
        'epics',
        mockEpicId,
        { status: 'completed' },
        undefined
      );
    });

    it('should not auto-complete epic when tasks are incomplete', async () => {
      const mockTasks = [
        { $id: 'task1', title: 'Task 1', completed: true },
        { $id: 'task2', title: 'Task 2', completed: false },
      ];

      vi.mocked(taskService.getTasksByEpic).mockResolvedValue(mockTasks as any);

      await epicService.autoCompleteEpicIfAllTasksDone(mockEpicId, mockUserId);

      expect(databaseService.updateDocument).not.toHaveBeenCalled();
    });
  });

  describe('batchCreateEpics', () => {
    it('should batch create multiple epics', async () => {
      const epicsData: CreateEpicData[] = [
        { name: 'Epic 1', status: 'planning' },
        { name: 'Epic 2', status: 'in_progress' },
      ];

      const mockEpics = epicsData.map((data, index) => ({
        $id: `epic${index + 1}`,
        ...data,
        userId: mockUserId,
        progressPercentage: 0,
      }));

      vi.mocked(databaseService.batchCreateDocuments).mockResolvedValue(mockEpics as any);

      const result = await epicService.batchCreateEpics(epicsData, mockUserId);

      expect(result).toEqual(mockEpics);
      expect(databaseService.batchCreateDocuments).toHaveBeenCalledWith(
        'epics',
        expect.arrayContaining([
          expect.objectContaining({ name: 'Epic 1' }),
          expect.objectContaining({ name: 'Epic 2' }),
        ]),
        expect.any(Array)
      );
    });
  });

  describe('duplicateEpic', () => {
    it('should duplicate an epic without tasks', async () => {
      const originalEpic = {
        $id: mockEpicId,
        name: 'Original Epic',
        description: 'Original Description',
        userId: mockUserId,
        status: 'planning',
        progressPercentage: 50,
      };

      const duplicatedEpic = {
        $id: 'new-epic-id',
        name: 'Original Epic (Copy)',
        description: 'Original Description',
        userId: mockUserId,
        status: 'planning',
        progressPercentage: 0,
      };

      vi.mocked(databaseService.getDocument).mockResolvedValue(originalEpic as any);
      vi.mocked(databaseService.createDocument).mockResolvedValue(duplicatedEpic as any);

      const result = await epicService.duplicateEpic(mockEpicId, mockUserId, false);

      expect(result.name).toBe('Original Epic (Copy)');
      expect(taskService.batchCreateTasks).not.toHaveBeenCalled();
    });

    it('should duplicate an epic with tasks', async () => {
      const originalEpic = {
        $id: mockEpicId,
        name: 'Original Epic',
        userId: mockUserId,
        status: 'planning',
        progressPercentage: 50,
      };

      const duplicatedEpic = {
        $id: 'new-epic-id',
        name: 'Original Epic (Copy)',
        userId: mockUserId,
        status: 'planning',
        progressPercentage: 0,
      };

      const mockTasks = [
        { $id: 'task1', title: 'Task 1', completed: true },
      ];

      vi.mocked(databaseService.getDocument).mockResolvedValue(originalEpic as any);
      vi.mocked(databaseService.createDocument).mockResolvedValue(duplicatedEpic as any);
      vi.mocked(taskService.getTasksByEpic).mockResolvedValue(mockTasks as any);

      const result = await epicService.duplicateEpic(mockEpicId, mockUserId, true);

      expect(result.name).toBe('Original Epic (Copy)');
      expect(taskService.batchCreateTasks).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            title: 'Task 1',
            completed: false, // Reset completion
            epicId: 'new-epic-id',
          }),
        ]),
        mockUserId
      );
    });
  });

  describe('linkTasksToEpic', () => {
    it('should link multiple tasks to an epic', async () => {
      const taskIds = ['task1', 'task2', 'task3'];
      const mockEpic = {
        $id: mockEpicId,
        name: 'Test Epic',
        userId: mockUserId,
        status: 'planning',
        progressPercentage: 0,
      };

      vi.mocked(databaseService.getDocument).mockResolvedValue(mockEpic as any);
      vi.mocked(taskService.getTasksByEpic).mockResolvedValue([]);
      vi.mocked(databaseService.updateDocument).mockResolvedValue(mockEpic as any);

      await epicService.linkTasksToEpic(taskIds, mockEpicId);

      expect(taskService.batchUpdateTasks).toHaveBeenCalledWith(
        expect.arrayContaining([
          { id: 'task1', data: { epicId: mockEpicId } },
          { id: 'task2', data: { epicId: mockEpicId } },
          { id: 'task3', data: { epicId: mockEpicId } },
        ])
      );
    });
  });
});
