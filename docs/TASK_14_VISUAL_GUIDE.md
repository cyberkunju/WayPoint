# Task 14: Custom Fields - Visual Guide

## Feature Overview

Custom Fields allow users to add flexible, type-safe metadata to their tasks. This guide shows how the feature looks and works in the UI.

## UI Components

### 1. Custom Fields Section in Detail Panel

Located at the bottom of the task detail panel, below the Task Dependencies section.

```
┌─────────────────────────────────────────────────────┐
│ Task Detail Panel                                   │
├─────────────────────────────────────────────────────┤
│                                                     │
│ [Details] [Comments] [Activity]                    │
│                                                     │
│ Description                                         │
│ ┌─────────────────────────────────────────────┐   │
│ │ Add a description...                        │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ Labels                                              │
│ [Bug] [Feature] [High Priority]                    │
│                                                     │
│ ─────────────────────────────────────────────────  │
│                                                     │
│ Task Dependencies                                   │
│ [Dependency UI]                                     │
│                                                     │
│ ─────────────────────────────────────────────────  │
│                                                     │
│ Custom Fields                    [+ Add Field]     │
│                                                     │
│ Client Name *                              [🗑️]    │
│ ┌─────────────────────────────────────────────┐   │
│ │ Acme Corporation                            │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ Budget                                     [🗑️]    │
│ ┌─────────────────────────────────────────────┐   │
│ │ 50000                                       │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ Status                                     [🗑️]    │
│ ┌─────────────────────────────────────────────┐   │
│ │ In Progress                          ▼      │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 2. Add Field Button

When no custom fields exist:

```
┌─────────────────────────────────────────────────────┐
│ Custom Fields                    [+ Add Field]     │
│                                                     │
│         No custom fields defined.                  │
│         Click "Add Field" to create one.           │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 3. Custom Fields Dialog

Clicking "Add Field" opens a modal dialog:

```
┌─────────────────────────────────────────────────────┐
│ Create Custom Field                          [✕]   │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Field Name *                                        │
│ ┌─────────────────────────────────────────────┐   │
│ │ e.g., Client Name, Budget, Status           │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ Field Type *                                        │
│ ┌─────────────────────────────────────────────┐   │
│ │ Text                                  ▼     │   │
│ └─────────────────────────────────────────────┘   │
│   Options: Text, Number, Date, Dropdown,           │
│            Multi-Select, Checkbox, URL,             │
│            Email, Phone                             │
│                                                     │
│ Description                                         │
│ ┌─────────────────────────────────────────────┐   │
│ │ Optional description for this field         │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ Default Value                                       │
│ ┌─────────────────────────────────────────────┐   │
│ │ Optional default value                      │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ Required Field                          [Toggle]   │
│                                                     │
│ Global Field                            [Toggle]   │
│ Apply to all projects or just this project         │
│                                                     │
├─────────────────────────────────────────────────────┤
│                          [Cancel] [Create Field]   │
└─────────────────────────────────────────────────────┘
```

### 4. Dropdown Field with Options

When creating a dropdown or multi-select field:

```
┌─────────────────────────────────────────────────────┐
│ Field Type *                                        │
│ ┌─────────────────────────────────────────────┐   │
│ │ Dropdown                              ▼     │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ Options *                                           │
│ ┌──────────────────────────────────┐ [+ Add]      │
│ │ Add an option                    │               │
│ └──────────────────────────────────┘               │
│                                                     │
│ [Not Started ✕] [In Progress ✕] [Complete ✕]      │
│ [On Hold ✕] [Blocked ✕]                           │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Field Type Examples

### Text Field
```
Client Name *                              [🗑️]
┌─────────────────────────────────────────────┐
│ Acme Corporation                            │
└─────────────────────────────────────────────┘
```

### Number Field
```
Budget                                     [🗑️]
┌─────────────────────────────────────────────┐
│ 50000                                       │
└─────────────────────────────────────────────┘
```

### Date Field
```
Deadline                                   [🗑️]
┌─────────────────────────────────────────────┐
│ 2024-12-31                          📅      │
└─────────────────────────────────────────────┘
```

### Dropdown Field
```
Status                                     [🗑️]
┌─────────────────────────────────────────────┐
│ In Progress                          ▼      │
└─────────────────────────────────────────────┘
  ↓ (when clicked)
