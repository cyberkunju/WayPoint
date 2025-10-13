# Task 18: Project Labels UI - Visual Guide

## Overview
This guide provides a visual walkthrough of the Project Labels feature implementation.

## 1. Label Management (Settings)

### Empty State
```
┌─────────────────────────────────────────────────────────────┐
│ 🏷️ Project Labels                    [Create Defaults] [New] │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│                         🏷️                                    │
│                                                               │
│                   No labels yet                               │
│                                                               │
│     Create labels to organize your projects by                │
│          category, client, or priority                        │
│                                                               │
│         [Create Default Labels]  [Create Custom Label]        │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Label Grid View
```
┌─────────────────────────────────────────────────────────────┐
│ 🏷️ Project Labels                    [Create Defaults] [New] │
├─────────────────────────────────────────────────────────────┤
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐         │
│ │ 🔵 Client  ✏️🗑️│ │ 🟢 Internal✏️🗑️│ │ 🟣 Research✏️🗑️│         │
│ │              │ │              │ │              │         │
│ │ 🏷️ Client    │ │ 🏷️ Internal  │ │ 🏷️ Research  │         │
│ └──────────────┘ └──────────────┘ └──────────────┘         │
│                                                               │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐         │
│ │ 🟠 Dev     ✏️🗑️│ │ 🔴 Marketing✏️🗑️│ │ 🟡 Design ✏️🗑️│         │
│ │              │ │              │ │              │         │
│ │ 🏷️ Dev       │ │ 🏷️ Marketing │ │ 🏷️ Design    │         │
│ └──────────────┘ └──────────────┘ └──────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

## 2. Label Dialog (Create/Edit)

### Create Label Dialog
```
┌─────────────────────────────────────────────────────────────┐
│ 🏷️ Create New Label                                      ✕   │
├─────────────────────────────────────────────────────────────┤
│ Create a new label to organize your projects                 │
│                                                               │
│ Label Name *                                                  │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Client Project                                          │ │
│ └─────────────────────────────────────────────────────────┘ │
│ 14/50 characters                                              │
│                                                               │
│ Label Color                                                   │
│ ┌───┬───┬───┬───┬───┬───┐                                   │
│ │🔵│🟢│🟣│🟠│🔴│🟡│  ← Preset colors                        │
│ ├───┼───┼───┼───┼───┼───┤                                   │
│ │💙│💚│💜│🧡│❤️│💛│                                          │
│ └───┴───┴───┴───┴───┴───┘                                   │
│                                                               │
│ Custom: [🎨] [#2E5AAC]                                        │
│                                                               │
│ Preview                                                       │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🔵 Client Project                                       │ │
│ │                                                         │ │
│ │ 🏷️ Client Project                                       │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│                                    [Cancel] [Create Label]    │
└─────────────────────────────────────────────────────────────┘
```

## 3. Label Selector (Project Form)

### Label Selector Closed
```
┌─────────────────────────────────────────────────────────────┐
│ 🏷️ Labels                                                     │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🏷️ Client    🏷️ Internal    🏷️ Urgent              ✕✕✕ │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│ [➕ Add labels]                                               │
└─────────────────────────────────────────────────────────────┘
```

