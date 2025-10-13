# Task 16: Epic Service - Visual Guide

## Epic Service Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Epic Service                              │
│                    (epic.service.ts)                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Core CRUD Operations                                            │
│  ├─ createEpic()          Create new epic                       │
│  ├─ getEpic()             Get epic by ID                        │
│  ├─ updateEpic()          Update epic fields                    │
│  ├─ deleteEpic()          Delete with cascade                   │
│  └─ listEpics()           List with filters                     │
│                                                                  │
│  Epic-Task Linking                                               │
│  ├─ linkTaskToEpic()      Link single task                      │
│  ├─ unlinkTaskFromEpic()  Unlink single task                    │
│  ├─ linkTasksToEpic()     Link multiple tasks                   │
│  └─ unlinkTasksFromEpics() Unlink multiple tasks                │
│                                                                  │
│  Progress & Statistics                                           │
│  ├─ calculateEpicProgress()           Calculate %               │
│  ├─ calculateAndUpdateEpicProgress()  Calculate & save          │
│  ├─ calculateEpicStatistics()         Full statistics           │
│  └─ autoCompleteEpicIfAllTasksDone()  Auto-complete             │
│                                                                  │
│  Hierarchy Management                                            │
│  ├─ getTopLevelEpics()    Get epics without parent             │
│  ├─ getChildEpics()       Get child epics                       │
│  ├─ moveEpicToParent()    Move to new parent                    │
│  └─ getEpicHierarchy()    Get epic with children                │
│                                                                  │
│  Advanced Features                                               │
│  ├─ getEpicWithTasks()              Epic + tasks + stats        │
│  ├─ getAllEpicsWithStatistics()     All epics with stats        │
│  ├─ duplicateEpic()                 Duplicate epic              │
│  ├─ getEpicRoadmapData()            Roadmap data                │
│  ├─ getEpicsWithOverdueTasks()      Filter overdue              │
│  ├─ archiveEpic()                   Archive epic                │
│  └─ unarchiveEpic()                 Unarchive epic              │
│                                                                  │
│  Batch Operations                                                │
│  ├─ batchCreateEpics()    Create multiple                       │
│  ├─ batchUpdateEpics()    Update multiple                       │
│  └─ batchDeleteEpics()    Delete multiple                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Uses
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Database Service                              │
│  ├─ createDocument()                                             │
│  ├─ getDocument()                                                │
│  ├─ updateDocument()                                             │
│  ├─ deleteDocument()                                             │
│  ├─ listDocuments()                                              │
│  ├─ countDocuments()                                             │
│  ├─ batchCreateDocuments()                                       │
│  └─ batchUpdateDocuments()                                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Uses
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Task Service                                │
│  ├─ getTasksByEpic()         Get tasks linked to epic           │
│  ├─ updateTask()             Update task (link/unlink)          │
│  ├─ deleteTaskWithSubtasks() Delete task with subtasks          │
│  ├─ getTask()                Get task by ID                     │
│  ├─ batchCreateTasks()       Create multiple tasks              │
│  └─ batchUpdateTasks()       Update multiple tasks              │
└─────────────────────────────────────────────────────────────────┘
```

## Epic Data Model

```
┌─────────────────────────────────────────────────────────────────┐
│                         Epic Document                            │
├─────────────────────────────────────────────────────────────────┤
│  $id: string                    (Appwrite document ID)           │
│  userId: string                 (Owner)                          │
│  projectId?: string             (Optional project link)          │
│  name: string                   (Epic name - required)           │
│  description?: string           (Epic description)               │
│  parentEpicId?: string          (Parent for nesting)             │
│  startDate?: string             (ISO 8601 date)                  │
│  endDate?: string               (ISO 8601 date)                  │
│  status: string                 (planning, in_progress, etc.)    │
│  progressPercentage: number     (0-100, auto-calculated)         │
│  $createdAt: string             (Appwrite timestamp)             │
│  $updatedAt: string             (Appwrite timestamp)             │
└─────────────────────────────────────────────────────────────────┘
```

## Epic Hierarchy Example

```
Initiative (Top-Level Epic)
│
├─ Epic 1: Product Launch
│  │
│  ├─ Story 1.1: Design UI
│  │  ├─ Task: Create wireframes
│  │  ├─ Task: Design mockups
│  │  └─ Task: User testing
│  │
│  ├─ Story 1.2: Develop Features
│  │  ├─ Task: Implement auth
│  │  ├─ Task: Build dashboard
│  │  └─ Task: Add analytics
│  │
│  └─ Story 1.3: Marketing
│     ├─ Task: Create landing page
│     ├─ Task: Write blog posts
│     └─ Task: Social media campaign
│
└─ Epic 2: Infrastructure
   │
   ├─ Story 2.1: Setup CI/CD
   │  ├─ Task: Configure GitHub Actions
   │  └─ Task: Setup deployment
   │
   └─ Story 2.2: Monitoring
      ├─ Task: Setup Sentry
      └─ Task: Configure alerts
