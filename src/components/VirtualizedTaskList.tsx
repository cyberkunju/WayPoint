import { useRef, useEffect, useState } from 'react';
import * as ReactWindow from 'react-window';
import { QuickAddBar } from './QuickAddBar';
import { TaskCard } from './TaskCard';
import { useTaskStore } from '../hooks/use-store';
import { useAppContext } from '../contexts/AppContext';
import { useDragAndDrop } from '../hooks/use-drag-drop';
import { filterTasks, sortTasks } from '../lib/utils-tasks';
import { Task } from '../lib/types';

const FixedSizeList = (ReactWindow as any).FixedSizeList;

interface VirtualTaskRowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    tasks: Task[];
    draggedItem: string | null;
    draggedOver: string | null;
    handleDragStart: (e: React.DragEvent, id: string) => void;
    handleDragEnd: () => void;
    handleDragOver: (e: React.DragEvent, id: string) => void;
    handleDragLeave: () => void;
    handleDrop: (e: React.DragEvent, targetId: string, callback: (draggedId: string, targetId: string) => void) => void;
    handleTaskReorder: (draggedTaskId: string, targetTaskId: string) => void;
  };
}

const VirtualTaskRow = ({ index, style, data }: VirtualTaskRowProps) => {
  const task = data.tasks[index];
  
  return (
    <div
      style={style}
      onDragOver={(e) => data.handleDragOver(e, task.id)}
      onDragLeave={data.handleDragLeave}
      onDrop={(e) => data.handleDrop(e, task.id, data.handleTaskReorder)}
    >
      <div className="px-2 pb-3">
        <TaskCard
          task={task}
          isDragging={data.draggedItem === task.id}
          isDraggedOver={data.draggedOver === task.id}
          onDragStart={(e) => data.handleDragStart(e, task.id)}
          onDragEnd={data.handleDragEnd}
        />
      </div>
    </div>
  );
};

export function VirtualizedTaskList() {
  const { tasks, projects, updateTask } = useTaskStore();
  const { currentView, searchQuery } = useAppContext();
  const {
    draggedItem,
    draggedOver,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  } = useDragAndDrop();
  
  const listRef = useRef<any>(null);
  const [listHeight, setListHeight] = useState(600);

  // Update list height based on window size
  useEffect(() => {
    const updateHeight = () => {
      // Calculate available height: viewport height - header - quick add bar - padding
      const height = Math.min(window.innerHeight - 300, 800);
      setListHeight(height);
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  const handleTaskReorder = (draggedTaskId: string, targetTaskId: string) => {
    const draggedTask = tasks?.find((t) => t.id === draggedTaskId);
    const targetTask = tasks?.find((t) => t.id === targetTaskId);

    if (draggedTask && targetTask) {
      updateTask(draggedTaskId, { updatedAt: new Date().toISOString() });
    }
  };

  const getFilteredTasks = () => {
    let filtered = tasks || [];

    // Apply view-specific filters
    switch (currentView) {
      case 'inbox':
        filtered = filterTasks(filtered, { completed: false });
        break;
      case 'today':
        filtered = filterTasks(filtered, {
          completed: false,
          dueDate: 'today',
        });
        break;
      case 'upcoming':
        filtered = filterTasks(filtered, {
          completed: false,
          dueDate: 'upcoming',
        });
        break;
      default:
        // Check if it's a project view
        if (currentView !== 'analytics' && currentView !== 'settings') {
          filtered = filterTasks(filtered, {
            completed: false,
            projectId: currentView,
          });
        }
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filterTasks(filtered, { search: searchQuery });
    }

    return sortTasks(filtered, 'priority');
  };

  const filteredTasks = getFilteredTasks();

  const getViewTitle = () => {
    switch (currentView) {
      case 'inbox':
        return 'Inbox';
      case 'today':
        return 'Today';
      case 'upcoming':
        return 'Upcoming';
      default: {
        const project = projects?.find((p) => p.id === currentView);
        return project ? project.name : 'Tasks';
      }
    }
  };

  const itemData = {
    tasks: filteredTasks,
    draggedItem,
    draggedOver,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleTaskReorder,
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="heading-1 text-foreground mb-2">{getViewTitle()}</h1>
        <p className="text-muted-foreground">
          {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
        </p>
      </div>

      <QuickAddBar />

      <div className="mt-6">
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
          <FixedSizeList
            ref={listRef}
            height={listHeight}
            itemCount={filteredTasks.length}
            itemSize={100} // Approximate height per task
            width="100%"
            itemData={itemData}
          >
            {VirtualTaskRow}
          </FixedSizeList>
        )}
      </div>
    </div>
  );
}
