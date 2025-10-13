# Task 19: Epics UI - Visual Guide

## Component Layout Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Epic Management                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Epics (15 total)                    [Link Tasks] [+ New] │  │
│  │  [List View] [Roadmap] [Details]                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌─────────────────────┬──────────────────────────────────────┐│
│  │   Epic List         │   Epic Details / Roadmap             ││
│  │                     │                                      ││
│  │  🚀 Q1 Launch       │   🚀 Q1 Product Launch              ││
│  │  ━━━━━━━━━━ 75%    │   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ││
│  │  15 tasks           │                                      ││
│  │                     │   [Overview] [Tasks] [Children]      ││
│  │  🚀 Backend API     │                                      ││
│  │  ━━━━━━━━━━ 60%    │   Description: ...                   ││
│  │  8 tasks            │                                      ││
│  │                     │   Progress: 75%                      ││
│  │  🚀 Mobile App      │   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ││
│  │  ━━━━━━━━━━ 40%    │                                      ││
│  │  12 tasks           │   Statistics:                        ││
│  │                     │   ┌──────┐ ┌──────┐ ┌──────┐       ││
│  │                     │   │ 15   │ │ 11   │ │ 2    │       ││
│  │                     │   │Total │ │Done  │ │Over  │       ││
│  │                     │   └──────┘ └──────┘ └──────┘       ││
│  └─────────────────────┴──────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

## 1. Epic Form Dialog

### Create New Epic
```
┌─────────────────────────────────────────────────────┐
│  🚀 Create New Epic                            [X]  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Epic Name *                                        │
│  ┌─────────────────────────────────────────────┐  │
│  │ Q1 Product Launch                           │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
│  Description                                        │
│  ┌─────────────────────────────────────────────┐  │
│  │ Launch new product features for Q1          │  │
│  │ including mobile app and API updates        │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
│  Status                                             │
│  ┌─────────────────────────────────────────────┐  │
│  │ In Progress                            ▼    │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
│  Project (Optional)                                 │
│  ┌─────────────────────────────────────────────┐  │
│  │ Product Development                    ▼    │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
│  Parent Epic (Optional)                             │
│  ┌─────────────────────────────────────────────┐  │
│  │ No Parent (Top-Level Epic)             ▼    │  │
│  └─────────────────────────────────────────────┘  │
│  Nested epics help organize large initiatives      │
│                                                     │
│  📅 Start Date        📅 End Date                  │
│  ┌──────────────┐    ┌──────────────┐            │
│  │ 2025-01-01   │    │ 2025-03-31   │            │
│  └──────────────┘    └──────────────┘            │
│                                                     │
│                        [Cancel] [Create Epic]      │
└─────────────────────────────────────────────────────┘
```

### Edit Existing Epic
```
┌─────────────────────────────────────────────────────┐
│  🚀 Edit Epic                                  [X]  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Epic Name *                                        │
│  ┌─────────────────────────────────────────────┐  │
│  │ Q1 Product Launch                           │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
│  [Same fields as create...]                        │
│                                                     │
│                        [Cancel] [Update Epic]      │
└─────────────────────────────────────────────────────┘
```

## 2. Epic Detail Panel