### Label Selector Open
```
┌─────────────────────────────────────────────────────────────┐
│ 🏷️ Labels                                                     │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🏷️ Client ✕  🏷️ Internal ✕  🏷️ Urgent ✕               │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│ [➕ 3 labels selected ▼]                                      │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🔍 Search labels...                                     │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ 🔵 Client                                            ✓  │ │
│ │ 🟢 Internal                                          ✓  │ │
│ │ 🟣 Research                                             │ │
│ │ 🟠 Development                                          │ │
│ │ 🔴 Marketing                                            │ │
│ │ 🟡 Design                                               │ │
│ │ 🔴 Urgent                                            ✓  │ │
│ │ ⚪ Low Priority                                         │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ 3 of 8 labels selected                                  │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 4. Project Form with Labels

### Create Project Dialog
```
┌─────────────────────────────────────────────────────────────┐
│ 📁 Create New Project                                     ✕  │
├─────────────────────────────────────────────────────────────┤
│ Create a new project to organize your tasks                  │
│                                                               │
│ Project Name *                                                │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Website Redesign                                        │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│ Description                                                   │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Complete redesign of company website with modern UI     │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│ Status                                                        │
│ [Active ▼]                                                    │
│                                                               │
│ Project Color                                                 │
│ [🔵][🟢][🟣][🟠][🔴][🟡][💙][💚] [🎨]                        │
│                                                               │
│ 📅 Start Date        📅 End Date                              │
│ [2024-01-15]        [2024-03-31]                              │
│                                                               │
│ 🏷️ Labels                                                     │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🏷️ Client ✕  🏷️ Design ✕                               │ │
│ └─────────────────────────────────────────────────────────┘ │
│ [➕ Add labels]                                               │
│                                                               │
│                                    [Cancel] [Create Project]  │
└─────────────────────────────────────────────────────────────┘
```

## 5. Label Filter (Project List)

### Filter Button (No Filters)
```
[🔽 Filter by Label]
```

### Filter Button (Active Filters)
```
[🔽 Filter by Label  2]  ← Badge shows count
```

### Filter Popover Open
```
┌─────────────────────────────────────────────────────────────┐
│ 🔽 Filter by Labels                              [✕ Clear]   │
├─────────────────────────────────────────────────────────────┤
│ 🔍 Search labels...                                          │
├─────────────────────────────────────────────────────────────┤
│ Active Filters (2)                                            │
│ 🏷️ Client ✕  🏷️ Urgent ✕                                    │
├─────────────────────────────────────────────────────────────┤
│ 🔵 Client                                                 ✓  │
│ 🟢 Internal                                                  │
│ 🟣 Research                                                  │
│ 🟠 Development                                               │
│ 🔴 Marketing                                                 │
│ 🟡 Design                                                    │
│ 🔴 Urgent                                                 ✓  │
│ ⚪ Low Priority                                              │
├─────────────────────────────────────────────────────────────┤
│ 2 of 8 selected                              [Clear all]     │
└─────────────────────────────────────────────────────────────┘
```

## 6. Project List with Labels

### Project Cards with Labels
```
┌─────────────────────────────────────────────────────────────┐
│ Projects                                          [➕ New]    │
│ 8 total projects                                              │
├─────────────────────────────────────────────────────────────┤
│ [🔽 Filter by Label  2]                                       │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🔵 Website Redesign                          [Active]   │ │
│ │ Complete redesign of company website...                │ │
│ │ 🏷️ Client  🏷️ Design  🏷️ Urgent                        │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🟢 Mobile App                                [Active]   │ │
│ │ New mobile application for iOS and Android              │ │
│ │ 🏷️ Internal  🏷️ Development                            │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🟣 Market Research                           [Planning] │ │
│ │ Research competitor products and features               │ │
│ │ 🏷️ Research  🏷️ Marketing  +2 more                     │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 7. Project Details with Labels

### Project Details Panel
```
┌─────────────────────────────────────────────────────────────┐
│ 🔵 Website Redesign                                           │
│ Created January 15, 2024                                      │
│                                                               │
│                          [✏️ Edit] [🔄 Status] [🗑️ Delete]    │
├─────────────────────────────────────────────────────────────┤
│ Current Status                                                │
│ [Active]                                                      │
│                                                               │
│ Description                                                   │
│ Complete redesign of company website with modern UI          │
│                                                               │
│ Start Date              End Date                              │
│ January 15, 2024        March 31, 2024                        │
│                                                               │
│ Labels                                                        │
│ 🏷️ Client  🏷️ Design  🏷️ Urgent                             │
└─────────────────────────────────────────────────────────────┘
```

