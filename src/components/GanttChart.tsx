import React, { useState, useMemo, useEffect } from 'react';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CaretLeft, CaretRight, Lightning, Graph } from '@phosphor-icons/react';
import { useTaskStore } from '@/hooks/use-store';
import { Task } from '@/lib/types';
import { taskDependenciesService, type TaskDependency } from '@/services/task-dependencies.service';
import { account } from '@/lib/appwrite';
import { DependencyGraph } from './DependencyGraph';

type TimeScale = 'day' | 'week' | 'month';

interface TaskWithDates extends Task {
  startDateObj: Date;
  endDateObj: Date;
}

export function GanttChart() {
  const { tasks, projects } = useTaskStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [timeScale, setTimeScale] = useState<TimeScale>('week');
  const [dependencies, setDependencies] = useState<TaskDependency[]>([]);
  const [criticalPath, setCriticalPath] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string>('');
  const [showCriticalPath, setShowCriticalPath] = useState(false);
  const [showDependencyGraph, setShowDependencyGraph] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const user = await account.get();
        setUserId(user.$id);
        
        // Load all dependencies
        const deps = await taskDependenciesService.getAllDependencies(user.$id);
        setDependencies(deps);
      } catch (err) {
        console.error('Error initializing Gantt chart:', err);
      }
    };
    init();
  }, []);

  // Calculate critical path for the current project
  useEffect(() => {
    const calculateCritical = async () => {
      if (!userId || !tasks || tasks.length === 0) return;
      
      try {
        // Get unique project IDs from tasks with dates
        const projectIds = [...new Set(tasksWithDates.map(t => t.projectId).filter(Boolean))];
        
        if (projectIds.length > 0) {
          // Calculate critical path for the first project (or you could do all)
          const criticalNodes = await taskDependenciesService.calculateCriticalPath(
            projectIds[0] as string,
            userId
          );
          
          const criticalTaskIds = new Set(criticalNodes.map(n => n.taskId));
          setCriticalPath(criticalTaskIds);
        }
      } catch (err) {
        console.error('Error calculating critical path:', err);
      }
    };
    
    if (showCriticalPath) {
      calculateCritical();
    }
  }, [userId, tasks, showCriticalPath]);

  // Filter tasks that have both start and due dates for the Gantt chart
  const tasksWithDates = useMemo(() => {
    if (!tasks) return [];
    
    return tasks
      .filter(task => task.dueDate && task.startDate)
      .map(task => ({
        ...task,
        startDateObj: new Date(task.startDate!),
        endDateObj: new Date(task.dueDate!)
      })) as TaskWithDates[];
  }, [tasks]);

  // Generate time periods based on scale
  const timePeriods = useMemo(() => {
    const start = startOfWeek(currentDate);
    const end = endOfWeek(addDays(currentDate, timeScale === 'day' ? 6 : timeScale === 'week' ? 41 : 90));
    
    if (timeScale === 'day') {
      return eachDayOfInterval({ start, end });
    }
    
    // For week and month, we'll generate weekly intervals
    const periods: Date[] = [];
    let current = start;
    while (current <= end) {
      periods.push(current);
      current = addDays(current, 7);
    }
    return periods;
  }, [currentDate, timeScale]);

  const getTaskPosition = (task: TaskWithDates) => {
    const chartStart = timePeriods[0];
    const chartEnd = timePeriods[timePeriods.length - 1];
    
    const taskStart = task.startDateObj < chartStart ? chartStart : task.startDateObj;
    const taskEnd = task.endDateObj > chartEnd ? chartEnd : task.endDateObj;
    
    const totalDays = Math.max(1, Math.ceil((chartEnd.getTime() - chartStart.getTime()) / (1000 * 60 * 60 * 24)));
    const startOffset = Math.max(0, Math.ceil((taskStart.getTime() - chartStart.getTime()) / (1000 * 60 * 60 * 24)));
    const duration = Math.max(1, Math.ceil((taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24)));
    
    return {
      left: `${(startOffset / totalDays) * 100}%`,
      width: `${(duration / totalDays) * 100}%`
    };
  };

  const getTaskColor = (task: Task, isCritical: boolean = false) => {
    if (isCritical && showCriticalPath) {
      return 'bg-purple-600';
    }
    switch (task.priority) {
      case 1: return 'bg-red-500';
      case 2: return 'bg-orange-500';
      case 3: return 'bg-blue-500';
      default: return 'bg-gray-400';
    }
  };

  const getTaskDependencies = (taskId: string) => {
    return dependencies.filter(d => d.taskId === taskId);
  };

  const navigateTime = (direction: 'prev' | 'next') => {
    const days = timeScale === 'day' ? 7 : timeScale === 'week' ? 28 : 90;
    setCurrentDate(prev => addDays(prev, direction === 'next' ? days : -days));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header Controls */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <h1 className="heading-2">Gantt Chart</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTimeScale('day')}
              className={timeScale === 'day' ? 'bg-primary text-primary-foreground' : ''}
            >
              Day
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTimeScale('week')}
              className={timeScale === 'week' ? 'bg-primary text-primary-foreground' : ''}
            >
              Week
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTimeScale('month')}
              className={timeScale === 'month' ? 'bg-primary text-primary-foreground' : ''}
            >
              Month
            </Button>
          </div>
          <Button
            variant={showCriticalPath ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowCriticalPath(!showCriticalPath)}
          >
            <Lightning className="w-4 h-4 mr-1" />
            Critical Path
          </Button>
          <Button
            variant={showDependencyGraph ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowDependencyGraph(!showDependencyGraph)}
          >
            <Graph className="w-4 h-4 mr-1" />
            Dependency Graph
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigateTime('prev')}>
            <CaretLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigateTime('next')}>
            <CaretRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Dependency Graph */}
      {showDependencyGraph && (
        <div className="m-4">
          <DependencyGraph />
        </div>
      )}

      {/* Gantt Chart */}
      <div className="flex-1 overflow-auto">
        <Card className="m-4">
          <div className="p-4">
            {/* Timeline Header */}
            <div className="flex border-b pb-2 mb-4">
              <div className="w-80 flex-shrink-0 font-medium text-sm text-muted-foreground">
                Task
              </div>
              <div className="flex-1 grid grid-cols-7 gap-px">
                {timePeriods.slice(0, 7).map((date, index) => (
                  <div key={index} className="text-center text-sm font-medium p-2">
                    {timeScale === 'day' 
                      ? format(date, 'EEE d')
                      : format(date, 'MMM d')
                    }
                  </div>
                ))}
              </div>
            </div>

            {/* Task Rows */}
            <div className="space-y-2">
              {tasksWithDates.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No tasks with start and due dates found.</p>
                  <p className="text-sm mt-2">Add start dates to your tasks to see them in the Gantt chart.</p>
                </div>
              ) : (
                tasksWithDates.map((task) => {
                  const position = getTaskPosition(task);
                  const project = projects?.find(p => p.id === task.projectId);
                  const taskDeps = getTaskDependencies(task.id);
                  const isCritical = criticalPath.has(task.id);
                  
                  return (
                    <div key={task.id} className="flex items-center min-h-[48px] hover:bg-muted/50 rounded-lg">
                      {/* Task Info */}
                      <div className="w-80 flex-shrink-0 px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getTaskColor(task, isCritical)}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm truncate">{task.title}</p>
                              {isCritical && showCriticalPath && (
                                <Badge variant="secondary" className="text-xs">
                                  <Lightning className="w-3 h-3 mr-1" />
                                  Critical
                                </Badge>
                              )}
                            </div>
                            {project && (
                              <p className="text-xs text-muted-foreground truncate">
                                {project.name}
                              </p>
                            )}
                            {taskDeps.length > 0 && (
                              <p className="text-xs text-muted-foreground">
                                {taskDeps.length} {taskDeps.length === 1 ? 'dependency' : 'dependencies'}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Timeline Bar */}
                      <div className="flex-1 relative h-8 bg-muted/30 rounded">
                        <div
                          className={`absolute top-1 bottom-1 ${getTaskColor(task, isCritical)} rounded opacity-80 flex items-center justify-center min-w-[2px]`}
                          style={position}
                        >
                          <span className="text-xs text-white font-medium px-2 truncate">
                            {task.title}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Legend */}
            <div className="mt-6 pt-4 border-t">
              <div className="flex items-center gap-6 text-sm flex-wrap">
                <span className="font-medium text-muted-foreground">Priority:</span>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span>High</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                  <span>Medium</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span>Low</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-gray-400" />
                  <span>None</span>
                </div>
                {showCriticalPath && (
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-purple-600" />
                    <span>Critical Path</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}