### Overview Tab
```
┌─────────────────────────────────────────────────────┐
│  🚀 Q1 Product Launch                               │
│  ✓ In Progress                    [Edit] [Delete]  │
│                                                     │
│  Progress                                      75%  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                     │
│  [Overview] [Tasks (15)] [Child Epics (2)]         │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Description                                        │
│  Launch new product features for Q1 including       │
│  mobile app and API updates                         │
│                                                     │
│  📅 Start Date        📅 End Date                  │
│  Jan 1, 2025          Mar 31, 2025                 │
│                                                     │
│  📊 Statistics                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │    15    │ │    11    │ │    3     │          │
│  │  Total   │ │Completed │ │In Progress│          │
│  │  Tasks   │ │  Tasks   │ │  Tasks   │          │
│  └──────────┘ └──────────┘ └──────────┘          │
│  ┌──────────┐ ┌──────────┐                        │
│  │    2     │ │    1     │                        │
│  │ Overdue  │ │ Blocked  │                        │
│  │  Tasks   │ │  Tasks   │                        │
│  └──────────┘ └──────────┘                        │
│                                                     │
│  ⏱️ Time Tracking                                   │
│  Estimated    Actual      Variance                 │
│  120h         135h        +12%                     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Tasks Tab
```
┌─────────────────────────────────────────────────────┐
│  🚀 Q1 Product Launch                               │
│  ✓ In Progress                    [Edit] [Delete]  │
│                                                     │
│  Progress                                      75%  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                     │
│  [Overview] [Tasks (15)] [Child Epics (2)]         │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────────────────────────────────────┐  │
│  │ ✓ Implement user authentication             │  │
│  │   📅 Due: Jan 15, 2025          [Unlink]   │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
│  ┌─────────────────────────────────────────────┐  │
│  │ ○ Design new dashboard UI                   │  │
│  │   📅 Due: Jan 20, 2025          [Unlink]   │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
│  ┌─────────────────────────────────────────────┐  │
│  │ ○ Integrate payment gateway                 │  │
│  │   📅 Due: Jan 10, 2025 [Overdue] [Unlink]  │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
│  [More tasks...]                                   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Child Epics Tab
```
┌─────────────────────────────────────────────────────┐
│  🚀 Q1 Product Launch                               │
│  ✓ In Progress                    [Edit] [Delete]  │
│                                                     │
│  Progress                                      75%  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                     │
│  [Overview] [Tasks (15)] [Child Epics (2)]         │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────────────────────────────────────┐  │
│  │ 🚀 Backend API Development                  │  │
│  │    [In Progress]                            │  │
│  │    Progress                            60%  │  │
│  │    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
│  ┌─────────────────────────────────────────────┐  │
│  │ 🚀 Mobile App Development                   │  │
│  │    [Planning]                               │  │
│  │    Progress                            40%  │  │
│  │    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## 3. Epic Task Linking Dialog

```
┌─────────────────────────────────────────────────────┐
│  🔗 Link Tasks to Epic                         [X]  │
│  Select tasks to link to "Q1 Product Launch"       │
├─────────────────────────────────────────────────────┤
│                                                     │
│  🔍 ┌─────────────────────────────────────────┐   │
│     │ Search tasks...                         │   │
│     └─────────────────────────────────────────┘   │
│                                                     │
│  15 selected    [2 changes]                        │
│                                                     │
│  ┌─────────────────────────────────────────────┐  │
│  │ ☑ ✓ Implement user authentication          │  │
│  │     [P1] Due: Jan 15, 2025                  │  │
│  ├─────────────────────────────────────────────┤  │
│  │ ☑ ○ Design new dashboard UI                │  │
│  │     [P2] Due: Jan 20, 2025                  │  │
│  ├─────────────────────────────────────────────┤  │
│  │ ☐ ○ Write API documentation                │  │
│  │     [P3] Due: Jan 25, 2025                  │  │
│  ├─────────────────────────────────────────────┤  │
│  │ ☑ ○ Setup CI/CD pipeline                   │  │
│  │     [P2] [Already in another epic]          │  │
│  ├─────────────────────────────────────────────┤  │
│  │ ☐ ○ Create user onboarding flow            │  │
│  │     [P3] Due: Feb 1, 2025                   │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
│                        [Cancel] [Link 15 Tasks]    │
└─────────────────────────────────────────────────────┘
```

## 4. Epic Roadmap View

### Monthly View
```
┌─────────────────────────────────────────────────────────────────┐
│  Epic Roadmap                                                    │
│  15 epics with timeline                                          │
│                                                                  │
│  [◀] [Today] [▶]     [Monthly] [Quarterly] [Yearly]            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Epic              │ Dec 2024 │ Jan 2025 │ Feb 2025 │ Mar 2025 │
│  ──────────────────┼──────────┼──────────┼──────────┼──────────│
│  ✓ Q1 Launch       │          │━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│  15/20 tasks       │          │    75%                          │
│                    │          │                                 │
│  ○ Backend API     │          │━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│  8/12 tasks        │          │    60%                          │
│                    │          │                                 │
│  ○ Mobile App      │          │          │━━━━━━━━━━━━━━━━━━━│
│  5/10 tasks        │          │          │    40%              │
│                    │          │          │                     │
│  ✓ Marketing       │━━━━━━━━━━━━━━━━━━━━│                     │
│  12/12 tasks       │    100%              │                     │
│                    │                      │                     │
└─────────────────────────────────────────────────────────────────┘
```

### Quarterly View
```
┌─────────────────────────────────────────────────────────────────┐
│  Epic Roadmap                                                    │
│  15 epics with timeline                                          │
│                                                                  │
│  [◀] [Today] [▶]     [Monthly] [Quarterly] [Yearly]            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Epic              │ Q4 2024  │ Q1 2025  │ Q2 2025  │ Q3 2025  │
│  ──────────────────┼──────────┼──────────┼──────────┼──────────│
│  ✓ Q1 Launch       │          │━━━━━━━━━━━━━━━━━━━━│          │
│  15/20 tasks       │          │    75%              │          │
│                    │          │                     │          │
│  ○ Q2 Features     │          │          │━━━━━━━━━━━━━━━━━━━│
│  0/15 tasks        │          │          │    0%               │
│                    │          │          │                     │
└─────────────────────────────────────────────────────────────────┘
```

## 5. Epic Management - List View

### Hierarchical List with Nested Epics
```
┌─────────────────────────────────────────────────────────────────┐
│  Epics                                                           │
│  15 total epics                    [Link Tasks] [+ New Epic]    │
│                                                                  │
│  [List View] [Roadmap] [Details]                                │
├──────────────────────────┬──────────────────────────────────────┤
│  All Epics               │  Epic Details                        │
│  [All Projects      ▼]   │                                      │
│                          │  Select an epic to view details      │
│  ┌────────────────────┐ │                                      │
│  │ 🚀 Q1 Launch       │ │                                      │
│  │ ✓ In Progress      │ │                                      │
│  │ ━━━━━━━━━━ 75%    │ │                                      │
│  │ 15 tasks, 11 done  │ │                                      │
│  │ Jan 1 → Mar 31     │ │                                      │
│  └────────────────────┘ │                                      │
│                          │                                      │
│    ┌──────────────────┐ │                                      │
│    │ 🚀 Backend API   │ │                                      │
│    │ ○ Planning       │ │                                      │
│    │ ━━━━━━━━━━ 60%  │ │                                      │
│    │ 8 tasks, 5 done  │ │                                      │
│    └──────────────────┘ │                                      │
│                          │                                      │
│    ┌──────────────────┐ │                                      │
│    │ 🚀 Mobile App    │ │                                      │
│    │ ○ Planning       │ │                                      │
│    │ ━━━━━━━━━━ 40%  │ │                                      │
│    │ 5 tasks, 2 done  │ │                                      │
│    └──────────────────┘ │                                      │
│                          │                                      │
│  ┌────────────────────┐ │                                      │
│  │ 🚀 Q2 Features     │ │                                      │
│  │ ○ Planning         │ │                                      │
│  │ ━━━━━━━━━━ 0%     │ │                                      │
│  │ 0 tasks            │ │                                      │
│  └────────────────────┘ │                                      │
└──────────────────────────┴──────────────────────────────────────┘
```

## Status Indicators

### Status Icons and Colors
```
○ Planning       (Blue)
✓ In Progress    (Green)
⏸ On Hold        (Yellow)
✓ Completed      (Dark Green)
📦 Archived      (Gray)
⛔ Blocked       (Red)
```

### Progress Bars
```
Empty:     ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 0%
Low:       ━━━━░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 25%
Medium:    ━━━━━━━━━━━━━━━━━━━━░░░░░░░░░░░░░░░░░░░░ 50%
High:      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━░░░░░░░░░░ 75%
Complete:  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 100%
```

## Navigation Flow

```
Sidebar → Epics
    ↓
