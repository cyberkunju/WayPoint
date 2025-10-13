import { useState, useEffect } from 'react';
import { epicService, type Epic, type EpicStatistics } from '@/services/epic.service';
import { projectService, type Project } from '@/services/project.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { EpicFormDialog } from './EpicFormDialog';
import { EpicDetailPanel } from './EpicDetailPanel';
import { EpicTaskLinking } from './EpicTaskLinking';
import { EpicRoadmap } from './EpicRoadmap';
import { toast } from 'sonner';
import {
  Plus,
  Rocket,
  CheckCircle,
  Circle,
  Pause,
  Archive,
  Prohibit,
  Link,
  ChartLineUp,
} from '@phosphor-icons/react';

interface EpicManagementProps {
  userId: string;
}

const STATUS_CONFIG = {
  planning: { icon: Circle, label: 'Planning', color: 'text-blue-500' },
  in_progress: { icon: CheckCircle, label: 'In Progress', color: 'text-green-500' },
  on_hold: { icon: Pause, label: 'On Hold', color: 'text-yellow-500' },
  completed: { icon: CheckCircle, label: 'Completed', color: 'text-green-600' },
  archived: { icon: Archive, label: 'Archived', color: 'text-gray-500' },
  blocked: { icon: Prohibit, label: 'Blocked', color: 'text-red-500' },
};

