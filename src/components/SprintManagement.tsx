import { useState, useEffect } from 'react';
import { Plus, Kanban, ListBullets, ChartLine, FileText, Play, CheckCircle, X } from '@phosphor-icons/react';
import { sprintService, type Sprint } from '@/services/sprint.service';
import { SprintFormDialog } from './SprintFormDialog';
import { SprintBacklog } from './SprintBacklog';
import { SprintBoard } from './SprintBoard';
import { SprintBurnDownChart } from './SprintBurnDownChart';
import { SprintReports } from './SprintReports';

interface SprintManagementProps {
  userId: string;
  projectId?: string;
  tasks: any[];
  onTaskUpdate: (taskId: string, updates: any) => void;
  onTaskClick: (taskId: string) => void;
  onRefresh: () => void;
}

type SprintView = 'backlog' | 'board' | 'burndown' | 'reports';

export function SprintManagement({
  userId,
  projectId,
  tasks,
  onTaskUpdate,
  onTaskClick,
  onRefresh
}: SprintManagementProps) {
  const [currentView, setCurrentView] = useState<SprintView>('backlog');
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [activeSprint, setActiveSprint] = useState<Sprint | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSprints();
  }, [userId, projectId]);

  const loadSprints = async () => {
    try {
      setLoading(true);
      const sprintsList = await sprintService.listSprints(userId, projectId);
      setSprints(sprintsList);
      
      const active = sprintsList.find(s => s.status === 'active');
      setActiveSprint(active || null);
    } catch (error) {
      console.error('Error loading sprints:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSprint = () => {
    setEditingSprint(null);
    setIsFormOpen(true);
  };

  const handleEditSprint = (sprint: Sprint) => {
    setEditingSprint(sprint);
    setIsFormOpen(true);
  };

  const handleStartSprint = async (sprintId: string) => {
    try {
      await sprintService.startSprint(sprintId);
      loadSprints();
      onRefresh();
    } catch (error) {
      console.error('Error starting sprint:', error);
    }
  };

  const handleCompleteSprint = async (sprintId: string) => {
    try {
      await sprintService.completeSprint(sprintId);
      loadSprints();
      onRefresh();
    } catch (error) {
      console.error('Error completing sprint:', error);
    }
  };

  const handleDeleteSprint = async (sprintId: string) => {
    if (!confirm('Are you sure you want to delete this sprint?')) return;

    try {
      await sprintService.deleteSprint(sprintId);
      loadSprints();
      onRefresh();
    } catch (error) {
      console.error('Error deleting sprint:', error);
    }
  };

  const views = [
    { id: 'backlog' as const, label: 'Backlog', icon: ListBullets },
    { id: 'board' as const, label: 'Sprint Board', icon: Kanban },
    { id: 'burndown' as const, label: 'Burn-down', icon: ChartLine },
    { id: 'reports' as const, label: 'Reports', icon: FileText }
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Sprint Planning
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage sprints and track progress
          </p>
        </div>

        <button
          onClick={handleCreateSprint}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus size={20} />
          New Sprint
        </button>
      </div>

      {/* Sprint Status Bar */}
      {activeSprint && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse" />
              <div>
                <div className="font-semibold text-blue-900 dark:text-blue-100">
                  {activeSprint.name}
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  {new Date(activeSprint.startDate).toLocaleDateString()} - {new Date(activeSprint.endDate).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleEditSprint(activeSprint)}
                className="px-3 py-1 text-sm text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleCompleteSprint(activeSprint.$id)}
                className="flex items-center gap-2 px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
              >
                <CheckCircle size={16} />
                Complete Sprint
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sprint List (Planning Sprints) */}
      {sprints.filter(s => s.status === 'planning').length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Planning Sprints
          </h3>
          <div className="space-y-2">
            {sprints.filter(s => s.status === 'planning').map(sprint => (
              <div
                key={sprint.$id}
                className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-between"
              >
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {sprint.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditSprint(sprint)}
                    className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleStartSprint(sprint.$id)}
                    className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                  >
                    <Play size={16} />
                    Start Sprint
                  </button>
                  <button
                    onClick={() => handleDeleteSprint(sprint.$id)}
                    className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        {views.map(view => {
          const Icon = view.icon;
          return (
            <button
              key={view.id}
              onClick={() => setCurrentView(view.id)}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                currentView === view.id
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Icon size={20} />
              {view.label}
            </button>
          );
        })}
      </div>

      {/* View Content */}
      <div className="flex-1 min-h-0">
        {currentView === 'backlog' && (
          <SprintBacklog
            userId={userId}
            projectId={projectId}
            tasks={tasks}
            onTaskUpdate={onTaskUpdate}
            onRefresh={() => {
              loadSprints();
              onRefresh();
            }}
          />
        )}

        {currentView === 'board' && (
          <SprintBoard
            userId={userId}
            projectId={projectId}
            tasks={tasks}
            onTaskUpdate={onTaskUpdate}
            onTaskClick={onTaskClick}
          />
        )}

        {currentView === 'burndown' && activeSprint && (
          <div className="h-full overflow-y-auto">
            <SprintBurnDownChart
              sprint={activeSprint}
              tasks={tasks}
            />
          </div>
        )}

        {currentView === 'burndown' && !activeSprint && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center text-gray-400 dark:text-gray-500">
              <ChartLine size={48} className="mx-auto mb-2" />
              <p>No active sprint</p>
              <p className="text-sm">Start a sprint to view burn-down chart</p>
            </div>
          </div>
        )}

        {currentView === 'reports' && (
          <div className="h-full overflow-y-auto">
            <SprintReports
              userId={userId}
              projectId={projectId}
              tasks={tasks}
            />
          </div>
        )}
      </div>

      {/* Sprint Form Dialog */}
      <SprintFormDialog
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingSprint(null);
        }}
        onSuccess={() => {
          loadSprints();
          onRefresh();
        }}
        userId={userId}
        projectId={projectId}
        sprint={editingSprint}
      />
    </div>
  );
}
