# Sprint Planning Implementation

## Overview

Sprint Planning provides agile project management capabilities with sprint creation, backlog management, sprint boards, burn-down charts, and comprehensive reporting.

## Components

### 1. SprintManagement (Main Component)
**File:** `SprintManagement.tsx`

Main container component that orchestrates all sprint-related functionality.

**Features:**
- Sprint list management (planning, active, completed)
- View switching (Backlog, Board, Burn-down, Reports)
- Sprint creation and editing
- Sprint lifecycle management (start, complete, delete)
- Active sprint status display

**Props:**
```typescript
interface SprintManagementProps {
  userId: string;
  projectId?: string;
  tasks: any[];
  onTaskUpdate: (taskId: string, updates: any) => void;
  onTaskClick: (taskId: string) => void;
  onRefresh: () => void;
}
```

### 2. SprintFormDialog
**File:** `SprintFormDialog.tsx`

Dialog for creating and editing sprints.

**Features:**
- Sprint name and description
- Date range selection (start/end dates)
- Sprint goals definition
- Status management (planning, active, completed, cancelled)
- Form validation

**Props:**
```typescript
interface SprintFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
  projectId?: string;
  sprint?: Sprint | null;
}
```

### 3. SprintBacklog
**File:** `SprintBacklog.tsx`

Backlog management view with drag-and-drop task assignment.

**Features:**
- Product backlog column (unassigned tasks)
- Active sprint column
- Drag-and-drop task assignment
- Task priority and estimation display
- Visual feedback for drag operations

**Props:**
```typescript
interface SprintBacklogProps {
  userId: string;
  projectId?: string;
  tasks: Task[];
  onTaskUpdate: (taskId: string, updates: any) => void;
  onRefresh: () => void;
}
```

### 4. SprintBoard
**File:** `SprintBoard.tsx`

Kanban-style sprint board with workflow columns.

**Features:**
- Four-column board (To Do, In Progress, Review, Done)
- Drag-and-drop task movement
- Task status updates based on column
- Priority indicators
- Task click to view details

**Columns:**
- **To Do:** Tasks not yet started
- **In Progress:** Tasks with start date
- **Review:** Tasks pending review
- **Done:** Completed tasks

**Props:**
```typescript
interface SprintBoardProps {
  userId: string;
  projectId?: string;
  tasks: Task[];
  onTaskUpdate: (taskId: string, updates: any) => void;
  onTaskClick: (taskId: string) => void;
}
```

### 5. SprintBurnDownChart
**File:** `SprintBurnDownChart.tsx`

Burn-down chart visualization with sprint statistics.

**Features:**
- Interactive line chart (ideal vs actual burn-down)
- Key metrics cards (total points, completed, remaining, velocity)
- Progress bar with days elapsed/remaining
- Status indicator (ahead/behind schedule)
- Task breakdown statistics

**Metrics Displayed:**
- Total story points
- Completed points
- Remaining points
- Velocity (points per day)
- Completion rate
- Days elapsed/remaining
- Task counts (total, completed, in progress, to do)

**Props:**
```typescript
interface SprintBurnDownChartProps {
  sprint: Sprint;
  tasks: any[];
}
```

### 6. SprintReports
**File:** `SprintReports.tsx`

Comprehensive sprint reports for completed sprints.

**Features:**
- Sprint selector (completed sprints only)
- Sprint overview (duration, status, goals)
- Key metrics (completion rate, story points, velocity, efficiency)
- Task breakdown with progress bars
- Sprint insights and recommendations
- Export report as JSON

**Report Sections:**
- Sprint Overview
- Key Metrics
- Task Breakdown
- Sprint Insights

**Props:**
```typescript
interface SprintReportsProps {
  userId: string;
  projectId?: string;
  tasks: any[];
}
```

## Service Layer

### SprintService
**File:** `src/services/sprint.service.ts`

Handles all sprint-related Appwrite operations.

**Key Methods:**

#### CRUD Operations
```typescript
createSprint(data: CreateSprintData): Promise<Sprint>
getSprint(sprintId: string): Promise<Sprint>
listSprints(userId: string, projectId?: string): Promise<Sprint[]>
updateSprint(sprintId: string, data: UpdateSprintData): Promise<Sprint>
deleteSprint(sprintId: string): Promise<void>
```

#### Sprint Management
```typescript
getActiveSprint(userId: string, projectId?: string): Promise<Sprint | null>
addTaskToSprint(sprintId: string, taskId: string): Promise<Sprint>
removeTaskFromSprint(sprintId: string, taskId: string): Promise<Sprint>
startSprint(sprintId: string): Promise<Sprint>
completeSprint(sprintId: string): Promise<Sprint>
```

#### Analytics
```typescript
calculateSprintStatistics(sprintId: string, tasks: any[]): Promise<SprintStatistics>
```

