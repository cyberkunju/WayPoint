# Project Service Documentation

## Overview

The Project Service provides comprehensive CRUD operations and advanced functionality for managing projects in ClarityFlow. It handles project creation, updates, deletion with cascade, statistics calculation, batch operations, and hierarchical project management.

## Features

### Core CRUD Operations
- ✅ Create projects with full configuration
- ✅ Get project by ID
- ✅ Update project properties
- ✅ Delete project with cascade deletion of tasks and child projects
- ✅ List projects with advanced filtering

### Advanced Features
- ✅ Project statistics (task counts, completion rate, time tracking)
- ✅ Get project with all tasks and statistics
- ✅ Batch operations (create, update, delete multiple projects)
- ✅ Hierarchical project management (parent-child relationships)
- ✅ Label management (add/remove labels)
- ✅ Status management (active, planning, in_progress, on_hold, completed, archived, blocked)
- ✅ Project duplication (with or without tasks)
- ✅ Drag-and-drop reordering
- ✅ Archive/unarchive functionality
- ✅ Search and filtering
- ✅ Overdue task detection

## API Reference

### Types

```typescript
interface ProjectDocument {
  userId: string;
  name: string;
  description?: string;
  color: string;
  status: 'active' | 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'archived' | 'blocked';
  parentId?: string;
  isExpanded: boolean;
  startDate?: string;
  endDate?: string;
  labels: string[];
  position: number;
}

interface ProjectStatistics {
  totalTasks: number;
  completedTasks: number;
  incompleteTasks: number;
  overdueTasks: number;
  completionRate: number;
  tasksByPriority: {
    priority1: number;
    priority2: number;
    priority3: number;
    priority4: number;
  };
  tasksByStatus: {
    completed: number;
    inProgress: number;
    notStarted: number;
  };
  estimatedTime: number;
  actualTime: number;
  timeVariance: number;
}
```

### Methods

#### createProject(data, userId, permissions?)
Creates a new project.

```typescript
const project = await projectService.createProject(
  {
    name: 'New Project',
    description: 'Project description',
    color: '#2E5AAC',
    status: 'active',
    labels: ['client', 'urgent'],
  },
  userId
);
```

#### getProject(projectId, userId?)
Gets a project by ID.

```typescript
const project = await projectService.getProject(projectId, userId);
```

#### updateProject(projectId, data, permissions?)
Updates a project.

```typescript
const updated = await projectService.updateProject(projectId, {
  name: 'Updated Name',
  status: 'in_progress',
});
```

#### deleteProject(projectId, userId)
Deletes a project and all its tasks and child projects (cascade deletion).

```typescript
await projectService.deleteProject(projectId, userId);
```

#### listProjects(filters?)
Lists projects with optional filters.

```typescript
const projects = await projectService.listProjects({
  userId,
  status: 'active',
  labels: ['client'],
  orderBy: 'name',
  orderDirection: 'asc',
});
```

#### getProjectWithTasks(projectId, userId)
Gets a project with all its tasks and statistics.

```typescript
const projectWithTasks = await projectService.getProjectWithTasks(projectId, userId);
console.log(projectWithTasks.tasks); // Array of tasks
console.log(projectWithTasks.statistics); // Project statistics
```

#### calculateProjectStatistics(projectId, userId)
Calculates comprehensive statistics for a project.

```typescript
const stats = await projectService.calculateProjectStatistics(projectId, userId);
console.log(`Completion: ${stats.completionRate}%`);
console.log(`Overdue: ${stats.overdueTasks}`);
console.log(`Time variance: ${stats.timeVariance}%`);
```

#### batchCreateProjects(projects, userId, permissions?)
Creates multiple projects in a batch.

```typescript
const projects = await projectService.batchCreateProjects(
  [
    { name: 'Project 1', color: '#2E5AAC', status: 'active', isExpanded: true, labels: [], position: 0 },
    { name: 'Project 2', color: '#F2994A', status: 'active', isExpanded: true, labels: [], position: 1 },
  ],
  userId
);
```

#### batchUpdateProjects(updates, permissions?)
Updates multiple projects in a batch.

```typescript
await projectService.batchUpdateProjects([
  { id: 'project1', data: { status: 'completed' } },
  { id: 'project2', data: { status: 'archived' } },
]);
```