┌─────────────────────────────────────────────┐
│ Not Started                                 │
│ In Progress                          ✓      │
│ Complete                                    │
│ On Hold                                     │
│ Blocked                                     │
└─────────────────────────────────────────────┘
```

### Multi-Select Field
```
Tags                                       [🗑️]
☐ Frontend
☑ Backend
☑ Database
☐ API
☐ Testing
```

### Checkbox Field
```
Billable                                   [🗑️]
☑ This task is billable
```

### URL Field
```
Documentation Link                         [🗑️]
┌─────────────────────────────────────────────┐
│ https://docs.example.com/project            │
└─────────────────────────────────────────────┘
```

### Email Field
```
Contact Email                              [🗑️]
┌─────────────────────────────────────────────┐
│ contact@example.com                         │
└─────────────────────────────────────────────┘
```

### Phone Field
```
Contact Phone                              [🗑️]
┌─────────────────────────────────────────────┐
│ +1 (555) 123-4567                           │
└─────────────────────────────────────────────┘
```

## User Flows

### Flow 1: Creating a Custom Field

1. User opens a task detail panel
2. Scrolls to "Custom Fields" section
3. Clicks "+ Add Field" button
4. Dialog opens
5. User fills in:
   - Field Name: "Client Name"
   - Field Type: "Text"
   - Description: "Name of the client for this task"
   - Required: ✓ (checked)
   - Global: ✓ (checked)
6. Clicks "Create Field"
7. Dialog closes
8. Field appears in the Custom Fields section
9. Field is now available for all tasks

### Flow 2: Setting a Field Value

1. User opens a task detail panel
2. Scrolls to "Custom Fields" section
3. Sees "Client Name" field (empty)
4. Clicks in the input field
5. Types "Acme Corporation"
6. Value is automatically saved
7. User can close the panel
8. Value persists when panel is reopened

### Flow 3: Deleting a Custom Field

1. User opens a task detail panel
2. Scrolls to "Custom Fields" section
3. Sees "Client Name" field with trash icon
4. Clicks trash icon (🗑️)
5. Confirmation dialog appears:
   ```
   Are you sure you want to delete this custom field?
   This will remove it from all tasks.
   
   [Cancel] [Delete]
   ```
6. User clicks "Delete"
7. Field is removed from the UI
8. Field definition is deleted from database
9. Field values are removed from all tasks

### Flow 4: Using Dropdown Options

1. User creates a dropdown field with options:
   - Not Started
   - In Progress
   - Complete
   - On Hold
   - Blocked
2. Field appears in task detail panel
3. User clicks the dropdown
4. Options list appears
5. User selects "In Progress"
6. Dropdown shows "In Progress"
7. Value is saved

### Flow 5: Using Multi-Select

1. User creates a multi-select field with options:
   - Frontend
   - Backend
   - Database
   - API
   - Testing
2. Field appears with checkboxes for each option
3. User checks "Backend" and "Database"
4. Both values are saved as an array
5. User can uncheck options to remove them

## Validation States

### Required Field (Empty)
```
Client Name *                              [🗑️]
┌─────────────────────────────────────────────┐
│                                             │ ← Empty, shows error on submit
└─────────────────────────────────────────────┘
⚠️ Client Name is required
```

### Invalid Email
```
Contact Email                              [🗑️]
┌─────────────────────────────────────────────┐
│ invalid-email                               │
└─────────────────────────────────────────────┘
⚠️ Contact Email must be a valid email
```

### Invalid URL
```
Documentation Link                         [🗑️]
┌─────────────────────────────────────────────┐
│ not-a-url                                   │
└─────────────────────────────────────────────┘
⚠️ Documentation Link must be a valid URL
```

### Invalid Phone
```
Contact Phone                              [🗑️]
┌─────────────────────────────────────────────┐
│ 123                                         │
└─────────────────────────────────────────────┘
⚠️ Contact Phone must be a valid phone number
```

## Global vs Project-Specific Fields

### Global Field (All Projects)
```
┌─────────────────────────────────────────────────────┐
│ Custom Fields                    [+ Add Field]     │
│                                                     │
│ Client Name * (Global)                     [🗑️]    │
│ ┌─────────────────────────────────────────────┐   │
│ │ Acme Corporation                            │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Project-Specific Field
```
┌─────────────────────────────────────────────────────┐
│ Custom Fields                    [+ Add Field]     │
│                                                     │
│ Sprint Number (Project: Website Redesign) [🗑️]    │
│ ┌─────────────────────────────────────────────┐   │
│ │ 5                                           │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Responsive Behavior

### Desktop (Wide Screen)
- Full-width inputs
- Side-by-side layout for labels and delete buttons
- Dialog is centered and 600px wide

### Tablet (Medium Screen)
- Full-width inputs
- Stacked layout for labels and delete buttons
- Dialog is centered and 90% width

### Mobile (Narrow Screen)
- Full-width inputs
- Stacked layout
- Dialog is full-screen
- Scrollable content

## Accessibility

### Keyboard Navigation
- Tab through fields in order
- Enter to submit dialog
- Escape to close dialog
- Space to toggle checkboxes
- Arrow keys to navigate dropdown options

### Screen Reader Support
- Labels are properly associated with inputs
- Required fields are announced
- Validation errors are announced
- Delete buttons have descriptive labels

### Focus Management
- Focus moves to first input when dialog opens
- Focus returns to trigger button when dialog closes
- Focus is trapped within dialog
- Focus indicators are visible

## Color Scheme

### Light Mode
- Background: White (#FFFFFF)
- Text: Dark Gray (#1F2937)
- Border: Light Gray (#E5E7EB)
- Primary: Deep Blue (#2E5AAC)
- Accent: Warm Orange (#F2994A)
- Error: Red (#EF4444)

### Dark Mode
- Background: Dark Gray (#1F2937)
- Text: Light Gray (#F9FAFB)
- Border: Medium Gray (#374151)
- Primary: Light Blue (#60A5FA)
- Accent: Light Orange (#FCD34D)
- Error: Light Red (#FCA5A5)

## Animation

### Dialog Open/Close
- Fade in/out: 200ms
- Scale: 0.95 → 1.0
- Easing: cubic-bezier(0.4, 0, 0.2, 1)

### Field Add/Remove
- Slide in from top: 300ms
- Fade in: 200ms
- Easing: ease-out

### Validation Error
- Shake animation: 300ms
- Color transition: 200ms

## Performance

### Rendering
- Fields are rendered on-demand
- Values are debounced (300ms) before saving
- Validation is performed client-side

### Data Loading
- Field definitions loaded once per project
- Cached in memory
- Refreshed on field creation/deletion

### Network Requests
- Field creation: 1 request
- Field update: 1 request
- Field deletion: 1 request
- Value update: 1 request (debounced)

## Edge Cases

### No Fields Defined
```
┌─────────────────────────────────────────────────────┐
│ Custom Fields                    [+ Add Field]     │
│                                                     │
│         No custom fields defined.                  │
│         Click "Add Field" to create one.           │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Loading State
```
┌─────────────────────────────────────────────────────┐
│ Custom Fields                                       │
│                                                     │
│         Loading custom fields...                   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Error State
```
┌─────────────────────────────────────────────────────┐
│ Custom Fields                    [+ Add Field]     │
│                                                     │
│ ⚠️ Failed to load custom fields.                   │
│    [Retry]                                          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Many Fields (Scrollable)
```
┌─────────────────────────────────────────────────────┐
│ Custom Fields                    [+ Add Field]     │
│ ┌─────────────────────────────────────────────┐   │
│ │ Client Name                                 │   │
│ │ Budget                                      │   │
│ │ Status                                      │   │
│ │ Priority Level                              │   │
│ │ Deadline                                    │   │
│ │ Contact Email                               │   │
│ │ Contact Phone                               │   │
│ │ Documentation Link                          │   │
│ │ ↓ Scroll for more                           │   │
│ └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

## Integration with Existing UI

The Custom Fields section integrates seamlessly with the existing task detail panel:

1. **Position**: Below Task Dependencies, above the bottom of the panel
2. **Styling**: Matches existing panel styling (borders, spacing, typography)
3. **Behavior**: Follows existing patterns (auto-save, validation, error handling)
4. **Accessibility**: Consistent with existing accessibility standards

## Future UI Enhancements

1. **Drag-and-Drop Reordering**: Drag fields to reorder them
2. **Field Groups**: Collapsible sections for organizing many fields
3. **Field Templates**: Quick-add common field sets
4. **Inline Editing**: Edit field definitions without opening dialog
5. **Bulk Operations**: Select multiple fields for batch actions
6. **Field Search**: Search/filter fields when many are defined
7. **Field Preview**: Preview how field will look before creating
8. **Field Duplication**: Duplicate existing fields with one click