```

## Epic-Task Linking Flow

```
┌──────────────┐
│   Create     │
│    Epic      │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Epic with   │
│ Progress: 0% │
└──────┬───────┘
       │
       │ Link Tasks
       ▼
┌──────────────────────────────────┐
│  Epic with 3 Tasks               │
│  ├─ Task 1: ✅ Completed         │
│  ├─ Task 2: ⬜ Not Started       │
│  └─ Task 3: ⬜ Not Started       │
│                                  │
│  Progress: 33% (1/3 completed)   │
└──────────────────────────────────┘
       │
       │ Complete Task 2
       ▼
┌──────────────────────────────────┐
│  Epic with 3 Tasks               │
│  ├─ Task 1: ✅ Completed         │
│  ├─ Task 2: ✅ Completed         │
│  └─ Task 3: ⬜ Not Started       │
│                                  │
│  Progress: 67% (2/3 completed)   │
└──────────────────────────────────┘
       │
       │ Complete Task 3
       ▼
┌──────────────────────────────────┐
│  Epic with 3 Tasks               │
│  ├─ Task 1: ✅ Completed         │
│  ├─ Task 2: ✅ Completed         │
│  └─ Task 3: ✅ Completed         │
│                                  │
│  Progress: 100% (3/3 completed)  │
│  Status: Auto-completed ✅       │
└──────────────────────────────────┘
```

## Epic Statistics Calculation

```
┌─────────────────────────────────────────────────────────────────┐
│                    Epic Statistics                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Task Counts                                                     │
│  ├─ totalTasks: 10                                               │
│  ├─ completedTasks: 6                                            │
│  ├─ incompleteTasks: 4                                           │
│  ├─ inProgressTasks: 2    (started but not completed)            │
│  ├─ blockedTasks: 1       (has incomplete dependencies)          │
│  └─ overdueTasks: 1       (past due date)                        │
│                                                                  │
│  Progress                                                        │
│  └─ completionRate: 60%   (6/10 completed)                       │
│                                                                  │
│  Time Tracking                                                   │
│  ├─ estimatedTime: 480 min  (8 hours)                            │
│  ├─ actualTime: 540 min     (9 hours)                            │
│  └─ timeVariance: +12.5%    (over estimate)                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Cascade Deletion Flow

```
Delete Epic
    │
    ├─ Get all linked tasks
    │  └─ Delete each task (with subtasks)
    │
    ├─ Get all child epics
    │  └─ Recursively delete each child epic
    │     ├─ Delete child's tasks
    │     ├─ Delete child's children
    │     └─ Delete child epic
    │
    └─ Delete the epic itself

Example:
Delete "Product Launch" Epic
    │
    ├─ Delete Tasks
    │  ├─ Task: Create wireframes
    │  ├─ Task: Design mockups
    │  └─ Task: User testing
    │
    ├─ Delete Child Epics
    │  ├─ Delete "Design UI" Epic
    │  │  └─ Delete its tasks
    │  ├─ Delete "Develop Features" Epic
    │  │  └─ Delete its tasks
    │  └─ Delete "Marketing" Epic
    │     └─ Delete its tasks
    │
    └─ Delete "Product Launch" Epic
```

## Roadmap Visualization Data

```
Timeline View (Gantt Chart)
═══════════════════════════════════════════════════════════════

Jan 2024          Feb 2024          Mar 2024          Apr 2024
│                 │                 │                 │
├─────────────────┼─────────────────┼─────────────────┤
│ Epic 1: Product Launch (Progress: 60%)              │
│ ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
├─────────────────┼─────────────────┼─────────────────┤
│                 │ Epic 2: Marketing (Progress: 30%) │
│                 │ ████████░░░░░░░░░░░░░░░░░░░░░░░░░ │
├─────────────────┼─────────────────┼─────────────────┤
│                 │                 │ Epic 3: Testing  │
│                 │                 │ ░░░░░░░░░░░░░░░░ │
└─────────────────┴─────────────────┴─────────────────┘

Data Structure:
[
  {
    id: 'epic1',
    name: 'Product Launch',
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    progressPercentage: 60,
    statistics: { totalTasks: 10, completedTasks: 6, ... }
  },
  {
    id: 'epic2',
    name: 'Marketing',
    startDate: '2024-02-01',
    endDate: '2024-03-15',
    progressPercentage: 30,
    statistics: { totalTasks: 8, completedTasks: 2, ... }
  },
  ...
]
```

## Filter Operations

