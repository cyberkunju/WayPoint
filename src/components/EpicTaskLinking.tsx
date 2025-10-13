import { useState, useEffect } from 'react';
import { epicService, type Epic } from '@/services/epic.service';
import { taskService, type Task } from '@/services/task.service';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { Link, MagnifyingGlass, CheckCircle, Circle } from '@phosphor-icons/react';

interface EpicTaskLinkingProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  epicId: string;
  userId: string;
  onLinked: () => void;
}

export function EpicTaskLinking({
  open,
  onOpenChange,
  epicId,
  userId,
  onLinked,
}: EpicTaskLinkingProps) {
  const [epic, setEpic] = useState<Epic | null>(null);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [linkedTaskIds, setLinkedTaskIds] = useState<Set<string>>(new Set());
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open, epicId, userId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [epicData, epicWithTasks, tasks] = await Promise.all([
        epicService.getEpic(epicId, userId),
        epicService.getEpicWithTasks(epicId, userId),
        taskService.listTasks({ userId, completed: false }),
      ]);

      setEpic(epicData);
      setAllTasks(tasks);

      // Track currently linked tasks
      const linked = new Set(epicWithTasks.tasks.map(t => t.$id));
      setLinkedTaskIds(linked);
      setSelectedTaskIds(new Set(linked));
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleTask = (taskId: string) => {
    setSelectedTaskIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Determine which tasks to link and unlink
      const tasksToLink = Array.from(selectedTaskIds).filter(
        (id) => !linkedTaskIds.has(id)
      );
      const tasksToUnlink = Array.from(linkedTaskIds).filter(
        (id) => !selectedTaskIds.has(id)
      );

      // Link new tasks
      if (tasksToLink.length > 0) {
        await epicService.linkTasksToEpic(tasksToLink, epicId);
      }

      // Unlink removed tasks
      if (tasksToUnlink.length > 0) {
        await epicService.unlinkTasksFromEpics(tasksToUnlink);
      }

      toast.success('Tasks linked successfully');
      onLinked();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to link tasks:', error);
      toast.error('Failed to link tasks');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTasks = allTasks.filter((task) => {
    if (searchQuery) {
      return task.title.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const selectedCount = selectedTaskIds.size;
  const changesCount = 
    Array.from(selectedTaskIds).filter(id => !linkedTaskIds.has(id)).length +
    Array.from(linkedTaskIds).filter(id => !selectedTaskIds.has(id)).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link size={24} />
            Link Tasks to Epic
          </DialogTitle>
          <DialogDescription>
            {epic ? `Select tasks to link to "${epic.name}"` : 'Loading...'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlass
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{selectedCount} selected</span>
            {changesCount > 0 && (
              <Badge variant="secondary">{changesCount} changes</Badge>
            )}
          </div>

          {/* Task List */}
          <ScrollArea className="h-[400px] border rounded-md">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Loading tasks...</p>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">
                  {searchQuery ? 'No tasks found' : 'No tasks available'}
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-2">
                {filteredTasks.map((task) => {
                  const isSelected = selectedTaskIds.has(task.$id);
                  const wasLinked = linkedTaskIds.has(task.$id);
                  const hasChanged = isSelected !== wasLinked;

                  return (
                    <div
                      key={task.$id}
                      className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-colors ${
                        isSelected ? 'bg-primary/5 border-primary' : 'hover:bg-secondary/50'
                      } ${hasChanged ? 'ring-2 ring-primary/20' : ''}`}
                      onClick={() => handleToggleTask(task.$id)}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleToggleTask(task.$id)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {task.completed ? (
                            <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                          ) : (
                            <Circle size={16} className="text-muted-foreground flex-shrink-0" />
                          )}
                          <span className={`truncate ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                            {task.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {task.priority && (
                            <Badge variant="outline" className="text-xs">
                              P{task.priority}
                            </Badge>
                          )}
                          {task.dueDate && (
                            <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
                          )}
                          {task.epicId && task.epicId !== epicId && (
                            <Badge variant="secondary" className="text-xs">
                              Already in another epic
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || changesCount === 0}
          >
            {isSubmitting ? 'Saving...' : `Link ${selectedCount} Tasks`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
