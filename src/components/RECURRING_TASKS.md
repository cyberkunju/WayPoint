# Recurring Tasks Feature

This document describes the implementation of recurring tasks in ClarityFlow.

## Overview

Recurring tasks allow users to create tasks that automatically repeat based on a schedule (daily, weekly, monthly, yearly, or custom patterns). When a recurring task is completed, a new instance is automatically created for the next occurrence.

## Architecture

### Components

1. **RecurringTasksService** (`src/services/recurring-tasks.service.ts`)
   - Manages recurring task configurations
   - Calculates next occurrence dates
   - Validates recurrence patterns
   - Provides human-readable descriptions

2. **RecurringTaskDialog** (`src/components/RecurringTaskDialog.tsx`)
   - UI for creating and editing recurrence patterns
   - Supports all recurrence types
   - Provides real-time preview
   - Validates user input

3. **RecurringTaskInfo** (`src/components/RecurringTaskInfo.tsx`)
   - Displays recurring task information in DetailPanel
   - Shows next occurrence date
   - Allows editing and removing recurrence
   - Tracks occurrence count

4. **Recurring Tasks Processor Function** (`functions/recurring-tasks-processor/`)
   - Appwrite serverless function
   - Runs daily (or on custom schedule)
   - Creates new task instances
   - Updates next occurrence dates

## Database Schema

### recurring_tasks Collection

```typescript
{
  taskId: string;           // Reference to the original task
  userId: string;           // Owner of the recurring task
  recurrencePattern: string; // JSON string of RecurrencePattern
  nextOccurrence: string;   // ISO date string for next instance
  endDate?: string;         // Optional end date
  maxOccurrences?: number;  // Optional max number of occurrences
  occurrencesCount: number; // Current count of created instances
}
```

### RecurrencePattern Interface

```typescript
{
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  interval: number;         // e.g., every 2 weeks
  daysOfWeek?: number[];    // 0-6 for weekly (Sunday-Saturday)
  dayOfMonth?: number;      // 1-31 for monthly
  monthOfYear?: number;     // 1-12 for yearly
  customRule?: string;      // For complex patterns
}
```

## Usage

### Creating a Recurring Task

```typescript
import { recurringTasksService } from '@/services/recurring-tasks.service';

// Define recurrence pattern
const pattern: RecurrencePattern = {
  frequency: 'weekly',
  interval: 1,
  daysOfWeek: [1, 3, 5], // Monday, Wednesday, Friday
};

// Calculate next occurrence
const nextOccurrence = recurringTasksService.calculateNextOccurrence(pattern);

// Create recurring task
await recurringTasksService.createRecurringTask(
  {
    taskId: 'task-id',
    recurrencePattern: JSON.stringify(pattern),
    nextOccurrence: nextOccurrence.toISOString(),
    endDate: '2024-12-31T23:59:59Z', // Optional
    maxOccurrences: 50, // Optional
  },
  userId
);
```

### Using the UI Components

```typescript
import { RecurringTaskInfo } from '@/components/RecurringTaskInfo';

// In your DetailPanel or task detail view
<RecurringTaskInfo
  taskId={task.$id}
  userId={userId}
  onUpdate={() => {
    // Refresh task data
  }}
/>
```

### Recurrence Patterns

#### Daily
```typescript
{
  frequency: 'daily',
  interval: 1, // Every day
}

{
  frequency: 'daily',
  interval: 3, // Every 3 days
}
```

#### Weekly
```typescript
{
  frequency: 'weekly',
  interval: 1,
  daysOfWeek: [1, 3, 5], // Monday, Wednesday, Friday
}

{
  frequency: 'weekly',
  interval: 2,
  daysOfWeek: [1], // Every 2 weeks on Monday
}
```

#### Monthly
```typescript
{
  frequency: 'monthly',
  interval: 1,
  dayOfMonth: 15, // 15th of every month
}

{
  frequency: 'monthly',
  interval: 3,
  dayOfMonth: 1, // 1st of every 3 months
}
```

#### Yearly
```typescript
{
  frequency: 'yearly',
  interval: 1,
  monthOfYear: 12,
  dayOfMonth: 25, // December 25th every year
}
```

## Appwrite Function Setup

### Prerequisites

1. Appwrite Cloud account (Pro plan recommended)
2. API key with database read/write permissions
3. Function deployment access

### Deployment Steps

