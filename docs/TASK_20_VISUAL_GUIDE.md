# Task 20: Sprint Planning - Visual Guide

## 🎨 Component Overview

### Main Sprint Management Interface

```
┌─────────────────────────────────────────────────────────────────┐
│  Sprint Planning                              [+ New Sprint]     │
│  Manage sprints and track progress                              │
├─────────────────────────────────────────────────────────────────┤
│  ● Active Sprint: Sprint 1                                      │
│    Jan 15, 2025 - Jan 29, 2025              [Edit] [Complete]   │
├─────────────────────────────────────────────────────────────────┤
│  Planning Sprints                                                │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Sprint 2                                                   │  │
│  │ Feb 1, 2025 - Feb 15, 2025        [Edit] [Start] [Delete] │  │
│  └───────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│  [Backlog] [Sprint Board] [Burn-down] [Reports]                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [View Content Area]                                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 📋 1. Sprint Backlog View

### Layout
```
┌──────────────────────────────┬───┬──────────────────────────────┐
│  Product Backlog             │ → │  Sprint 1                    │
│  12 tasks                    │   │  8 tasks                     │
├──────────────────────────────┤   ├──────────────────────────────┤
│ ┌──────────────────────────┐ │   │ ┌──────────────────────────┐ │
│ │ [P1] Implement login     │ │   │ │ [P1] Setup database      │ │
│ │ 🕐 8h                    │ │   │ │ 🕐 5h  ✓                 │ │
│ └──────────────────────────┘ │   │ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │   │ ┌──────────────────────────┐ │
│ │ [P2] Add user profile    │ │   │ │ [P2] Create API routes   │ │
│ │ 🕐 5h                    │ │   │ │ 🕐 8h                    │ │
│ └──────────────────────────┘ │   │ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │   │ ┌──────────────────────────┐ │
│ │ [P3] Write tests         │ │   │ │ [P3] Add validation      │ │
│ │ 🕐 3h                    │ │   │ │ 🕐 3h                    │ │
│ └──────────────────────────┘ │   │ └──────────────────────────┘ │
│                              │   │                              │
│  Drag tasks here             │   │  Drag tasks here             │
└──────────────────────────────┴───┴──────────────────────────────┘
```

### Features
- **Left Column**: Product Backlog (unassigned tasks)
- **Right Column**: Active Sprint tasks
- **Drag-and-Drop**: Move tasks between columns
- **Task Cards**: Show priority, title, and estimate
- **Visual Feedback**: Highlight drop zones during drag

## 🎯 2. Sprint Board (Kanban)

### Layout
```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│  To Do       │ In Progress  │  Review      │  Done        │
│  ○ 3         │  🕐 2        │  → 1         │  ✓ 2        │
├──────────────┼──────────────┼──────────────┼──────────────┤
│ ┌──────────┐ │ ┌──────────┐ │ ┌──────────┐ │ ┌──────────┐ │
│ │[P1] Task │ │ │[P1] Task │ │ │[P2] Task │ │ │[P1] Task │ │
│ │Setup DB  │ │ │Create API│ │ │Add tests │ │ │Login UI  │ │
│ │🕐 5h     │ │ │🕐 8h     │ │ │🕐 3h     │ │ │🕐 5h ✓   │ │
│ └──────────┘ │ └──────────┘ │ └──────────┘ │ └──────────┘ │
│ ┌──────────┐ │ ┌──────────┐ │              │ ┌──────────┐ │
│ │[P2] Task │ │ │[P3] Task │ │              │ │[P2] Task │ │
│ │Profile   │ │ │Validate  │ │              │ │Auth API  │ │
│ │🕐 5h     │ │ │🕐 3h     │ │              │ │🕐 8h ✓   │ │
│ └──────────┘ │ └──────────┘ │              │ └──────────┘ │
│ ┌──────────┐ │              │              │              │
│ │[P3] Task │ │              │              │              │
│ │Document  │ │              │              │              │
│ │🕐 2h     │ │              │              │              │
│ └──────────┘ │              │              │              │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

