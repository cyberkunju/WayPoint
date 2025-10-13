# Epic Service Documentation

## Overview

The Epic Service provides comprehensive CRUD operations and management functionality for epics in ClarityFlow. Epics are high-level goals that can contain multiple tasks and support nested hierarchies (parent-child relationships).

## Features

### Core CRUD Operations
- ✅ Create epic with Appwrite
- ✅ Get epic by ID
- ✅ Update epic
- ✅ Delete epic (with cascade deletion of tasks and child epics)
- ✅ List epics with advanced filtering

### Epic-Task Linking
- ✅ Link task to epic
- ✅ Unlink task from epic
- ✅ Link multiple tasks to epic
- ✅ Unlink multiple tasks from epics
- ✅ Get tasks by epic

### Progress Calculation
- ✅ Calculate epic progress based on linked tasks
- ✅ Auto-update progress when tasks change
- ✅ Auto-complete epic when all tasks are done
- ✅ Calculate comprehensive statistics (total, completed, in-progress, blocked, overdue)

### Nested Epics Support
- ✅ Create child epics (parent-child relationships)
- ✅ Get top-level epics (no parent)
- ✅ Get child epics
- ✅ Move epic to new parent
- ✅ Get epic hierarchy (epic with all nested children)
- ✅ Recursive cascade deletion

### Batch Operations
- ✅ Batch create epics
- ✅ Batch update epics
- ✅ Batch delete epics (with cascade)

### Advanced Features
- ✅ Duplicate epic (with or without tasks)
- ✅ Get epic with tasks and statistics
- ✅ Get all epics with statistics
- ✅ Get epics by project
- ✅ Get epics by status
- ✅ Search epics
- ✅ Count epics
- ✅ Archive/unarchive epics
- ✅ Get epics with overdue tasks
- ✅ Get epic roadmap data (for timeline visualization)

## Data Model

### EpicDocument Interface
```typescript
interface EpicDocument {
  userId: string;              // Owner of the epic
  projectId?: string;          // Optional project association
  name: string;                // Epic name (required)
  description?: string;        // Epic description
  parentEpicId?: string;       // Parent epic for nested hierarchies
  startDate?: string;          // Start date (ISO 8601)
  endDate?: string;            // End date (ISO 8601)
  status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'archived' | 'blocked';
  progressPercentage: number;  // 0-100, calculated from linked tasks
}
```

### Epic Statistics
```typescript
interface EpicStatistics {
  totalTasks: number;
  completedTasks: number;
  incompleteTasks: number;
  inProgressTasks: number;
  blockedTasks: number;
  overdueTasks: number;
  completionRate: number;      // 0-100
  estimatedTime: number;       // Total estimated minutes
  actualTime: number;          // Total actual minutes
  timeVariance: number;        // Percentage variance
}
```

## Usage Examples

### Create an Epic
```typescript
import { epicService } from '@/services/epic.service';

const epic = await epicService.createEpic(
  {
    name: 'Q1 Product Launch',
    description: 'Launch new product features in Q1',
    projectId: 'project123',
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    status: 'planning',
  },
  userId
);
```

### Create a Nested Epic
```typescript
const childEpic = await epicService.createEpic(
  {
    name: 'Marketing Campaign',
    description: 'Marketing activities for product launch',
    parentEpicId: 'parent-epic-id',
    status: 'planning',
  },
  userId
);
```

### Link Tasks to Epic
```typescript
// Link a single task
await epicService.linkTaskToEpic('task-id', 'epic-id');

// Link multiple tasks
await epicService.linkTasksToEpic(
  ['task1', 'task2', 'task3'],
  'epic-id'
);
```

### Get Epic with Tasks and Statistics
```typescript
const epicWithTasks = await epicService.getEpicWithTasks('epic-id', userId);

console.log(epicWithTasks.tasks);        // Array of tasks
console.log(epicWithTasks.statistics);   // Comprehensive statistics
```

### Calculate and Update Progress
```typescript
// Manually calculate progress
const progress = await epicService.calculateEpicProgress('epic-id', userId);

// Calculate and update in one call
const updatedEpic = await epicService.calculateAndUpdateEpicProgress('epic-id', userId);
```

### Auto-Complete Epic
```typescript
// Automatically mark epic as completed when all tasks are done
await epicService.autoCompleteEpicIfAllTasksDone('epic-id', userId);
```