1. **Create Function in Appwrite Console:**
   - Function ID: `recurring-tasks-processor`
   - Runtime: Node.js 20
   - Execute: `role:all`

2. **Upload Function Code:**
   - Upload `functions/recurring-tasks-processor/` directory
   - Entrypoint: `src/main.js`

3. **Configure Environment Variables:**
   - `DATABASE_ID`: Your database ID (default: `clarityflow_production`)

4. **Set Up Schedule:**
   - Cron: `0 0 * * *` (daily at midnight)
   - Or: `0 */6 * * *` (every 6 hours)

5. **Test Function:**
   - Execute manually from console
   - Check logs for errors
   - Verify task instances are created

### Automated Setup

Run the setup script:

```bash
npm run setup:recurring-tasks-function
```

Or manually:

```bash
tsx scripts/setup-recurring-tasks-function.ts
```

## How It Works

### Task Creation Flow

1. User creates a task and sets it as recurring
2. `RecurringTaskDialog` collects recurrence pattern
3. Service calculates `nextOccurrence` date
4. Recurring task configuration is saved to database
5. Original task is marked with recurring metadata

### Processing Flow

1. Function runs on schedule (e.g., daily at midnight)
2. Queries for recurring tasks where `nextOccurrence <= now`
3. For each recurring task:
   - Checks if should continue (end date, max occurrences)
   - Fetches original task data
   - Creates new task instance with updated due date
   - Calculates next occurrence
   - Updates recurring task record
   - Increments occurrence count
4. Logs results and errors

### Completion Flow

1. User completes a recurring task instance
2. Task is marked as complete (normal task behavior)
3. Function creates next instance on next run
4. Original recurring task configuration remains active

### Stopping Recurrence

Recurrence stops when:
- User manually removes recurrence
- `maxOccurrences` is reached
- `endDate` is passed
- Original task is deleted

## API Reference

### RecurringTasksService

#### Methods

- `createRecurringTask(data, userId, permissions?)` - Create recurring task
- `getRecurringTaskByTaskId(taskId, userId?)` - Get by task ID
- `getRecurringTask(recurringTaskId)` - Get by ID
- `updateRecurringTask(recurringTaskId, data, permissions?)` - Update
- `deleteRecurringTask(recurringTaskId)` - Delete
- `listRecurringTasks(userId)` - List all for user
- `calculateNextOccurrence(pattern, fromDate?)` - Calculate next date
- `getRecurrenceDescription(pattern)` - Get human-readable description
- `validateRecurrencePattern(pattern)` - Validate pattern
- `shouldContinueRecurrence(recurringTask)` - Check if should continue

## Testing

### Manual Testing

1. Create a task with daily recurrence
2. Set next occurrence to past date
3. Manually trigger function
4. Verify new task instance is created
5. Check next occurrence is updated

### Automated Testing

```bash
# Run service tests
npm test recurring-tasks.service.test.ts

# Test function locally
cd functions/recurring-tasks-processor
npm install
node src/main.js
```

## Troubleshooting

### Function Not Creating Tasks

1. Check function logs in Appwrite Console
2. Verify API key has correct permissions
3. Ensure `nextOccurrence` is in the past
4. Check database connection

### Incorrect Next Occurrence

1. Verify recurrence pattern is valid
2. Check timezone handling
3. Review calculation logic for edge cases
4. Test with different patterns

### Performance Issues

1. Limit batch size in function (default: 100)
2. Optimize database queries
3. Add indexes on `nextOccurrence` field
4. Consider running function more frequently

## Future Enhancements

- [ ] Support for more complex patterns (e.g., "last Friday of month")
- [ ] Timezone-aware scheduling
- [ ] Bulk operations for recurring tasks
- [ ] Recurring task templates
- [ ] Smart scheduling based on completion patterns
- [ ] Notification before next occurrence
- [ ] Skip/postpone next occurrence
- [ ] Recurring task analytics

## Related Files

- `src/services/recurring-tasks.service.ts` - Service implementation
- `src/components/RecurringTaskDialog.tsx` - UI dialog
- `src/components/RecurringTaskInfo.tsx` - Info display
- `functions/recurring-tasks-processor/` - Appwrite function
- `scripts/setup-recurring-tasks-function.ts` - Setup script

## References

- [Appwrite Functions Documentation](https://appwrite.io/docs/functions)
- [Cron Expression Guide](https://crontab.guru/)
- [ISO 8601 Date Format](https://en.wikipedia.org/wiki/ISO_8601)
