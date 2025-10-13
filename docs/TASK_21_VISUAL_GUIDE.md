# Task 21: Project Roadmap - Visual Guide

## Component Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Project Roadmap                                    [<] [Today] [>] [Export PDF] │
│ 42 items on timeline                                                     │
├─────────────────────────────────────────────────────────────────────────┤
│ [Monthly] [Quarterly] [Yearly]    [✓] Projects [✓] Epics [✓] Milestones │
│                                    [Filter: All Status ▼]                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│ Item                  Q4 2024    Q1 2025    Q2 2025    Q3 2025          │
│                       ─────────────────────────────────────────────────  │
│                                      │ Today                             │
│ [Project] Website    ████████████████                                   │
│ Redesign             ░░░░░░░░░░░░░░░░ 65%                               │
│ 13/20 tasks                                                              │
│                                                                           │
│ [Epic] User Auth     ████████████████████                               │
│ System               ░░░░░░░░░░░░░░░░░░░░ 80% [2 overdue] 🚩           │
│ 8/10 tasks                                                               │
│                                                                           │
│ [Project] Mobile     ████████████████████████████                       │
│ App Launch           ░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 45%                  │
│ 9/20 tasks                                                               │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

## Header Section

### Title and Navigation
```
┌─────────────────────────────────────────────────────────────┐
│ Project Roadmap                    [<] [Today] [>] [Export] │
│ 42 items on timeline                                         │
└─────────────────────────────────────────────────────────────┘
```

**Elements:**
- **Title**: "Project Roadmap" (text-2xl font-bold)
- **Item Count**: "42 items on timeline" (text-sm text-muted-foreground)
- **Previous Button**: Navigate backward in time
- **Today Button**: Jump to current date
- **Next Button**: Navigate forward in time
- **Export PDF Button**: Export roadmap (foundation)

### View Selector and Filters
```
┌─────────────────────────────────────────────────────────────┐
│ [Monthly] [Quarterly] [Yearly]                              │
│                                                              │
│ [✓] Projects  [✓] Epics  [✓] Milestones  [Filter: All ▼]  │
└─────────────────────────────────────────────────────────────┘
```

**View Buttons:**
- **Monthly**: Shows 6 months (1 before, 5 ahead)
- **Quarterly**: Shows 12 months (3 before, 9 ahead) - Default
- **Yearly**: Shows 3 years (1 before, 2 ahead)

**Toggle Checkboxes:**
- **Projects**: Show/hide project items
- **Epics**: Show/hide epic items
- **Milestones**: Show/hide milestone markers

**Status Filter:**
- All Status (default)
- Planning
- In Progress
- On Hold
- Completed
- Blocked

## Timeline Section

### Timeline Header
```
┌─────────────────────────────────────────────────────────────┐
│ Item          Q4 2024    Q1 2025    Q2 2025    Q3 2025     │
│               ─────────────────────────────────────────────  │
│                              │ Today                         │
└─────────────────────────────────────────────────────────────┘
```

**Elements:**
- **Item Column**: Fixed width (w-64), shows item info
- **Timeline Columns**: Flexible width, shows time periods
- **Today Marker**: Red vertical line at current date
- **Column Headers**: Formatted based on view mode
  - Monthly: "Jan 2025", "Feb 2025"
  - Quarterly: "Q1 2025", "Q2 2025"
  - Yearly: "2024", "2025"

### Timeline Item Row

#### Project Item
```
┌─────────────────────────────────────────────────────────────┐
│ [Project] ● Website Redesign                                │
│           13/20 tasks                                        │
│                                                              │
│           ████████████████                                  │
│           ░░░░░░░░░░░░░░░░ 65%                              │
└─────────────────────────────────────────────────────────────┘
```

**Left Column (w-64):**
- **Type Badge**: "Project" (default variant)
- **Status Icon**: Colored circle/icon
- **Item Name**: Truncated if too long
- **Task Count**: "13/20 tasks" (text-xs text-muted-foreground)

**Timeline Bar:**
- **Background Color**: Based on status
  - Planning: bg-blue-500
  - In Progress: bg-green-500
  - On Hold: bg-yellow-500
  - Completed: bg-green-600
  - Blocked: bg-red-500
- **Height**: h-10 (hover: h-12)
- **Progress Text**: "65%" (white text)
- **Progress Bar**: Bottom 1px height
- **Cursor**: cursor-move (draggable)

