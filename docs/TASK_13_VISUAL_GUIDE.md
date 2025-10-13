# Task 13: Recurring Tasks - Visual Guide

## UI Components Overview

This guide shows how the recurring tasks UI components look and work together.

## 1. RecurringTaskInfo Component

### When No Recurrence is Set

```
┌─────────────────────────────────────────┐
│  ┌────────────────────────────────────┐ │
│  │  🔄  Make recurring                │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Behavior:**
- Shows a button to make the task recurring
- Clicking opens the RecurringTaskDialog

### When Recurrence is Active

```
┌─────────────────────────────────────────┐
│  ┌────────────────────────────────────┐ │
│  │  🔄  Every week on Mon, Wed, Fri   │ │
│  │  📅  Next: Jan 17, 2024            │ │
│  │  5 of 10 occurrences               │ │
│  │                          🔄  ✕     │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Behavior:**
- Shows recurrence pattern description
- Displays next occurrence date
- Shows occurrence count (if max is set)
- Edit button (🔄) opens dialog
- Remove button (✕) removes recurrence

## 2. RecurringTaskDialog Component

### Dialog Structure

```
┌─────────────────────────────────────────────────┐
│  Set Recurrence                            ✕    │
├─────────────────────────────────────────────────┤
│                                                  │
│  Repeat                                          │
│  ┌──────────────────────────────────────────┐  │
│  │  Daily                              ▼    │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
│  Every                                           │
│  ┌────┐                                          │
│  │  1 │  day(s)                                 │
│  └────┘                                          │
│                                                  │
│  Ends                                            │
│  ○ Never                                         │
│  ○ On  ┌──────────────┐                         │
│        │  2024-12-31  │                         │
│        └──────────────┘                         │
│  ○ After ┌────┐ occurrences                     │
│          │ 10 │                                  │
│          └────┘                                  │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │  Repeats: Daily                            │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
├─────────────────────────────────────────────────┤
│                          Cancel      Save       │
└─────────────────────────────────────────────────┘
```

### Daily Pattern

```
Repeat: Daily
Every: [1] day(s)
```

### Weekly Pattern

```
Repeat: Weekly
Every: [1] week(s)

On:
┌───┬───┬───┬───┬───┬───┬───┐
│Sun│Mon│Tue│Wed│Thu│Fri│Sat│
└───┴───┴───┴───┴───┴───┴───┘
     ■       ■       ■
```

**Behavior:**
- Click days to toggle selection
- Selected days are highlighted
- Must select at least one day

### Monthly Pattern

```
Repeat: Monthly
Every: [1] month(s)

On day: [15]
```

### Yearly Pattern

```
Repeat: Yearly
Every: [1] year(s)

Month: [December ▼]
Day: [25]
```

## 3. Integration in DetailPanel

### Recommended Layout

```
┌─────────────────────────────────────────────────┐
│  Task Details                                    │
├─────────────────────────────────────────────────┤
│                                                  │
│  Title: Weekly Team Meeting                     │
│  Description: Discuss project progress...        │
│                                                  │
│  ─────────────────────────────────────────────  │
│                                                  │
│  Due Date: Jan 15, 2024                         │
│  Priority: High                                  │
│  Project: Marketing                              │
│                                                  │
│  ─────────────────────────────────────────────  │
│                                                  │
│  Recurrence                                      │
│  ┌────────────────────────────────────────────┐ │
│  │  🔄  Every week on Monday                  │ │
│  │  📅  Next: Jan 22, 2024                    │ │
│  │                          🔄  ✕             │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  ─────────────────────────────────────────────  │
│                                                  │
│  [Other task details...]                         │
│                                                  │
└─────────────────────────────────────────────────┘
```

## 4. User Flow

### Creating a Recurring Task

```
1. User opens task details
   │
   ▼
2. Clicks "Make recurring"
   │
   ▼
3. Dialog opens
   │
   ▼
4. User selects pattern (e.g., Weekly)
   │
   ▼
5. User selects days (Mon, Wed, Fri)
   │
   ▼
6. User sets end condition (optional)
   │
   ▼
7. User clicks "Save"
   │
   ▼
8. Dialog closes
   │
   ▼
9. Recurrence info displays
```

### Editing Recurrence

```
1. User sees recurrence info
   │
   ▼
2. Clicks edit button (🔄)
   │
   ▼
3. Dialog opens with current pattern
   │
   ▼
4. User modifies pattern
   │
   ▼
5. User clicks "Save"
   │
   ▼
6. Updated info displays
```

### Removing Recurrence

```
1. User sees recurrence info
   │
   ▼
2. Clicks remove button (✕)
   │
   ▼
3. Recurrence is removed
   │
   ▼
4. "Make recurring" button shows
```

## 5. Color Scheme

The components use the project's color scheme:

- **Primary Blue**: `#2E5AAC` (oklch(0.45 0.15 250))
- **Accent Orange**: `#F2994A` (oklch(0.72 0.15 60))
- **Background**: White / Dark gray
- **Text**: Gray-900 / White
- **Borders**: Gray-200 / Gray-700