**Sprint Statistics:**
```typescript
interface SprintStatistics {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  completionRate: number;
  totalPoints: number;
  completedPoints: number;
  remainingPoints: number;
  velocity: number;
  daysRemaining: number;
  daysElapsed: number;
  totalDays: number;
  burnDownData: Array<{
    date: string;
    ideal: number;
    actual: number;
  }>;
}
```

## Database Schema

### Collection: `sprints`

**Attributes:**
- `userId` (string, required): User who owns the sprint
- `projectId` (string, optional): Associated project
- `name` (string, required): Sprint name
- `description` (string): Sprint description
- `startDate` (datetime, required): Sprint start date
- `endDate` (datetime, required): Sprint end date
- `goals` (string): Sprint goals
- `status` (string, default: 'planning'): Sprint status
  - `planning`: Sprint is being planned
  - `active`: Sprint is in progress
  - `completed`: Sprint is finished
  - `cancelled`: Sprint was cancelled
- `velocity` (double): Calculated velocity (points per day)
- `completedPoints` (double): Total completed story points
- `totalPoints` (double): Total story points in sprint
- `taskIds` (string[], array): Array of task IDs in the sprint

**Indexes:**
- `userId_idx`: Index on userId
- `projectId_idx`: Index on projectId
- `status_idx`: Index on status
- `startDate_idx`: Index on startDate
- `endDate_idx`: Index on endDate

**Permissions:**
- Read: User who owns the sprint
- Create: Any authenticated user
- Update: User who owns the sprint
- Delete: User who owns the sprint

## Setup

### 1. Run Setup Script
```bash
npx tsx scripts/setup-sprints.ts
```

This creates the `sprints` collection with all required attributes and indexes.

### 2. Import Components
```typescript
import { SprintManagement } from '@/components/SprintManagement';
```

### 3. Use in Application
```typescript
<SprintManagement
  userId={currentUser.$id}
  projectId={selectedProject?.$id}
  tasks={tasks}
  onTaskUpdate={handleTaskUpdate}
  onTaskClick={handleTaskClick}
  onRefresh={loadTasks}
/>
```

## User Workflows

### Creating a Sprint
1. Click "New Sprint" button
2. Enter sprint name and description
3. Set start and end dates (default: 2 weeks)
4. Define sprint goals
5. Click "Create Sprint"

### Planning a Sprint
1. Navigate to Backlog view
2. Drag tasks from Product Backlog to Sprint column
3. Review task estimates and priorities
4. Click "Start Sprint" when ready

### Running a Sprint
1. Sprint automatically becomes active
2. Use Sprint Board to track progress
3. Drag tasks between columns (To Do → In Progress → Review → Done)
4. Monitor burn-down chart for progress tracking

### Completing a Sprint
1. Click "Complete Sprint" button
2. Sprint status changes to "completed"
3. View sprint report in Reports tab
4. Export report if needed

### Viewing Reports
1. Navigate to Reports tab
2. Select completed sprint from dropdown
3. Review metrics and insights
4. Export report as JSON

## Key Features

### Drag-and-Drop
- Backlog: Assign tasks to sprints
- Board: Move tasks between workflow columns
- Visual feedback during drag operations
- Automatic status updates

### Burn-down Chart
- Real-time progress tracking
- Ideal vs actual burn rate
- Velocity calculation
- Schedule status (ahead/behind)

### Sprint Statistics
- Completion rate
- Story points (total, completed, remaining)
- Velocity (points per day)
- Task breakdown
- Days elapsed/remaining

### Reports
- Comprehensive sprint summaries
- Key performance metrics
- Task breakdown analysis
- Sprint insights and recommendations
- Export functionality

## Integration Points

### Task Management
- Tasks can be assigned to sprints
- Task status updates affect sprint metrics
- Task completion updates burn-down chart

### Project Management
- Sprints can be associated with projects
- Filter sprints by project
- Project-level sprint tracking

### Analytics
- Sprint velocity tracking
- Team performance metrics
- Historical sprint data

## Best Practices

### Sprint Planning
- Keep sprints 1-4 weeks long
- Define clear sprint goals
- Estimate tasks before adding to sprint
- Don't overcommit (use velocity as guide)

### Sprint Execution
- Update task status regularly
- Move tasks through workflow columns
- Monitor burn-down chart daily
- Address blockers quickly

### Sprint Review
- Complete sprint when all work is done
- Review sprint report
- Calculate velocity for next sprint
- Document lessons learned

## Performance Considerations

- Sprints are loaded on demand
- Statistics calculated client-side
- Burn-down data generated efficiently
- Task filtering optimized for large datasets

## Future Enhancements

- Sprint capacity planning
- Team member assignment
- Sprint retrospectives
- Velocity forecasting
- Sprint templates
- Automated sprint creation
- Integration with time tracking
- Custom workflow columns
- Sprint goals tracking
- Burnup charts
