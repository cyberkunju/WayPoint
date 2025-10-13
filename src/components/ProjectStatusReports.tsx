import { useEffect, useState } from 'react';
import { projectService, Project, ProjectStatistics } from '@/services/project.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ProjectStatusBadge } from './ProjectStatusBadge';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { FileText, Download } from '@phosphor-icons/react';
import { toast } from 'sonner';

interface ProjectStatusReportsProps {
  userId: string;
}

interface ProjectWithStats extends Project {
  statistics: ProjectStatistics;
}

export function ProjectStatusReports({ userId }: ProjectStatusReportsProps) {
  const [projects, setProjects] = useState<ProjectWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    loadProjects();
  }, [userId]);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const data = await projectService.getAllProjectsWithStatistics(userId);
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
      toast.error('Failed to load project reports');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProjects =
    selectedStatus === 'all'
      ? projects
      : projects.filter((p) => p.status === selectedStatus);

  const statusCounts = {
    all: projects.length,
    planning: projects.filter((p) => p.status === 'planning').length,
    in_progress: projects.filter((p) => p.status === 'in_progress').length,
    on_hold: projects.filter((p) => p.status === 'on_hold').length,
    completed: projects.filter((p) => p.status === 'completed').length,
    archived: projects.filter((p) => p.status === 'archived').length,
    blocked: projects.filter((p) => p.status === 'blocked').length,
    active: projects.filter((p) => p.status === 'active').length,
  };

  const handleExportReport = () => {
    // Generate CSV report
    const headers = [
      'Project Name',
      'Status',
      'Total Tasks',
      'Completed Tasks',
      'Completion Rate',
      'Overdue Tasks',
      'Start Date',
      'End Date',
    ];

    const rows = filteredProjects.map((project) => [
      project.name,
      project.status,
      project.statistics.totalTasks,
      project.statistics.completedTasks,
      `${project.statistics.completionRate}%`,
      project.statistics.overdueTasks,
      project.startDate || 'N/A',
      project.endDate || 'N/A',
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project-status-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Report exported successfully');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project Status Reports</CardTitle>
          <CardDescription>Loading project data...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Project Status Reports</h2>
          <p className="text-muted-foreground">
            Overview of all projects and their current status
          </p>
        </div>
        <Button onClick={handleExportReport} variant="outline" className="gap-2">
          <Download size={16} />
          Export Report
        </Button>
      </div>

      {/* Status Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Projects</CardDescription>
            <CardTitle className="text-3xl">{statusCounts.all}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>In Progress</CardDescription>
            <CardTitle className="text-3xl">{statusCounts.in_progress}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Completed</CardDescription>
            <CardTitle className="text-3xl">{statusCounts.completed}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Blocked</CardDescription>
            <CardTitle className="text-3xl">{statusCounts.blocked}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Status Filter Tabs */}
      <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="all">
            All ({statusCounts.all})
          </TabsTrigger>
          <TabsTrigger value="planning">
            Planning ({statusCounts.planning})
          </TabsTrigger>
          <TabsTrigger value="in_progress">
            In Progress ({statusCounts.in_progress})
          </TabsTrigger>
          <TabsTrigger value="on_hold">
            On Hold ({statusCounts.on_hold})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({statusCounts.completed})
          </TabsTrigger>
          <TabsTrigger value="archived">
            Archived ({statusCounts.archived})
          </TabsTrigger>
          <TabsTrigger value="blocked">
            Blocked ({statusCounts.blocked})
          </TabsTrigger>
          <TabsTrigger value="active">
            Active ({statusCounts.active})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedStatus} className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedStatus === 'all' ? 'All Projects' : `${selectedStatus.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())} Projects`}
              </CardTitle>
              <CardDescription>
                {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {filteredProjects.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <FileText size={48} className="mx-auto mb-4 opacity-50" />
                      <p>No projects found with this status</p>
                    </div>
                  ) : (
                    filteredProjects.map((project) => (
                      <Card key={project.$id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: project.color }}
                                />
                                <CardTitle className="text-lg">{project.name}</CardTitle>
                              </div>
                              {project.description && (
                                <CardDescription>{project.description}</CardDescription>
                              )}
                            </div>
                            <ProjectStatusBadge status={project.status} />
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {/* Progress */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Progress</span>
                                <span className="font-medium">
                                  {project.statistics.completionRate}%
                                </span>
                              </div>
                              <Progress value={project.statistics.completionRate} />
                            </div>

                            {/* Statistics */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div>
                                <p className="text-xs text-muted-foreground">Total Tasks</p>
                                <p className="text-lg font-semibold">
                                  {project.statistics.totalTasks}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Completed</p>
                                <p className="text-lg font-semibold text-green-600">
                                  {project.statistics.completedTasks}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">In Progress</p>
                                <p className="text-lg font-semibold text-blue-600">
                                  {project.statistics.incompleteTasks}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Overdue</p>
                                <p className="text-lg font-semibold text-red-600">
                                  {project.statistics.overdueTasks}
                                </p>
                              </div>
                            </div>

                            {/* Dates */}
                            {(project.startDate || project.endDate) && (
                              <div className="flex gap-4 text-sm">
                                {project.startDate && (
                                  <div>
                                    <span className="text-muted-foreground">Start: </span>
                                    <span>
                                      {new Date(project.startDate).toLocaleDateString()}
                                    </span>
                                  </div>
                                )}
                                {project.endDate && (
                                  <div>
                                    <span className="text-muted-foreground">End: </span>
                                    <span>
                                      {new Date(project.endDate).toLocaleDateString()}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Labels */}
                            {project.labels && project.labels.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {project.labels.map((label) => (
                                  <Badge key={label} variant="secondary">
                                    {label}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
