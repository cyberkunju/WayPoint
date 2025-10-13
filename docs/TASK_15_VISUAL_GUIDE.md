# Task 15: Project Service - Visual Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Project Service Layer                        │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │              Core CRUD Operations                       │   │
│  │  • createProject()    • getProject()                   │   │
│  │  • updateProject()    • deleteProject()                │   │
│  │  • listProjects()                                      │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │              Advanced Features                          │   │
│  │  • calculateProjectStatistics()                        │   │
│  │  • getProjectWithTasks()                               │   │
│  │  • duplicateProject()                                  │   │
│  │  • reorderProject()                                    │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │              Batch Operations                           │   │
│  │  • batchCreateProjects()                               │   │
│  │  • batchUpdateProjects()                               │   │
│  │  • batchDeleteProjects()                               │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │              Hierarchical Management                    │   │
│  │  • getTopLevelProjects()                               │   │
│  │  • getChildProjects()                                  │   │
│  │  • getProjectHierarchy()                               │   │
│  │  • moveProjectToParent()                               │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │              Label & Status Management                  │   │
│  │  • addLabelToProject()    • updateProjectStatus()      │   │
│  │  • removeLabelFromProject() • archiveProject()         │   │
│  │  • getProjectsByLabel()   • getProjectsByStatus()      │   │
│  └────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Database Service Layer                       │
│  • createDocument()    • listDocuments()                        │
│  • getDocument()       • updateDocument()                       │
│  • deleteDocument()    • batchOperations()                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Appwrite Backend                             │
│  • Database: clarityflow_production                             │
│  • Collection: projects                                         │
│  • Permissions: User-based access control                       │
└─────────────────────────────────────────────────────────────────┘
```

## Project Data Model

```
Project Document
├── $id: string                    (Appwrite generated)
├── $createdAt: string             (Appwrite generated)
├── $updatedAt: string             (Appwrite generated)
├── userId: string                 (Owner ID)
├── name: string                   (Project name)
├── description?: string           (Optional description)
├── color: string                  (Hex color code)
├── status: string                 (7 status types)
│   ├── active
│   ├── planning
│   ├── in_progress
│   ├── on_hold
│   ├── completed
│   ├── archived
│   └── blocked
├── parentId?: string              (Parent project ID)
├── isExpanded: boolean            (UI state)
├── startDate?: string             (ISO 8601)
├── endDate?: string               (ISO 8601)
├── labels: string[]               (Label IDs)
└── position: number               (Sort order)
```

## Project Statistics Structure

```
ProjectStatistics
├── totalTasks: number
├── completedTasks: number
├── incompleteTasks: number
├── overdueTasks: number
├── completionRate: number (0-100%)
├── tasksByPriority
│   ├── priority1: number (P1 count)
│   ├── priority2: number (P2 count)
│   ├── priority3: number (P3 count)
│   └── priority4: number (P4 count)
├── tasksByStatus
│   ├── completed: number
│   ├── inProgress: number
│   └── notStarted: number
├── estimatedTime: number (minutes)
├── actualTime: number (minutes)
└── timeVariance: number (percentage)
```

## Cascade Deletion Flow

```
deleteProject(projectId, userId)
    │
    ├─► Get all tasks in project
    │   └─► For each task:
    │       └─► deleteTaskWithSubtasks()
    │           ├─► Get all subtasks
    │           ├─► Recursively delete subtasks
    │           └─► Delete task
    │
    ├─► Get all child projects
    │   └─► For each child:
    │       └─► deleteProject() (recursive)
    │           ├─► Delete child's tasks
    │           ├─► Delete child's children
    │           └─► Delete child project
    │
    └─► Delete the project itself
```

## Project Hierarchy Example

```
Root Projects (parentId = null)
│
├── Q1 2024 Initiatives
│   ├── Marketing Campaign
│   │   ├── Social Media
│   │   └── Email Campaign
│   ├── Product Launch
│   │   ├── Beta Testing
│   │   └── Documentation
│   └── Sales Enablement
│
├── Q2 2024 Initiatives
│   ├── Customer Success
│   └── Product Improvements
│
└── Internal Projects
    ├── Team Building
    └── Process Improvements
