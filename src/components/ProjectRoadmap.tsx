import { useState, useEffect, useMemo, useRef, createRef } from 'react';
import { projectService, type Project, type ProjectStatistics } from '@/services/project.service';
import { epicService, type Epic, type EpicStatistics } from '@/services/epic.service';
import { taskService, type Task } from '@/services/task.service';
import { taskDependenciesService, type TaskDependency } from '@/services/task-dependencies.service';
import { inferRoadmapDependencies, type RoadmapDependency } from '@/lib/roadmap.utils';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { ScrollArea } from './ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  Rocket,
  CaretLeft,
  CaretRight,
  CheckCircle,
  Circle,
  Pause,
  Archive,
  Prohibit,
  FlagBanner,
  Export,
  Funnel,
} from '@phosphor-icons/react';

interface ProjectRoadmapProps {
  userId: string;
  onProjectClick?: (project: Project & { statistics: ProjectStatistics }) => void;
  onEpicClick?: (epic: Epic & { statistics: EpicStatistics }) => void;
}

type TimelineView = 'monthly' | 'quarterly' | 'yearly';
type RoadmapItem = 
  | ({ type: 'project' } & Project & { statistics: ProjectStatistics })
  | ({ type: 'epic' } & Epic & { statistics: EpicStatistics });

const PROJECT_STATUS_CONFIG = {
  active: { icon: CheckCircle, label: 'Active', color: 'bg-green-500' },
  planning: { icon: Circle, label: 'Planning', color: 'bg-blue-500' },
  in_progress: { icon: CheckCircle, label: 'In Progress', color: 'bg-green-500' },
  on_hold: { icon: Pause, label: 'On Hold', color: 'bg-yellow-500' },
  completed: { icon: CheckCircle, label: 'Completed', color: 'bg-green-600' },
  archived: { icon: Archive, label: 'Archived', color: 'bg-gray-500' },
  blocked: { icon: Prohibit, label: 'Blocked', color: 'bg-red-500' },
};

const EPIC_STATUS_CONFIG = {
  planning: { icon: Circle, label: 'Planning', color: 'bg-blue-500' },
  in_progress: { icon: CheckCircle, label: 'In Progress', color: 'bg-green-500' },
  on_hold: { icon: Pause, label: 'On Hold', color: 'bg-yellow-500' },
  completed: { icon: CheckCircle, label: 'Completed', color: 'bg-green-600' },
  archived: { icon: Archive, label: 'Archived', color: 'bg-gray-500' },
  blocked: { icon: Prohibit, label: 'Blocked', color: 'bg-red-500' },
};

