# Task 13: Recurring Tasks - Integration Guide

## Quick Start

This guide shows how to integrate the recurring tasks feature into your ClarityFlow application.

## 1. Add to DetailPanel

The easiest way to enable recurring tasks is to add the `RecurringTaskInfo` component to your task detail view.

### Example: Update DetailPanel.tsx

```typescript
import { RecurringTaskInfo } from '@/components/RecurringTaskInfo';

// Inside your DetailPanel component, add this section:
export function DetailPanel({ task, userId, onUpdate }) {
  return (
    <div className="detail-panel">
      {/* Existing task details */}
      <div className="task-title">{task.title}</div>
      <div className="task-description">{task.description}</div>
      
      {/* Add recurring task section */}
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Recurrence
        </h3>
        <RecurringTaskInfo
          taskId={task.$id}
          userId={userId}
          onUpdate={onUpdate}
        />
      </div>
      
      {/* Rest of task details */}
    </div>
  );
}
```

## 2. Import Required Components

Make sure to import the components at the top of your file:

```typescript
import { RecurringTaskInfo } from '@/components/RecurringTaskInfo';
import { RecurringTaskDialog } from '@/components/RecurringTaskDialog';
```

## 3. Using the Service Directly

If you need more control, you can use the service directly:

```typescript
import { recurringTasksService } from '@/services/recurring-tasks.service';
import type { RecurrencePattern } from '@/services/recurring-tasks.service';

// Create a recurring task
async function makeTaskRecurring(taskId: string, userId: string) {
  const pattern: RecurrencePattern = {
    frequency: 'daily',
    interval: 1,
  };

  const nextOccurrence = recurringTasksService.calculateNextOccurrence(pattern);

  await recurringTasksService.createRecurringTask(
    {
      taskId,
      recurrencePattern: JSON.stringify(pattern),
      nextOccurrence: nextOccurrence.toISOString(),
    },
    userId
  );
}

// Get recurring task info
async function getRecurringInfo(taskId: string, userId: string) {
  const recurringTask = await recurringTasksService.getRecurringTaskByTaskId(
    taskId,
    userId
  );
  
  if (recurringTask) {
    const pattern = recurringTasksService.parseRecurrencePattern(
      recurringTask.recurrencePattern
    );
    const description = recurringTasksService.getRecurrenceDescription(pattern);
    console.log('Recurrence:', description);
  }
}

// Remove recurrence
async function removeRecurrence(taskId: string, userId: string) {
  await recurringTasksService.deleteRecurringTaskByTaskId(taskId, userId);
}
```

## 4. Setup Appwrite Function

### Automated Setup

Run the setup script:

```bash
npm run setup:recurring-tasks-function
```

### Manual Setup

If automated setup doesn't work, follow these steps:

1. **Create Function in Appwrite Console:**
   - Go to Appwrite Console > Functions
   - Click "Create Function"
   - Function ID: `recurring-tasks-processor`
   - Name: Recurring Tasks Processor
   - Runtime: Node.js 20
   - Execute: `role:all`

2. **Upload Function Code:**
   - Go to function > Deployments
   - Click "Create Deployment"
   - Upload `functions/recurring-tasks-processor/` directory
   - Entrypoint: `src/main.js`
   - Click "Deploy"

3. **Configure Environment Variables:**
   - Go to function > Settings > Environment Variables
   - Add: `DATABASE_ID = clarityflow_production`

4. **Set Schedule:**
   - Go to function > Settings > Schedule
   - Enable schedule
   - Cron: `0 0 * * *` (daily at midnight)
   - Save

5. **Test:**
   - Go to Executions tab
   - Click "Execute Now"
   - Check logs for success

## 5. UI Customization

### Customize Dialog Appearance

You can customize the `RecurringTaskDialog` by modifying the component or wrapping it:

```typescript
import { RecurringTaskDialog } from '@/components/RecurringTaskDialog';

function CustomRecurringDialog(props) {
  return (
    <div className="custom-wrapper">
      <RecurringTaskDialog
        {...props}
        // Add custom props or wrap with additional UI
      />
    </div>
  );
}
```

### Customize Info Display

Modify `RecurringTaskInfo` styling to match your design:

```typescript
// The component uses Tailwind classes that can be customized
// Edit src/components/RecurringTaskInfo.tsx to change styling
```

## 6. Testing

### Test the UI

1. Create a new task
2. Open task details
3. Click "Make recurring"
4. Select a pattern (e.g., "Daily")
5. Save
6. Verify the recurrence info is displayed

### Test the Function

1. Create a recurring task with next occurrence in the past
2. Go to Appwrite Console > Functions > recurring-tasks-processor
3. Click "Execute Now"
4. Check logs for processing
5. Verify new task instance is created in database

### Test Calculations

