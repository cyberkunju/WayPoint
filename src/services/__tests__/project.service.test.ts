import { describe, it, expect, beforeEach, vi } from 'vitest';
import { projectService, type CreateProjectData, type UpdateProjectData } from '../project.service';
import { databaseService } from '../database.service';
import { taskService } from '../task.service';

// Mock the database service
vi.mock('../database.service', () => ({
  databaseService: {
    createDocument: vi.fn(),
    getDocument: vi.fn(),
    listDocuments: vi.fn(),
    updateDocument: vi.fn(),
    deleteDocument: vi.fn(),
    batchCreateDocuments: vi.fn(),
    batchUpdateDocuments: vi.fn(),
    batchDeleteDocuments: vi.fn(),
    countDocuments: vi.fn(),
  },
  Query: {
    equal: vi.fn((field, value) => `equal("${field}", ${JSON.stringify(value)})`),
    isNull: vi.fn((field) => `isNull("${field}")`),
    search: vi.fn((field, value) => `search("${field}", "${value}")`),
    orderAsc: vi.fn((field) => `orderAsc("${field}")`),
    orderDesc: vi.fn((field) => `orderDesc("${field}")`),
    limit: vi.fn((value) => `limit(${value})`),
    offset: vi.fn((value) => `offset(${value})`),
    greaterThanEqual: vi.fn((field, value) => `greaterThanEqual("${field}", "${value}")`),
    lessThanEqual: vi.fn((field, value) => `lessThanEqual("${field}", "${value}")`),
  },
}));

// Mock the task service
vi.mock('../task.service', () => ({
  taskService: {
    getTasksByProject: vi.fn(),
    deleteTaskWithSubtasks: vi.fn(),
    batchCreateTasks: vi.fn(),
  },
}));

