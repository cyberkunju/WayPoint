import { memo, useState, useCallback } from 'react';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { Plus, X, DotsSixVertical } from '@phosphor-icons/react';
import { Task } from '../lib/types';
import { useTaskStore } from '../hooks/use-store';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

interface SubtaskListProps {
  parentTask: Task;
  subtasks: Task[];
  onSubtaskClick?: (subtaskId: string) => void;
}

export const SubtaskList = memo(function SubtaskList({ 
  parentTask, 
  subtasks,
  onSubtaskClick 
}: SubtaskListProps) {
  const { addSubtask, toggleTask, deleteTask, updateTask, reorderTask } = useTaskStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [draggedSubtask, setDraggedSubtask] = useState<string | null>(null);
  const [draggedOver, setDraggedOver] = useState<string | null>(null);

  const handleAddSubtask = useCallback(async () => {
    if (!newSubtaskTitle.trim()) return;

    try {
      await addSubtask(parentTask.id, {
        title: newSubtaskTitle.trim(),
        projectId: parentTask.projectId,
        priority: parentTask.priority,
      });
      
      setNewSubtaskTitle('');
      setIsAdding(false);
      toast.success('Subtask added');
    } catch (error) {
      console.error('Failed to add subtask:', error);
      toast.error('Failed to add subtask');
    }
  }, [newSubtaskTitle, parentTask, addSubtask]);

  const handleToggleSubtask = useCallback(async (subtaskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await toggleTask(subtaskId);
    } catch (error) {
      console.error('Failed to toggle subtask:', error);
      toast.error('Failed to update subtask');
    }
  }, [toggleTask]);

  const handleDeleteSubtask = useCallback(async (subtaskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteTask(subtaskId);
      toast.success('Subtask deleted');
    } catch (error) {
      console.error('Failed to delete subtask:', error);
      toast.error('Failed to delete subtask');
    }
  }, [deleteTask]);

  const handleDragStart = useCallback((e: React.DragEvent, subtaskId: string) => {
    setDraggedSubtask(subtaskId);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedSubtask(null);
    setDraggedOver(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, subtaskId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDraggedOver(subtaskId);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDraggedOver(null);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent, targetSubtaskId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedSubtask || draggedSubtask === targetSubtaskId) {
      setDraggedSubtask(null);
      setDraggedOver(null);
      return;
    }

    try {
      const draggedIndex = subtasks.findIndex(s => s.id === draggedSubtask);
      const targetIndex = subtasks.findIndex(s => s.id === targetSubtaskId);
      
      if (draggedIndex !== -1 && targetIndex !== -1) {
        await reorderTask(draggedSubtask, targetIndex, parentTask.projectId, parentTask.id);
        toast.success('Subtask reordered');
      }
    } catch (error) {
      console.error('Failed to reorder subtask:', error);
      toast.error('Failed to reorder subtask');
    }

    setDraggedSubtask(null);
    setDraggedOver(null);
  }, [draggedSubtask, subtasks, parentTask, reorderTask]);

  const completedCount = subtasks.filter(s => s.completed).length;
  const progress = subtasks.length > 0 ? Math.round((completedCount / subtasks.length) * 100) : 0;

  return (
    <div className="space-y-2">
      {/* Progress indicator */}
      {subtasks.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs font-medium">
            {completedCount}/{subtasks.length}
          </span>
        </div>
      )}

      {/* Subtask list */}
      <div className="space-y-1">
        {subtasks.map((subtask) => (
          <div
            key={subtask.id}
            draggable
            onDragStart={(e) => handleDragStart(e, subtask.id)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, subtask.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, subtask.id)}
            onClick={() => onSubtaskClick?.(subtask.id)}
            className={cn(
              "group flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors",
              draggedSubtask === subtask.id && "opacity-50",
              draggedOver === subtask.id && "bg-muted border-2 border-primary"
            )}
          >
            <div className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity">
              <DotsSixVertical size={14} className="text-muted-foreground" />
            </div>
            
            <Checkbox
              checked={subtask.completed}
              onCheckedChange={(e) => handleToggleSubtask(subtask.id, e as any)}
              onClick={(e) => e.stopPropagation()}
              aria-label={`Mark subtask "${subtask.title}" as ${subtask.completed ? 'incomplete' : 'complete'}`}
            />
            
            <span 
              className={cn(
                "flex-1 text-sm",
                subtask.completed && "line-through text-muted-foreground"
              )}
            >
              {subtask.title}
            </span>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => handleDeleteSubtask(subtask.id, e)}
              aria-label={`Delete subtask "${subtask.title}"`}
            >
              <X size={14} />
            </Button>
          </div>
        ))}
      </div>

      {/* Add subtask input */}
      {isAdding ? (
        <div className="flex items-center gap-2">
          <Input
            autoFocus
            placeholder="Subtask title..."
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddSubtask();
              } else if (e.key === 'Escape') {
                setIsAdding(false);
                setNewSubtaskTitle('');
              }
            }}
            onBlur={() => {
              if (!newSubtaskTitle.trim()) {
                setIsAdding(false);
              }
            }}
            className="flex-1 h-8 text-sm"
          />
          <Button
            size="sm"
            onClick={handleAddSubtask}
            disabled={!newSubtaskTitle.trim()}
            className="h-8"
          >
            Add
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsAdding(false);
              setNewSubtaskTitle('');
            }}
            className="h-8"
          >
            Cancel
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsAdding(true)}
          className="w-full justify-start gap-2 h-8 text-muted-foreground hover:text-foreground"
        >
          <Plus size={14} />
          Add subtask
        </Button>
      )}
    </div>
  );
});
