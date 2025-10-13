import { useState, useEffect } from 'react';
import { Plus, ArrowRight, CheckCircle, Circle, Clock } from '@phosphor-icons/react';
import { sprintService, type Sprint } from '@/services/sprint.service';

interface Task {
  $id: string;
  title: string;
  completed: boolean;
  priority: number;
  estimatedTime?: number;
  projectId?: string;
}

interface SprintBacklogProps {
  userId: string;
  projectId?: string;
  tasks: Task[];
  onTaskUpdate: (taskId: string, updates: any) => void;
  onRefresh: () => void;
}

export function SprintBacklog({
  userId,
  projectId,
  tasks,
  onTaskUpdate,
  onRefresh
}: SprintBacklogProps) {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [activeSprint, setActiveSprint] = useState<Sprint | null>(null);
  const [loading, setLoading] = useState(true);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);

  useEffect(() => {
    loadSprints();
  }, [userId, projectId]);

  const loadSprints = async () => {
    try {
      setLoading(true);
      const sprintsList = await sprintService.listSprints(userId, projectId);
      setSprints(sprintsList);
      
      const active = sprintsList.find(s => s.status === 'active');
      setActiveSprint(active || null);
    } catch (error) {
      console.error('Error loading sprints:', error);
    } finally {
      setLoading(false);
    }
  };

  const backlogTasks = tasks.filter(task => {
    const isInAnySprint = sprints.some(sprint => sprint.taskIds?.includes(task.$id));
    return !isInAnySprint && !task.completed;
  });

  const sprintTasks = (sprintId: string) => {
    const sprint = sprints.find(s => s.$id === sprintId);
    if (!sprint) return [];
    return tasks.filter(task => sprint.taskIds?.includes(task.$id));
  };

  const handleDragStart = (taskId: string) => {
    setDraggedTask(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropToSprint = async (e: React.DragEvent, sprintId: string) => {
    e.preventDefault();
    if (!draggedTask) return;

    try {
      await sprintService.addTaskToSprint(sprintId, draggedTask);
      setDraggedTask(null);
      loadSprints();
      onRefresh();
    } catch (error) {
      console.error('Error adding task to sprint:', error);
    }
  };

  const handleDropToBacklog = async (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedTask) return;

    try {
      // Remove from all sprints
      for (const sprint of sprints) {
        if (sprint.taskIds?.includes(draggedTask)) {
          await sprintService.removeTaskFromSprint(sprint.$id, draggedTask);
        }
      }
      setDraggedTask(null);
      loadSprints();
      onRefresh();
    } catch (error) {
      console.error('Error removing task from sprint:', error);
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'text-red-600 dark:text-red-400';
      case 2: return 'text-orange-600 dark:text-orange-400';
      case 3: return 'text-blue-600 dark:text-blue-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1: return 'P1';
      case 2: return 'P2';
      case 3: return 'P3';
      default: return 'P4';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Loading sprints...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex gap-4 overflow-hidden">
      {/* Backlog Column */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Product Backlog
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {backlogTasks.length} tasks
          </span>
        </div>

        <div
          className="flex-1 space-y-2 overflow-y-auto bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border-2 border-dashed border-gray-300 dark:border-gray-600"
          onDragOver={handleDragOver}
          onDrop={handleDropToBacklog}
        >
          {backlogTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
              <Circle size={48} className="mb-2" />
              <p>No tasks in backlog</p>
              <p className="text-sm">All tasks are assigned to sprints</p>
            </div>
          ) : (
            backlogTasks.map(task => (
              <div
                key={task.$id}
                draggable
                onDragStart={() => handleDragStart(task.$id)}
                className="bg-white dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600 cursor-move hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {getPriorityLabel(task.priority)}
                      </span>
                      {task.estimatedTime && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          <Clock size={12} className="inline mr-1" />
                          {task.estimatedTime}h
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Arrow */}
      <div className="flex items-center justify-center">
        <ArrowRight size={24} className="text-gray-400 dark:text-gray-500" />
      </div>

      {/* Sprint Columns */}
      <div className="flex-1 flex flex-col min-w-0">
        {activeSprint ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {activeSprint.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Active Sprint
                </p>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {sprintTasks(activeSprint.$id).length} tasks
              </span>
            </div>

            <div
              className="flex-1 space-y-2 overflow-y-auto bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border-2 border-dashed border-blue-300 dark:border-blue-700"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDropToSprint(e, activeSprint.$id)}
            >
              {sprintTasks(activeSprint.$id).length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
                  <Plus size={48} className="mb-2" />
                  <p>No tasks in sprint</p>
                  <p className="text-sm">Drag tasks from backlog</p>
                </div>
              ) : (
                sprintTasks(activeSprint.$id).map(task => (
                  <div
                    key={task.$id}
                    draggable
                    onDragStart={() => handleDragStart(task.$id)}
                    className="bg-white dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600 cursor-move hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                            {getPriorityLabel(task.priority)}
                          </span>
                          {task.estimatedTime && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              <Clock size={12} className="inline mr-1" />
                              {task.estimatedTime}h
                            </span>
                          )}
                          {task.completed && (
                            <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
            <div className="text-center text-gray-400 dark:text-gray-500">
              <Circle size={48} className="mx-auto mb-2" />
              <p>No active sprint</p>
              <p className="text-sm">Create and start a sprint to begin</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