## 8. Label Badge Variations

### Small Badge
```
🏷️ Client
```

### Medium Badge (Default)
```
🏷️ Client Project
```

### Large Badge
```
🏷️ Client Project Name
```

### Badge with Remove Button
```
🏷️ Client ✕
```

### Badge List with Max Display
```
🏷️ Client  🏷️ Internal  🏷️ Design  +3 more
```

## Color Palette

### Preset Colors
1. **Deep Blue** (#2E5AAC) - 🔵 Primary, Professional
2. **Green** (#27AE60) - 🟢 Success, Internal
3. **Purple** (#9B51E0) - 🟣 Creative, Research
4. **Orange** (#F2994A) - 🟠 Development, Technical
5. **Red** (#EB5757) - 🔴 Marketing, Important
6. **Yellow** (#F2C94C) - 🟡 Design, Creative
7. **Light Blue** (#56CCF2) - 💙 Information
8. **Light Green** (#6FCF97) - 💚 Growth
9. **Light Purple** (#BB6BD9) - 💜 Innovation
10. **Warm Orange** (#F2994A) - 🧡 Energy
11. **Bright Red** (#E74C3C) - ❤️ Urgent, Critical
12. **Gray** (#95A5A6) - ⚪ Low Priority, Neutral

## Interaction States

### Hover States
```
Normal:   🏷️ Client
Hover:    🏷️ Client  ← Slightly larger, shadow
```

### Focus States
```
Normal:   🏷️ Client
Focus:    🏷️ Client  ← Ring indicator
```

### Selected States
```
Unselected: 🔵 Client
Selected:   🔵 Client ✓  ← Checkmark, highlighted
```

## Responsive Behavior

### Desktop (Wide)
- Grid layout: 3 columns
- Full label names visible
- All controls accessible

### Tablet (Medium)
- Grid layout: 2 columns
- Truncated long names
- Scrollable lists

### Mobile (Narrow)
- Grid layout: 1 column
- Compact badges
- Touch-friendly targets

## Animation & Transitions

### Popover Open/Close
- Fade in/out: 200ms
- Scale from trigger: ease-out
- Backdrop blur

### Badge Hover
- Scale: 1.05
- Duration: 100ms
- Ease: ease-in-out

### Filter Apply
- List fade: 300ms
- Stagger items: 50ms each
- Smooth scroll

## Accessibility Features

### Keyboard Navigation
- Tab: Move between elements
- Enter/Space: Select/toggle
- Escape: Close popovers
- Arrow keys: Navigate lists

### Screen Reader
- ARIA labels on all buttons
- Role attributes on interactive elements
- Live regions for dynamic content
- Descriptive alt text

### Color Contrast
- All text meets WCAG AA standards
- Focus indicators visible
- Color not sole indicator
- High contrast mode support

## Empty States

### No Labels Created
```
        🏷️
   No labels yet
   
Create labels to organize
your projects by category
```

### No Labels Found (Search)
```
        🏷️
   No labels found
   
Try a different search term
```

### No Projects with Label
```
        📁
No projects with this label

Create a project and add
this label to see it here
```

## Success States

### Label Created
```
✓ Label created successfully
```

### Label Updated
```
✓ Label updated successfully
```

### Label Deleted
```
✓ Label deleted successfully
```

### Labels Applied
```
✓ Project labels updated
```

## Error States

### Duplicate Name
```
⚠️ A label with this name already exists
```

### Network Error
```
⚠️ Failed to load labels. Please try again.
```

### Validation Error
```
⚠️ Label name is required
⚠️ Label name must be 50 characters or less
```

## Loading States

### Loading Labels
```
Loading labels...
```

### Saving Label
```
Saving...
```

### Applying Filters
```
Filtering projects...
```

This visual guide provides a comprehensive overview of all UI states and interactions for the Project Labels feature.