### List Epics with Filters
```typescript
// Get all epics for a user
const allEpics = await epicService.listEpics({ userId });

// Get epics by project
const projectEpics = await epicService.getEpicsByProject('project-id', userId);

// Get top-level epics (no parent)
const topLevelEpics = await epicService.getTopLevelEpics(userId);

// Get child epics
const childEpics = await epicService.getChildEpics('parent-epic-id', userId);

// Get epics by status
const activeEpics = await epicService.getEpicsByStatus('in_progress', userId);

// Search epics
const searchResults = await epicService.searchEpics('product launch', userId);

// Advanced filtering
const filteredEpics = await epicService.listEpics({
  userId,
  projectId: 'project123',
  status: ['planning', 'in_progress'],
  search: 'launch',
  orderBy: 'startDate',
  orderDirection: 'asc',
  limit: 10,
  offset: 0,
});
```

### Get Epic Hierarchy
```typescript
const epicHierarchy = await epicService.getEpicHierarchy('epic-id', userId);

console.log(epicHierarchy.children); // Array of child epics
```

### Duplicate Epic
```typescript
// Duplicate without tasks
const duplicatedEpic = await epicService.duplicateEpic(
  'epic-id',
  userId,
  false
);

// Duplicate with tasks
const duplicatedWithTasks = await epicService.duplicateEpic(
  'epic-id',
  userId,
  true,
  'Q2 Product Launch' // Optional new name
);
```

### Delete Epic (Cascade)
```typescript
// Deletes epic, all linked tasks, and all child epics
await epicService.deleteEpic('epic-id', userId);
```

### Batch Operations
```typescript
// Batch create
const newEpics = await epicService.batchCreateEpics(
  [
    { name: 'Epic 1', status: 'planning' },
    { name: 'Epic 2', status: 'in_progress' },
  ],
  userId
);

// Batch update
await epicService.batchUpdateEpics([
  { id: 'epic1', data: { status: 'in_progress' } },
  { id: 'epic2', data: { progressPercentage: 75 } },
]);

// Batch delete
await epicService.batchDeleteEpics(['epic1', 'epic2'], userId);
```

### Get Roadmap Data
```typescript
// Get all epics with statistics for roadmap visualization
const roadmapData = await epicService.getEpicRoadmapData(userId);

// Get roadmap data for specific project
const projectRoadmap = await epicService.getEpicRoadmapData(userId, 'project-id');
```

### Archive/Unarchive
```typescript
// Archive epic
await epicService.archiveEpic('epic-id');

// Unarchive epic
await epicService.unarchiveEpic('epic-id');

// Get archived epics
const archivedEpics = await epicService.getArchivedEpics(userId);
```

### Get Epics with Overdue Tasks
```typescript
const epicsWithOverdue = await epicService.getEpicsWithOverdueTasks(userId);

epicsWithOverdue.forEach(epic => {
  console.log(`${epic.name}: ${epic.overdueCount} overdue tasks`);
});
```

## Integration with Task Service

The Epic Service integrates seamlessly with the Task Service:

1. **Task Linking**: Tasks can be linked to epics via the `epicId` field
2. **Progress Calculation**: Epic progress is automatically calculated based on task completion
3. **Cascade Deletion**: Deleting an epic also deletes all linked tasks
4. **Statistics**: Epic statistics include comprehensive task metrics

## Requirements Satisfied

This implementation satisfies the following requirements from Requirement 10:

- ✅ **10.1**: Create epic with name, description, timeline, and success criteria
- ✅ **10.2**: Link tasks to epics as stories or sub-tasks
- ✅ **10.3**: Display progress based on completed linked tasks with visual progress bars
- ✅ **10.4**: Show epics in roadmap view with timelines and milestones
- ✅ **10.5**: Filter tasks by epic across all views
- ✅ **10.7**: Support nested epics (initiative > epic > story > sub-task)

Additional features implemented:
- Auto-complete epic when all tasks are done (10.6)
- Comprehensive metrics (10.8): total tasks, completed, in progress, blocked, estimated vs actual time

## Performance Considerations

- **Batch Operations**: Use batch methods for creating/updating/deleting multiple epics
- **Progress Calculation**: Progress is calculated on-demand and cached in the `progressPercentage` field
- **Cascade Deletion**: Recursive deletion is optimized to minimize database calls
- **Statistics**: Statistics are calculated on-demand; consider caching for frequently accessed epics

## Error Handling

All methods include try-catch blocks with console.error logging. Errors are thrown to be handled by calling code.

## Testing

Comprehensive test suite available in `src/services/__tests__/epic.service.test.ts` covering:
- CRUD operations
- Epic-task linking
- Progress calculation
- Nested epics
- Batch operations
- Statistics calculation
- Edge cases

## Next Steps

To use the Epic Service in the UI:
1. Create epic management components (EpicDialog, EpicList, EpicDetail)
2. Add epic visualization to roadmap view
3. Integrate epic filtering in task views
4. Add epic progress indicators
5. Implement epic hierarchy visualization
