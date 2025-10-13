# Project Status Management UI

## Overview

The Project Status Management UI provides comprehensive tools for tracking and managing project statuses throughout their lifecycle. This feature includes status workflows, history tracking, status change dialogs, and detailed reporting capabilities.

## Components

### 1. ProjectStatusDialog

A dialog component for changing project status with optional notes.

**Features:**
- Visual status selection with icons and colors
- Current status display
- Status change notes (optional)
- Automatic history tracking
- Toast notifications

**Usage:**
```tsx
import { ProjectStatusDialog } from '@/components/ProjectStatusDialog';

<ProjectStatusDialog
  project={project}
  open={isOpen}
  onOpenChange={setIsOpen}
  onStatusChanged={() => {
    // Refresh project data
  }}
/>
```

### 2. ProjectStatusBadge

A reusable badge component for displaying project status with icons and colors.

**Features:**
- Icon-based status indicators
- Color-coded badges
- Tooltip with status description
- Multiple sizes (sm, md, lg)
- Optional label display

**Usage:**
```tsx
import { ProjectStatusBadge } from '@/components/ProjectStatusBadge';

// With label
<ProjectStatusBadge status="in_progress" />

// Icon only with tooltip
<ProjectStatusBadge status="blocked" showLabel={false} size="sm" />
```

### 3. ProjectStatusHistory

A component for displaying the complete status change history of a project.

**Features:**
- Timeline visualization
- Status transition indicators
- Change notes display
- Timestamp with relative time
- Scrollable history list

**Usage:**
```tsx
import { ProjectStatusHistory } from '@/components/ProjectStatusHistory';

<ProjectStatusHistory projectId={projectId} userId={userId} />
```

### 4. ProjectStatusReports

A comprehensive reporting view for all projects grouped by status.

**Features:**
- Status overview cards
- Filterable tabs by status
- Project statistics (tasks, completion rate, overdue)
- Progress bars
- CSV export functionality
- Responsive grid layout

**Usage:**
```tsx
import { ProjectStatusReports } from '@/components/ProjectStatusReports';

<ProjectStatusReports userId={userId} />
```

### 5. ProjectManagement

A complete project management interface with status management capabilities.

**Features:**
- Project list with status indicators
- Project details view
- Status change functionality
- Status history tab
- Project deletion
- Responsive layout

**Usage:**
```tsx
import { ProjectManagement } from '@/components/ProjectManagement';

<ProjectManagement userId={userId} />
```

## Status Types

The system supports 7 project statuses:

| Status | Icon | Color | Description |
|--------|------|-------|-------------|
| Planning | Lightbulb | Purple (#9B59B6) | Project is in planning phase |
| In Progress | PlayCircle | Blue (#3498DB) | Project is actively being worked on |
| On Hold | HourglassHigh | Orange (#F39C12) | Project is temporarily paused |
| Completed | CheckCircle | Green (#27AE60) | Project has been completed |
| Archived | Archive | Gray (#95A5A6) | Project is archived |
| Blocked | WarningCircle | Red (#E74C3C) | Project is blocked by dependencies |
| Active | ClipboardText | Deep Blue (#2E5AAC) | Project is active (default) |

## Service Layer

### ProjectStatusService

Handles all status history operations with Appwrite.

**Methods:**
- `recordStatusChange()` - Record a new status change
- `getProjectStatusHistory()` - Get history for a project
- `getUserStatusHistory()` - Get all status changes for a user
- `getStatusHistoryByDateRange()` - Get history within date range
- `getLatestStatusChange()` - Get most recent status change
- `countStatusChanges()` - Count status changes
- `deleteProjectStatusHistory()` - Delete history when project is deleted

**Usage:**
```typescript
import { projectStatusService } from '@/services/project-status.service';

// Record status change
await projectStatusService.recordStatusChange(
  projectId,
  userId,
  'planning',
  'in_progress',
  'Started development phase'
);

// Get project history
const history = await projectStatusService.getProjectStatusHistory(projectId);
```

## Database Schema

### Collection: project_status_history

**Attributes:**
- `projectId` (string, 255, required) - Project ID
- `userId` (string, 255, required) - User ID
- `fromStatus` (string, 50, required) - Previous status
- `toStatus` (string, 50, required) - New status
- `notes` (string, 5000, optional) - Change notes
- `changedAt` (datetime, required) - Timestamp
- `changedBy` (string, 255, required) - User who made the change

**Indexes:**
- `projectId_idx` - For querying by project
- `userId_idx` - For querying by user
- `changedAt_idx` - For sorting by date
- `projectId_userId_idx` - Composite index for combined queries

**Permissions:**
- Read: Users (document-level)
- Create: Users
- Update: Users (document-level)
- Delete: Users (document-level)

## Setup

### 1. Run Setup Script

```bash
npm run tsx scripts/setup-project-status-history.ts
```

This creates the `project_status_history` collection with all required attributes and indexes.

### 2. Verify Setup

Check the Appwrite console to ensure:
- Collection exists with correct name
- All 7 attributes are created
- All 4 indexes are created
- Document security is enabled

## Integration with Sidebar

The Sidebar component now displays status indicators for projects:

```tsx
// Status badge shown for non-active projects
{project.status && project.status !== 'active' && (
  <ProjectStatusBadge status={project.status} showLabel={false} size="sm" />
)}
```

## Workflow

### Status Change Flow

1. User clicks "Change Status" button
2. ProjectStatusDialog opens
3. User selects new status
4. User optionally adds notes
5. User clicks "Update Status"
6. Project status is updated in database
7. Status change is recorded in history
8. Toast notification confirms change
9. UI refreshes to show new status

### History Tracking

All status changes are automatically tracked with:
- Previous status
- New status
- Change timestamp
- User who made the change
- Optional notes explaining the change

### Reporting

Status reports provide:
- Overview of all projects by status
- Filterable views by status type
- Project statistics and progress
- CSV export for external analysis

## Best Practices

1. **Always provide notes** for significant status changes (e.g., moving to "Blocked" or "On Hold")
2. **Use appropriate statuses** - Don't skip from "Planning" directly to "Completed"
3. **Review status history** before making changes to understand project trajectory
4. **Export reports regularly** for stakeholder updates
5. **Archive completed projects** to keep active project list manageable

## Performance Considerations

- Status history is paginated for large projects
- Indexes optimize query performance
- Status badges use memoization to prevent re-renders
- Reports use batch loading for statistics

## Future Enhancements

Potential improvements:
- Custom status workflows per project type
- Status change notifications
- Automated status transitions based on task completion
- Status-based project filtering in main views
- Status change approval workflows
- Integration with calendar for status milestones
