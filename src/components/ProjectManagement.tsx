import { useState, useEffect } from 'react';
import { projectService, type Project } from '@/services/project.service';
import { labelsService, type Label } from '@/services/labels.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label as UILabel } from './ui/label';
import { ProjectStatusDialog } from './ProjectStatusDialog';
import { ProjectStatusHistory } from './ProjectStatusHistory';
import { ProjectStatusBadge } from './ProjectStatusBadge';
import { ProjectFormDialog } from './ProjectFormDialog';
import { LabelBadgeList } from './LabelBadge';
import { LabelFilter } from './LabelFilter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { toast } from 'sonner';
import { Plus, Trash, ArrowsClockwise, PencilSimple } from '@phosphor-icons/react';

interface ProjectManagementProps {
  userId: string;
}

export function ProjectManagement({ userId }: ProjectManagementProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [allLabels, setAllLabels] = useState<Label[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLabelFilters, setSelectedLabelFilters] = useState<string[]>([]);

  useEffect(() => {
    loadProjects();
    loadLabels();
  }, [userId]);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const filters = selectedLabelFilters.length > 0
        ? { userId, labels: selectedLabelFilters }
        : { userId };
      const data = await projectService.listProjects(filters);
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  const loadLabels = async () => {
    try {
      const data = await labelsService.getUserLabels(userId);
      setAllLabels(data);
    } catch (error) {
      console.error('Failed to load labels:', error);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [selectedLabelFilters]);

  const handleStatusChange = () => {
    loadProjects();
    if (selectedProject) {
      // Reload selected project
      projectService.getProject(selectedProject.$id, userId).then(setSelectedProject);
    }
  };

  const handleCreateProject = () => {
    setSelectedProject(null);
    setIsFormDialogOpen(true);
  };

  const handleEditProject = () => {
    setIsFormDialogOpen(true);
  };

  const handleSaveProject = async () => {
    await loadProjects();
    setIsFormDialogOpen(false);
    if (selectedProject) {
      // Reload selected project
      const updated = await projectService.getProject(selectedProject.$id, userId);
      setSelectedProject(updated);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project? This will also delete all tasks in the project.')) {
      return;
    }

    try {
      await projectService.deleteProject(projectId, userId);
      toast.success('Project deleted successfully');
      loadProjects();
      if (selectedProject?.$id === projectId) {
        setSelectedProject(null);
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
      toast.error('Failed to delete project');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex gap-6">
      {/* Projects List */}
      <div className="w-1/3">
        <Card className="h-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Projects</CardTitle>
                <CardDescription>{projects.length} total projects</CardDescription>
              </div>
              <Button size="sm" onClick={handleCreateProject} className="gap-2">
                <Plus size={16} />
                New Project
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Label Filter */}
            <div className="mb-4">
              <LabelFilter
                userId={userId}
                selectedLabelIds={selectedLabelFilters}
                onFilterChange={setSelectedLabelFilters}
              />
            </div>

            <ScrollArea className="h-[calc(100vh-320px)]">
              <div className="space-y-2">
                {projects.map((project) => {
                  const projectLabels = allLabels.filter((label) =>
                    project.labels.includes(label.$id)
                  );

                  return (
                    <div
                      key={project.$id}
                      className={`p-3 rounded-md border cursor-pointer transition-colors ${
                        selectedProject?.$id === project.$id
                          ? 'bg-primary/10 border-primary'
                          : 'hover:bg-secondary/50'
                      }`}
                      onClick={() => setSelectedProject(project)}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: project.color }}
                          />
                          <span className="font-medium truncate">{project.name}</span>
                        </div>
                        <ProjectStatusBadge status={project.status} showLabel={false} size="sm" />
                      </div>
                      {project.description && (
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {project.description}
                        </p>
                      )}
                      {projectLabels.length > 0 && (
                        <LabelBadgeList
                          labels={projectLabels}
                          size="sm"
                          showIcon={false}
                          maxDisplay={3}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Project Details */}
      <div className="flex-1">
        {selectedProject ? (
          <Tabs defaultValue="details" className="h-full">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="history">Status History</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="mt-4">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: selectedProject.color }}
                        />
                        <CardTitle>{selectedProject.name}</CardTitle>
                      </div>
                      <CardDescription>
                        Created {new Date(selectedProject.$createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={handleEditProject}
                      >
                        <PencilSimple size={16} />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => setIsStatusDialogOpen(true)}
                      >
                        <ArrowsClockwise size={16} />
                        Status
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteProject(selectedProject.$id)}
                      >
                        <Trash size={16} />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Status */}
                  <div className="space-y-2">
                    <UILabel>Current Status</UILabel>
                    <div>
                      <ProjectStatusBadge status={selectedProject.status} />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <UILabel>Description</UILabel>
                    <p className="text-sm text-muted-foreground">
                      {selectedProject.description || 'No description provided'}
                    </p>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <UILabel>Start Date</UILabel>
                      <p className="text-sm">
                        {selectedProject.startDate
                          ? new Date(selectedProject.startDate).toLocaleDateString()
                          : 'Not set'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <UILabel>End Date</UILabel>
                      <p className="text-sm">
                        {selectedProject.endDate
                          ? new Date(selectedProject.endDate).toLocaleDateString()
                          : 'Not set'}
                      </p>
                    </div>
                  </div>

                  {/* Labels */}
                  <div className="space-y-2">
                    <UILabel>Labels</UILabel>
                    {selectedProject.labels && selectedProject.labels.length > 0 ? (
                      <LabelBadgeList
                        labels={allLabels.filter((label) =>
                          selectedProject.labels.includes(label.$id)
                        )}
                        size="md"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">No labels assigned</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="mt-4">
              <ProjectStatusHistory projectId={selectedProject.$id} userId={userId} />
            </TabsContent>
          </Tabs>
        ) : (
          <Card className="h-full flex items-center justify-center">
            <CardContent>
              <p className="text-muted-foreground">Select a project to view details</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Status Change Dialog */}
      {selectedProject && (
        <ProjectStatusDialog
          project={selectedProject}
          open={isStatusDialogOpen}
          onOpenChange={setIsStatusDialogOpen}
          onStatusChanged={handleStatusChange}
        />
      )}

      {/* Project Form Dialog */}
      <ProjectFormDialog
        open={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        project={selectedProject}
        userId={userId}
        onSave={handleSaveProject}
      />
    </div>
  );
}
