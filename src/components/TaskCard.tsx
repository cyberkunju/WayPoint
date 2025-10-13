import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { TaskContextMenu } from './TaskContextMenu';
import { SubtaskList } from './SubtaskList';
import { 
  CalendarBlank, 
  Tag, 
  User, 
  Circle,
  CheckCircle,
  DotsThree,
  DotsSixVertical,
  CaretDown,
  CaretRight
} from '@phosphor-icons/react';
import { Task } from '../lib/types';
import { formatDate, getPriorityColor, isOverdue } from '../lib/utils-tasks';
import { useTaskStore } from '../hooks/use-store';
import { useAppContext } from '../contexts/AppContext';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import { memo, useCallback, useMemo, useState } from 'react';

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
  isDraggedOver?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
  showProject?: boolean;
  compact?: boolean;
}

export const TaskCard = memo(function TaskCard({ task, isDragging, isDraggedOver, onDragStart, onDragEnd, showProject, compact }: TaskCardProps) {
  const { toggleTask, tasks } = useTaskStore();
  const { setSelectedTaskId, setIsDetailPanelOpen } = useAppContext();
  const [isExpanded, setIsExpanded] = useState(false);

  // Get subtasks for this task
  const subtasks = useMemo(() => 
    tasks?.filter(t => t.parentId === task.id) || [],
    [tasks, task.id]
  );

  const hasSubtasks = subtasks.length > 0;

  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    toggleTask(task.id);
    
    if (!task.completed) {
      toast.success('Task completed! 🎉');
    } else {
      toast('Task reopened');
    }
  }, [task.id, task.completed, toggleTask]);

  const handleClick = useCallback(() => {
    setSelectedTaskId(task.id);
    setIsDetailPanelOpen(true);
  }, [task.id, setSelectedTaskId, setIsDetailPanelOpen]);

  const handleToggleExpand = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  const handleSubtaskClick = useCallback((subtaskId: string) => {
    setSelectedTaskId(subtaskId);
    setIsDetailPanelOpen(true);
  }, [setSelectedTaskId, setIsDetailPanelOpen]);

  const priorityColor = useMemo(() => getPriorityColor(task.priority), [task.priority]);
  const overdue = useMemo(() => 
    task.dueDate && !task.completed && isOverdue(task.dueDate),
    [task.dueDate, task.completed]
  );

  return (
    <TaskContextMenu task={task}>
      <div 
        data-task-id={task.id}
        draggable
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        tabIndex={0}
        role="button"
        aria-label={`Task: ${task.title}. ${task.completed ? 'Completed' : 'Incomplete'}. Priority ${task.priority}. ${task.dueDate ? `Due ${formatDate(task.dueDate)}` : 'No due date'}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        className={cn(
          "group bg-card border border-border rounded-lg p-4 cursor-pointer transition-all duration-200",
          "hover:shadow-sm hover:bg-card/80 focus:ring-2 focus:ring-ring focus:outline-none",
          task.completed && "opacity-60",
          overdue && "border-l-4 border-l-destructive",
          isDragging && "opacity-50 rotate-2 scale-105",
          isDraggedOver && "border-primary border-2",
          compact && "p-3"
        )}
        onClick={handleClick}
      >
      <div className="flex items-start gap-3">
        {/* Expand/collapse button for tasks with subtasks */}
        {hasSubtasks && (
          <button
            type="button"
            onClick={handleToggleExpand}
            aria-label={isExpanded ? 'Collapse subtasks' : 'Expand subtasks'}
            className="mt-0.5 text-muted-foreground hover:text-foreground transition-colors focus:ring-2 focus:ring-ring focus:outline-none rounded"
          >
            {isExpanded ? (
              <CaretDown size={16} weight="bold" />
            ) : (
              <CaretRight size={16} weight="bold" />
            )}
          </button>
        )}

        <button
          type="button"
          onClick={handleToggle}
          aria-label={task.completed ? `Mark "${task.title}" as incomplete` : `Mark "${task.title}" as complete`}
          className={cn(
            "mt-0.5 text-muted-foreground hover:text-foreground transition-colors focus:ring-2 focus:ring-ring focus:outline-none rounded",
            !hasSubtasks && "ml-0"
          )}
        >
          {task.completed ? (
            <CheckCircle size={20} className="text-primary" />
          ) : (
            <Circle size={20} />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={cn(
              "font-medium text-foreground",
              task.completed && "line-through text-muted-foreground"
            )}>
              {task.title}
            </h3>
            {hasSubtasks && (
              <span className="text-xs text-muted-foreground">
                ({subtasks.filter(s => s.completed).length}/{subtasks.length})
              </span>
            )}
          </div>

          {task.description && (
            <p className="text-sm text-muted-foreground mb-2 overflow-hidden">
              {task.description.length > 100 ? task.description.substring(0, 100) + '...' : task.description}
            </p>
          )}

          <div className="flex items-center gap-2 flex-wrap mb-2">
            {task.dueDate && (
              <Badge 
                variant="outline" 
                className={cn(
                  "gap-1 text-xs",
                  overdue && "border-destructive text-destructive"
                )}
              >
                <CalendarBlank size={12} />
                {formatDate(task.dueDate)}
              </Badge>
            )}

            {task.labels.map((label) => (
              <Badge key={label} variant="secondary" className="gap-1 text-xs">
                <Tag size={12} />
                {label}
              </Badge>
            ))}

            {task.assignee && (
              <Badge variant="outline" className="gap-1 text-xs">
                <User size={12} />
                {task.assignee}
              </Badge>
            )}

            {task.priority < 4 && (
              <div className={cn("text-xs font-medium", priorityColor)}>
                P{task.priority}
              </div>
            )}
          </div>

          {/* Subtasks section */}
          {hasSubtasks && isExpanded && (
            <div className="mt-3 pl-4 border-l-2 border-muted">
              <SubtaskList 
                parentTask={task}
                subtasks={subtasks}
                onSubtaskClick={handleSubtaskClick}
              />
            </div>
          )}
        </div>

        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <DotsThree size={16} />
          </Button>
          <div className="cursor-grab active:cursor-grabbing">
            <DotsSixVertical size={16} className="text-muted-foreground" />
          </div>
        </div>
      </div>
    </div>
    </TaskContextMenu>
  );
});