import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { TaskCard } from './TaskCard';
import { useTaskStore } from '../hooks/use-store';
import { Task } from '../lib/types';
import { Plus, Trash } from '@phosphor-icons/react';
import { toast } from 'sonner';

/**
 * SubtaskDemo Component
 * 
 * Demonstrates the subtask functionality including:
 * - Creating tasks with subtasks
 * - Progress calculation
 * - Drag-and-drop reordering
 * - Parent-child relationships
 * - Auto-completion logic
 */
export function SubtaskDemo() {
  const { tasks, addTask, addSubtask, deleteTaskWithSubtasks, userId } = useTaskStore();
  const [demoTaskId, setDemoTaskId] = useState<string | null>(null);

  // Find the demo task
  const demoTask = tasks?.find(t => t.id === demoTaskId);
  const demoSubtasks = tasks?.filter(t => t.parentId === demoTaskId) || [];

  const createDemoTask = async () => {
    try {
      const task = await addTask({
        title: 'Plan Project Launch',
        description: 'Complete all tasks required for the project launch',
        priority: 1,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });

      setDemoTaskId(task.id);

      // Add some demo subtasks
      const subtaskTitles = [
        'Design landing page mockups',
        'Set up hosting infrastructure',
        'Write product documentation',
        'Create marketing materials',
        'Schedule launch announcement',
      ];

      for (const title of subtaskTitles) {
        await addSubtask(task.id, {
          title,
          priority: 2,
        });
      }

      toast.success('Demo task created with 5 subtasks!');
    } catch (error) {
      console.error('Failed to create demo task:', error);
      toast.error('Failed to create demo task');
    }
  };

  const deleteDemoTask = async () => {
    if (!demoTaskId) return;

    try {
      await deleteTaskWithSubtasks(demoTaskId);
      setDemoTaskId(null);
      toast.success('Demo task and all subtasks deleted');
    } catch (error) {
      console.error('Failed to delete demo task:', error);
      toast.error('Failed to delete demo task');
    }
  };

  const addRandomSubtask = async () => {
    if (!demoTaskId) return;

    const randomTitles = [
      'Review code changes',
      'Update dependencies',
      'Run integration tests',
      'Deploy to staging',
      'Notify stakeholders',
      'Update changelog',
      'Create backup',
    ];

    const randomTitle = randomTitles[Math.floor(Math.random() * randomTitles.length)];

    try {
      await addSubtask(demoTaskId, {
        title: randomTitle,
        priority: 3,
      });
      toast.success('Subtask added!');
    } catch (error) {
      console.error('Failed to add subtask:', error);
      toast.error('Failed to add subtask');
    }
  };

  if (!userId) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-card border border-border rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-muted-foreground">
            Please log in to try the subtask demo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Subtasks & Hierarchies Demo</h1>
        <p className="text-muted-foreground">
          Explore the powerful subtask functionality with progress tracking, drag-and-drop reordering, and auto-completion.
        </p>
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        {!demoTask ? (
          <Button onClick={createDemoTask} className="gap-2">
            <Plus size={16} />
            Create Demo Task
          </Button>
        ) : (
          <>
            <Button onClick={addRandomSubtask} variant="outline" className="gap-2">
              <Plus size={16} />
              Add Random Subtask
            </Button>
            <Button onClick={deleteDemoTask} variant="destructive" className="gap-2">
              <Trash size={16} />
              Delete Demo Task
            </Button>
          </>
        )}
      </div>

      {/* Features List */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Features Demonstrated</h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary">✓</span>
            <span><strong>Progress Tracking:</strong> Visual progress bar shows completion percentage</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">✓</span>
            <span><strong>Auto-Completion:</strong> Parent task completes when all subtasks are done</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">✓</span>
            <span><strong>Drag & Drop:</strong> Reorder subtasks by dragging the handle</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">✓</span>
            <span><strong>Inline Creation:</strong> Add subtasks directly from the task card</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">✓</span>
            <span><strong>Expand/Collapse:</strong> Click the caret to show/hide subtasks</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">✓</span>
            <span><strong>Completion Count:</strong> See how many subtasks are complete at a glance</span>
          </li>
        </ul>
      </div>

      {/* Demo Task Display */}
      {demoTask && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Demo Task</h2>
          <TaskCard task={demoTask} />
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="text-2xl font-bold text-primary">
                {demoSubtasks.length}
              </div>
              <div className="text-sm text-muted-foreground">Total Subtasks</div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">
                {demoSubtasks.filter(s => s.completed).length}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-600">
                {demoSubtasks.filter(s => !s.completed).length}
              </div>
              <div className="text-sm text-muted-foreground">Remaining</div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      {demoTask && (
        <div className="bg-muted/50 border border-border rounded-lg p-6">
          <h3 className="font-semibold mb-3">Try These Actions:</h3>
          <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
            <li>Click the caret icon to expand and see all subtasks</li>
            <li>Check off subtasks and watch the progress bar update</li>
            <li>Try dragging subtasks to reorder them</li>
            <li>Add a new subtask using the "Add subtask" button</li>
            <li>Complete all subtasks and see the parent auto-complete</li>
            <li>Click on a subtask to view its details</li>
          </ol>
        </div>
      )}
    </div>
  );
}
