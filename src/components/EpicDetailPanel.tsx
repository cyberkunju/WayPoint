import { useState, useEffect } from 'react';
import { epicService, type Epic, type EpicWithTasks, type EpicStatistics } from '@/services/epic.service';
import { taskService, type Task } from '@/services/task.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';
import {
  Rocket,
  PencilSimple,
  Trash,
  Calendar,
  ChartBar,
  ListChecks,
  Clock,
  Warning,
  CheckCircle,
  Circle,
  Pause,
  Archive,
  Prohibit,
} from '@phosphor-icons/react';

interface EpicDetailPanelProps {
  epicId: string;
  userId: string;
  onEdit: (epic: Epic) => void;
  onDelete: () => void;
  onClose: () => void;
}

const STATUS_CONFIG = {
  planning: { icon: Circle, label: 'Planning', color: 'text-blue-500' },
  in_progress: { icon: CheckCircle, label: 'In Progress', color: 'text-green-500' },
  on_hold: { icon: Pause, label: 'On Hold', color: 'text-yellow-500' },
  completed: { icon: CheckCircle, label: 'Completed', color: 'text-green-600' },
  archived: { icon: Archive, label: 'Archived', color: 'text-gray-500' },
  blocked: { icon: Prohibit, label: 'Blocked', color: 'text-red-500' },
};

export function EpicDetailPanel({
  epicId,
  userId,
  onEdit,
  onDelete,
  onClose,
}: EpicDetailPanelProps) {
  const [epicWithTasks, setEpicWithTasks] = useState<EpicWithTasks | null>(null);
  const [childEpics, setChildEpics] = useState<Epic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEpicData();
  }, [epicId, userId]);

  const loadEpicData = async () => {
    setIsLoading(true);
    try {
      const [data, children] = await Promise.all([
        epicService.getEpicWithTasks(epicId, userId),
        epicService.getChildEpics(epicId, userId),
      ]);
      setEpicWithTasks(data);
      setChildEpics(children);
    } catch (error) {
      console.error('Failed to load epic data:', error);
      toast.error('Failed to load epic details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEpic = async () => {
    if (!confirm('Are you sure you want to delete this epic? This will also delete all linked tasks and child epics.')) {
      return;
    }

    try {
      await epicService.deleteEpic(epicId, userId);
      toast.success('Epic deleted successfully');
      onDelete();
    } catch (error) {
      console.error('Failed to delete epic:', error);
      toast.error('Failed to delete epic');
    }
  };

  const handleUnlinkTask = async (taskId: string) => {
    try {
      await epicService.unlinkTaskFromEpic(taskId);
      toast.success('Task unlinked from epic');
      loadEpicData();
    } catch (error) {
      console.error('Failed to unlink task:', error);
      toast.error('Failed to unlink task');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading epic details...</p>
      </div>
    );
  }

  if (!epicWithTasks) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Epic not found</p>
      </div>
    );
  }

  const { statistics } = epicWithTasks;
  const StatusIcon = STATUS_CONFIG[epicWithTasks.status].icon;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Rocket size={32} className="text-primary" />
            <div>
              <h2 className="text-2xl font-bold">{epicWithTasks.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <StatusIcon size={16} className={STATUS_CONFIG[epicWithTasks.status].color} />
                <span className="text-sm text-muted-foreground">
                  {STATUS_CONFIG[epicWithTasks.status].label}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => onEdit(epicWithTasks)}
            >
              <PencilSimple size={16} />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteEpic}
            >
              <Trash size={16} />
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{epicWithTasks.progressPercentage}%</span>
          </div>
          <Progress value={epicWithTasks.progressPercentage} className="h-2" />
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <Tabs defaultValue="overview" className="p-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">
              Tasks ({epicWithTasks.tasks.length})
            </TabsTrigger>
            {childEpics.length > 0 && (
              <TabsTrigger value="children">
                Child Epics ({childEpics.length})
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Description */}
            {epicWithTasks.description && (
              <div className="space-y-2">
                <Label>Description</Label>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {epicWithTasks.description}
                </p>
              </div>
            )}

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar size={16} />
                  Start Date
                </Label>
                <p className="text-sm">
                  {epicWithTasks.startDate
                    ? new Date(epicWithTasks.startDate).toLocaleDateString()
                    : 'Not set'}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar size={16} />
                  End Date
                </Label>
                <p className="text-sm">
                  {epicWithTasks.endDate
                    ? new Date(epicWithTasks.endDate).toLocaleDateString()
                    : 'Not set'}
                </p>
              </div>
            </div>

            {/* Statistics */}
            <div className="space-y-4">
              <Label className="flex items-center gap-2">
                <ChartBar size={16} />
                Statistics
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Total Tasks</CardDescription>
                    <CardTitle className="text-3xl">{statistics.totalTasks}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Completed</CardDescription>
                    <CardTitle className="text-3xl text-green-600">
                      {statistics.completedTasks}
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>In Progress</CardDescription>
                    <CardTitle className="text-3xl text-blue-600">
                      {statistics.inProgressTasks}
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Overdue</CardDescription>
                    <CardTitle className="text-3xl text-red-600">
                      {statistics.overdueTasks}
                    </CardTitle>
                  </CardHeader>
                </Card>
              </div>
            </div>

            {/* Time Tracking */}
            {(statistics.estimatedTime > 0 || statistics.actualTime > 0) && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock size={16} />
                  Time Tracking
                </Label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Estimated</p>
                    <p className="text-lg font-medium">
                      {Math.round(statistics.estimatedTime / 60)}h
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Actual</p>
                    <p className="text-lg font-medium">
                      {Math.round(statistics.actualTime / 60)}h
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Variance</p>
                    <p className={`text-lg font-medium ${
                      statistics.timeVariance > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {statistics.timeVariance > 0 ? '+' : ''}{statistics.timeVariance}%
                    </p>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4 mt-6">
            {epicWithTasks.tasks.length === 0 ? (
              <div className="text-center py-8">
                <ListChecks size={48} className="mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No tasks linked to this epic</p>
              </div>
            ) : (
              <div className="space-y-2">
                {epicWithTasks.tasks.map((task) => (
                  <Card key={task.$id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {task.completed ? (
                              <CheckCircle size={16} className="text-green-600" />
                            ) : (
                              <Circle size={16} className="text-muted-foreground" />
                            )}
                            <span className={task.completed ? 'line-through text-muted-foreground' : ''}>
                              {task.title}
                            </span>
                          </div>
                          {task.dueDate && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar size={14} />
                              {new Date(task.dueDate).toLocaleDateString()}
                              {!task.completed && new Date(task.dueDate) < new Date() && (
                                <Badge variant="destructive" className="ml-2">Overdue</Badge>
                              )}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUnlinkTask(task.$id)}
                        >
                          Unlink
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {childEpics.length > 0 && (
            <TabsContent value="children" className="space-y-4 mt-6">
              <div className="space-y-2">
                {childEpics.map((childEpic) => (
                  <Card key={childEpic.$id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Rocket size={16} className="text-primary" />
                            <span className="font-medium">{childEpic.name}</span>
                            <Badge variant="outline">
                              {STATUS_CONFIG[childEpic.status].label}
                            </Badge>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-medium">{childEpic.progressPercentage}%</span>
                            </div>
                            <Progress value={childEpic.progressPercentage} className="h-1" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </ScrollArea>
    </div>
  );
}
