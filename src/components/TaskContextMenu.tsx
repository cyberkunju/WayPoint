import { 
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from './ui/context-menu';
import { 
  Trash,
  Copy,
  Calendar,
  Tag,
  User,
  Flag
} from '@phosphor-icons/react';
import { Task } from '../lib/types';
import { useTaskStore } from '../hooks/use-store';
import { toast } from 'sonner';

interface TaskContextMenuProps {
  task: Task;
  children: React.ReactNode;
}

export function TaskContextMenu({ task, children }: TaskContextMenuProps) {
  const { deleteTask, updateTask, addTask } = useTaskStore();

  const handleDelete = () => {
    deleteTask(task.id);
    toast.success('Task deleted');
  };

  const handleDuplicate = () => {
    // Create a duplicate task
    const duplicatedTask = {
      ...task,
      title: `${task.title} (Copy)`,
      completed: false,
    };
    
    addTask(duplicatedTask);
    toast.success('Task duplicated');
  };

  const handleTogglePriority = () => {
    const nextPriority = task.priority === 1 ? 4 : Math.max(1, task.priority - 1) as 1 | 2 | 3 | 4;
    updateTask(task.id, { priority: nextPriority });
    toast.success(`Priority changed to P${nextPriority}`);
  };

  const handleSetDueToday = () => {
    const today = new Date().toISOString().split('T')[0];
    updateTask(task.id, { dueDate: today });
    toast.success('Due date set to today');
  };

  const handleSetDueTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    updateTask(task.id, { dueDate: tomorrow.toISOString().split('T')[0] });
    toast.success('Due date set to tomorrow');
  };

  const handleRemoveDueDate = () => {
    updateTask(task.id, { dueDate: undefined });
    toast.success('Due date removed');
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuItem onClick={handleTogglePriority}>
          <Flag size={16} className="mr-2" />
          Change Priority
        </ContextMenuItem>
        
        <ContextMenuItem onClick={handleSetDueToday}>
          <Calendar size={16} className="mr-2" />
          Due Today
        </ContextMenuItem>
        
        <ContextMenuItem onClick={handleSetDueTomorrow}>
          <Calendar size={16} className="mr-2" />
          Due Tomorrow
        </ContextMenuItem>
        
        {task.dueDate && (
          <ContextMenuItem onClick={handleRemoveDueDate}>
            <Calendar size={16} className="mr-2" />
            Remove Due Date
          </ContextMenuItem>
        )}
        
        <ContextMenuSeparator />
        
        <ContextMenuItem onClick={handleDuplicate}>
          <Copy size={16} className="mr-2" />
          Duplicate Task
        </ContextMenuItem>
        
        <ContextMenuSeparator />
        
        <ContextMenuItem 
          onClick={handleDelete}
          className="text-destructive focus:text-destructive"
        >
          <Trash size={16} className="mr-2" />
          Delete Task
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}