```
┌─────────────────────────────────────────────────────────────────┐
│                      Epic Filters                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Basic Filters                                                   │
│  ├─ userId: 'user123'           (Required for security)         │
│  ├─ projectId: 'project456'     (Filter by project)             │
│  ├─ parentEpicId: null          (Top-level epics only)          │
│  └─ status: 'in_progress'       (Filter by status)              │
│                                                                  │
│  Advanced Filters                                                │
│  ├─ search: 'product launch'    (Full-text search)              │
│  ├─ orderBy: 'startDate'        (Sort field)                    │
│  ├─ orderDirection: 'asc'       (Sort direction)                │
│  ├─ limit: 10                   (Pagination)                    │
│  └─ offset: 0                   (Pagination)                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

Example Query:
listEpics({
  userId: 'user123',
  projectId: 'project456',
  status: ['planning', 'in_progress'],
  search: 'launch',
  orderBy: 'startDate',
  orderDirection: 'asc',
  limit: 10
})

Result:
[
  { name: 'Product Launch', status: 'in_progress', ... },
  { name: 'Marketing Launch', status: 'planning', ... }
]
```

## Batch Operations Flow

```
Batch Create Epics
┌─────────────────────────────────────────────────────────────────┐
│  Input: Array of Epic Data                                      │
│  [                                                               │
│    { name: 'Epic 1', status: 'planning' },                      │
│    { name: 'Epic 2', status: 'in_progress' },                   │
│    { name: 'Epic 3', status: 'planning' }                       │
│  ]                                                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Transform to Epic Documents                                     │
│  Add userId, default values, progressPercentage                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Single Database Call                                            │
│  batchCreateDocuments(collection, documents, permissions)        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Output: Array of Created Epics                                  │
│  [                                                               │
│    { $id: 'epic1', name: 'Epic 1', ... },                       │
│    { $id: 'epic2', name: 'Epic 2', ... },                       │
│    { $id: 'epic3', name: 'Epic 3', ... }                        │
│  ]                                                               │
└─────────────────────────────────────────────────────────────────┘

Benefits:
✅ Single database call (vs 3 separate calls)
✅ Atomic operation (all succeed or all fail)
✅ Better performance
✅ Consistent permissions
```

## Integration with UI Components

```
┌─────────────────────────────────────────────────────────────────┐
│                        UI Components                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  EpicDialog.tsx                                                  │
│  ├─ Create/Edit epic form                                       │
│  ├─ Uses: createEpic(), updateEpic()                            │
│  └─ Fields: name, description, dates, status, parent            │
│                                                                  │
│  EpicList.tsx                                                    │
│  ├─ List view of epics                                          │
│  ├─ Uses: listEpics(), getEpicsByProject()                      │
│  └─ Shows: name, progress, status, dates                        │
│                                                                  │
│  EpicDetail.tsx                                                  │
│  ├─ Epic detail panel                                           │
│  ├─ Uses: getEpicWithTasks(), calculateEpicStatistics()         │
│  └─ Shows: tasks, progress, statistics, actions                 │
│                                                                  │
│  EpicCard.tsx                                                    │
│  ├─ Epic card component                                         │
│  ├─ Uses: epic data                                             │
│  └─ Shows: name, progress bar, status badge                     │
│                                                                  │
│  RoadmapView.tsx                                                 │
│  ├─ Timeline visualization                                      │
│  ├─ Uses: getEpicRoadmapData()                                  │
│  └─ Shows: Gantt chart with epics                               │
│                                                                  │
│  EpicHierarchy.tsx                                               │
│  ├─ Tree view of nested epics                                   │
│  ├─ Uses: getEpicHierarchy(), getTopLevelEpics()                │
│  └─ Shows: parent-child relationships                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Status Flow

```
Epic Lifecycle
═══════════════

┌──────────┐
│ Planning │  Initial state
└────┬─────┘
     │
     ▼
┌──────────────┐
│ In Progress  │  Work started
└────┬─────────┘
     │
     ├─────────────┐
     │             │
     ▼             ▼
┌──────────┐  ┌──────────┐
│ On Hold  │  │ Blocked  │  Temporary states
└────┬─────┘  └────┬─────┘
     │             │
     └──────┬──────┘
            │
            ▼
     ┌──────────────┐
     │  Completed   │  All tasks done
     └────┬─────────┘
          │
          ▼
     ┌──────────┐
     │ Archived │  Final state
     └──────────┘
```

## Summary

The Epic Service provides:
- ✅ Complete CRUD operations
- ✅ Epic-task linking with auto-progress
- ✅ Nested hierarchies (unlimited depth)
- ✅ Comprehensive statistics
- ✅ Batch operations for performance
- ✅ Roadmap data for visualization
- ✅ Auto-complete functionality
- ✅ Archive/unarchive support

Ready for UI integration in Task 17!