#### batchDeleteProjects(projectIds, userId)
Deletes multiple projects with cascade deletion.

```typescript
await projectService.batchDeleteProjects(['project1', 'project2'], userId);
```

#### getTopLevelProjects(userId)
Gets all top-level projects (no parent).

```typescript
const topProjects = await projectService.getTopLevelProjects(userId);
```

#### getChildProjects(parentId, userId)
Gets all child projects of a parent.

```typescript
const children = await projectService.getChildProjects(parentId, userId);
```

#### getProjectsByStatus(status, userId)
Gets projects by status.

```typescript
const activeProjects = await projectService.getProjectsByStatus('active', userId);
const completedProjects = await projectService.getProjectsByStatus(['completed', 'archived'], userId);
```

#### getProjectsByLabel(labelId, userId)
Gets projects with a specific label.

```typescript
const clientProjects = await projectService.getProjectsByLabel('client-label-id', userId);
```

#### searchProjects(searchQuery, userId)
Searches projects by name.

```typescript
const results = await projectService.searchProjects('marketing', userId);
```

#### addLabelToProject(projectId, labelId)
Adds a label to a project.

```typescript
await projectService.addLabelToProject(projectId, labelId);
```

#### removeLabelFromProject(projectId, labelId)
Removes a label from a project.

```typescript
await projectService.removeLabelFromProject(projectId, labelId);
```

#### updateProjectStatus(projectId, status)
Updates project status.

```typescript
await projectService.updateProjectStatus(projectId, 'completed');
```

#### archiveProject(projectId)
Archives a project.

```typescript
await projectService.archiveProject(projectId);
```

#### unarchiveProject(projectId)
Unarchives a project.

```typescript
await projectService.unarchiveProject(projectId);
```

#### duplicateProject(projectId, userId, includeTasks?, newName?)
Duplicates a project with optional task copying.

```typescript
// Duplicate without tasks
const copy = await projectService.duplicateProject(projectId, userId, false);

// Duplicate with tasks
const copyWithTasks = await projectService.duplicateProject(
  projectId,
  userId,
  true,
  'New Project Name'
);
```

#### reorderProject(projectId, newPosition, userId, parentId?)
Reorders a project (for drag-and-drop).

```typescript
await projectService.reorderProject(projectId, 2, userId);
```

#### getAllProjectsWithStatistics(userId)
Gets all projects with their statistics.

```typescript
const projectsWithStats = await projectService.getAllProjectsWithStatistics(userId);
projectsWithStats.forEach(project => {
  console.log(`${project.name}: ${project.statistics.completionRate}%`);
});
```

#### getProjectsWithOverdueTasks(userId)
Gets projects that have overdue tasks.

```typescript
const overdueProjects = await projectService.getProjectsWithOverdueTasks(userId);
overdueProjects.forEach(project => {
  console.log(`${project.name} has ${project.overdueCount} overdue tasks`);
});
```

## Usage Examples

### Creating a Project Hierarchy

```typescript
// Create parent project
const parent = await projectService.createProject(
  {
    name: 'Q1 2024 Initiatives',
    color: '#2E5AAC',
    status: 'active',
    isExpanded: true,
    labels: [],
    position: 0,
  },
  userId
);

// Create child projects
const child1 = await projectService.createProject(
  {
    name: 'Marketing Campaign',
    parentId: parent.$id,
    color: '#F2994A',
    status: 'in_progress',
    isExpanded: true,
    labels: ['marketing'],
    position: 0,
  },
  userId
);

const child2 = await projectService.createProject(
  {
    name: 'Product Launch',
    parentId: parent.$id,
    color: '#27AE60',
    status: 'planning',
    isExpanded: true,
    labels: ['product'],
    position: 1,
  },
  userId
);
```

### Getting Project Statistics

```typescript
const stats = await projectService.calculateProjectStatistics(projectId, userId);

console.log(`Project Statistics:
  Total Tasks: ${stats.totalTasks}
  Completed: ${stats.completedTasks}
  Incomplete: ${stats.incompleteTasks}
  Overdue: ${stats.overdueTasks}
  Completion Rate: ${stats.completionRate}%
  
  By Priority:
    P1: ${stats.tasksByPriority.priority1}
    P2: ${stats.tasksByPriority.priority2}
    P3: ${stats.tasksByPriority.priority3}
    P4: ${stats.tasksByPriority.priority4}
  
  Time Tracking:
    Estimated: ${stats.estimatedTime} minutes
    Actual: ${stats.actualTime} minutes
    Variance: ${stats.timeVariance}%