#### Epic Item
```
┌─────────────────────────────────────────────────────────────┐
│ [Epic] ● User Auth System                                   │
│        8/10 tasks                                            │
│                                                              │
│        ████████████████████                                 │
│        ░░░░░░░░░░░░░░░░░░░░ 80% [2 overdue] 🚩            │
└─────────────────────────────────────────────────────────────┘
```

**Left Column (w-64):**
- **Type Badge**: "Epic" (secondary variant)
- **Status Icon**: Colored circle/icon
- **Item Name**: Truncated if too long
- **Task Count**: "8/10 tasks" (text-xs text-muted-foreground)

**Timeline Bar:**
- **Background Color**: Based on status (same as projects)
- **Progress Text**: "80%" (white text)
- **Overdue Badge**: Red badge if overdue tasks exist
- **Milestone Flag**: 🚩 icon if showMilestones enabled
- **Progress Bar**: Bottom 1px height

## Status Colors

### Project Statuses
```
● Active       - bg-green-500   (Green)
● Planning     - bg-blue-500    (Blue)
● In Progress  - bg-green-500   (Green)
● On Hold      - bg-yellow-500  (Yellow)
● Completed    - bg-green-600   (Dark Green)
● Archived     - bg-gray-500    (Gray)
● Blocked      - bg-red-500     (Red)
```

### Epic Statuses
```
● Planning     - bg-blue-500    (Blue)
● In Progress  - bg-green-500   (Green)
● On Hold      - bg-yellow-500  (Yellow)
● Completed    - bg-green-600   (Dark Green)
● Archived     - bg-gray-500    (Gray)
● Blocked      - bg-red-500     (Red)
```

## Interactive States

### Hover State
```
Timeline Bar:
- Height increases: h-10 → h-12
- Transition: transition-all
- Cursor: cursor-move
```

### Drag State
```
Timeline Bar:
- Opacity: opacity-50
- Scale: scale-105
- Visual feedback during drag
```

### Click State
```
Timeline Bar:
- Opens detail panel (onProjectClick or onEpicClick)
- Shows full item details
```

## Empty States

### No Items with Dates
```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│                          🚀                                  │
│                                                              │
│              No items with dates found                       │
│                                                              │
│   Add start and end dates to projects and epics             │
│            to see them on the roadmap                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Loading State
```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│                  Loading roadmap...                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Responsive Behavior

### Desktop (>1024px)
- Full layout with all columns visible
- Timeline bars have full width
- All filters and controls visible

### Tablet (768px - 1024px)
- Slightly compressed timeline
- All features still accessible
- Horizontal scroll if needed

### Mobile (<768px)
- Horizontal scroll required
- Item column remains fixed
- Timeline scrolls horizontally
- Touch-friendly drag and drop

## Keyboard Shortcuts (Future)

```
Arrow Left/Right  - Navigate timeline
Home             - Jump to today
+/-              - Zoom in/out
Space            - Toggle play/pause
Esc              - Close detail panel
```

## Accessibility Features

### ARIA Labels
```html
<div role="region" aria-label="Project Roadmap Timeline">
  <div role="row" aria-label="Website Redesign Project">
    <div role="cell" aria-label="Project details">...</div>
    <div role="cell" aria-label="Timeline bar">...</div>
  </div>
</div>
```

### Screen Reader Announcements
- "Project Roadmap loaded with 42 items"
- "Viewing quarterly timeline from Q4 2024 to Q3 2025"
- "Website Redesign project, 65% complete, 13 of 20 tasks done"
- "Dragging Website Redesign project"
- "Project dates updated successfully"

### Keyboard Navigation
- Tab through interactive elements
- Enter to activate buttons
- Space to toggle checkboxes
- Arrow keys for timeline navigation (future)

## Color Contrast

All colors meet WCAG AA standards:
- Status colors have sufficient contrast with white text
- Badge colors have sufficient contrast
- Today marker is highly visible (red)
- Hover states are clearly distinguishable

## Animation Timing

```css
/* Primary transitions */
transition: all 300ms ease-in-out;

/* Hover effects */
transition: height 200ms ease-in-out;

/* Drag feedback */
transition: opacity 100ms ease-in-out;
```

## Z-Index Layers

```
1. Base timeline (z-0)
2. Timeline bars (z-1)
3. Today marker (z-10)
4. Hover effects (z-20)
5. Drag overlay (z-30)
6. Tooltips (z-40)
7. Modals (z-50)
```

## Performance Indicators

### Good Performance
- Timeline renders in <200ms
- Drag operations feel smooth (60fps)
- Filter changes are instant
- No layout shifts during load

### Optimization Techniques
- Memoized calculations
- Efficient re-renders
- No unnecessary API calls
- Optimistic UI updates
