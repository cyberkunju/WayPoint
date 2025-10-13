import { Client, Databases, Query, ID } from 'node-appwrite';

/**
 * Recurring Tasks Processor Function
 * 
 * This function runs daily to process recurring tasks:
 * 1. Find recurring tasks where nextOccurrence is in the past
 * 2. Create new task instances based on the original task
 * 3. Update nextOccurrence to the next date
 * 4. Increment occurrence count
 * 5. Stop if max occurrences or end date is reached
 */

export default async ({ req, res, log, error }) => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const databases = new Databases(client);
  const DATABASE_ID = process.env.DATABASE_ID || 'clarityflow_production';
  const RECURRING_TASKS_COLLECTION = 'recurring_tasks';
  const TASKS_COLLECTION = 'tasks';

  try {
    log('Starting recurring tasks processor...');

    // Get all recurring tasks that need processing
    const now = new Date().toISOString();
    const recurringTasksResult = await databases.listDocuments(
      DATABASE_ID,
      RECURRING_TASKS_COLLECTION,
      [
        Query.lessThanEqual('nextOccurrence', now),
        Query.limit(100) // Process in batches
      ]
    );

    log(`Found ${recurringTasksResult.documents.length} recurring tasks to process`);

    let processedCount = 0;
    let errorCount = 0;

    for (const recurringTask of recurringTasksResult.documents) {
      try {
        // Check if should continue recurrence
        const shouldContinue = checkShouldContinue(recurringTask);
        
        if (!shouldContinue) {
          log(`Recurring task ${recurringTask.$id} has reached its end condition`);
          // Optionally delete or mark as inactive
          await databases.deleteDocument(
            DATABASE_ID,
            RECURRING_TASKS_COLLECTION,
            recurringTask.$id
          );
          continue;
        }

        // Get the original task
        const originalTask = await databases.getDocument(
          DATABASE_ID,
          TASKS_COLLECTION,
          recurringTask.taskId
        );

        // Parse recurrence pattern
        const pattern = JSON.parse(recurringTask.recurrencePattern);

        // Calculate next occurrence
        const nextOccurrence = calculateNextOccurrence(
          pattern,
          new Date(recurringTask.nextOccurrence)
        );

        // Create new task instance
        const newTaskData = {
          userId: originalTask.userId,
          title: originalTask.title,
          description: originalTask.description,
          completed: false,
          priority: originalTask.priority,
          dueDate: nextOccurrence.toISOString(),
          startDate: originalTask.startDate,
          projectId: originalTask.projectId,
          epicId: originalTask.epicId,
          assignee: originalTask.assignee,
          labels: originalTask.labels || [],
          dependencies: [],
          estimatedTime: originalTask.estimatedTime,
          position: originalTask.position,
          customFields: originalTask.customFields,
        };

        await databases.createDocument(
          DATABASE_ID,
          TASKS_COLLECTION,
          ID.unique(),
          newTaskData,
          [
            `read("user:${originalTask.userId}")`,
            `update("user:${originalTask.userId}")`,
            `delete("user:${originalTask.userId}")`,
          ]
        );

        // Update recurring task
        await databases.updateDocument(
          DATABASE_ID,
          RECURRING_TASKS_COLLECTION,
          recurringTask.$id,
          {
            nextOccurrence: nextOccurrence.toISOString(),
            occurrencesCount: recurringTask.occurrencesCount + 1,
          }
        );

        processedCount++;
        log(`Processed recurring task ${recurringTask.$id}`);
      } catch (err) {
        errorCount++;
        error(`Error processing recurring task ${recurringTask.$id}: ${err.message}`);
      }
    }

    log(`Completed processing. Processed: ${processedCount}, Errors: ${errorCount}`);

    return res.json({
      success: true,
      processed: processedCount,
      errors: errorCount,
      total: recurringTasksResult.documents.length,
    });
  } catch (err) {
    error(`Fatal error in recurring tasks processor: ${err.message}`);
    return res.json({
      success: false,
      error: err.message,
    }, 500);
  }
};

/**
 * Check if recurring task should continue
 */
function checkShouldContinue(recurringTask) {
  // Check max occurrences
  if (recurringTask.maxOccurrences && recurringTask.occurrencesCount >= recurringTask.maxOccurrences) {
    return false;
  }

  // Check end date
  if (recurringTask.endDate) {
    const endDate = new Date(recurringTask.endDate);
    const now = new Date();
    if (now > endDate) {
      return false;
    }
  }

  return true;
}

/**
 * Calculate next occurrence based on recurrence pattern
 */
function calculateNextOccurrence(pattern, fromDate) {
  const nextDate = new Date(fromDate);

  switch (pattern.frequency) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + (pattern.interval || 1));
      break;

    case 'weekly': {
      const currentDay = nextDate.getDay();
      const daysOfWeek = pattern.daysOfWeek || [currentDay];
      
      // Find next occurrence day
      let daysToAdd = 0;
      let found = false;
      
      for (let i = 1; i <= 7; i++) {
        const checkDay = (currentDay + i) % 7;
        if (daysOfWeek.includes(checkDay)) {
          daysToAdd = i;
          found = true;
          break;
        }
      }
      
      if (!found) {
        daysToAdd = 7 * (pattern.interval || 1);
      }
      
      nextDate.setDate(nextDate.getDate() + daysToAdd);
      break;
    }

    case 'monthly': {
      const dayOfMonth = pattern.dayOfMonth || nextDate.getDate();
      nextDate.setMonth(nextDate.getMonth() + (pattern.interval || 1));
      
      // Handle months with fewer days
      const lastDayOfMonth = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate();
      nextDate.setDate(Math.min(dayOfMonth, lastDayOfMonth));
      break;
    }

    case 'yearly': {
      nextDate.setFullYear(nextDate.getFullYear() + (pattern.interval || 1));
      if (pattern.monthOfYear) {
        nextDate.setMonth(pattern.monthOfYear - 1);
      }
      if (pattern.dayOfMonth) {
        const lastDayOfMonth = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate();
        nextDate.setDate(Math.min(pattern.dayOfMonth, lastDayOfMonth));
      }
      break;
    }

    case 'custom':
      // For custom patterns, default to daily
      nextDate.setDate(nextDate.getDate() + 1);
      break;
  }

  return nextDate;
}