`);
```

### Filtering Projects

```typescript
// Get active projects with specific labels
const filteredProjects = await projectService.listProjects({
  userId,
  status: 'active',
  labels: ['client', 'urgent'],
  orderBy: 'name',
  orderDirection: 'asc',
  limit: 10,
});

// Search projects
const searchResults = await projectService.searchProjects('marketing', userId);

// Get projects by status
const completedProjects = await projectService.getProjectsByStatus('completed', userId);
```

### Managing Project Labels

```typescript
// Add labels
await projectService.addLabelToProject(projectId, 'client-label-id');
await projectService.addLabelToProject(projectId, 'urgent-label-id');

// Remove label
await projectService.removeLabelFromProject(projectId, 'urgent-label-id');
```

### Batch Operations

```typescript
// Create multiple projects
const newProjects = await projectService.batchCreateProjects(
  [
    { name: 'Project A', color: '#2E5AAC', status: 'active', isExpanded: true, labels: [], position: 0 },
    { name: 'Project B', color: '#F2994A', status: 'active', isExpanded: true, labels: [], position: 1 },
    { name: 'Project C', color: '#27AE60', status: 'active', isExpanded: true, labels: [], position: 2 },
  ],
  userId
);

// Update multiple projects
await projectService.batchUpdateProjects([
  { id: newProjects[0].$id, data: { status: 'in_progress' } },
  { id: newProjects[1].$id, data: { status: 'completed' } },
]);

// Delete multiple projects
await projectService.batchDeleteProjects(
  [newProjects[0].$id, newProjects[1].$id],
  userId
);
```

### Cascade Deletion

```typescript
// Deleting a project will:
// 1. Delete all tasks in the project (including subtasks)
// 2. Delete all child projects recursively
// 3. Delete the project itself
await projectService.deleteProject(projectId, userId);
```

## Integration with Task Service

The Project Service integrates seamlessly with the Task Service:

```typescript
// Get project with all tasks
const projectWithTasks = await projectService.getProjectWithTasks(projectId, userId);

// Access tasks
projectWithTasks.tasks.forEach(task => {
  console.log(`Task: ${task.title} - ${task.completed ? 'Done' : 'Pending'}`);
});

// Access statistics
console.log(`Completion: ${projectWithTasks.statistics.completionRate}%`);
```

## Error Handling

All methods include comprehensive error handling:

```typescript
try {
  const project = await projectService.getProject(projectId, userId);
} catch (error) {
  console.error('Failed to get project:', error);
  // Handle error appropriately
}
```

## Performance Considerations

- **Batch Operations**: Use batch methods for multiple operations to reduce API calls
- **Statistics Caching**: Consider caching statistics for frequently accessed projects
- **Pagination**: Use `limit` and `offset` for large project lists
- **Filtering**: Apply filters at the database level for better performance

## Security

- All operations require a `userId` for data isolation
- Permissions are enforced at the document level
- Default permissions: read, update, delete for the owner only
- Custom permissions can be provided for sharing

## Testing

Comprehensive test suite included in `src/services/__tests__/project.service.test.ts`:

- ✅ CRUD operations
- ✅ Batch operations
- ✅ Statistics calculation
- ✅ Label management
- ✅ Status management
- ✅ Cascade deletion
- ✅ Duplication
- ✅ Reordering
- ✅ Filtering and search

## Requirements Satisfied

This implementation satisfies the following requirements from the spec:

- **Requirement 7.5**: Project status management with custom workflows
- **Requirement 9.1**: Project labels and categorization
- **Requirement 9.2**: Label management interface and filtering

## Next Steps

To use the Project Service in your application:

1. Import the service:
   ```typescript
   import { projectService } from '@/services/project.service';
   ```

2. Use it in your components:
   ```typescript
   const projects = await projectService.listProjects({ userId });
   ```

3. Integrate with UI components for project management

4. Add real-time updates using Appwrite Realtime subscriptions

5. Implement project templates (Task 23 in the implementation plan)
