import { describe, it, expect, beforeEach, vi } from 'vitest';
import { taskService, type CreateTaskData } from '../task.service';
import { databaseService } from '../database.service';

// Mock the database service
vi.mock('../database.service', () => ({
  databaseService: {
    createDocument: vi.fn(),
    getDocument: vi.fn(),
    updateDocument: vi.fn(),
    deleteDocument: vi.fn(),
    listDocuments: vi.fn(),
    batchUpdateDocuments: vi.fn(),
  },
  Query: {
    equal: vi.fn((field, value) => `equal("${field}", "${value}")`),
    orderAsc: vi.fn((field) => `orderAsc("${field}")`),
  },
}));

describe('TaskService - Subtasks', () => {
  const mockUserId = 'user123';
  const mockParentTaskId = 'parent-task-123';
  const mockSubtaskId = 'subtask-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createSubtask', () => {
    it('should create a subtask with parentId set', async () => {
      const mockParentTask = {
        $id: mockParentTaskId,
        userId: mockUserId,
        title: 'Parent Task',
        completed: false,
        priority: 2,
        labels: [],
        dependencies: [],
        subtasks: [],
        position: 0,
      };

      const mockSubtask = {
        $id: mockSubtaskId,
        userId: mockUserId,
        title: 'Subtask 1',
        parentId: mockParentTaskId,
        completed: false,
        priority: 2,
        labels: [],
        dependencies: [],
        subtasks: [],
        position: 0,
      };

      vi.mocked(databaseService.createDocument).mockResolvedValue(mockSubtask as any);
      vi.mocked(databaseService.getDocument).mockResolvedValue(mockParentTask as any);
      vi.mocked(databaseService.updateDocument).mockResolvedValue({
        ...mockParentTask,
        subtasks: [mockSubtaskId],
      } as any);

      const subtaskData: CreateTaskData = {
        title: 'Subtask 1',
        completed: false,
        priority: 2,
        labels: [],
        dependencies: [],
        position: 0,
      };

      const result = await taskService.createSubtask(
        mockParentTaskId,
        subtaskData,
        mockUserId
      );

      expect(result.parentId).toBe(mockParentTaskId);
      expect(databaseService.createDocument).toHaveBeenCalledWith(
        'tasks',
        expect.objectContaining({
          parentId: mockParentTaskId,
          title: 'Subtask 1',
        }),
        expect.any(String),
        expect.any(Array)
      );
      expect(databaseService.updateDocument).toHaveBeenCalledWith(
        'tasks',
        mockParentTaskId,
        { subtasks: [mockSubtaskId] },
        undefined
      );
    });
  });

  describe('calculateTaskProgress', () => {
    it('should return 0 when there are no subtasks', async () => {
      vi.mocked(databaseService.listDocuments).mockResolvedValue({
        documents: [],
        total: 0,
      } as any);

      const progress = await taskService.calculateTaskProgress(mockParentTaskId, mockUserId);

      expect(progress).toBe(0);
    });

    it('should calculate progress correctly with mixed completion', async () => {
      const mockSubtasks = [
        { $id: 'sub1', completed: true },
        { $id: 'sub2', completed: false },
        { $id: 'sub3', completed: true },
        { $id: 'sub4', completed: false },
      ];

      vi.mocked(databaseService.listDocuments).mockResolvedValue({
        documents: mockSubtasks,
        total: 4,
      } as any);

      const progress = await taskService.calculateTaskProgress(mockParentTaskId, mockUserId);

      expect(progress).toBe(50); // 2 out of 4 = 50%
    });

    it('should return 100 when all subtasks are complete', async () => {
      const mockSubtasks = [
        { $id: 'sub1', completed: true },
        { $id: 'sub2', completed: true },
        { $id: 'sub3', completed: true },
      ];

      vi.mocked(databaseService.listDocuments).mockResolvedValue({
        documents: mockSubtasks,
        total: 3,
      } as any);

      const progress = await taskService.calculateTaskProgress(mockParentTaskId, mockUserId);

      expect(progress).toBe(100);
    });
  });

  describe('updateParentTaskProgress', () => {
    it('should mark parent as complete when all subtasks are complete', async () => {
      const mockSubtasks = [
        { $id: 'sub1', completed: true },
        { $id: 'sub2', completed: true },
      ];

      vi.mocked(databaseService.listDocuments).mockResolvedValue({
        documents: mockSubtasks,
        total: 2,
      } as any);

      vi.mocked(databaseService.updateDocument).mockResolvedValue({
        $id: mockParentTaskId,
        completed: true,
        completedAt: expect.any(String),
      } as any);

      const result = await taskService.updateParentTaskProgress(mockParentTaskId, mockUserId);

      expect(result.completed).toBe(true);
      expect(result.completedAt).toBeDefined();
    });

    it('should not mark parent as complete when some subtasks are incomplete', async () => {
      const mockSubtasks = [
        { $id: 'sub1', completed: true },
        { $id: 'sub2', completed: false },
      ];

      vi.mocked(databaseService.listDocuments).mockResolvedValue({
        documents: mockSubtasks,
        total: 2,
      } as any);

      vi.mocked(databaseService.updateDocument).mockResolvedValue({
        $id: mockParentTaskId,
        completed: false,
        completedAt: undefined,
      } as any);

      const result = await taskService.updateParentTaskProgress(mockParentTaskId, mockUserId);

      expect(result.completed).toBe(false);
      expect(result.completedAt).toBeUndefined();
    });
  });

  describe('reorderTask', () => {
    it('should update positions when moving task down', async () => {
      const mockTasks = [
        { $id: 'task1', position: 0 },
        { $id: 'task2', position: 1 },
        { $id: 'task3', position: 2 },
        { $id: 'task4', position: 3 },
      ];

      vi.mocked(databaseService.listDocuments).mockResolvedValue({
        documents: mockTasks,
        total: 4,
      } as any);

      vi.mocked(databaseService.batchUpdateDocuments).mockResolvedValue([] as any);

      await taskService.reorderTask('task2', 3, mockUserId);

      expect(databaseService.batchUpdateDocuments).toHaveBeenCalledWith(
        'tasks',
        [
          { id: 'task2', data: { position: 3 } },
          { id: 'task3', data: { position: 1 } },
          { id: 'task4', data: { position: 2 } },
        ],
        undefined
      );
    });

    it('should update positions when moving task up', async () => {
      const mockTasks = [
        { $id: 'task1', position: 0 },
        { $id: 'task2', position: 1 },
        { $id: 'task3', position: 2 },
        { $id: 'task4', position: 3 },
      ];

      vi.mocked(databaseService.listDocuments).mockResolvedValue({
        documents: mockTasks,
        total: 4,
      } as any);

      vi.mocked(databaseService.batchUpdateDocuments).mockResolvedValue([] as any);

      await taskService.reorderTask('task3', 1, mockUserId);

      expect(databaseService.batchUpdateDocuments).toHaveBeenCalledWith(
        'tasks',
        [
          { id: 'task3', data: { position: 1 } },
          { id: 'task2', data: { position: 2 } },
        ],
        undefined
      );
    });
  });

  describe('deleteTaskWithSubtasks', () => {
    it('should delete task and all its subtasks recursively', async () => {
      // Mock nested subtasks structure
      const mockSubtasks1 = [
        { $id: 'sub1', parentId: mockParentTaskId },
        { $id: 'sub2', parentId: mockParentTaskId },
      ];

      const mockSubtasks2 = [
        { $id: 'sub1-1', parentId: 'sub1' },
      ];

      vi.mocked(databaseService.listDocuments)
        .mockResolvedValueOnce({ documents: mockSubtasks1, total: 2 } as any)
        .mockResolvedValueOnce({ documents: mockSubtasks2, total: 1 } as any)
        .mockResolvedValueOnce({ documents: [], total: 0 } as any)
        .mockResolvedValueOnce({ documents: [], total: 0 } as any);

      vi.mocked(databaseService.deleteDocument).mockResolvedValue(undefined as any);

      await taskService.deleteTaskWithSubtasks(mockParentTaskId, mockUserId);

      // Should delete parent + 2 subtasks + 1 nested subtask = 4 total
      expect(databaseService.deleteDocument).toHaveBeenCalledTimes(4);
      expect(databaseService.deleteDocument).toHaveBeenCalledWith(
        'tasks',
        'sub1-1'
      );
      expect(databaseService.deleteDocument).toHaveBeenCalledWith(
        'tasks',
        'sub1'
      );
      expect(databaseService.deleteDocument).toHaveBeenCalledWith(
        'tasks',
        'sub2'
      );
      expect(databaseService.deleteDocument).toHaveBeenCalledWith(
        'tasks',
        mockParentTaskId
      );
    });
  });

  describe('convertToSubtask', () => {
    it('should convert a task to a subtask', async () => {
      const mockTask = {
        $id: 'task1',
        parentId: undefined,
      };

      const mockParentTask = {
        $id: mockParentTaskId,
        subtasks: [],
      };

      vi.mocked(databaseService.updateDocument)
        .mockResolvedValueOnce({ ...mockTask, parentId: mockParentTaskId } as any);

      vi.mocked(databaseService.getDocument).mockResolvedValue(mockParentTask as any);

      vi.mocked(databaseService.updateDocument)
        .mockResolvedValueOnce({ ...mockParentTask, subtasks: ['task1'] } as any);

      const result = await taskService.convertToSubtask('task1', mockParentTaskId);

      expect(result.parentId).toBe(mockParentTaskId);
      expect(databaseService.updateDocument).toHaveBeenCalledWith(
        'tasks',
        'task1',
        { parentId: mockParentTaskId },
        undefined
      );
    });
  });

  describe('removeFromParent', () => {
    it('should remove parentId and update parent subtasks array', async () => {
      const mockTask = {
        $id: 'task1',
        parentId: mockParentTaskId,
      };

      const mockParentTask = {
        $id: mockParentTaskId,
        subtasks: ['task1', 'task2'],
      };

      vi.mocked(databaseService.getDocument)
        .mockResolvedValueOnce(mockTask as any)
        .mockResolvedValueOnce(mockParentTask as any);

      vi.mocked(databaseService.updateDocument)
        .mockResolvedValueOnce({ ...mockParentTask, subtasks: ['task2'] } as any)
        .mockResolvedValueOnce({ ...mockTask, parentId: undefined } as any);

      const result = await taskService.removeFromParent('task1');

      expect(result.parentId).toBeUndefined();
      expect(databaseService.updateDocument).toHaveBeenCalledWith(
        'tasks',
        mockParentTaskId,
        { subtasks: ['task2'] },
        undefined
      );
    });
  });
});
