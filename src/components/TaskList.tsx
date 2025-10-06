import { useMemo, memo } from 'react';
import { QuickAddBar } from './QuickAddBar';
import { TaskCard } from './TaskCard';
import { VirtualizedTaskList } from './VirtualizedTaskList';
import { useTaskStore } from '../hooks/use-store';
import { useAppContext } from '../contexts/AppContext';
import { useDragAndDrop } from '../hooks/use-drag-drop';
import { useVirtualization } from '../hooks/use-virtualization';
import { filterTasks, sortTasks } from '../lib/utils-tasks';

export const TaskList = memo(function TaskList() {
  const { tasks, projects, updateTask } = useTaskStore();
  const { currentView, searchQuery } = useAppContext();
  const { 
    draggedItem, 
    draggedOver, 
    handleDragStart, 
    handleDragEnd, 
    handleDragOver, 
    handleDragLeave, 
    handleDrop 
  } = useDragAndDrop();

  const handleTaskReorder = (draggedTaskId: string, targetTaskId: string) => {
    // Simple reordering logic - in a real app you might want more sophisticated ordering
    const draggedTask = tasks?.find(t => t.id === draggedTaskId);
    const targetTask = tasks?.find(t => t.id === targetTaskId);
    
    if (draggedTask && targetTask) {
      // For now, we'll just update the updatedAt timestamp to change order
      updateTask(draggedTaskId, { updatedAt: new Date().toISOString() });
    }
  };

  // Memoize filtered tasks to prevent recalculation on every render
  const filteredTasks = useMemo(() => {
    let filtered = tasks || [];

    // Apply view-specific filters
    switch (currentView) {
      case 'inbox':
        filtered = filterTasks(filtered, { completed: false });
        break;
      case 'today':
        filtered = filterTasks(filtered, { 
          completed: false, 
          dueDate: 'today' 
        });
        break;
      case 'upcoming':
        filtered = filterTasks(filtered, { 
          completed: false, 
          dueDate: 'upcoming' 
        });
        break;
      default:
        // Check if it's a project view
        if (currentView !== 'analytics' && currentView !== 'settings') {
          filtered = filterTasks(filtered, { 
            completed: false,
            projectId: currentView 
          });
        }
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filterTasks(filtered, { search: searchQuery });
    }

    return sortTasks(filtered, 'priority');
  }, [tasks, currentView, searchQuery]);
  const shouldVirtualize = useVirtualization(filteredTasks.length);

  const getViewTitle = () => {
    switch (currentView) {
      case 'inbox': return 'Inbox';
      case 'today': return 'Today';
      case 'upcoming': return 'Upcoming';
      default: {
        // Check if it's a project view
        const project = projects?.find(p => p.id === currentView);
        return project ? project.name : 'Tasks';
      }
    }
  };

  // Use virtualized list for large datasets
  if (shouldVirtualize) {
    return <VirtualizedTaskList />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="heading-1 text-foreground mb-2">
          {getViewTitle()}
        </h1>
        <p className="text-muted-foreground">
          {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
        </p>
      </div>

      <QuickAddBar />

      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-2">
              {searchQuery ? 'No tasks found matching your search' : 'No tasks yet'}
            </div>
            <p className="text-sm text-muted-foreground">
              {!searchQuery && 'Add your first task using the input above'}
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              onDragOver={(e) => handleDragOver(e, task.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, task.id, handleTaskReorder)}
            >
              <TaskCard 
                task={task}
                isDragging={draggedItem === task.id}
                isDraggedOver={draggedOver === task.id}
                onDragStart={(e) => handleDragStart(e, task.id)}
                onDragEnd={handleDragEnd}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
});