import { useState, useEffect } from 'react';
import { CheckCircle, Circle, Clock, ArrowRight } from '@phosphor-icons/react';
import { sprintService, type Sprint } from '@/services/sprint.service';

interface Task {
  $id: string;
  title: string;
  completed: boolean;
  priority: number;
  estimatedTime?: number;
  startDate?: string;
  description?: string;
}

interface SprintBoardProps {
  userId: string;
  projectId?: string;
  tasks: Task[];
  onTaskUpdate: (taskId: string, updates: any) => void;
  onTaskClick: (taskId: string) => void;
}

type BoardColumn = 'todo' | 'inProgress' | 'review' | 'done';

export function SprintBoard({
  userId,
  projectId,
  tasks,
  onTaskUpdate,
  onTaskClick
}: SprintBoardProps) {
  const [activeSprint, setActiveSprint] = useState<Sprint | null>(null);
  const [loading, setLoading] = useState(true);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);

  useEffect(() => {
    loadActiveSprint();
  }, [userId, projectId]);

  const loadActiveSprint = async () => {
    try {
      setLoading(true);
      const sprint = await sprintService.getActiveSprint(userId, projectId);
      setActiveSprint(sprint);
    } catch (error) {
      console.error('Error loading active sprint:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTaskColumn = (task: Task): BoardColumn => {
    if (task.completed) return 'done';
    if (task.startDate) return 'inProgress';
    // You could add a 'review' status field to tasks for this
    return 'todo';
  };

  const getColumnTasks = (column: BoardColumn) => {
    if (!activeSprint) return [];
    
    const sprintTasks = tasks.filter(task => activeSprint.taskIds?.includes(task.$id));
    return sprintTasks.filter(task => getTaskColumn(task) === column);
  };

  const handleDragStart = (taskId: string) => {
    setDraggedTask(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, column: BoardColumn) => {
    e.preventDefault();
    if (!draggedTask) return;

    const task = tasks.find(t => t.$id === draggedTask);
    if (!task) return;

    try {
      const updates: any = {};

      switch (column) {
        case 'todo':
          updates.startDate = null;
          updates.completed = false;
          break;
        case 'inProgress':
          updates.startDate = new Date().toISOString();
          updates.completed = false;
          break;
        case 'review':
          // Keep startDate, not completed
          updates.completed = false;
          break;
        case 'done':
          updates.completed = true;
          updates.completedAt = new Date().toISOString();
          break;
      }

      await onTaskUpdate(draggedTask, updates);
      setDraggedTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'border-l-4 border-l-red-500';
      case 2: return 'border-l-4 border-l-orange-500';
      case 3: return 'border-l-4 border-l-blue-500';
      default: return 'border-l-4 border-l-gray-400';
    }
  };

  const columns: Array<{ id: BoardColumn; title: string; icon: any; color: string }> = [
    { id: 'todo', title: 'To Do', icon: Circle, color: 'bg-gray-100 dark:bg-gray-800' },
    { id: 'inProgress', title: 'In Progress', icon: Clock, color: 'bg-blue-50 dark:bg-blue-900/20' },
    { id: 'review', title: 'Review', icon: ArrowRight, color: 'bg-yellow-50 dark:bg-yellow-900/20' },
    { id: 'done', title: 'Done', icon: CheckCircle, color: 'bg-green-50 dark:bg-green-900/20' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Loading sprint board...</div>
      </div>
    );
  }

  if (!activeSprint) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-gray-400 dark:text-gray-500">
          <Circle size={48} className="mx-auto mb-2" />
          <p className="text-lg font-medium">No Active Sprint</p>
          <p className="text-sm">Create and start a sprint to use the board</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Sprint Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {activeSprint.name}
        </h2>
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <span>
            {new Date(activeSprint.startDate).toLocaleDateString()} - {new Date(activeSprint.endDate).toLocaleDateString()}
          </span>
          <span>•</span>
          <span>{activeSprint.taskIds?.length || 0} tasks</span>
        </div>
      </div>

      {/* Board Columns */}
      <div className="flex-1 grid grid-cols-4 gap-4 overflow-hidden">
        {columns.map(column => {
          const columnTasks = getColumnTasks(column.id);
          const Icon = column.icon;

          return (
            <div key={column.id} className="flex flex-col min-h-0">
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Icon size={20} className="text-gray-600 dark:text-gray-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {column.title}
                  </h3>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {columnTasks.length}
                </span>
              </div>

              {/* Column Content */}
              <div
                className={`flex-1 ${column.color} rounded-lg p-3 space-y-2 overflow-y-auto border-2 border-dashed border-gray-300 dark:border-gray-600`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                {columnTasks.length === 0 ? (
                  <div className="flex items-center justify-center h-32 text-gray-400 dark:text-gray-500 text-sm">
                    Drop tasks here
                  </div>
                ) : (
                  columnTasks.map(task => (
                    <div
                      key={task.$id}
                      draggable
                      onDragStart={() => handleDragStart(task.$id)}
                      onClick={() => onTaskClick(task.$id)}
                      className={`bg-white dark:bg-gray-700 p-3 rounded-lg shadow-sm cursor-move hover:shadow-md transition-shadow ${getPriorityColor(task.priority)}`}
                    >
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        {task.estimatedTime && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            <Clock size={12} className="inline mr-1" />
                            {task.estimatedTime}h
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