```

## Statistics Calculation Flow

```
calculateProjectStatistics(projectId, userId)
    │
    ├─► Get all tasks for project
    │   └─► taskService.getTasksByProject()
    │
    ├─► Calculate counts
    │   ├─► totalTasks = tasks.length
    │   ├─► completedTasks = tasks.filter(completed).length
    │   ├─► incompleteTasks = totalTasks - completedTasks
    │   └─► overdueTasks = tasks.filter(overdue).length
    │
    ├─► Calculate completion rate
    │   └─► (completedTasks / totalTasks) * 100
    │
    ├─► Group by priority
    │   ├─► priority1 = tasks.filter(p === 1).length
    │   ├─► priority2 = tasks.filter(p === 2).length
    │   ├─► priority3 = tasks.filter(p === 3).length
    │   └─► priority4 = tasks.filter(p === 4).length
    │
    ├─► Group by status
    │   ├─► completed = completedTasks
    │   ├─► inProgress = tasks with startDate <= now
    │   └─► notStarted = tasks with startDate > now
    │
    └─► Calculate time metrics
        ├─► estimatedTime = sum(task.estimatedTime)
        ├─► actualTime = sum(task.actualTime)
        └─► timeVariance = ((actual - estimated) / estimated) * 100
```

## Batch Operations Flow

```
Batch Create Projects
┌─────────────────────────────────────────────────────────┐
│ Input: Array of CreateProjectData                       │
│ [                                                        │
│   { name: "Project 1", color: "#2E5AAC", ... },        │
│   { name: "Project 2", color: "#F2994A", ... },        │
│   { name: "Project 3", color: "#27AE60", ... }         │
│ ]                                                        │
└─────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│ Transform to ProjectDocument[]                          │
│ Add userId, default values, etc.                        │
└─────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│ databaseService.batchCreateDocuments()                  │
│ Creates all documents in parallel                       │
└─────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│ Output: Array of created Projects                       │
│ [                                                        │
│   { $id: "abc123", name: "Project 1", ... },           │
│   { $id: "def456", name: "Project 2", ... },           │
│   { $id: "ghi789", name: "Project 3", ... }            │
│ ]                                                        │
└─────────────────────────────────────────────────────────┘
```

## Reordering Flow

```
reorderProject(projectId, newPosition, userId)
    │
    ├─► Get all projects in same context
    │   └─► Same parent or top-level
    │
    ├─► Find project to move
    │   └─► oldPosition = project.position
    │
    ├─► Calculate affected projects
    │   │
    │   ├─► If moving down (oldPos < newPos):
    │   │   └─► Shift projects between old and new up by 1
    │   │
    │   └─► If moving up (oldPos > newPos):
    │       └─► Shift projects between new and old down by 1
    │
    └─► Batch update all affected projects
        └─► databaseService.batchUpdateDocuments()
```

## Label Management Flow

```
Add Label to Project
    │
    ├─► Get current project
    │   └─► project.labels = ['label1', 'label2']
    │
    ├─► Check if label already exists
    │   └─► If exists: return unchanged
    │
    ├─► Add new label
    │   └─► labels = [...project.labels, 'label3']
    │
    └─► Update project
        └─► project.labels = ['label1', 'label2', 'label3']

Remove Label from Project
    │
    ├─► Get current project
    │   └─► project.labels = ['label1', 'label2', 'label3']
    │
    ├─► Filter out label
    │   └─► labels = project.labels.filter(id !== 'label2')
    │
    └─► Update project
        └─► project.labels = ['label1', 'label3']
```

## Duplication Flow

```
duplicateProject(projectId, userId, includeTasks, newName)
    │
    ├─► Get original project
    │   └─► { name, description, color, status, ... }
    │
    ├─► Create new project
    │   ├─► name = newName || "Original Name (Copy)"
    │   ├─► Copy all properties
    │   └─► position = original.position + 1
    │
    └─► If includeTasks = true:
        │
        ├─► Get all tasks from original
        │   └─► taskService.getTasksByProject()
        │
        ├─► Transform tasks
        │   ├─► projectId = newProject.$id
        │   ├─► completed = false (reset)
        │   └─► dependencies = [] (clear)
        │
        └─► Batch create tasks
            └─► taskService.batchCreateTasks()
