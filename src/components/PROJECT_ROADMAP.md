# Project Roadmap Component

## Overview
The Project Roadmap component provides a comprehensive timeline visualization for projects and epics.

## Features Implemented

### Timeline Visualization (Requirement 12.1)
- Monthly, Quarterly, and Yearly views
- Displays both projects and epics on the same timeline
- Color-coded bars based on status
- Progress percentage overlay

### Drag-to-Adjust Dates (Requirement 12.2)
- Click and drag timeline bars to adjust dates
- Visual feedback during drag
- Automatic date calculation
- Toast notifications for updates

### Milestone Markers (Requirement 12.4)
- Toggle to show/hide milestones
- Flag icon displayed at end dates
- Visual distinction for deadlines

### Export Roadmap (Requirement 12.8)
- Export button in header
- Foundation for PDF export

## Component Props

```typescript
interface ProjectRoadmapProps {
  userId: string;
  onProjectClick?: (project: Project & { statistics: ProjectStatistics }) => void;
  onEpicClick?: (epic: Epic & { statistics: EpicStatistics }) => void;
}
```

## Usage Example

```tsx
import { ProjectRoadmap } from '@/components/ProjectRoadmap';

<ProjectRoadmap
  userId={user.$id}
  onProjectClick={handleProjectClick}
  onEpicClick={handleEpicClick}
/>
```
