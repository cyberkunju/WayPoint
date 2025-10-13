# Custom Fields Feature

## Overview

The Custom Fields feature allows users to define and use custom metadata fields for their tasks. This provides flexibility to track project-specific or workflow-specific information beyond the standard task properties.

## Architecture

### Components

1. **CustomFieldsService** (`src/services/custom-fields.service.ts`)
   - Manages custom field definitions (CRUD operations)
   - Handles field value serialization/deserialization
   - Provides validation for field values
   - Supports both global and project-specific fields

2. **CustomFieldsDialog** (`src/components/CustomFieldsDialog.tsx`)
   - UI for creating new custom field definitions
   - Supports all field types with appropriate configuration
   - Handles options for dropdown/multi-select fields
   - Allows setting default values and required status

3. **CustomFieldsSection** (`src/components/CustomFieldsSection.tsx`)
   - Displays custom fields in the task detail panel
   - Renders appropriate input controls based on field type
   - Handles field value updates
   - Allows deleting field definitions

### Database Schema

**Collection: `custom_fields`**

```typescript
{
  userId: string;           // Owner of the field definition
  name: string;             // Display name
  fieldType: CustomFieldType; // Field type (text, number, date, etc.)
  description?: string;     // Optional description
  options?: string[];       // Options for dropdown/multi-select
  defaultValue?: string;    // Default value
  isRequired: boolean;      // Whether field is required
  isGlobal: boolean;        // Apply to all projects or specific project
  projectId?: string;       // Project ID if not global
  position: number;         // Display order
}
```

**Field Types:**
- `text` - Single-line text input
- `number` - Numeric input
- `date` - Date picker
- `dropdown` - Single selection from options
- `multi-select` - Multiple selections from options
- `checkbox` - Boolean value
- `url` - URL input with validation
- `email` - Email input with validation
- `phone` - Phone number input with validation

### Data Storage

Custom field values are stored in the `tasks.customFields` field as a JSON string:

```typescript
interface CustomFieldValue {
  fieldId: string;
  value: string | number | boolean | string[];
}

// Stored as: JSON.stringify(CustomFieldValue[])
```

## Usage

### Creating a Custom Field

1. Open a task detail panel
2. Scroll to the "Custom Fields" section
3. Click "Add Field"
4. Fill in the field definition:
   - Name (required)
   - Type (required)
   - Description (optional)
   - Options (for dropdown/multi-select)
   - Default value (optional)
   - Required checkbox
   - Global checkbox (if in a project context)
5. Click "Create Field"

### Using Custom Fields

1. Open a task detail panel
2. Scroll to the "Custom Fields" section
3. Fill in the custom field values
4. Values are automatically saved when changed

### Deleting a Custom Field

1. Open a task detail panel
2. Scroll to the "Custom Fields" section
3. Click the trash icon next to the field name
4. Confirm deletion
5. The field definition and all values are removed

## Setup

### 1. Create the Collection

Run the setup script to create the `custom_fields` collection:

```bash
npm run setup:custom-fields
```

**Prerequisites:**
- Appwrite project must be created
- `APPWRITE_API_KEY` must be set in `.env.local`
- API key must have the following scopes:
  - `databases.read`
  - `databases.write`
  - `collections.read`
  - `collections.write`
  - `attributes.read`
  - `attributes.write`
  - `indexes.read`
  - `indexes.write`

### 2. Verify Setup

Verify the collection was created correctly:

```bash
npm run verify:custom-fields
```

## Features

### Field Types

#### Text Fields
- Single-line text input
- Supports default values
- Can be marked as required

#### Number Fields
- Numeric input with validation
- Supports decimal numbers
- Can be marked as required

#### Date Fields
- Date picker interface
- Stores dates in ISO format
- Can be marked as required

#### Dropdown Fields
- Single selection from predefined options
- Options are defined when creating the field
- Can be marked as required

#### Multi-Select Fields
- Multiple selections from predefined options
- Stored as an array of strings
- Can be marked as required

#### Checkbox Fields
- Boolean value (true/false)
- Useful for yes/no questions
- Can be marked as required

#### URL Fields
- Text input with URL validation
- Validates format on blur
- Can be marked as required

#### Email Fields
- Text input with email validation
- Validates format on blur
- Can be marked as required

#### Phone Fields
- Text input with phone number validation
- Validates format on blur
- Can be marked as required

### Global vs Project-Specific Fields

**Global Fields:**
- Apply to all tasks across all projects
- Useful for organization-wide metadata
- Examples: Client Name, Budget, Priority Level

**Project-Specific Fields:**
- Only apply to tasks in a specific project
- Useful for project-specific tracking
- Examples: Sprint Number, Story Points, Release Version

### Validation

The service provides validation for all field types:

```typescript
// Validate a single field value
const validation = customFieldsService.validateFieldValue(field, value);
if (!validation.valid) {
  console.error(validation.error);
}

// Validate all fields for a task
const validation = customFieldsService.validateAllFieldValues(fields, customFieldsJson);
if (!validation.valid) {
  console.error(validation.errors);
}
```

### Filtering by Custom Fields

Custom fields can be used for filtering tasks (future enhancement):

```typescript
// Example: Filter tasks by custom field value
const tasks = await taskService.listTasks({
  userId,
  // Custom field filtering would be implemented here
});
```

## Integration Points

### Task Service

The task service already supports custom fields through the `customFields` property:

```typescript
interface TaskDocument {
  // ... other properties
  customFields?: string; // JSON string of CustomFieldValue[]
}
```

### Detail Panel

The detail panel includes the CustomFieldsSection component:

