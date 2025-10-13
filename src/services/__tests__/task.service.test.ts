import { describe, it, expect, vi, beforeEach } from 'vitest';
import { taskService, type Task, type CreateTaskData, type UpdateTaskData } from '../task.service';
import { databaseService, Query } from '../database.service';
import { COLLECTIONS } from '@/lib/appwrite';

// Mock the database service
vi.mock('../database.service', () => ({
  databaseService: {
    createDocument: vi.fn(),
    getDocument: vi.fn(),
    updateDocument: vi.fn(),
    deleteDocument: vi.fn(),
    listDocuments: vi.fn(),
    batchCreateDocuments: vi.fn(),
    batchUpdateDocuments: vi.fn(),
    batchDeleteDocuments: vi.fn(),
    countDocuments: vi.fn(),
  },
  Query: {
    equal: vi.fn((field: string, value: any) => `equal("${field}", ${JSON.stringify(value)})`),
    greaterThanEqual: vi.fn((field: string, value: any) => `greaterThanEqual("${field}", ${JSON.stringify(value)})`),
    lessThanEqual: vi.fn((field: string, value: any) => `lessThanEqual("${field}", ${JSON.stringify(value)})`),
    search: vi.fn((field: string, value: any) => `search("${field}", ${JSON.stringify(value)})`),
    orderAsc: vi.fn((field: string) => `orderAsc("${field}")`),
    orderDesc: vi.fn((field: string) => `orderDesc("${field}")`),
    limit: vi.fn((value: number) => `limit(${value})`),
    offset: vi.fn((value: number) => `offset(${value})`),
  },
}));

