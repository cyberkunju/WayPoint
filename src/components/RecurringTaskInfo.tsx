import { useState, useEffect } from 'react';
import { Repeat, Calendar, X } from 'lucide-react';
import {
  recurringTasksService,
  type RecurringTask,
  type RecurrencePattern,
} from '@/services/recurring-tasks.service';
import { RecurringTaskDialog } from './RecurringTaskDialog';

interface RecurringTaskInfoProps {
  taskId: string;
  userId: string;
  onUpdate?: () => void;
}

export function RecurringTaskInfo({ taskId, userId, onUpdate }: RecurringTaskInfoProps) {
  const [recurringTask, setRecurringTask] = useState<RecurringTask | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecurringTask();
  }, [taskId, userId]);

  const loadRecurringTask = async () => {
    try {
      setLoading(true);
      const task = await recurringTasksService.getRecurringTaskByTaskId(taskId, userId);
      setRecurringTask(task);
    } catch (error) {
      console.error('Failed to load recurring task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRecurrence = async (
    pattern: RecurrencePattern,
    endDate?: string,
    maxOccurrences?: number
  ) => {
    try {
      const patternJson = recurringTasksService.stringifyRecurrencePattern(pattern);
      const nextOccurrence = recurringTasksService.calculateNextOccurrence(pattern);

      if (recurringTask) {
        // Update existing recurring task
        await recurringTasksService.updateRecurringTask(recurringTask.$id, {
          recurrencePattern: patternJson,
          nextOccurrence: nextOccurrence.toISOString(),
          endDate,
          maxOccurrences,
        });
      } else {
        // Create new recurring task
        await recurringTasksService.createRecurringTask(
          {
            taskId,
            recurrencePattern: patternJson,
            nextOccurrence: nextOccurrence.toISOString(),
            endDate,
            maxOccurrences,
          },
          userId
        );
      }

      await loadRecurringTask();
      onUpdate?.();
    } catch (error) {
      console.error('Failed to save recurrence:', error);
    }
  };

  const handleRemoveRecurrence = async () => {
    if (!recurringTask) return;

    try {
      await recurringTasksService.deleteRecurringTask(recurringTask.$id);
      setRecurringTask(null);
      onUpdate?.();
    } catch (error) {
      console.error('Failed to remove recurrence:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Repeat className="w-4 h-4 animate-spin" />
        <span>Loading...</span>
      </div>
    );
  }

  const pattern = recurringTask
    ? recurringTasksService.parseRecurrencePattern(recurringTask.recurrencePattern)
    : null;

  const description = pattern
    ? recurringTasksService.getRecurrenceDescription(pattern)
    : null;

  return (
    <div className="space-y-2">
      {recurringTask ? (
        <div className="flex items-start justify-between gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <Repeat className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {description}
              </span>
            </div>
            
            {recurringTask.nextOccurrence && (
              <div className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300">
                <Calendar className="w-3 h-3" />
                <span>
                  Next: {new Date(recurringTask.nextOccurrence).toLocaleDateString()}
                </span>
              </div>
            )}

            {recurringTask.maxOccurrences && (
              <div className="text-xs text-blue-700 dark:text-blue-300">
                {recurringTask.occurrencesCount} of {recurringTask.maxOccurrences} occurrences
              </div>
            )}

            {recurringTask.endDate && (
              <div className="text-xs text-blue-700 dark:text-blue-300">
                Ends: {new Date(recurringTask.endDate).toLocaleDateString()}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsDialogOpen(true)}
              className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded"
              title="Edit recurrence"
            >
              <Repeat className="w-4 h-4" />
            </button>
            <button
              onClick={handleRemoveRecurrence}
              className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded"
              title="Remove recurrence"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md w-full"
        >
          <Repeat className="w-4 h-4" />
          <span>Make recurring</span>
        </button>
      )}

      <RecurringTaskDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveRecurrence}
        initialPattern={pattern || undefined}
        initialEndDate={recurringTask?.endDate}
        initialMaxOccurrences={recurringTask?.maxOccurrences}
      />
    </div>
  );
}