```tsx
<CustomFieldsSection
  taskId={task.id}
  userId={userId}
  projectId={task.projectId}
  customFieldsJson={task.customFields}
  onUpdate={(customFieldsJson) => updateTask(task.id, { customFields: customFieldsJson })}
/>
```

## API Reference

### CustomFieldsService

#### Methods

**createCustomField(data, userId, permissions?)**
- Creates a new custom field definition
- Returns: `Promise<CustomField>`

**getCustomField(fieldId)**
- Gets a custom field by ID
- Returns: `Promise<CustomField>`

**updateCustomField(fieldId, data, permissions?)**
- Updates a custom field definition
- Returns: `Promise<CustomField>`

**deleteCustomField(fieldId)**
- Deletes a custom field definition
- Returns: `Promise<void>`

**listCustomFields(userId, projectId?, includeGlobal?)**
- Lists custom fields for a user
- Returns: `Promise<CustomField[]>`

**getFieldsForProject(userId, projectId)**
- Gets all fields for a project (including global)
- Returns: `Promise<CustomField[]>`

**getGlobalFields(userId)**
- Gets only global custom fields
- Returns: `Promise<CustomField[]>`

**parseCustomFieldValues(customFieldsJson?)**
- Parses JSON string to CustomFieldValue array
- Returns: `CustomFieldValue[]`

**serializeCustomFieldValues(values)**
- Serializes CustomFieldValue array to JSON string
- Returns: `string`

**getFieldValue(customFieldsJson, fieldId)**
- Gets a specific field value
- Returns: `CustomFieldValue | undefined`

**setFieldValue(customFieldsJson, fieldId, value)**
- Sets a field value
- Returns: `string` (updated JSON)

**removeFieldValue(customFieldsJson, fieldId)**
- Removes a field value
- Returns: `string` (updated JSON)

**validateFieldValue(field, value)**
- Validates a single field value
- Returns: `{ valid: boolean; error?: string }`

**validateAllFieldValues(fields, customFieldsJson)**
- Validates all field values
- Returns: `{ valid: boolean; errors: string[] }`

**reorderFields(fieldIds, userId)**
- Reorders custom fields
- Returns: `Promise<void>`

## Future Enhancements

1. **Field Templates**
   - Pre-defined field sets for common use cases
   - Import/export field definitions

2. **Calculated Fields**
   - Fields that compute values from other fields
   - Formula support (e.g., Budget - Spent = Remaining)

3. **Conditional Fields**
   - Show/hide fields based on other field values
   - Dynamic field behavior

4. **Field Groups**
   - Organize fields into collapsible sections
   - Better organization for many fields

5. **Field History**
   - Track changes to field values over time
   - Audit trail for important fields

6. **Advanced Filtering**
   - Filter tasks by custom field values
   - Support for complex queries

7. **Field Permissions**
   - Control who can edit specific fields
   - Read-only fields for certain users

8. **Field Validation Rules**
   - Min/max values for numbers
   - Regex patterns for text
   - Custom validation functions

## Testing

### Manual Testing Checklist

- [ ] Create a text custom field
- [ ] Create a number custom field
- [ ] Create a date custom field
- [ ] Create a dropdown field with options
- [ ] Create a multi-select field with options
- [ ] Create a checkbox field
- [ ] Create a URL field
- [ ] Create an email field
- [ ] Create a phone field
- [ ] Set values for all field types
- [ ] Verify values are saved
- [ ] Verify values persist after page reload
- [ ] Delete a custom field
- [ ] Verify field values are removed from tasks
- [ ] Create a global field
- [ ] Create a project-specific field
- [ ] Verify global fields appear in all projects
- [ ] Verify project-specific fields only appear in that project
- [ ] Test required field validation
- [ ] Test field type validation (email, URL, phone)
- [ ] Test dropdown options
- [ ] Test multi-select options

### Unit Tests

Unit tests should be added for:
- CustomFieldsService methods
- Field value serialization/deserialization
- Field validation logic
- Field type-specific behavior

## Troubleshooting

### Collection Not Found

**Error:** `Custom Fields collection not found`

**Solution:** Run the setup script:
```bash
npm run setup:custom-fields
```

### API Key Missing

**Error:** `User (role: guests) missing scopes`

**Solution:** 
1. Generate an API key in Appwrite Console
2. Add it to `.env.local` as `APPWRITE_API_KEY`
3. Ensure the key has the required scopes

### Field Values Not Saving

**Issue:** Custom field values don't persist

**Solution:**
1. Check browser console for errors
2. Verify the task update is being called
3. Check Appwrite permissions on the tasks collection
4. Verify the customFields attribute exists on tasks

### Field Not Appearing

**Issue:** Custom field doesn't show in the detail panel

**Solution:**
1. Verify the field was created successfully
2. Check if it's a project-specific field and you're in the right project
3. Refresh the page to reload field definitions
4. Check browser console for errors

## Requirements Satisfied

This implementation satisfies the following requirements from the spec:

- **18.1**: Support for multiple field types (text, number, date, dropdown, multi-select, checkbox, URL, email, phone)
- **18.2**: Fields can be applied globally or to specific projects
- **18.3**: Custom field values are stored and retrieved correctly
- **18.4**: Custom fields are displayed in the task detail panel with appropriate input controls
- **18.5**: Field values can be used for filtering (foundation laid, full implementation pending)

## Related Files

- `src/services/custom-fields.service.ts` - Service layer
- `src/components/CustomFieldsDialog.tsx` - Field definition UI
- `src/components/CustomFieldsSection.tsx` - Field display/edit UI
- `src/components/DetailPanel.tsx` - Integration point
- `src/lib/appwrite.ts` - Collection ID constant
- `scripts/setup-custom-fields.ts` - Setup script
- `scripts/verify-custom-fields.ts` - Verification script