describe('ProjectService', () => {
  const mockUserId = 'user123';
  const mockProjectId = 'project123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createProject', () => {
    it('should create a project with default values', async () => {
      const projectData: CreateProjectData = {
        name: 'Test Project',
        description: 'Test Description',
        color: '#2E5AAC',
        status: 'active',
        isExpanded: true,
        labels: [],
        position: 0,
      };

      const mockProject = {
        $id: mockProjectId,
        ...projectData,
        userId: mockUserId,
        $createdAt: '2024-01-01T00:00:00.000Z',
        $updatedAt: '2024-01-01T00:00:00.000Z',
      };

      vi.mocked(databaseService.createDocument).mockResolvedValue(mockProject as any);

      const result = await projectService.createProject(projectData, mockUserId);

      expect(result).toEqual(mockProject);
      expect(databaseService.createDocument).toHaveBeenCalledWith(
        'projects',
        expect.objectContaining({
          userId: mockUserId,
          name: 'Test Project',
          description: 'Test Description',
        }),
        expect.any(String),
        expect.arrayContaining([
          `read("user:${mockUserId}")`,
          `update("user:${mockUserId}")`,
          `delete("user:${mockUserId}")`,
        ])
      );
    });

    it('should create a project with minimal data', async () => {
      const projectData: CreateProjectData = {
        name: 'Minimal Project',
        color: '#2E5AAC',
        status: 'active',
        isExpanded: true,
        labels: [],
        position: 0,
      };

      const mockProject = {
        $id: mockProjectId,
        ...projectData,
        userId: mockUserId,
        $createdAt: '2024-01-01T00:00:00.000Z',
        $updatedAt: '2024-01-01T00:00:00.000Z',
      };

      vi.mocked(databaseService.createDocument).mockResolvedValue(mockProject as any);

      const result = await projectService.createProject(projectData, mockUserId);

      expect(result.name).toBe('Minimal Project');
      expect(result.userId).toBe(mockUserId);
    });
  });

  describe('getProject', () => {
    it('should get a project by ID', async () => {
      const mockProject = {
        $id: mockProjectId,
        userId: mockUserId,
        name: 'Test Project',
        color: '#2E5AAC',
        status: 'active',
        isExpanded: true,
        labels: [],
        position: 0,
        $createdAt: '2024-01-01T00:00:00.000Z',
        $updatedAt: '2024-01-01T00:00:00.000Z',
      };

      vi.mocked(databaseService.getDocument).mockResolvedValue(mockProject as any);

      const result = await projectService.getProject(mockProjectId, mockUserId);

      expect(result).toEqual(mockProject);
      expect(databaseService.getDocument).toHaveBeenCalledWith(
        'projects',
        mockProjectId,
        expect.any(Array)
      );
    });
  });

  describe('updateProject', () => {
    it('should update a project', async () => {
      const updateData: UpdateProjectData = {
        name: 'Updated Project',
        status: 'in_progress',
      };

      const mockUpdatedProject = {
        $id: mockProjectId,
        userId: mockUserId,
        name: 'Updated Project',
        status: 'in_progress',
        color: '#2E5AAC',
        isExpanded: true,
        labels: [],
        position: 0,
        $createdAt: '2024-01-01T00:00:00.000Z',
        $updatedAt: '2024-01-01T00:00:00.000Z',
      };

      vi.mocked(databaseService.updateDocument).mockResolvedValue(mockUpdatedProject as any);

      const result = await projectService.updateProject(mockProjectId, updateData);

      expect(result.name).toBe('Updated Project');
      expect(result.status).toBe('in_progress');
      expect(databaseService.updateDocument).toHaveBeenCalledWith(
        'projects',
        mockProjectId,
        updateData,
        undefined
      );
    });
  });

  describe('deleteProject', () => {
    it('should delete a project and its tasks', async () => {
      const mockTasks = [
        { $id: 'task1', title: 'Task 1', userId: mockUserId, completed: false },
        { $id: 'task2', title: 'Task 2', userId: mockUserId, completed: false },
      ];

      vi.mocked(taskService.getTasksByProject).mockResolvedValue(mockTasks as any);
      vi.mocked(taskService.deleteTaskWithSubtasks).mockResolvedValue(undefined);
      vi.mocked(databaseService.listDocuments).mockResolvedValue({ documents: [], total: 0 } as any);
      vi.mocked(databaseService.deleteDocument).mockResolvedValue(undefined);

      await projectService.deleteProject(mockProjectId, mockUserId);

      expect(taskService.getTasksByProject).toHaveBeenCalledWith(mockProjectId, mockUserId);
      expect(taskService.deleteTaskWithSubtasks).toHaveBeenCalledTimes(2);
      expect(databaseService.deleteDocument).toHaveBeenCalledWith('projects', mockProjectId);
    });

    it('should delete child projects recursively', async () => {
      const mockChildProjects = [
        { $id: 'child1', name: 'Child 1', userId: mockUserId },
        { $id: 'child2', name: 'Child 2', userId: mockUserId },
      ];

      vi.mocked(taskService.getTasksByProject).mockResolvedValue([]);
      vi.mocked(databaseService.listDocuments)
        .mockResolvedValueOnce({ documents: mockChildProjects, total: 2 } as any)
        .mockResolvedValue({ documents: [], total: 0 } as any);
      vi.mocked(databaseService.deleteDocument).mockResolvedValue(undefined);

      await projectService.deleteProject(mockProjectId, mockUserId);

      expect(databaseService.deleteDocument).toHaveBeenCalledTimes(3); // parent + 2 children
    });
  });

  describe('listProjects', () => {
    it('should list projects with filters', async () => {
      const mockProjects = [
        { $id: 'project1', name: 'Project 1', userId: mockUserId, status: 'active' },
        { $id: 'project2', name: 'Project 2', userId: mockUserId, status: 'active' },
      ];

      vi.mocked(databaseService.listDocuments).mockResolvedValue({
        documents: mockProjects,
        total: 2,
      } as any);

      const result = await projectService.listProjects({ userId: mockUserId, status: 'active' });

      expect(result).toEqual(mockProjects);
      expect(databaseService.listDocuments).toHaveBeenCalledWith(
        'projects',
        expect.arrayContaining([
          expect.stringContaining('userId'),
          expect.stringContaining('status'),
        ])
      );
    });

    it('should get top-level projects', async () => {
      const mockProjects = [
        { $id: 'project1', name: 'Project 1', userId: mockUserId, parentId: undefined },
      ];

      vi.mocked(databaseService.listDocuments).mockResolvedValue({
        documents: mockProjects,
        total: 1,
      } as any);

      const result = await projectService.getTopLevelProjects(mockUserId);

      expect(result).toEqual(mockProjects);
    });
  });

  describe('calculateProjectStatistics', () => {
    it('should calculate project statistics correctly', async () => {
      const mockTasks = [
        {
          $id: 'task1',
          title: 'Task 1',
          completed: true,
          priority: 1,
          estimatedTime: 60,
          actualTime: 50,
          dueDate: '2024-01-01T00:00:00.000Z',
        },
        {
          $id: 'task2',
          title: 'Task 2',
          completed: false,
          priority: 2,
          estimatedTime: 120,
          actualTime: 0,
          dueDate: '2020-01-01T00:00:00.000Z', // Overdue
        },
        {
          $id: 'task3',
          title: 'Task 3',
          completed: false,
          priority: 3,
          estimatedTime: 90,
          actualTime: 0,
          dueDate: '2025-01-01T00:00:00.000Z',
        },
      ];

      vi.mocked(taskService.getTasksByProject).mockResolvedValue(mockTasks as any);

      const statistics = await projectService.calculateProjectStatistics(mockProjectId, mockUserId);

      expect(statistics.totalTasks).toBe(3);
      expect(statistics.completedTasks).toBe(1);
      expect(statistics.incompleteTasks).toBe(2);
      expect(statistics.overdueTasks).toBe(1);
      expect(statistics.completionRate).toBe(33); // 1/3 = 33%
      expect(statistics.tasksByPriority.priority1).toBe(1);
      expect(statistics.tasksByPriority.priority2).toBe(1);
      expect(statistics.tasksByPriority.priority3).toBe(1);
      expect(statistics.estimatedTime).toBe(270); // 60 + 120 + 90
      expect(statistics.actualTime).toBe(50);
    });

    it('should handle empty project', async () => {
      vi.mocked(taskService.getTasksByProject).mockResolvedValue([]);

      const statistics = await projectService.calculateProjectStatistics(mockProjectId, mockUserId);

      expect(statistics.totalTasks).toBe(0);
      expect(statistics.completedTasks).toBe(0);
      expect(statistics.completionRate).toBe(0);
    });
  });

  describe('getProjectWithTasks', () => {
    it('should get project with tasks and statistics', async () => {
      const mockProject = {
        $id: mockProjectId,
        userId: mockUserId,
        name: 'Test Project',
        color: '#2E5AAC',
        status: 'active',
        isExpanded: true,
        labels: [],
        position: 0,
      };

      const mockTasks = [
        { $id: 'task1', title: 'Task 1', completed: true, priority: 1 },
        { $id: 'task2', title: 'Task 2', completed: false, priority: 2 },
      ];

      vi.mocked(databaseService.getDocument).mockResolvedValue(mockProject as any);
      vi.mocked(taskService.getTasksByProject).mockResolvedValue(mockTasks as any);

      const result = await projectService.getProjectWithTasks(mockProjectId, mockUserId);

      expect(result.name).toBe('Test Project');
      expect(result.tasks).toEqual(mockTasks);
      expect(result.statistics).toBeDefined();
      expect(result.statistics.totalTasks).toBe(2);
      expect(result.statistics.completedTasks).toBe(1);
    });
  });

  describe('batch operations', () => {
    it('should batch create projects', async () => {
      const projectsData: CreateProjectData[] = [
        { name: 'Project 1', color: '#2E5AAC', status: 'active', isExpanded: true, labels: [], position: 0 },
        { name: 'Project 2', color: '#F2994A', status: 'active', isExpanded: true, labels: [], position: 1 },
      ];

      const mockProjects = projectsData.map((data, index) => ({
        ...data,
        $id: `project${index + 1}`,
        userId: mockUserId,
      }));

      vi.mocked(databaseService.batchCreateDocuments).mockResolvedValue(mockProjects as any);

      const result = await projectService.batchCreateProjects(projectsData, mockUserId);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Project 1');
      expect(result[1].name).toBe('Project 2');
    });

    it('should batch update projects', async () => {
      const updates = [
        { id: 'project1', data: { name: 'Updated 1' } },
        { id: 'project2', data: { name: 'Updated 2' } },
      ];

      const mockUpdatedProjects = updates.map(({ id, data }) => ({
        ...data,
        $id: id,
        userId: mockUserId,
      }));

      vi.mocked(databaseService.batchUpdateDocuments).mockResolvedValue(mockUpdatedProjects as any);

      const result = await projectService.batchUpdateProjects(updates);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Updated 1');
      expect(result[1].name).toBe('Updated 2');
    });

    it('should batch delete projects', async () => {
      const projectIds = ['project1', 'project2'];

      vi.mocked(taskService.getTasksByProject).mockResolvedValue([]);
      vi.mocked(databaseService.listDocuments).mockResolvedValue({ documents: [], total: 0 } as any);
      vi.mocked(databaseService.deleteDocument).mockResolvedValue(undefined);

      await projectService.batchDeleteProjects(projectIds, mockUserId);

      expect(databaseService.deleteDocument).toHaveBeenCalledTimes(2);
    });
  });

  describe('label operations', () => {
    it('should add label to project', async () => {
      const mockProject = {
        $id: mockProjectId,
        userId: mockUserId,
        name: 'Test Project',
        labels: ['label1'],
      };

      const mockUpdatedProject = {
        ...mockProject,
        labels: ['label1', 'label2'],
      };

      vi.mocked(databaseService.getDocument).mockResolvedValue(mockProject as any);
      vi.mocked(databaseService.updateDocument).mockResolvedValue(mockUpdatedProject as any);

      const result = await projectService.addLabelToProject(mockProjectId, 'label2');

      expect(result.labels).toContain('label2');
      expect(result.labels).toHaveLength(2);
    });

    it('should not add duplicate label', async () => {
      const mockProject = {
        $id: mockProjectId,
        userId: mockUserId,
        name: 'Test Project',
        labels: ['label1'],
      };

      vi.mocked(databaseService.getDocument).mockResolvedValue(mockProject as any);
      vi.mocked(databaseService.updateDocument).mockResolvedValue(mockProject as any);

      const result = await projectService.addLabelToProject(mockProjectId, 'label1');

      expect(result.labels).toHaveLength(1);
    });

    it('should remove label from project', async () => {
      const mockProject = {
        $id: mockProjectId,
        userId: mockUserId,
        name: 'Test Project',
        labels: ['label1', 'label2'],
      };

      const mockUpdatedProject = {
        ...mockProject,
        labels: ['label1'],
      };

      vi.mocked(databaseService.getDocument).mockResolvedValue(mockProject as any);
      vi.mocked(databaseService.updateDocument).mockResolvedValue(mockUpdatedProject as any);

      const result = await projectService.removeLabelFromProject(mockProjectId, 'label2');

      expect(result.labels).not.toContain('label2');
      expect(result.labels).toHaveLength(1);
    });
  });

  describe('status operations', () => {
    it('should update project status', async () => {
      const mockUpdatedProject = {
        $id: mockProjectId,
        userId: mockUserId,
        name: 'Test Project',
        status: 'completed',
      };

      vi.mocked(databaseService.updateDocument).mockResolvedValue(mockUpdatedProject as any);

      const result = await projectService.updateProjectStatus(mockProjectId, 'completed');

      expect(result.status).toBe('completed');
    });

    it('should archive project', async () => {
      const mockArchivedProject = {
        $id: mockProjectId,
        userId: mockUserId,
        name: 'Test Project',
        status: 'archived',
      };

      vi.mocked(databaseService.updateDocument).mockResolvedValue(mockArchivedProject as any);

      const result = await projectService.archiveProject(mockProjectId);

      expect(result.status).toBe('archived');
    });

    it('should unarchive project', async () => {
      const mockUnarchivedProject = {
        $id: mockProjectId,
        userId: mockUserId,
        name: 'Test Project',
        status: 'active',
      };

      vi.mocked(databaseService.updateDocument).mockResolvedValue(mockUnarchivedProject as any);

      const result = await projectService.unarchiveProject(mockProjectId);

      expect(result.status).toBe('active');
    });
  });

  describe('duplicateProject', () => {
    it('should duplicate project without tasks', async () => {
      const mockOriginalProject = {
        $id: mockProjectId,
        userId: mockUserId,
        name: 'Original Project',
        description: 'Original Description',
        color: '#2E5AAC',
        status: 'active',
        isExpanded: true,
        labels: ['label1'],
        position: 0,
      };

      const mockNewProject = {
        ...mockOriginalProject,
        $id: 'newProject123',
        name: 'Original Project (Copy)',
        position: 1,
      };

      vi.mocked(databaseService.getDocument).mockResolvedValue(mockOriginalProject as any);
      vi.mocked(databaseService.createDocument).mockResolvedValue(mockNewProject as any);

      const result = await projectService.duplicateProject(mockProjectId, mockUserId, false);

      expect(result.name).toBe('Original Project (Copy)');
      expect(result.$id).not.toBe(mockProjectId);
    });

    it('should duplicate project with tasks', async () => {
      const mockOriginalProject = {
        $id: mockProjectId,
        userId: mockUserId,
        name: 'Original Project',
        color: '#2E5AAC',
        status: 'active',
        isExpanded: true,
        labels: [],
        position: 0,
      };

      const mockTasks = [
        { $id: 'task1', title: 'Task 1', completed: true, priority: 1, projectId: mockProjectId },
      ];

      const mockNewProject = {
        ...mockOriginalProject,
        $id: 'newProject123',
        name: 'Custom Name',
      };

      vi.mocked(databaseService.getDocument).mockResolvedValue(mockOriginalProject as any);
      vi.mocked(databaseService.createDocument).mockResolvedValue(mockNewProject as any);
      vi.mocked(taskService.getTasksByProject).mockResolvedValue(mockTasks as any);
      vi.mocked(taskService.batchCreateTasks).mockResolvedValue([]);

      const result = await projectService.duplicateProject(
        mockProjectId,
        mockUserId,
        true,
        'Custom Name'
      );

      expect(result.name).toBe('Custom Name');
      expect(taskService.batchCreateTasks).toHaveBeenCalled();
    });
  });

  describe('reorderProject', () => {
    it('should reorder project correctly', async () => {
      const mockProjects = [
        { $id: 'project1', name: 'Project 1', position: 0, userId: mockUserId },
        { $id: 'project2', name: 'Project 2', position: 1, userId: mockUserId },
        { $id: 'project3', name: 'Project 3', position: 2, userId: mockUserId },
      ];

      vi.mocked(databaseService.listDocuments).mockResolvedValue({
        documents: mockProjects,
        total: 3,
      } as any);
      vi.mocked(databaseService.batchUpdateDocuments).mockResolvedValue([]);

      // Move project1 from position 0 to position 2
      await projectService.reorderProject('project1', 2, mockUserId);

      expect(databaseService.batchUpdateDocuments).toHaveBeenCalled();
    });
  });
});