describe('TaskService', () => {
  const mockUserId = 'user123';
  const mockTaskId = 'task123';

  const mockTask: Task = {
    $id: mockTaskId,
    $createdAt: '2024-01-01T00:00:00.000Z',
    $updatedAt: '2024-01-01T00:00:00.000Z',
    $permissions: [],
    $databaseId: 'db',
    $collectionId: COLLECTIONS.TASKS,
    $sequence: 0,
    userId: mockUserId,
    title: 'Test Task',
    description: 'Test Description',
    completed: false,
    priority: 1,
    dueDate: '2024-12-31T00:00:00.000Z',
    startDate: undefined,
    completedAt: undefined,
    projectId: 'project123',
    epicId: undefined,
    parentId: undefined,
    assignee: undefined,
    labels: ['label1'],
    dependencies: [],
    estimatedTime: 60,
    actualTime: undefined,
    position: 0,
    customFields: undefined,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createTask', () => {
    it('should create a task with all fields', async () => {
      const createData: CreateTaskData = {
        title: 'New Task',
        description: 'Task description',
        completed: false,
        priority: 2,
        dueDate: '2024-12-31T00:00:00.000Z',
        projectId: 'project123',
        labels: ['label1'],
        dependencies: [],
        position: 0,
      };

      vi.mocked(databaseService.createDocument).mockResolvedValue(mockTask as any);

      const result = await taskService.createTask(createData, mockUserId);

      expect(databaseService.createDocument).toHaveBeenCalledWith(
        COLLECTIONS.TASKS,
        expect.objectContaining({
          userId: mockUserId,
          title: 'New Task',
          description: 'Task description',
          completed: false,
          priority: 2,
        }),
        expect.any(String),
        expect.arrayContaining([
          `read("user:${mockUserId}")`,
          `update("user:${mockUserId}")`,
          `delete("user:${mockUserId}")`,
        ])
      );
      expect(result).toEqual(mockTask);
    });

    it('should create a task with default values', async () => {
      const createData: CreateTaskData = {
        title: 'Minimal Task',
        completed: false,
        priority: 4,
        labels: [],
        dependencies: [],
        position: 0,
      };

      vi.mocked(databaseService.createDocument).mockResolvedValue(mockTask as any);

      await taskService.createTask(createData, mockUserId);

      expect(databaseService.createDocument).toHaveBeenCalledWith(
        COLLECTIONS.TASKS,
        expect.objectContaining({
          userId: mockUserId,
          title: 'Minimal Task',
          completed: false,
          priority: 4,
          labels: [],
          dependencies: [],
        }),
        expect.any(String),
        expect.any(Array)
      );
    });
  });

  describe('getTask', () => {
    it('should get a task by ID', async () => {
      vi.mocked(databaseService.getDocument).mockResolvedValue(mockTask as any);

      const result = await taskService.getTask(mockTaskId, mockUserId);

      expect(databaseService.getDocument).toHaveBeenCalledWith(
        COLLECTIONS.TASKS,
        mockTaskId,
        expect.arrayContaining([expect.stringContaining('equal("userId"')])
      );
      expect(result).toEqual(mockTask);
    });

    it('should get a task without userId filter', async () => {
      vi.mocked(databaseService.getDocument).mockResolvedValue(mockTask as any);

      await taskService.getTask(mockTaskId);

      expect(databaseService.getDocument).toHaveBeenCalledWith(
        COLLECTIONS.TASKS,
        mockTaskId,
        undefined
      );
    });
  });

  describe('updateTask', () => {
    it('should update a task', async () => {
      const updateData: UpdateTaskData = {
        title: 'Updated Task',
        priority: 1,
      };

      vi.mocked(databaseService.updateDocument).mockResolvedValue(mockTask as any);

      const result = await taskService.updateTask(mockTaskId, updateData);

      expect(databaseService.updateDocument).toHaveBeenCalledWith(
        COLLECTIONS.TASKS,
        mockTaskId,
        updateData,
        undefined
      );
      expect(result).toEqual(mockTask);
    });

    it('should set completedAt when marking task as completed', async () => {
      const updateData: UpdateTaskData = {
        completed: true,
      };

      vi.mocked(databaseService.updateDocument).mockResolvedValue(mockTask as any);

      await taskService.updateTask(mockTaskId, updateData);

      expect(databaseService.updateDocument).toHaveBeenCalledWith(
        COLLECTIONS.TASKS,
        mockTaskId,
        expect.objectContaining({
          completed: true,
          completedAt: expect.any(String),
        }),
        undefined
      );
    });

    it('should clear completedAt when marking task as incomplete', async () => {
      const updateData: UpdateTaskData = {
        completed: false,
      };

      vi.mocked(databaseService.updateDocument).mockResolvedValue(mockTask as any);

      await taskService.updateTask(mockTaskId, updateData);

      expect(databaseService.updateDocument).toHaveBeenCalledWith(
        COLLECTIONS.TASKS,
        mockTaskId,
        expect.objectContaining({
          completed: false,
          completedAt: undefined,
        }),
        undefined
      );
    });
  });

  describe('deleteTask', () => {
    it('should delete a task', async () => {
      vi.mocked(databaseService.deleteDocument).mockResolvedValue(undefined);

      await taskService.deleteTask(mockTaskId);

      expect(databaseService.deleteDocument).toHaveBeenCalledWith(
        COLLECTIONS.TASKS,
        mockTaskId
      );
    });
  });

  describe('listTasks', () => {
    it('should list tasks with filters', async () => {
      const mockDocuments = [mockTask];
      vi.mocked(databaseService.listDocuments).mockResolvedValue({
        documents: mockDocuments,
        total: 1,
      } as any);

      const result = await taskService.listTasks({
        userId: mockUserId,
        projectId: 'project123',
        completed: false,
        priority: 1,
      });

      expect(databaseService.listDocuments).toHaveBeenCalledWith(
        COLLECTIONS.TASKS,
        expect.arrayContaining([
          expect.stringContaining('equal("userId"'),
          expect.stringContaining('equal("projectId"'),
          expect.stringContaining('equal("completed"'),
          expect.stringContaining('equal("priority"'),
        ])
      );
      expect(result).toEqual(mockDocuments);
    });

    it('should list tasks with date range filters', async () => {
      vi.mocked(databaseService.listDocuments).mockResolvedValue({
        documents: [mockTask],
        total: 1,
      } as any);

      await taskService.listTasks({
        userId: mockUserId,
        dueDateStart: '2024-01-01T00:00:00.000Z',
        dueDateEnd: '2024-12-31T23:59:59.999Z',
      });

      expect(databaseService.listDocuments).toHaveBeenCalledWith(
        COLLECTIONS.TASKS,
        expect.arrayContaining([
          expect.stringContaining('greaterThanEqual("dueDate"'),
          expect.stringContaining('lessThanEqual("dueDate"'),
        ])
      );
    });

    it('should list tasks with search', async () => {
      vi.mocked(databaseService.listDocuments).mockResolvedValue({
        documents: [mockTask],
        total: 1,
      } as any);

      await taskService.listTasks({
        userId: mockUserId,
        search: 'test query',
      });

      expect(databaseService.listDocuments).toHaveBeenCalledWith(
        COLLECTIONS.TASKS,
        expect.arrayContaining([
          expect.stringContaining('search("title"'),
        ])
      );
    });

    it('should list tasks with pagination', async () => {
      vi.mocked(databaseService.listDocuments).mockResolvedValue({
        documents: [mockTask],
        total: 1,
      } as any);

      await taskService.listTasks({
        userId: mockUserId,
        limit: 10,
        offset: 20,
      });

      expect(databaseService.listDocuments).toHaveBeenCalledWith(
        COLLECTIONS.TASKS,
        expect.arrayContaining([
          expect.stringContaining('limit(10)'),
          expect.stringContaining('offset(20)'),
        ])
      );
    });

    it('should list tasks with custom ordering', async () => {
      vi.mocked(databaseService.listDocuments).mockResolvedValue({
        documents: [mockTask],
        total: 1,
      } as any);

      await taskService.listTasks({
        userId: mockUserId,
        orderBy: 'dueDate',
        orderDirection: 'desc',
      });

      expect(databaseService.listDocuments).toHaveBeenCalledWith(
        COLLECTIONS.TASKS,
        expect.arrayContaining([
          expect.stringContaining('orderDesc("dueDate")'),
        ])
      );
    });
  });

  describe('batch operations', () => {
    it('should batch create tasks', async () => {
      const createData: CreateTaskData[] = [
        { title: 'Task 1', completed: false, priority: 1, labels: [], dependencies: [], position: 0 },
        { title: 'Task 2', completed: false, priority: 2, labels: [], dependencies: [], position: 1 },
      ];

      vi.mocked(databaseService.batchCreateDocuments).mockResolvedValue([mockTask, mockTask] as any);

      const result = await taskService.batchCreateTasks(createData, mockUserId);

      expect(databaseService.batchCreateDocuments).toHaveBeenCalledWith(
        COLLECTIONS.TASKS,
        expect.arrayContaining([
          expect.objectContaining({ userId: mockUserId, title: 'Task 1' }),
          expect.objectContaining({ userId: mockUserId, title: 'Task 2' }),
        ]),
        expect.any(Array)
      );
      expect(result).toHaveLength(2);
    });

    it('should batch update tasks', async () => {
      const updates = [
        { id: 'task1', data: { title: 'Updated 1' } },
        { id: 'task2', data: { title: 'Updated 2' } },
      ];

      vi.mocked(databaseService.batchUpdateDocuments).mockResolvedValue([mockTask, mockTask] as any);

      const result = await taskService.batchUpdateTasks(updates);

      expect(databaseService.batchUpdateDocuments).toHaveBeenCalledWith(
        COLLECTIONS.TASKS,
        expect.arrayContaining([
          expect.objectContaining({ id: 'task1' }),
          expect.objectContaining({ id: 'task2' }),
        ]),
        undefined
      );
      expect(result).toHaveLength(2);
    });

    it('should batch delete tasks', async () => {
      const taskIds = ['task1', 'task2', 'task3'];

      vi.mocked(databaseService.batchDeleteDocuments).mockResolvedValue(undefined);

      await taskService.batchDeleteTasks(taskIds);

      expect(databaseService.batchDeleteDocuments).toHaveBeenCalledWith(
        COLLECTIONS.TASKS,
        taskIds
      );
    });
  });

  describe('helper methods', () => {
    beforeEach(() => {
      vi.mocked(databaseService.listDocuments).mockResolvedValue({
        documents: [mockTask],
        total: 1,
      } as any);
    });

    it('should get tasks by project', async () => {
      await taskService.getTasksByProject('project123', mockUserId);

      expect(databaseService.listDocuments).toHaveBeenCalledWith(
        COLLECTIONS.TASKS,
        expect.arrayContaining([
          expect.stringContaining('equal("projectId"'),
          expect.stringContaining('equal("userId"'),
        ])
      );
    });

    it('should get subtasks', async () => {
      await taskService.getSubtasks('parent123', mockUserId);

      expect(databaseService.listDocuments).toHaveBeenCalledWith(
        COLLECTIONS.TASKS,
        expect.arrayContaining([
          expect.stringContaining('equal("parentId"'),
        ])
      );
    });

    it('should get completed tasks', async () => {
      await taskService.getCompletedTasks(mockUserId, 10);

      expect(databaseService.listDocuments).toHaveBeenCalledWith(
        COLLECTIONS.TASKS,
        expect.arrayContaining([
          expect.stringContaining('equal("completed", true)'),
          expect.stringContaining('limit(10)'),
        ])
      );
    });

    it('should get incomplete tasks', async () => {
      await taskService.getIncompleteTasks(mockUserId);

      expect(databaseService.listDocuments).toHaveBeenCalledWith(
        COLLECTIONS.TASKS,
        expect.arrayContaining([
          expect.stringContaining('equal("completed", false)'),
        ])
      );
    });

    it('should get tasks by priority', async () => {
      await taskService.getTasksByPriority(1, mockUserId);

      expect(databaseService.listDocuments).toHaveBeenCalledWith(
        COLLECTIONS.TASKS,
        expect.arrayContaining([
          expect.stringContaining('equal("priority"'),
        ])
      );
    });

    it('should search tasks', async () => {
      await taskService.searchTasks('test query', mockUserId);

      expect(databaseService.listDocuments).toHaveBeenCalledWith(
        COLLECTIONS.TASKS,
        expect.arrayContaining([
          expect.stringContaining('search("title"'),
        ])
      );
    });
  });

  describe('toggleTaskCompletion', () => {
    it('should toggle task from incomplete to complete', async () => {
      const incompleteTask = { ...mockTask, completed: false };
      vi.mocked(databaseService.getDocument).mockResolvedValue(incompleteTask as any);
      vi.mocked(databaseService.updateDocument).mockResolvedValue({ ...incompleteTask, completed: true } as any);

      await taskService.toggleTaskCompletion(mockTaskId);

      expect(databaseService.updateDocument).toHaveBeenCalledWith(
        COLLECTIONS.TASKS,
        mockTaskId,
        expect.objectContaining({
          completed: true,
          completedAt: expect.any(String),
        }),
        undefined
      );
    });

    it('should toggle task from complete to incomplete', async () => {
      const completeTask = { ...mockTask, completed: true };
      vi.mocked(databaseService.getDocument).mockResolvedValue(completeTask as any);
      vi.mocked(databaseService.updateDocument).mockResolvedValue({ ...completeTask, completed: false } as any);

      await taskService.toggleTaskCompletion(mockTaskId);

      expect(databaseService.updateDocument).toHaveBeenCalledWith(
        COLLECTIONS.TASKS,
        mockTaskId,
        expect.objectContaining({
          completed: false,
          completedAt: undefined,
        }),
        undefined
      );
    });
  });

  describe('label operations', () => {
    it('should add label to task', async () => {
      vi.mocked(databaseService.getDocument).mockResolvedValue(mockTask as any);
      vi.mocked(databaseService.updateDocument).mockResolvedValue(mockTask as any);

      await taskService.addLabelToTask(mockTaskId, 'label2');

      expect(databaseService.updateDocument).toHaveBeenCalledWith(
        COLLECTIONS.TASKS,
        mockTaskId,
        expect.objectContaining({
          labels: expect.arrayContaining(['label1', 'label2']),
        }),
        undefined
      );
    });

    it('should not add duplicate label', async () => {
      vi.mocked(databaseService.getDocument).mockResolvedValue(mockTask as any);
      vi.mocked(databaseService.updateDocument).mockResolvedValue(mockTask as any);

      await taskService.addLabelToTask(mockTaskId, 'label1');

      expect(databaseService.updateDocument).toHaveBeenCalledWith(
        COLLECTIONS.TASKS,
        mockTaskId,
        expect.objectContaining({
          labels: ['label1'],
        }),
        undefined
      );
    });

    it('should remove label from task', async () => {
      vi.mocked(databaseService.getDocument).mockResolvedValue(mockTask as any);
      vi.mocked(databaseService.updateDocument).mockResolvedValue(mockTask as any);

      await taskService.removeLabelFromTask(mockTaskId, 'label1');

      expect(databaseService.updateDocument).toHaveBeenCalledWith(
        COLLECTIONS.TASKS,
        mockTaskId,
        expect.objectContaining({
          labels: [],
        }),
        undefined
      );
    });
  });

  describe('dependency operations', () => {
    it('should add dependency to task', async () => {
      vi.mocked(databaseService.getDocument).mockResolvedValue(mockTask as any);
      vi.mocked(databaseService.updateDocument).mockResolvedValue(mockTask as any);

      await taskService.addDependency(mockTaskId, 'dep1');

      expect(databaseService.updateDocument).toHaveBeenCalledWith(
        COLLECTIONS.TASKS,
        mockTaskId,
        expect.objectContaining({
          dependencies: ['dep1'],
        }),
        undefined
      );
    });

    it('should remove dependency from task', async () => {
      const taskWithDep = { ...mockTask, dependencies: ['dep1', 'dep2'] };
      vi.mocked(databaseService.getDocument).mockResolvedValue(taskWithDep as any);
      vi.mocked(databaseService.updateDocument).mockResolvedValue(taskWithDep as any);

      await taskService.removeDependency(mockTaskId, 'dep1');

      expect(databaseService.updateDocument).toHaveBeenCalledWith(
        COLLECTIONS.TASKS,
        mockTaskId,
        expect.objectContaining({
          dependencies: ['dep2'],
        }),
        undefined
      );
    });
  });

  describe('countTasks', () => {
    it('should count tasks with filters', async () => {
      vi.mocked(databaseService.countDocuments).mockResolvedValue(42);

      const count = await taskService.countTasks({
        userId: mockUserId,
        completed: false,
      });

      expect(databaseService.countDocuments).toHaveBeenCalledWith(
        COLLECTIONS.TASKS,
        expect.arrayContaining([
          expect.stringContaining('equal("userId"'),
          expect.stringContaining('equal("completed"'),
        ])
      );
      expect(count).toBe(42);
    });
  });
});