export function EpicManagement({ userId }: EpicManagementProps) {
  const [epics, setEpics] = useState<Array<Epic & { statistics: EpicStatistics }>>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedEpic, setSelectedEpic] = useState<Epic | null>(null);
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isLinkingDialogOpen, setIsLinkingDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('list');

  useEffect(() => {
    loadData();
  }, [userId, selectedProject]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [epicsData, projectsData] = await Promise.all([
        epicService.getAllEpicsWithStatistics(userId),
        projectService.listProjects({ userId }),
      ]);

      // Filter by project if selected
      const filteredEpics = selectedProject === 'all'
        ? epicsData
        : epicsData.filter(epic => epic.projectId === selectedProject);

      setEpics(filteredEpics);
      setProjects(projectsData);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load epics');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEpic = () => {
    setSelectedEpic(null);
    setIsFormDialogOpen(true);
  };

  const handleEditEpic = (epic: Epic) => {
    setSelectedEpic(epic);
    setIsFormDialogOpen(true);
  };

  const handleSaveEpic = () => {
    loadData();
    setIsFormDialogOpen(false);
  };

  const handleDeleteEpic = () => {
    loadData();
    setSelectedEpic(null);
  };

  const handleLinkTasks = () => {
    if (selectedEpic) {
      setIsLinkingDialogOpen(true);
    }
  };

  const handleTasksLinked = () => {
    loadData();
    // Reload selected epic details if in detail view
    if (selectedEpic) {
      epicService.getEpic(selectedEpic.$id, userId).then(setSelectedEpic);
    }
  };

  const handleEpicClick = (epic: Epic & { statistics: EpicStatistics }) => {
    setSelectedEpic(epic);
    setActiveTab('details');
  };

  const topLevelEpics = epics.filter(epic => !epic.parentEpicId);
  const getChildEpics = (parentId: string) => epics.filter(epic => epic.parentEpicId === parentId);

  const renderEpicCard = (epic: Epic & { statistics: EpicStatistics }, level = 0) => {
    const StatusIcon = STATUS_CONFIG[epic.status].icon;
    const children = getChildEpics(epic.$id);

    return (
      <div key={epic.$id} style={{ marginLeft: `${level * 24}px` }}>
        <Card
          className={`mb-2 cursor-pointer transition-colors ${
            selectedEpic?.$id === epic.$id
              ? 'bg-primary/10 border-primary'
              : 'hover:bg-secondary/50'
          }`}
          onClick={() => setSelectedEpic(epic)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Rocket size={20} className="text-primary flex-shrink-0" />
                <span className="font-medium truncate">{epic.name}</span>
                {children.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {children.length} child{children.length > 1 ? 'ren' : ''}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <StatusIcon size={16} className={STATUS_CONFIG[epic.status].color} />
                <Badge variant="outline" className="text-xs">
                  {STATUS_CONFIG[epic.status].label}
                </Badge>
              </div>
            </div>

            {epic.description && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {epic.description}
              </p>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{epic.progressPercentage}%</span>
              </div>
              <Progress value={epic.progressPercentage} className="h-2" />
            </div>

            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              <span>{epic.statistics.totalTasks} tasks</span>
              <span>{epic.statistics.completedTasks} completed</span>
              {epic.statistics.overdueTasks > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {epic.statistics.overdueTasks} overdue
                </Badge>
              )}
            </div>

            {(epic.startDate || epic.endDate) && (
              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                {epic.startDate && (
                  <span>{new Date(epic.startDate).toLocaleDateString()}</span>
                )}
                {epic.startDate && epic.endDate && <span>→</span>}
                {epic.endDate && (
                  <span>{new Date(epic.endDate).toLocaleDateString()}</span>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Render child epics */}
        {children.map(child => renderEpicCard(child, level + 1))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading epics...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">Epics</h2>
              <p className="text-sm text-muted-foreground">
                {epics.length} total epics
              </p>
            </div>
            <div className="flex gap-2">
              {selectedEpic && activeTab === 'details' && (
                <Button size="sm" onClick={handleLinkTasks} className="gap-2">
                  <Link size={16} />
                  Link Tasks
                </Button>
              )}
              <Button size="sm" onClick={handleCreateEpic} className="gap-2">
                <Plus size={16} />
                New Epic
              </Button>
            </div>
          </div>

          <TabsList>
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="roadmap">
              <ChartLineUp size={16} className="mr-2" />
              Roadmap
            </TabsTrigger>
            {selectedEpic && <TabsTrigger value="details">Details</TabsTrigger>}
          </TabsList>
        </div>

        <TabsContent value="list" className="flex-1 flex gap-6 p-6 mt-0">
          {/* Epics List */}
          <div className="w-1/2">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>All Epics</CardTitle>
                  <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="h-9 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="all">All Projects</option>
                    {projects.map((project) => (
                      <option key={project.$id} value={project.$id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[calc(100vh-320px)]">
                  {topLevelEpics.length === 0 ? (
                    <div className="text-center py-8">
                      <Rocket size={48} className="mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No epics found</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={handleCreateEpic}
                      >
                        Create your first epic
                      </Button>
                    </div>
                  ) : (
                    <div>
                      {topLevelEpics.map(epic => renderEpicCard(epic))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Epic Details */}
          <div className="flex-1">
            {selectedEpic ? (
              <Card className="h-full">
                <EpicDetailPanel
                  epicId={selectedEpic.$id}
                  userId={userId}
                  onEdit={handleEditEpic}
                  onDelete={handleDeleteEpic}
                  onClose={() => setSelectedEpic(null)}
                />
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <CardContent>
                  <p className="text-muted-foreground">Select an epic to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="roadmap" className="flex-1 mt-0">
          <EpicRoadmap
            userId={userId}
            projectId={selectedProject === 'all' ? undefined : selectedProject}
            onEpicClick={handleEpicClick}
          />
        </TabsContent>

        {selectedEpic && (
          <TabsContent value="details" className="flex-1 p-6 mt-0">
            <Card className="h-full">
              <EpicDetailPanel
                epicId={selectedEpic.$id}
                userId={userId}
                onEdit={handleEditEpic}
                onDelete={handleDeleteEpic}
                onClose={() => {
                  setSelectedEpic(null);
                  setActiveTab('list');
                }}
              />
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Epic Form Dialog */}
      <EpicFormDialog
        open={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        epic={selectedEpic}
        userId={userId}
        onSave={handleSaveEpic}
      />

      {/* Task Linking Dialog */}
      {selectedEpic && (
        <EpicTaskLinking
          open={isLinkingDialogOpen}
          onOpenChange={setIsLinkingDialogOpen}
          epicId={selectedEpic.$id}
          userId={userId}
          onLinked={handleTasksLinked}
        />
      )}
    </div>
  );
}
