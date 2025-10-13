import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Plus, X, Warning, ArrowRight } from '@phosphor-icons/react';
import { taskDependenciesService, type DependencyType, type TaskDependency } from '@/services/task-dependencies.service';
import { taskService, type Task } from '@/services/task.service';
import { useTaskStore } from '@/hooks/use-store';

interface TaskDependenciesProps {
  taskId: string;
  userId: string;
}

export function TaskDependencies({ taskId, userId }: TaskDependenciesProps) {
  const { tasks } = useTaskStore();
  const [dependencies, setDependencies] = useState<TaskDependency[]>([]);
  const [dependentTasks, setDependentTasks] = useState<TaskDependency[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [dependencyType, setDependencyType] = useState<DependencyType>('finish-to-start');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDependencies();
  }, [taskId, userId]);

  const loadDependencies = async () => {
    try {
      const [deps, depTasks] = await Promise.all([
        taskDependenciesService.getTaskDependencies(taskId, userId),
        taskDependenciesService.getDependentTasks(taskId, userId)
      ]);
      setDependencies(deps);
      setDependentTasks(depTasks);
    } catch (err) {
      console.error('Error loading dependencies:', err);
    }
  };

  const handleAddDependency = async () => {
    if (!selectedTaskId) {
      setError('Please select a task');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await taskDependenciesService.createDependency(
        {
          taskId,
          dependsOnTaskId: selectedTaskId,
          dependencyType
        },
        userId
      );

      await loadDependencies();
      setIsAdding(false);
      setSelectedTaskId('');
      setDependencyType('finish-to-start');
    } catch (err: any) {
      setError(err.message || 'Failed to add dependency');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDependency = async (dependencyId: string) => {
    try {
      await taskDependenciesService.deleteDependency(dependencyId);
      await loadDependencies();
    } catch (err) {
      console.error('Error removing dependency:', err);
    }
  };

  const getTaskTitle = (id: string) => {
    const task = tasks?.find(t => t.id === id);
    return task?.title || 'Unknown Task';
  };

  const getDependencyTypeLabel = (type: DependencyType) => {
    const labels: Record<DependencyType, string> = {
      'finish-to-start': 'Finish to Start',
      'start-to-start': 'Start to Start',
      'finish-to-finish': 'Finish to Finish',
      'start-to-finish': 'Start to Finish'
    };
    return labels[type];
  };

  // Filter out current task and already dependent tasks
  const availableTasks = tasks?.filter(t => 
    t.id !== taskId && 
    !dependencies.some(d => d.dependsOnTaskId === t.id)
  ) || [];

  return (
    <div className="space-y-4">
      {/* Blocked By (Dependencies) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-foreground">
            Blocked By
          </label>
          {!isAdding && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAdding(true)}
            >
              <Plus size={16} className="mr-1" />
              Add
            </Button>
          )}
        </div>

        {isAdding && (
          <div className="space-y-2 p-3 border border-border rounded-lg mb-2">
            <Select value={selectedTaskId} onValueChange={setSelectedTaskId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a task" />
              </SelectTrigger>
              <SelectContent>
                {availableTasks.map(task => (
                  <SelectItem key={task.id} value={task.id}>
                    {task.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={dependencyType} onValueChange={(v) => setDependencyType(v as DependencyType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="finish-to-start">Finish to Start</SelectItem>
                <SelectItem value="start-to-start">Start to Start</SelectItem>
                <SelectItem value="finish-to-finish">Finish to Finish</SelectItem>
                <SelectItem value="start-to-finish">Start to Finish</SelectItem>
              </SelectContent>
            </Select>

            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <Warning size={16} />
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleAddDependency}
                disabled={loading}
              >
                Add Dependency
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setIsAdding(false);
                  setError('');
                  setSelectedTaskId('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {dependencies.length === 0 && !isAdding && (
          <p className="text-sm text-muted-foreground">
            No dependencies
          </p>
        )}

        <div className="space-y-2">
          {dependencies.map(dep => (
            <div
              key={dep.$id}
              className="flex items-center justify-between p-2 border border-border rounded-lg"
            >
              <div className="flex-1">
                <div className="text-sm font-medium">
                  {getTaskTitle(dep.dependsOnTaskId)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {getDependencyTypeLabel(dep.dependencyType)}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveDependency(dep.$id)}
              >
                <X size={16} />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Blocking (Dependent Tasks) */}
      {dependentTasks.length > 0 && (
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Blocking
          </label>
          <div className="space-y-2">
            {dependentTasks.map(dep => (
              <div
                key={dep.$id}
                className="flex items-center gap-2 p-2 border border-border rounded-lg"
              >
                <ArrowRight size={16} className="text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-sm font-medium">
                    {getTaskTitle(dep.taskId)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {getDependencyTypeLabel(dep.dependencyType)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