export function ProjectRoadmap({ userId, onProjectClick, onEpicClick }: ProjectRoadmapProps) {
  const [projects, setProjects] = useState<Array<Project & { statistics: ProjectStatistics }>>([]);
  const [epics, setEpics] = useState<Array<Epic & { statistics: EpicStatistics }>>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskDependencies, setTaskDependencies] = useState<TaskDependency[]>([]);
  const [roadmapDependencies, setRoadmapDependencies] = useState<RoadmapDependency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timelineView, setTimelineView] = useState<TimelineView>('quarterly');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showProjects, setShowProjects] = useState(true);
  const [showEpics, setShowEpics] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showMilestones, setShowMilestones] = useState(true);
  const [draggedItem, setDraggedItem] = useState<RoadmapItem | null>(null);
  const [dragStartX, setDragStartX] = useState(0);
  const timelineRef = useRef<HTMLDivElement>(null);
  const roadmapContainerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<string, React.RefObject<HTMLDivElement>>>({});

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [projectsData, epicsData, tasksData, dependenciesData] = await Promise.all([
        projectService.getAllProjectsWithStatistics(userId),
        epicService.getEpicRoadmapData(userId),
        taskService.getAllUserTasks(userId),
        taskDependenciesService.getAllDependencies(userId),
      ]);

      const projectsWithDates = projectsData.filter(p => p.startDate || p.endDate);
      const epicsWithDates = epicsData.filter(e => e.startDate || e.endDate);

      setProjects(projectsWithDates);
      setEpics(epicsWithDates);
      setTasks(tasksData);
      setTaskDependencies(dependenciesData);

      const inferredDeps = inferRoadmapDependencies(projectsData, epicsData, tasksData, dependenciesData);
      setRoadmapDependencies(inferredDeps);

    } catch (error) {
      console.error('Failed to load roadmap data:', error);
      toast.error('Failed to load roadmap');
    } finally {
      setIsLoading(false);
    }
  };

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

  const roadmapItems = useMemo(() => {
    const items: RoadmapItem[] = [];

    if (showProjects) {
      projects.forEach(project => {
        if (statusFilter === 'all' || project.status === statusFilter) {
          items.push({ type: 'project', ...project });
        }
      });
    }

    if (showEpics) {
      epics.forEach(epic => {
        if (statusFilter === 'all' || epic.status === statusFilter) {
          items.push({ type: 'epic', ...epic });
        }
      });
    }

    // Sort by start date
    const sortedItems = items.sort((a, b) => {
      const aDate = a.startDate ? new Date(a.startDate).getTime() : 0;
      const bDate = b.startDate ? new Date(b.startDate).getTime() : 0;
      return aDate - bDate;
    });

    // Create refs for each item
    itemRefs.current = sortedItems.reduce((acc, item) => {
      acc[`${item.type}-${item.$id}`] = createRef<HTMLDivElement>();
      return acc;
    }, {} as Record<string, React.RefObject<HTMLDivElement>>);

    return sortedItems;
  }, [projects, epics, showProjects, showEpics, statusFilter]);

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

  const calculateItemPosition = (item: RoadmapItem) => {
    if (!item.startDate && !item.endDate) return null;

    const itemStart = item.startDate ? new Date(item.startDate) : timelineRange.start;
    const itemEnd = item.endDate ? new Date(item.endDate) : timelineRange.end;

    const totalDuration = timelineRange.end.getTime() - timelineRange.start.getTime();
    const startOffset = itemStart.getTime() - timelineRange.start.getTime();
    const duration = itemEnd.getTime() - itemStart.getTime();

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

  const handleDragStart = (item: RoadmapItem, e: React.MouseEvent) => {
    setDraggedItem(item);
    setDragStartX(e.clientX);
  };

  const handleDragMove = (e: React.MouseEvent) => {
    if (!draggedItem || !timelineRef.current) return;
  };

  const handleDragEnd = async (e: React.MouseEvent) => {
    if (!draggedItem || !timelineRef.current) {
      setDraggedItem(null);
      return;
    }

    const rect = timelineRef.current.getBoundingClientRect();
    const deltaX = e.clientX - dragStartX;
    const percentDelta = (deltaX / rect.width) * 100;

    const totalDuration = timelineRange.end.getTime() - timelineRange.start.getTime();
    const timeDelta = (percentDelta / 100) * totalDuration;

    try {
      if (draggedItem.type === 'project') {
        const newStartDate = draggedItem.startDate 
          ? new Date(new Date(draggedItem.startDate).getTime() + timeDelta).toISOString()
          : undefined;
        const newEndDate = draggedItem.endDate
          ? new Date(new Date(draggedItem.endDate).getTime() + timeDelta).toISOString()
          : undefined;

        await projectService.updateProject(draggedItem.$id, {
          startDate: newStartDate,
          endDate: newEndDate,
        });

        toast.success('Project dates updated');
      } else {
        const newStartDate = draggedItem.startDate
          ? new Date(new Date(draggedItem.startDate).getTime() + timeDelta).toISOString()
          : undefined;
        const newEndDate = draggedItem.endDate
          ? new Date(new Date(draggedItem.endDate).getTime() + timeDelta).toISOString()
          : undefined;

        await epicService.updateEpic(draggedItem.$id, {
          startDate: newStartDate,
          endDate: newEndDate,
        });

        toast.success('Epic dates updated');
      }

      await loadData();
    } catch (error) {
      console.error('Failed to update dates:', error);
      toast.error('Failed to update dates');
    } finally {
      setDraggedItem(null);
    }
  };

  const handleExportPDF = async () => {
    if (!roadmapContainerRef.current) return;

    toast.info('Exporting PDF...');
    try {
      const canvas = await html2canvas(roadmapContainerRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`roadmap-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF exported successfully');
    } catch (error) {
      console.error('Failed to export PDF:', error);
      toast.error('Failed to export PDF');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading roadmap...</p>
      </div>
    );
  }

  if (roadmapItems.length === 0) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent className="text-center py-12">
          <Rocket size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No items with dates found</p>
          <p className="text-sm text-muted-foreground mt-2">
            Add start and end dates to projects and epics to see them on the roadmap
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="h-full flex flex-col" ref={roadmapContainerRef}>
      {/* Header */}
      <div className="p-6 border-b space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Project Roadmap</h2>
            <p className="text-sm text-muted-foreground">
              {roadmapItems.length} items on timeline
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => handleNavigate('prev')}><CaretLeft size={16} /></Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>Today</Button>
            <Button variant="outline" size="sm" onClick={() => handleNavigate('next')}><CaretRight size={16} /></Button>
            <Button variant="outline" size="sm" onClick={handleExportPDF}><Export size={16} className="mr-2" />Export PDF</Button>
          </div>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-2">
            <Button variant={timelineView === 'monthly' ? 'default' : 'outline'} size="sm" onClick={() => setTimelineView('monthly')}>Monthly</Button>
            <Button variant={timelineView === 'quarterly' ? 'default' : 'outline'} size="sm" onClick={() => setTimelineView('quarterly')}>Quarterly</Button>
            <Button variant={timelineView === 'yearly' ? 'default' : 'outline'} size="sm" onClick={() => setTimelineView('yearly')}>Yearly</Button>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2"><Checkbox id="show-projects" checked={showProjects} onCheckedChange={(checked) => setShowProjects(checked as boolean)} /><Label htmlFor="show-projects">Projects</Label></div>
            <div className="flex items-center gap-2"><Checkbox id="show-epics" checked={showEpics} onCheckedChange={(checked) => setShowEpics(checked as boolean)} /><Label htmlFor="show-epics">Epics</Label></div>
            <div className="flex items-center gap-2"><Checkbox id="show-milestones" checked={showMilestones} onCheckedChange={(checked) => setShowMilestones(checked as boolean)} /><Label htmlFor="show-milestones">Milestones</Label></div>
            <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-[150px]"><Funnel size={16} className="mr-2" /><SelectValue placeholder="Filter status" /></SelectTrigger><SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="planning">Planning</SelectItem><SelectItem value="in_progress">In Progress</SelectItem><SelectItem value="on_hold">On Hold</SelectItem><SelectItem value="completed">Completed</SelectItem><SelectItem value="blocked">Blocked</SelectItem></SelectContent></Select>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <ScrollArea className="flex-1">
        <div className="p-6 relative">
          <div className="flex border-b pb-2 mb-4">
            <div className="w-64 flex-shrink-0 font-medium">Item</div>
            <div ref={timelineRef} className="flex-1 relative" onMouseMove={draggedItem ? handleDragMove : undefined} onMouseUp={draggedItem ? handleDragEnd : undefined} onMouseLeave={draggedItem ? handleDragEnd : undefined}>
              <div className="flex">
                {timelineColumns.map((date, index) => (<div key={index} className="flex-1 text-center text-sm text-muted-foreground border-l px-2">{formatColumnHeader(date)}</div>))}
              </div>
              {(() => {
                const today = new Date();
                const totalDuration = timelineRange.end.getTime() - timelineRange.start.getTime();
                const todayOffset = today.getTime() - timelineRange.start.getTime();
                const todayPercent = (todayOffset / totalDuration) * 100;
                if (todayPercent >= 0 && todayPercent <= 100) {
                  return (<div className="absolute top-0 bottom-0 w-px bg-red-500 z-10" style={{ left: `${todayPercent}%` }}><div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-red-500 font-medium whitespace-nowrap">Today</div></div>);
                }
                return null;
              })()}
            </div>
          </div>
          <div className="space-y-2">
            {roadmapItems.map((item, index) => {
              const position = calculateItemPosition(item);
              const isProject = item.type === 'project';
              const statusConfig = isProject ? PROJECT_STATUS_CONFIG : EPIC_STATUS_CONFIG;
              const status = item.status as keyof typeof statusConfig;
              const StatusIcon = statusConfig[status]?.icon || Circle;
              const progressPercentage = isProject ? item.statistics.completionRate : (item as Epic & { statistics: EpicStatistics }).progressPercentage;

              return (
                <div key={`${item.type}-${item.$id}`} ref={itemRefs.current[`${item.type}-${item.$id}`]} className="flex items-center group">
                  <div className="w-64 flex-shrink-0 pr-4">
                    <div className="flex items-center gap-2">
                      <Badge variant={isProject ? 'default' : 'secondary'} className="text-xs">{isProject ? 'Project' : 'Epic'}</Badge>
                      <StatusIcon size={14} className={statusConfig[status]?.color} />
                      <span className="text-sm font-medium truncate">{item.name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 ml-16">{item.statistics.completedTasks}/{item.statistics.totalTasks} tasks</div>
                  </div>
                  <div className="flex-1 relative h-14">
                    {position && (<div className={`absolute top-1/2 -translate-y-1/2 h-10 rounded-md cursor-move transition-all hover:h-12 ${statusConfig[status]?.color || 'bg-gray-500'} ${draggedItem?.$id === item.$id ? 'opacity-50 scale-105' : ''}`} style={{left: position.left, width: position.width,}} onMouseDown={(e) => handleDragStart(item, e)} onClick={() => { if (isProject) { onProjectClick?.(item as Project & { statistics: ProjectStatistics }); } else { onEpicClick?.(item as Epic & { statistics: EpicStatistics }); }}}>
                        <div className="h-full flex items-center justify-between px-3 text-white text-xs font-medium">
                          <span className="truncate">{progressPercentage}%</span>
                          <div className="flex items-center gap-2">
                            {item.statistics.overdueTasks > 0 && (<Badge variant="destructive" className="text-xs">{item.statistics.overdueTasks} overdue</Badge>)}
                            {showMilestones && item.endDate && (<FlagBanner size={14} className="text-white" />)}
                          </div>
                        </div>
                        <Progress value={progressPercentage} className="absolute bottom-0 left-0 right-0 h-1 bg-white/20" />
                      </div>)}
                  </div>
                </div>
              );
            })}
          </div>
          <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ paddingTop: '8rem', paddingLeft: '17rem' }}>
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#666" /></marker>
            </defs>
            {roadmapDependencies.map((dep, index) => {
              const fromElement = itemRefs.current[dep.from]?.current;
              const toElement = itemRefs.current[dep.to]?.current;
              if (!fromElement || !toElement || !timelineRef.current) return null;

              const fromRect = fromElement.getBoundingClientRect();
              const toRect = toElement.getBoundingClientRect();
              const containerRect = timelineRef.current.getBoundingClientRect();

              const startX = fromRect.right - containerRect.left;
              const startY = fromRect.top - containerRect.top + fromRect.height / 2;
              const endX = toRect.left - containerRect.left;
              const endY = toRect.top - containerRect.top + toRect.height / 2;

              return (<line key={index} x1={startX} y1={startY} x2={endX - 10} y2={endY} stroke="#666" strokeWidth="2" markerEnd="url(#arrowhead)" />);
            })}
          </svg>
        </div>
      </ScrollArea>
    </div>
  );
}
