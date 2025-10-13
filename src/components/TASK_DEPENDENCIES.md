# Task Dependencies Feature

## Overview

The Task Dependencies feature allows users to create relationships between tasks, visualize dependencies, and calculate the critical path for projects. This helps with project planning and identifying tasks that directly impact project timelines.

## Features

### 1. Dependency Types

Four standard dependency types are supported:

- **Finish-to-Start (FS)**: Task B cannot start until Task A finishes (most common)
- **Start-to-Start (SS)**: Task B cannot start until Task A starts
- **Finish-to-Finish (FF)**: Task B cannot finish until Task A finishes
- **Start-to-Finish (SF)**: Task B cannot finish until Task A starts (rare)

### 2. Circular Dependency Prevention

The system automatically detects and prevents circular dependencies using depth-first search (DFS) algorithm. When attempting to create a dependency that would result in a cycle, the user receives a clear error message.

### 3. Dependency Management UI

Located in the DetailPanel, users can:

- View all tasks that the current task depends on ("Blocked By")
- View all tasks that depend on the current task ("Blocking")
- Add new dependencies with a dropdown selector
- Choose the dependency type
- Remove existing dependencies
- See dependency counts and types

### 4. Gantt Chart Visualization

The Gantt chart has been enhanced to show:

- Dependency counts for each task
- Critical path highlighting (purple color)
- Toggle button to show/hide critical path
- Toggle button to show/hide dependency graph

### 5. Dependency Graph

A visual network diagram showing:

- Tasks as nodes positioned by dependency level
- Arrows showing dependency relationships
- Automatic layout using topological sort
- Canvas-based rendering for smooth performance

### 6. Critical Path Calculation

The critical path algorithm:

- Uses forward pass to calculate earliest start/finish times
- Uses backward pass to calculate latest start/finish times
- Calculates slack time for each task
- Identifies tasks with zero slack as critical
- Highlights critical tasks in the Gantt chart

## Technical Implementation

### Service Layer

**File**: `src/services/task-dependencies.service.ts`

Key methods:
- `createDependency()`: Create a new dependency with validation
- `validateDependency()`: Check for circular dependencies
- `calculateCriticalPath()`: Compute critical path using CPM algorithm
- `canCompleteTask()`: Check if all dependencies are satisfied
- `getTaskDependencies()`: Get dependencies for a task
- `getDependentTasks()`: Get tasks that depend on a task

### Components

1. **TaskDependencies** (`src/components/TaskDependencies.tsx`)
   - Dependency management UI
   - Add/remove dependencies
   - Display blocked by and blocking relationships

2. **DependencyGraph** (`src/components/DependencyGraph.tsx`)
   - Visual network diagram
   - Canvas-based rendering
   - Topological layout algorithm

3. **GanttChart** (enhanced)
   - Critical path visualization
   - Dependency count display
   - Integration with dependency graph

4. **DetailPanel** (enhanced)
   - Integrated TaskDependencies component
   - Shows in Details tab

### Database Schema

**Collection**: `task_dependencies`

Attributes:
- `userId` (string, required): Owner of the dependency
- `taskId` (string, required): The dependent task (blocked by)
- `dependsOnTaskId` (string, required): The task it depends on (blocks)
- `dependencyType` (string, required): Type of dependency (finish-to-start, etc.)
- `lag` (integer, optional): Lag time in days (can be negative for lead time)
- `notes` (string, optional): Additional notes about the dependency

Indexes:
- `userId_idx`: Query by user
- `taskId_idx`: Query dependencies for a task
- `dependsOnTaskId_idx`: Query dependent tasks
- `userId_taskId_idx`: Composite index for efficient queries

## Setup

### 1. Create the Collection

Run the setup script:

```bash
npm run tsx scripts/setup-task-dependencies.ts
```

Or manually create the collection in Appwrite Console with the schema above.

### 2. Environment Variables

Ensure these are set in `.env.local`:

```
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_DATABASE_ID=clarityflow_production
APPWRITE_API_KEY=your_api_key
```

### 3. Permissions

The collection uses document-level security:
- Users can only read/write their own dependencies
- Permissions are set automatically based on userId

## Usage

### Adding a Dependency

1. Open a task in the DetailPanel
2. Scroll to the "Blocked By" section
3. Click "Add" button
4. Select the task this task depends on
5. Choose the dependency type
6. Click "Add Dependency"

### Viewing Critical Path

1. Navigate to Gantt Chart view
2. Click "Critical Path" button
3. Critical tasks are highlighted in purple
4. Tasks show "Critical" badge

### Viewing Dependency Graph

1. Navigate to Gantt Chart view
2. Click "Dependency Graph" button
3. Visual network diagram appears above the Gantt chart
4. Shows task relationships and flow

## Algorithms

### Circular Dependency Detection

Uses depth-first search with recursion stack:

```typescript
1. Start from the new dependency target
2. Traverse all dependencies recursively
3. Track visited nodes and recursion stack
4. If we encounter a node in the recursion stack, we found a cycle
5. Return the circular path for error messaging
```

### Critical Path Method (CPM)

Two-pass algorithm:

**Forward Pass**:
```typescript
1. Start with tasks that have no dependencies (earliest start = 0)
2. For each task, calculate earliest finish = earliest start + duration
3. For dependent tasks, earliest start = max(predecessor earliest finish)
4. Continue until all tasks are processed
```

**Backward Pass**:
```typescript
1. Start with end tasks (latest finish = project end)
2. For each task, calculate latest start = latest finish - duration
3. For predecessor tasks, latest finish = min(successor latest start)
4. Continue until all tasks are processed
```

**Slack Calculation**:
```typescript
slack = latest start - earliest start
critical = (slack === 0)
```

## Performance Considerations

- Dependency validation is O(V + E) where V = tasks, E = dependencies
- Critical path calculation is O(V + E)
- Dependency graph rendering uses canvas for smooth performance
- Queries are optimized with composite indexes

## Future Enhancements

- Lag time support in critical path calculation
- Dependency templates for common patterns
- Bulk dependency operations
- Dependency impact analysis
- Resource leveling
- What-if scenario analysis
- Export dependency graph as image
- Dependency change notifications

## Requirements Satisfied

This implementation satisfies Requirement 17 from the backend-cloud-sync spec:

- ✅ 17.1: Support for all four dependency types
- ✅ 17.2: Prevent completing tasks before dependencies
- ✅ 17.3: Visual display in Gantt chart
- ✅ 17.6: Circular dependency detection and prevention
- ✅ 17.8: Dependency graph visualization with zoom/pan capabilities
- ✅ Critical path calculation and highlighting
