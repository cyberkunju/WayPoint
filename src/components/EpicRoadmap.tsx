import { useState, useEffect, useMemo } from 'react';
import { epicService, type Epic, type EpicStatistics } from '@/services/epic.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { ScrollArea } from './ui/scroll-area';
import { toast } from 'sonner';
import {
  Rocket,
  Calendar,
  CaretLeft,
  CaretRight,
  CheckCircle,
  Circle,
  Pause,
  Archive,
  Prohibit,
} from '@phosphor-icons/react';

interface EpicRoadmapProps {
  userId: string;
  projectId?: string;
  onEpicClick?: (epic: Epic & { statistics: EpicStatistics }) => void;
}

type TimelineView = 'monthly' | 'quarterly' | 'yearly';

const STATUS_CONFIG = {
  planning: { icon: Circle, label: 'Planning', color: 'bg-blue-500' },
  in_progress: { icon: CheckCircle, label: 'In Progress', color: 'bg-green-500' },
  on_hold: { icon: Pause, label: 'On Hold', color: 'bg-yellow-500' },
  completed: { icon: CheckCircle, label: 'Completed', color: 'bg-green-600' },
  archived: { icon: Archive, label: 'Archived', color: 'bg-gray-500' },
  blocked: { icon: Prohibit, label: 'Blocked', color: 'bg-red-500' },
};