```

## Filter Options Visualization

```
ProjectFilters
├── userId: "user123"              (Required for security)
├── parentId: "project456"         (null for top-level)
├── status: "active"               (or ["active", "in_progress"])
├── labels: ["client", "urgent"]   (Match any label)
├── search: "marketing"            (Search in name)
├── orderBy: "name"                (Sort field)
├── orderDirection: "asc"          (Sort direction)
├── limit: 10                      (Pagination)
└── offset: 0                      (Pagination)

Example Query:
"Get active projects with 'client' label, sorted by name, first 10"
```

## Status Workflow

```
Project Status Lifecycle

Planning ──────► In Progress ──────► Completed
   │                  │                   │
   │                  │                   │
   ▼                  ▼                   ▼
On Hold           Blocked             Archived
   │                  │
   │                  │
   └──────────────────┘
          │
          ▼
       Active

Status Transitions:
• Planning → In Progress (Start work)
• In Progress → Completed (Finish work)
• In Progress → On Hold (Pause work)
• In Progress → Blocked (Dependencies)
• Completed → Archived (Long-term storage)
• Any → Active (Reactivate)
```

## Integration Points

```
Project Service Integration

┌─────────────────────────────────────────────────────────┐
│                   Project Service                        │
└─────────────────────────────────────────────────────────┘
    │
    ├─► Task Service
    │   ├─► getTasksByProject() - Get project tasks
    │   ├─► deleteTaskWithSubtasks() - Cascade deletion
    │   └─► batchCreateTasks() - Duplication
    │
    ├─► Database Service
    │   ├─► createDocument() - Create projects
    │   ├─► getDocument() - Get projects
    │   ├─► listDocuments() - List/filter projects
    │   ├─► updateDocument() - Update projects
    │   ├─► deleteDocument() - Delete projects
    │   └─► batchOperations() - Batch operations
    │
    └─► Appwrite Collections
        ├─► projects - Project documents
        ├─► tasks - Task documents
        └─► labels - Label documents
```

## Performance Optimization

```
Optimization Strategies

1. Batch Operations
   ├─► Create multiple projects: 1 API call
   ├─► Update multiple projects: 1 API call
   └─► Delete multiple projects: N API calls (cascade)

2. Statistics Caching
   ├─► Calculate once
   ├─► Cache in memory/state
   └─► Invalidate on task changes

3. Pagination
   ├─► limit: 10-50 projects per page
   ├─► offset: Skip processed projects
   └─► Total: Available for UI

4. Filtering at Database
   ├─► Apply filters in query
   ├─► Reduce data transfer
   └─► Faster response times

5. Parallel Operations
   ├─► Batch creates: Promise.all()
   ├─► Batch updates: Promise.all()
   └─► Independent operations: Concurrent
```

## Security Model

```
Permission Structure

Project Document
├── read("user:userId")      - Owner can read
├── update("user:userId")    - Owner can update
└── delete("user:userId")    - Owner can delete

Custom Permissions (Optional)
├── read("team:teamId")      - Team can read
├── update("team:teamId")    - Team can update
└── read("any")              - Public read

Data Isolation
├─► All queries include userId filter
├─► Appwrite enforces document permissions
└─► No cross-user data access
```

## Usage Patterns

```
Common Usage Patterns

1. Create Project
   projectService.createProject(data, userId)

2. Get Project with Stats
   projectService.getProjectWithTasks(projectId, userId)

3. Update Status
   projectService.updateProjectStatus(projectId, 'completed')

4. Archive Project
   projectService.archiveProject(projectId)

5. Duplicate Project
   projectService.duplicateProject(projectId, userId, true)

6. Batch Create
   projectService.batchCreateProjects(projects, userId)

7. Filter Projects
   projectService.listProjects({ userId, status: 'active' })

8. Search Projects
   projectService.searchProjects('marketing', userId)

9. Get Hierarchy
   projectService.getProjectHierarchy(projectId, userId)

10. Reorder Projects
    projectService.reorderProject(projectId, newPos, userId)
```

This visual guide provides a comprehensive overview of the Project Service architecture, data flows, and usage patterns.
