# Task 17: Project Status Management UI - Visual Guide

## Component Hierarchy

```
ProjectManagement
├── Project List (Left Panel)
│   ├── Project Cards
│   │   ├── Project Color Indicator
│   │   ├── Project Name
│   │   ├── ProjectStatusBadge
│   │   └── Description
│   └── New Project Button
│
└── Project Details (Right Panel)
    ├── Details Tab
    │   ├── Project Header
    │   │   ├── Color + Name
    │   │   ├── Change Status Button
    │   │   └── Delete Button
    │   ├── Current Status (ProjectStatusBadge)
    │   ├── Description
    │   ├── Dates (Start/End)
    │   └── Labels
    │
    └── Status History Tab
        └── ProjectStatusHistory
            └── Timeline Items
                ├── Status Indicator Dot
                ├── From/To Status Badges
                ├── Notes
                └── Timestamp
```

## Status Change Flow

```
1. User clicks "Change Status" button
   ↓
2. ProjectStatusDialog opens
   ├── Shows current status
   ├── Status dropdown with icons
   ├── Optional notes field
   └── Update button
   ↓
3. User selects new status
   ↓
4. User adds notes (optional)
   ↓
5. User clicks "Update Status"
   ↓
6. Service updates project status
   ↓
7. Service records status change in history
   ↓
8. Toast notification confirms change
   ↓
9. UI refreshes with new status
```

## Status Badge Visual States

```
┌─────────────────────────────────────┐
│ Planning    [Lightbulb] Purple      │
│ In Progress [PlayCircle] Blue       │
│ On Hold     [Hourglass] Orange      │
│ Completed   [CheckCircle] Green     │
│ Archived    [Archive] Gray          │
│ Blocked     [Warning] Red           │
│ Active      [Clipboard] Deep Blue   │
└─────────────────────────────────────┘
```

## Status Reports Layout

```
┌─────────────────────────────────────────────────────┐
│ Project Status Reports          [Export Report]     │
├─────────────────────────────────────────────────────┤
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐               │
│ │Total │ │In    │ │Comp  │ │Block │               │
│ │  12  │ │Prog 5│ │leted │ │ed  1 │               │
│ └──────┘ └──────┘ └──────┘ └──────┘               │
├─────────────────────────────────────────────────────┤
│ [All] [Planning] [In Progress] [On Hold] ...       │
├─────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────┐   │
│ │ Project Name              [Status Badge]    │   │
│ │ Description text...                         │   │
│ │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 75%      │   │
│ │ Total: 20  Completed: 15  Overdue: 2       │   │
│ │ Start: 01/01/2025  End: 03/31/2025         │   │
│ └─────────────────────────────────────────────┘   │
│ ┌─────────────────────────────────────────────┐   │
│ │ Another Project           [Status Badge]    │   │
│ │ ...                                         │   │
│ └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

## Sidebar Integration

```
Projects
├── Project 1 [●] [Badge if not active]
├── Project 2 [●]
└── Project 3 [●] [Blocked Badge]
```

## Status History Timeline

```
┌─────────────────────────────────────┐
│ Status History                      │
│ 3 status changes recorded           │
├─────────────────────────────────────┤
│ ● [Planning] → [In Progress]        │
│   Started development phase         │
│   2 hours ago                       │
│ │                                   │
│ ● [Active] → [Planning]             │
│   Initial planning complete         │
│   1 day ago                         │
│ │                                   │
│ ● Created                           │
│   Project created                   │
│   3 days ago                        │
└─────────────────────────────────────┘
```

## Color Scheme

- **Planning**: Purple (#9B59B6) - Creative/ideation phase
- **In Progress**: Blue (#3498DB) - Active work
- **On Hold**: Orange (#F39C12) - Attention needed
- **Completed**: Green (#27AE60) - Success
- **Archived**: Gray (#95A5A6) - Inactive
- **Blocked**: Red (#E74C3C) - Critical issue
- **Active**: Deep Blue (#2E5AAC) - Default state

## Responsive Behavior

### Desktop (>1024px)
- Two-column layout (list + details)
- Full status labels shown
- All statistics visible

### Tablet (768px - 1024px)
- Stacked layout with tabs
- Abbreviated status labels
- Key statistics only

### Mobile (<768px)
- Single column
- Icon-only status badges
- Collapsible sections