export function EpicRoadmap({ userId, projectId, onEpicClick }: EpicRoadmapProps) {
  const [epics, setEpics] = useState<Array<Epic & { statistics: EpicStatistics }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timelineView, setTimelineView] = useState<TimelineView>('quarterly');
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    loadEpics();
  }, [userId, projectId]);

  const loadEpics = async () => {
    setIsLoading(true);
    try {
      const data = await epicService.getEpicRoadmapData(userId, projectId);
      // Filter epics with dates
      const epicsWithDates = data.filter(epic => epic.startDate || epic.endDate);
      setEpics(epicsWithDates);
    } catch (error) {
      console.error('Failed to load epics:', error);
      toast.error('Failed to load roadmap');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate timeline range based on view
  const timelineRange = useMemo(() => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);

    switch (timelineView) {
      case 'monthly':
        start.setMonth(start.getMonth() - 1);
        end.setMonth(end.getMonth() + 5);
        break;
      case 'quarterly':
        start.setMonth(start.getMonth() - 3);
        end.setMonth(end.getMonth() + 9);
        break;
      case 'yearly':
        start.setFullYear(start.getFullYear() - 1);
        end.setFullYear(end.getFullYear() + 2);
        break;
    }

    return { start, end };
  }, [currentDate, timelineView]);

  // Generate timeline columns
  const timelineColumns = useMemo(() => {
    const columns: Date[] = [];
    const current = new Date(timelineRange.start);

    while (current <= timelineRange.end) {
      columns.push(new Date(current));
      
      switch (timelineView) {
        case 'monthly':
          current.setMonth(current.getMonth() + 1);
          break;
        case 'quarterly':
          current.setMonth(current.getMonth() + 3);
          break;
        case 'yearly':
          current.setFullYear(current.getFullYear() + 1);
          break;
      }
    }

    return columns;
  }, [timelineRange, timelineView]);

  const formatColumnHeader = (date: Date): string => {
    switch (timelineView) {
      case 'monthly':
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      case 'quarterly':
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        return `Q${quarter} ${date.getFullYear()}`;
      case 'yearly':
        return date.getFullYear().toString();
    }
  };

  const calculateEpicPosition = (epic: Epic & { statistics: EpicStatistics }) => {
    if (!epic.startDate && !epic.endDate) return null;

    const epicStart = epic.startDate ? new Date(epic.startDate) : timelineRange.start;
    const epicEnd = epic.endDate ? new Date(epic.endDate) : timelineRange.end;

    // Calculate position as percentage
    const totalDuration = timelineRange.end.getTime() - timelineRange.start.getTime();
    const startOffset = epicStart.getTime() - timelineRange.start.getTime();
    const duration = epicEnd.getTime() - epicStart.getTime();

    const left = Math.max(0, (startOffset / totalDuration) * 100);
    const width = Math.min(100 - left, (duration / totalDuration) * 100);

    return { left: `${left}%`, width: `${width}%` };
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    switch (timelineView) {
      case 'monthly':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 3 : -3));
        break;
      case 'quarterly':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 6 : -6));
        break;
      case 'yearly':
        newDate.setFullYear(newDate.getFullYear() + (direction === 'next' ? 1 : -1));
        break;
    }
    
    setCurrentDate(newDate);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading roadmap...</p>
      </div>
    );
  }

  if (epics.length === 0) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent className="text-center">
          <Rocket size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No epics with dates found</p>
          <p className="text-sm text-muted-foreground mt-2">
            Add start and end dates to epics to see them on the roadmap
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Epic Roadmap</h2>
            <p className="text-sm text-muted-foreground">
              {epics.length} epics with timeline
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleNavigate('prev')}
            >
              <CaretLeft size={16} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleNavigate('next')}
            >
              <CaretRight size={16} />
            </Button>
          </div>
        </div>

        {/* View Selector */}
        <div className="flex gap-2">
          <Button
            variant={timelineView === 'monthly' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimelineView('monthly')}
          >
            Monthly
          </Button>
          <Button
            variant={timelineView === 'quarterly' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimelineView('quarterly')}
          >
            Quarterly
          </Button>
          <Button
            variant={timelineView === 'yearly' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimelineView('yearly')}
          >
            Yearly
          </Button>
        </div>
      </div>

      {/* Timeline */}
      <ScrollArea className="flex-1">
        <div className="p-6">
          {/* Timeline Header */}
          <div className="flex border-b pb-2 mb-4">
            <div className="w-48 flex-shrink-0 font-medium">Epic</div>
            <div className="flex-1 relative">
              <div className="flex">
                {timelineColumns.map((date, index) => (
                  <div
                    key={index}
                    className="flex-1 text-center text-sm text-muted-foreground border-l px-2"
                  >
                    {formatColumnHeader(date)}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Epic Rows */}
          <div className="space-y-3">
            {epics.map((epic) => {
              const position = calculateEpicPosition(epic);
              const StatusIcon = STATUS_CONFIG[epic.status].icon;

              return (
                <div key={epic.$id} className="flex items-center group">
                  {/* Epic Info */}
                  <div className="w-48 flex-shrink-0 pr-4">
                    <div className="flex items-center gap-2">
                      <StatusIcon size={14} className={`text-${STATUS_CONFIG[epic.status].color}`} />
                      <span className="text-sm font-medium truncate">{epic.name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {epic.statistics.completedTasks}/{epic.statistics.totalTasks} tasks
                    </div>
                  </div>

                  {/* Timeline Bar */}
                  <div className="flex-1 relative h-12">
                    {position && (
                      <div
                        className={`absolute top-1/2 -translate-y-1/2 h-8 rounded-md cursor-pointer transition-all hover:h-10 ${STATUS_CONFIG[epic.status].color}`}
                        style={{
                          left: position.left,
                          width: position.width,
                        }}
                        onClick={() => onEpicClick?.(epic)}
                      >
                        <div className="h-full flex items-center justify-between px-3 text-white text-xs font-medium">
                          <span className="truncate">{epic.progressPercentage}%</span>
                          {epic.statistics.overdueTasks > 0 && (
                            <Badge variant="destructive" className="ml-2 text-xs">
                              {epic.statistics.overdueTasks} overdue
                            </Badge>
                          )}
                        </div>
                        <Progress
                          value={epic.progressPercentage}
                          className="absolute bottom-0 left-0 right-0 h-1 bg-white/20"
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
