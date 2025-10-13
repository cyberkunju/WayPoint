import { memo, useCallback } from 'react';
import { Button } from './ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { 
  Tray, 
  CalendarBlank, 
  ClockCounterClockwise,
  Folder,
  FolderOpen,
  Plus,
  CaretDown,
  CaretRight,
  ChartBar,
  Gear,
  Info,
  Kanban,
  ChartLineUp,
  Graph,
  Rocket,
  MapTrifold
} from '@phosphor-icons/react';
import { useTaskStore, useUserStore } from '../hooks/use-store';
import { useAppContext } from '../contexts/AppContext';
import { cn } from '../lib/utils';
import { Project } from '../lib/types';
import { ProjectStatusBadge } from './ProjectStatusBadge';

export const Sidebar = memo(function Sidebar() {
  const { projects, addProject, updateProject } = useTaskStore();
  const { preferences } = useUserStore();
  const { currentView, setCurrentView } = useAppContext();
  
  const isCollapsed = preferences?.sidebarCollapsed || false;

  const navigationItems = [
    { id: 'inbox', label: 'Inbox', icon: Tray },
    { id: 'today', label: 'Today', icon: CalendarBlank },
    { id: 'upcoming', label: 'Upcoming', icon: ClockCounterClockwise },
  ];

  const viewItems = [
    { id: 'kanban', label: 'Kanban', icon: Kanban },
    { id: 'calendar', label: 'Calendar', icon: CalendarBlank },
    { id: 'gantt', label: 'Gantt Chart', icon: ChartLineUp },
    { id: 'roadmap', label: 'Roadmap', icon: MapTrifold },
    { id: 'mindmap', label: 'Mind Map', icon: Graph },
  ];

  const managementItems = [
    { id: 'epics', label: 'Epics', icon: Rocket },
    { id: 'projects', label: 'Projects', icon: FolderOpen },
  ];

  const handleProjectToggle = useCallback((projectId: string) => {
    const project = projects?.find(p => p.id === projectId);
    if (project) {
      updateProject(projectId, { isExpanded: !project.isExpanded });
    }
  }, [projects, updateProject]);

  const handleAddProject = useCallback(() => {
    addProject({ name: 'New Project' });
  }, [addProject]);

  const renderProject = (project: Project, level = 0) => {
    const hasChildren = projects?.some(p => p.parentId === project.id);
    const children = projects?.filter(p => p.parentId === project.id) || [];

    return (
      <div key={project.id}>
        <div 
          className={cn(
            "flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-secondary/50 cursor-pointer",
            currentView === project.id && "bg-primary/10 text-primary",
            isCollapsed && "justify-center px-2"
          )}
          style={{ paddingLeft: isCollapsed ? undefined : `${12 + level * 16}px` }}
          onClick={() => setCurrentView(project.id)}
        >
          {hasChildren && !isCollapsed && (
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0"
              onClick={(e) => {
                e.stopPropagation();
                handleProjectToggle(project.id);
              }}
            >
              {project.isExpanded ? 
                <CaretDown size={12} /> : 
                <CaretRight size={12} />
              }
            </Button>
          )}
          
          {!hasChildren && !isCollapsed && <div className="w-4" />}
          
          <div 
            className="w-3 h-3 rounded-full flex-shrink-0" 
            style={{ backgroundColor: project.color }}
          />
          
          {!isCollapsed && (
            <>
              <span className="truncate flex-1">{project.name}</span>
              {project.status && project.status !== 'active' && (
                <ProjectStatusBadge status={project.status} showLabel={false} size="sm" />
              )}
            </>
          )}
        </div>

        {hasChildren && project.isExpanded && !isCollapsed && (
          <div>
            {children.map(child => renderProject(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className={cn(
      "border-r border-border bg-background flex flex-col transition-all duration-200",
      isCollapsed ? "w-16" : "w-72"
    )}>
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h2 className="heading-3 text-foreground">Navigation</h2>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Info size={14} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="text-sm">Use Cmd/Ctrl + 1-3 for quick navigation</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {navigationItems.map((item) => (
            <Button
              key={item.id}
              variant={currentView === item.id ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-3",
                isCollapsed && "justify-center px-2"
              )}
              onClick={() => setCurrentView(item.id)}
            >
              <item.icon size={20} />
              {!isCollapsed && <span>{item.label}</span>}
            </Button>
          ))}
        </div>

        <div className="mt-4">
          <div className="flex items-center px-3 py-2">
            {!isCollapsed && (
              <span className="text-sm font-medium text-muted-foreground">Management</span>
            )}
          </div>
          <div className="space-y-1">
            {managementItems.map((item) => (
              <Button
                key={item.id}
                variant={currentView === item.id ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3",
                  isCollapsed && "justify-center px-2"
                )}
                onClick={() => setCurrentView(item.id)}
              >
                <item.icon size={20} />
                {!isCollapsed && <span>{item.label}</span>}
              </Button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center px-3 py-2">
            {!isCollapsed && (
              <span className="text-sm font-medium text-muted-foreground">Views</span>
            )}
          </div>
          <div className="space-y-1">
            {viewItems.map((item) => (
              <Button
                key={item.id}
                variant={currentView === item.id ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3",
                  isCollapsed && "justify-center px-2"
                )}
                onClick={() => setCurrentView(item.id)}
              >
                <item.icon size={20} />
                {!isCollapsed && <span>{item.label}</span>}
              </Button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between px-3 py-2">
            {!isCollapsed && (
              <span className="text-sm font-medium text-muted-foreground">Projects</span>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={handleAddProject}
            >
              <Plus size={14} />
            </Button>
          </div>

          <div className="space-y-1">
            {projects?.filter(p => !p.parentId).map(project => renderProject(project))}
          </div>
        </div>
      </nav>

      <div className="p-2 border-t border-border">
        <Button
          variant={currentView === 'analytics' ? "secondary" : "ghost"}
          className={cn(
            "w-full justify-start gap-3",
            isCollapsed && "justify-center px-2"
          )}
          onClick={() => setCurrentView('analytics')}
        >
          <ChartBar size={20} />
          {!isCollapsed && <span>Analytics</span>}
        </Button>

        <Button
          variant={currentView === 'settings' ? "secondary" : "ghost"}
          className={cn(
            "w-full justify-start gap-3 mt-1",
            isCollapsed && "justify-center px-2"
          )}
          onClick={() => setCurrentView('settings')}
        >
          <Gear size={20} />
          {!isCollapsed && <span>Settings</span>}
        </Button>
      </div>
    </aside>
  );
});