### Features
- **Four Columns**: To Do → In Progress → Review → Done
- **Task Movement**: Drag tasks between columns
- **Auto Status Update**: Task status changes based on column
- **Priority Borders**: Color-coded left border (red/orange/blue/gray)
- **Task Details**: Click to view full details

## 📊 3. Burn-down Chart

### Statistics Cards
```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Total Points │  Completed   │  Remaining   │  Velocity    │
│     45       │     28       │     17       │    2.8 ↑     │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

### Progress Bar
```
┌─────────────────────────────────────────────────────────────┐
│ Sprint Progress                                      62.2%   │
│ ████████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│ 10 days elapsed                        4 days remaining     │
└─────────────────────────────────────────────────────────────┘
```

### Status Indicator
```
┌─────────────────────────────────────────────────────────────┐
│ ↑ Ahead of Schedule                                         │
│ You're 3.5 points ahead of the ideal burn rate.            │
└─────────────────────────────────────────────────────────────┘
```

### Chart
```
┌─────────────────────────────────────────────────────────────┐
│ 🎯 Burn-down Chart                                          │
├─────────────────────────────────────────────────────────────┤
│ 45│                                                          │
│   │ ●                                                        │
│ 40│   ●                                                      │
│   │     ●                                                    │
│ 35│       ●                                                  │
│   │         ●                                                │
│ 30│           ●                                              │
│   │             ●                                            │
│ 25│               ●                                          │
│   │                 ●                                        │
│ 20│                   ●                                      │
│   │                     ●                                    │
│ 15│                       ●                                  │
│   │                         ●                                │
│ 10│                           ●                              │
│   │                             ●                            │
│  5│                               ●                          │
│   │                                 ●                        │
│  0│─────────────────────────────────●                       │
│   1/15  1/17  1/19  1/21  1/23  1/25  1/27  1/29           │
│                                                              │
│   ─ ─ ─ Ideal    ━━━━━ Actual                             │
└─────────────────────────────────────────────────────────────┘
```

### Task Breakdown
```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Total Tasks  │  Completed   │ In Progress  │   To Do      │
│      8       │      5       │      2       │      1       │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

## 📈 4. Sprint Reports

### Sprint Selector
```
┌─────────────────────────────────────────────────────────────┐
│ Select Sprint                                               │
│ [Sprint 1 (Jan 15 - Jan 29) ▼]          [Export Report]   │
└─────────────────────────────────────────────────────────────┘
```

### Sprint Overview
```
┌─────────────────────────────────────────────────────────────┐
│ Sprint 1                                                     │
├─────────────────────────────────────────────────────────────┤
│ 📅 Duration                    🎯 Status                    │
│ Jan 15 - Jan 29, 2025          ✓ Completed                 │
│ 14 days                                                      │
│                                                              │
│ Sprint Goals                                                 │
│ • Implement core authentication                             │
│ • Set up database infrastructure                            │
│ • Create basic API endpoints                                │
└─────────────────────────────────────────────────────────────┘
```