Epic Management (List View)
    ↓
    ├─→ Click "New Epic" → Epic Form Dialog → Save → Refresh List
    ├─→ Click Epic Card → Epic Detail Panel
    │       ↓
    │       ├─→ Click "Edit" → Epic Form Dialog → Save → Refresh
    │       ├─→ Click "Link Tasks" → Task Linking Dialog → Save → Refresh
    │       └─→ Click "Delete" → Confirm → Delete → Refresh List
    ├─→ Switch to "Roadmap" Tab → Epic Roadmap View
    │       ↓
    │       └─→ Click Epic Bar → Switch to Details Tab
    └─→ Filter by Project → Refresh List
```

## Responsive Behavior

### Desktop (>1024px)
- Two-column layout (list + details)
- Full roadmap timeline visible
- All statistics cards shown

### Tablet (768px - 1024px)
- Stacked layout with tabs
- Condensed roadmap timeline
- Statistics in 2x2 grid

### Mobile (<768px)
- Single column layout
- Simplified roadmap (monthly only)
- Statistics in single column
- Collapsible sections

## Color Coding

### Epic Status Colors
- **Planning**: Blue (#2E5AAC)
- **In Progress**: Green (#27AE60)
- **On Hold**: Yellow (#F2C94C)
- **Completed**: Dark Green (#1E8449)
- **Archived**: Gray (#95A5A6)
- **Blocked**: Red (#EB5757)

### Progress Bar Colors
- 0-25%: Red gradient
- 26-50%: Orange gradient
- 51-75%: Yellow gradient
- 76-100%: Green gradient

### Badge Colors
- Overdue: Red background
- In Progress: Blue background
- Completed: Green background
- Child Count: Gray outline
