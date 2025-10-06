import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { TaskCard } from './TaskCard';
import { Button } from './ui/button';
import { Plus } from '@phosphor-icons/react';
import { useTaskStore } from '../hooks/use-store';
import { useAppContext } from '../contexts/AppContext';
import { useDragAndDrop } from '../hooks/use-drag-drop';
import { filterTasks } from '../lib/utils-tasks';
import { Task } from '../lib/types';
import { cn } from '../lib/utils';

interface KanbanColumn {
  id: string;
  title: string;
  filter: (task: Task) => boolean;
  color: string;
}

const defaultColumns: KanbanColumn[] = [
  {
    id: 'todo',
    title: 'To Do',
    filter: (task) => !task.completed && !task.dueDate,
    color: 'bg-muted'
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    filter: (task) => !task.completed && !!task.dueDate && new Date(task.dueDate) >= new Date(),
    color: 'bg-blue-50 dark:bg-blue-950'
  },
  {
    id: 'review',
    title: 'Review',
    filter: (task) => !task.completed && task.priority <= 2,
    color: 'bg-orange-50 dark:bg-orange-950'
  },
  {
    id: 'completed',
    title: 'Completed',
    filter: (task) => task.completed,
    color: 'bg-green-50 dark:bg-green-950'
  }
];

export function KanbanBoard() {
  const { tasks, addTask, updateTask } = useTaskStore();
  const { searchQuery, currentView } = useAppContext();
  const { 
    draggedItem, 
    draggedOver, 
    handleDragStart, 
    handleDragEnd, 
    handleDragOver, 
    handleDragLeave, 
    handleDrop 
  } = useDragAndDrop();
  
  const [showAddTask, setShowAddTask] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const getFilteredTasks = () => {
    let filtered = tasks || [];

    // Apply current view filters first
    if (currentView !== 'inbox' && currentView !== 'analytics' && currentView !== 'settings') {
      filtered = filterTasks(filtered, { projectId: currentView });
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filterTasks(filtered, { search: searchQuery });
    }

    return filtered;
  };

  const filteredTasks = getFilteredTasks();

  const getColumnTasks = (column: KanbanColumn) => {
    return filteredTasks.filter(column.filter);
  };

  const handleTaskMove = (taskId: string, targetColumnId: string) => {
    const task = tasks?.find(t => t.id === taskId);
    if (!task) return;

    // Update task based on target column
    let updates: Partial<Task> = {};
    
    switch (targetColumnId) {
      case 'todo':
        updates = { completed: false, dueDate: undefined };
        break;
      case 'in-progress':
        updates = { 
          completed: false, 
          dueDate: task.dueDate || new Date().toISOString()
        };
        break;
      case 'review':
        updates = { completed: false, priority: Math.min(task.priority, 2) as 1 | 2 };
        break;
      case 'completed':
        updates = { completed: true };
        break;
    }

    updateTask(taskId, updates);
  };

  const handleColumnDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    if (draggedItem) {
      handleTaskMove(draggedItem, columnId);
    }
    handleDragEnd();
  };

  const handleAddTask = (columnId: string) => {
    if (!newTaskTitle.trim()) return;

    let taskData: Partial<Task> = {
      title: newTaskTitle,
      projectId: currentView !== 'inbox' ? currentView : undefined
    };

    // Set defaults based on column
    switch (columnId) {
      case 'in-progress':
        taskData.dueDate = new Date().toISOString();
        break;
      case 'review':
        taskData.priority = 2;
        break;
      case 'completed':
        taskData.completed = true;
        break;
    }

    addTask(taskData);
    setNewTaskTitle('');
    setShowAddTask(null);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h1 className="heading-1 text-foreground mb-2">Kanban Board</h1>
        <p className="text-muted-foreground">
          Organize your tasks by workflow stage
        </p>
      </div>

      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-6 h-full min-w-max pb-6">
          {defaultColumns.map((column) => {
            const columnTasks = getColumnTasks(column);
            
            return (
              <div
                key={column.id}
                className="w-80 flex flex-col"
              >
                <Card className={cn("flex-1 flex flex-col", column.color)}>
                  <div className="p-4 border-b border-border">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground">
                        {column.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {columnTasks.length}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowAddTask(column.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Plus size={14} />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <CardContent 
                    className="flex-1 p-4 space-y-3 min-h-96 overflow-y-auto"
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDrop={(e) => handleColumnDrop(e, column.id)}
                  >
                    {showAddTask === column.id && (
                      <Card className="p-3 border-dashed border-2 border-muted-foreground/25">
                        <input
                          type="text"
                          placeholder="Task title..."
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleAddTask(column.id);
                            } else if (e.key === 'Escape') {
                              setShowAddTask(null);
                              setNewTaskTitle('');
                            }
                          }}
                          onBlur={() => {
                            if (newTaskTitle.trim()) {
                              handleAddTask(column.id);
                            } else {
                              setShowAddTask(null);
                            }
                          }}
                          className="w-full bg-transparent border-none outline-none text-sm"
                          autoFocus
                        />
                      </Card>
                    )}

                    {columnTasks.length === 0 && showAddTask !== column.id ? (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        No tasks in {column.title.toLowerCase()}
                      </div>
                    ) : (
                      columnTasks.map((task) => (
                        <div
                          key={task.id}
                          className={cn(
                            "transition-transform duration-150",
                            draggedItem === task.id && "rotate-3 scale-105 opacity-80"
                          )}
                        >
                          <TaskCard 
                            task={task}
                            isDragging={draggedItem === task.id}
                            isDraggedOver={draggedOver === task.id}
                            onDragStart={(e) => handleDragStart(e, task.id)}
                            onDragEnd={handleDragEnd}
                            showProject={currentView === 'inbox'}
                            compact
                          />
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}