```typescript
import { recurringTasksService } from '@/services/recurring-tasks.service';

// Test daily
const dailyPattern = { frequency: 'daily', interval: 1 };
const nextDaily = recurringTasksService.calculateNextOccurrence(dailyPattern);
console.log('Next daily:', nextDaily);

// Test weekly
const weeklyPattern = { 
  frequency: 'weekly', 
  interval: 1, 
  daysOfWeek: [1, 3, 5] 
};
const nextWeekly = recurringTasksService.calculateNextOccurrence(weeklyPattern);
console.log('Next weekly:', nextWeekly);
```

## 7. Common Patterns

### Daily Task

```typescript
const pattern: RecurrencePattern = {
  frequency: 'daily',
  interval: 1,
};
```

### Weekly on Specific Days

```typescript
const pattern: RecurrencePattern = {
  frequency: 'weekly',
  interval: 1,
  daysOfWeek: [1, 3, 5], // Mon, Wed, Fri
};
```

### Monthly on Specific Day

```typescript
const pattern: RecurrencePattern = {
  frequency: 'monthly',
  interval: 1,
  dayOfMonth: 15, // 15th of each month
};
```

### Yearly on Specific Date

```typescript
const pattern: RecurrencePattern = {
  frequency: 'yearly',
  interval: 1,
  monthOfYear: 12,
  dayOfMonth: 25, // December 25th
};
```

### With End Date

```typescript
await recurringTasksService.createRecurringTask(
  {
    taskId,
    recurrencePattern: JSON.stringify(pattern),
    nextOccurrence: nextOccurrence.toISOString(),
    endDate: '2024-12-31T23:59:59Z',
  },
  userId
);
```

### With Max Occurrences

```typescript
await recurringTasksService.createRecurringTask(
  {
    taskId,
    recurrencePattern: JSON.stringify(pattern),
    nextOccurrence: nextOccurrence.toISOString(),
    maxOccurrences: 10,
  },
  userId
);
```

## 8. Troubleshooting

### Function Not Creating Tasks

**Problem:** Function runs but doesn't create tasks

**Solutions:**
1. Check function logs in Appwrite Console
2. Verify `nextOccurrence` is in the past
3. Ensure API key has correct permissions
4. Check database connection

### UI Not Showing Recurrence

**Problem:** RecurringTaskInfo doesn't display

**Solutions:**
1. Verify component is imported correctly
2. Check taskId and userId are passed
3. Look for console errors
4. Verify recurring task exists in database

### Incorrect Next Occurrence

**Problem:** Next occurrence date is wrong

**Solutions:**
1. Verify recurrence pattern is valid
2. Check timezone handling
3. Test calculation with known dates
4. Review pattern validation

## 9. Performance Tips

1. **Batch Processing:** Function processes up to 100 tasks per run
2. **Indexing:** Ensure `nextOccurrence` field is indexed
3. **Caching:** Consider caching recurring task info in UI
4. **Lazy Loading:** Load recurring info only when needed

## 10. Security Considerations

1. **Permissions:** All operations respect user permissions
2. **Validation:** Patterns are validated before saving
3. **API Key:** Function uses secure API key
4. **Data Isolation:** Users can only access their own recurring tasks

## 11. Next Steps

After integration:

1. ✅ Test with real users
2. ✅ Monitor function executions
3. ✅ Gather feedback on UI/UX
4. ✅ Consider additional patterns
5. ✅ Add analytics for recurring tasks

## 12. Support

For issues or questions:

1. Check `src/components/RECURRING_TASKS.md` for detailed docs
2. Review `functions/recurring-tasks-processor/README.md`
3. Check Appwrite function logs
4. Review test files for examples

## 13. Example: Complete Integration

Here's a complete example of integrating recurring tasks into a task detail component:

```typescript
import { useState, useEffect } from 'react';
import { RecurringTaskInfo } from '@/components/RecurringTaskInfo';
import { taskService } from '@/services/task.service';
import type { Task } from '@/services/task.service';

interface TaskDetailProps {
  taskId: string;
  userId: string;
}

export function TaskDetail({ taskId, userId }: TaskDetailProps) {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTask();
  }, [taskId]);

  const loadTask = async () => {
    try {
      setLoading(true);
      const taskData = await taskService.getTask(taskId, userId);
      setTask(taskData);
    } catch (error) {
      console.error('Failed to load task:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!task) return <div>Task not found</div>;

  return (
    <div className="task-detail p-4 space-y-4">
      {/* Task Title */}
      <h2 className="text-2xl font-bold">{task.title}</h2>

      {/* Task Description */}
      {task.description && (
        <p className="text-gray-600 dark:text-gray-400">
          {task.description}
        </p>
      )}

      {/* Due Date */}
      {task.dueDate && (
        <div className="text-sm text-gray-500">
          Due: {new Date(task.dueDate).toLocaleDateString()}
        </div>
      )}

      {/* Recurring Task Section */}
      <div className="border-t pt-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Recurrence
        </h3>
        <RecurringTaskInfo
          taskId={task.$id}
          userId={userId}
          onUpdate={loadTask}
        />
      </div>

      {/* Other task details */}
    </div>
  );
}
```

That's it! Your recurring tasks feature is now fully integrated. 🎉