### Light Mode

```
┌─────────────────────────────────────────┐
│  🔄  Every week on Mon, Wed, Fri   │ ← Blue background
│  📅  Next: Jan 17, 2024            │ ← Blue text
│  5 of 10 occurrences               │
│                          🔄  ✕     │
└─────────────────────────────────────────┘
```

### Dark Mode

```
┌─────────────────────────────────────────┐
│  🔄  Every week on Mon, Wed, Fri   │ ← Dark blue background
│  📅  Next: Jan 17, 2024            │ ← Light blue text
│  5 of 10 occurrences               │
│                          🔄  ✕     │
└─────────────────────────────────────────┘
```

## 6. Responsive Design

### Desktop (> 768px)

```
┌─────────────────────────────────────────────────┐
│  Set Recurrence                            ✕    │
├─────────────────────────────────────────────────┤
│  [Full width dialog with all controls]          │
└─────────────────────────────────────────────────┘
```

### Mobile (< 768px)

```
┌───────────────────────┐
│  Set Recurrence    ✕  │
├───────────────────────┤
│  [Stacked controls]   │
│  [Scrollable]         │
└───────────────────────┘
```

## 7. States

### Loading State

```
┌─────────────────────────────────────────┐
│  🔄  Loading...                         │
└─────────────────────────────────────────┘
```

### Error State

```
┌─────────────────────────────────────────┐
│  ⚠️  Failed to load recurrence          │
│  [Retry button]                         │
└─────────────────────────────────────────┘
```

### Empty State (No Recurrence)

```
┌─────────────────────────────────────────┐
│  🔄  Make recurring                     │
└─────────────────────────────────────────┘
```

## 8. Validation Messages

### In Dialog

```
┌─────────────────────────────────────────┐
│  ⚠️  Please select at least one day     │
└─────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────┐
│  ⚠️  Interval must be at least 1        │
└─────────────────────────────────────────┘
```

## 9. Accessibility

### Keyboard Navigation

- **Tab**: Move between controls
- **Enter**: Activate buttons
- **Space**: Toggle checkboxes/radio buttons
- **Escape**: Close dialog

### Screen Reader Support

- All buttons have aria-labels
- Form inputs have associated labels
- Error messages are announced
- Dialog has proper role and aria attributes

## 10. Animation

### Dialog Open/Close

```
Fade in + Scale up (300ms)
Fade out + Scale down (200ms)
```

### Button Hover

```
Background color transition (150ms)
```

### Day Selection

```
Background color transition (150ms)
Scale slightly on click (100ms)
```

## 11. Example Code for Integration

```typescript
import { RecurringTaskInfo } from '@/components/RecurringTaskInfo';

// In your DetailPanel component
<div className="space-y-4">
  {/* Other task details */}
  
  <div className="border-t pt-4">
    <h3 className="text-sm font-medium mb-2">
      Recurrence
    </h3>
    <RecurringTaskInfo
      taskId={task.$id}
      userId={userId}
      onUpdate={() => {
        // Refresh task data
        loadTask();
      }}
    />
  </div>
</div>
```

## 12. Tips for Customization

### Change Colors

Edit the Tailwind classes in the components:
- `bg-blue-50` → Your background color
- `text-blue-900` → Your text color
- `border-blue-200` → Your border color

### Change Icons

Replace Lucide icons with your preferred icon library:
```typescript
import { Repeat, Calendar, X } from 'lucide-react';
// Replace with your icons
```

### Change Layout

Modify the component structure to match your design:
- Adjust spacing with Tailwind classes
- Change flex/grid layouts
- Modify border radius, shadows, etc.

## 13. Common Patterns

### Pattern: Daily Standup

```
Frequency: Daily
Interval: 1
End: Never
```

### Pattern: Weekly Team Meeting

```
Frequency: Weekly
Interval: 1
Days: Monday
End: Never
```

### Pattern: Bi-weekly Sprint Planning

```
Frequency: Weekly
Interval: 2
Days: Monday
End: Never
```

### Pattern: Monthly Report

```
Frequency: Monthly
Interval: 1
Day: 1 (first of month)
End: Never
```

### Pattern: Quarterly Review

```
Frequency: Monthly
Interval: 3
Day: 15
End: After 4 occurrences
```

### Pattern: Annual Performance Review

```
Frequency: Yearly
Interval: 1
Month: December
Day: 15
End: Never
```

## 14. Visual Hierarchy

```
Primary: Recurrence pattern description
Secondary: Next occurrence date
Tertiary: Occurrence count
Actions: Edit and remove buttons
```

## 15. Best Practices

1. **Keep it Simple**: Start with common patterns
2. **Provide Preview**: Show what the pattern means
3. **Validate Input**: Check before saving
4. **Clear Feedback**: Show success/error messages
5. **Consistent Style**: Match project design system
6. **Accessible**: Support keyboard and screen readers
7. **Responsive**: Work on all screen sizes
8. **Performance**: Load data efficiently

---

This visual guide should help you understand how the recurring tasks UI components work and how to integrate them into your application. For more details, see the integration guide and implementation summary.