### Key Metrics
```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Completion   │ Story Points │  Velocity    │  Efficiency  │
│   Rate       │              │              │              │
│              │              │              │              │
│   87.5%      │     35       │    2.5 ↑     │     78%      │
│              │              │              │              │
│ 7 of 8 tasks │  of 45 pts   │ points/day   │ pts complete │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

### Task Breakdown
```
┌─────────────────────────────────────────────────────────────┐
│ Task Breakdown                                               │
├─────────────────────────────────────────────────────────────┤
│ Completed                                            7 (88%) │
│ ████████████████████████████████████████████░░░░░░░░░░░░░░  │
│                                                              │
│ In Progress                                          1 (12%) │
│ ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│                                                              │
│ To Do                                                0 (0%)  │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
└─────────────────────────────────────────────────────────────┘
```

### Sprint Insights
```
┌─────────────────────────────────────────────────────────────┐
│ Sprint Insights                                              │
├─────────────────────────────────────────────────────────────┤
│ • The team completed 88% of planned work                    │
│ • Average velocity was 2.5 points per day                   │
│ • 7 out of 8 tasks were completed                           │
│ ✓ Excellent sprint! The team met or exceeded goals         │
└─────────────────────────────────────────────────────────────┘
```

## 🎨 Color Scheme

### Priority Colors
- **P1 (High)**: Red border (`border-l-red-500`)
- **P2 (Medium)**: Orange border (`border-l-orange-500`)
- **P3 (Low)**: Blue border (`border-l-blue-500`)
- **P4 (None)**: Gray border (`border-l-gray-400`)

### Status Colors
- **Planning**: Gray background
- **Active**: Blue background with pulse animation
- **Completed**: Green background
- **Cancelled**: Red background

### Column Colors
- **To Do**: Gray (`bg-gray-100`)
- **In Progress**: Blue (`bg-blue-50`)
- **Review**: Yellow (`bg-yellow-50`)
- **Done**: Green (`bg-green-50`)

## 🔄 User Interactions

### Creating a Sprint
```
1. Click [+ New Sprint]
   ↓
2. Fill form:
   - Sprint Name: "Sprint 1"
   - Start Date: Jan 15, 2025
   - End Date: Jan 29, 2025
   - Goals: "Implement auth..."
   ↓
3. Click [Create Sprint]
   ↓
4. Sprint appears in Planning list
```

### Planning a Sprint
```
1. Navigate to Backlog view
   ↓
2. Drag task from Product Backlog
   ↓
3. Drop in Sprint column
   ↓
4. Task added to sprint
   ↓
5. Click [Start Sprint]
   ↓
6. Sprint becomes active
```

### Working on Sprint
```
1. Navigate to Sprint Board
   ↓
2. Drag task from To Do
   ↓
3. Drop in In Progress
   ↓
4. Task status updates
   ↓
5. Complete work
   ↓
6. Drag to Done column
   ↓
7. Task marked complete
```

### Viewing Progress
```
1. Navigate to Burn-down tab
   ↓
2. View chart and metrics
   ↓
3. Check if ahead/behind schedule
   ↓
4. Adjust work if needed
```

### Completing Sprint
```
1. Click [Complete Sprint]
   ↓
2. Sprint status → Completed
   ↓
3. Navigate to Reports tab
   ↓
4. View sprint report
   ↓
5. Export if needed
```

## 📱 Responsive Design

### Desktop (1920px+)
- Full 4-column board layout
- Side-by-side backlog columns
- Large charts and metrics

### Tablet (768px - 1919px)
- 2-column board layout
- Stacked backlog columns
- Responsive charts

### Mobile (< 768px)
- Single column board
- Vertical backlog layout
- Compact metrics cards

## ♿ Accessibility

- **Keyboard Navigation**: Tab through all interactive elements
- **Screen Readers**: Proper ARIA labels
- **Color Contrast**: WCAG AA compliant
- **Focus Indicators**: Clear focus states
- **Alt Text**: Descriptive labels for icons

## 🎭 Animations

- **Drag Feedback**: Opacity change during drag
- **Drop Zones**: Highlight on drag over
- **Status Changes**: Smooth transitions
- **Chart Updates**: Animated line drawing
- **Progress Bars**: Smooth width transitions
- **Active Sprint**: Pulse animation on status dot

## 💡 Tips for Users

1. **Estimate Tasks**: Add estimated hours for accurate burn-down
2. **Update Status**: Move tasks regularly for accurate tracking
3. **Monitor Velocity**: Use for future sprint planning
4. **Review Reports**: Learn from completed sprints
5. **Set Clear Goals**: Define sprint objectives upfront
6. **Don't Overcommit**: Use velocity as a guide
