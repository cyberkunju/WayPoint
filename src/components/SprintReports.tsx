import { useState, useEffect } from 'react';
import { FileText, Download, Calendar, CheckCircle, TrendUp, Target } from '@phosphor-icons/react';
import { sprintService, type Sprint, type SprintStatistics } from '@/services/sprint.service';

interface SprintReportsProps {
  userId: string;
  projectId?: string;
  tasks: any[];
}

export function SprintReports({ userId, projectId, tasks }: SprintReportsProps) {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);
  const [statistics, setStatistics] = useState<SprintStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSprints();
  }, [userId, projectId]);

  useEffect(() => {
    if (selectedSprint) {
      loadStatistics();
    }
  }, [selectedSprint, tasks]);

  const loadSprints = async () => {
    try {
      setLoading(true);
      const sprintsList = await sprintService.listSprints(userId, projectId);
      // Only show completed sprints
      const completedSprints = sprintsList.filter(s => s.status === 'completed');
      setSprints(completedSprints);
      
      if (completedSprints.length > 0 && !selectedSprint) {
        setSelectedSprint(completedSprints[0]);
      }
    } catch (error) {
      console.error('Error loading sprints:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    if (!selectedSprint) return;

    try {
      const stats = await sprintService.calculateSprintStatistics(selectedSprint.$id, tasks);
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const exportReport = () => {
    if (!selectedSprint || !statistics) return;

    const report = {
      sprint: {
        name: selectedSprint.name,
        startDate: selectedSprint.startDate,
        endDate: selectedSprint.endDate,
        goals: selectedSprint.goals,
        status: selectedSprint.status
      },
      statistics: {
        totalTasks: statistics.totalTasks,
        completedTasks: statistics.completedTasks,
        completionRate: statistics.completionRate,
        totalPoints: statistics.totalPoints,
        completedPoints: statistics.completedPoints,
        velocity: statistics.velocity,
        daysElapsed: statistics.daysElapsed
      },
      tasks: tasks
        .filter(t => selectedSprint.taskIds?.includes(t.$id))
        .map(t => ({
          title: t.title,
          completed: t.completed,
          priority: t.priority,
          estimatedTime: t.estimatedTime
        }))
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sprint-report-${selectedSprint.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Loading reports...</div>
      </div>
    );
  }

  if (sprints.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-gray-400 dark:text-gray-500">
          <FileText size={48} className="mx-auto mb-2" />
          <p className="text-lg font-medium">No Completed Sprints</p>
          <p className="text-sm">Complete a sprint to view reports</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sprint Selector */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Sprint
          </label>
          <select
            value={selectedSprint?.$id || ''}
            onChange={(e) => {
              const sprint = sprints.find(s => s.$id === e.target.value);
              setSelectedSprint(sprint || null);
            }}
            className="w-full max-w-md px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {sprints.map(sprint => (
              <option key={sprint.$id} value={sprint.$id}>
                {sprint.name} ({new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={exportReport}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Download size={20} />
          Export Report
        </button>
      </div>

      {selectedSprint && statistics && (
        <>
          {/* Sprint Overview */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {selectedSprint.name}
            </h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <Calendar size={16} className="inline mr-1" />
                  Duration
                </div>
                <div className="text-gray-900 dark:text-white">
                  {new Date(selectedSprint.startDate).toLocaleDateString()} - {new Date(selectedSprint.endDate).toLocaleDateString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {statistics.totalDays} days
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <Target size={16} className="inline mr-1" />
                  Status
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm font-medium">
                  <CheckCircle size={16} />
                  Completed
                </div>
              </div>
            </div>

            {selectedSprint.goals && (
              <div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sprint Goals
                </div>
                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                  {selectedSprint.goals}
                </p>
              </div>
            )}
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Completion Rate</div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {statistics.completionRate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {statistics.completedTasks} of {statistics.totalTasks} tasks
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Story Points</div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {statistics.completedPoints}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                of {statistics.totalPoints} points
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Velocity</div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1 flex items-center gap-2">
                {statistics.velocity.toFixed(1)}
                <TrendUp size={24} />
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                points per day
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Efficiency</div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                {((statistics.completedPoints / statistics.totalPoints) * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                points completed
              </div>
            </div>
          </div>

          {/* Task Breakdown */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Task Breakdown
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Completed</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {statistics.completedTasks} tasks ({((statistics.completedTasks / statistics.totalTasks) * 100).toFixed(0)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-600 dark:bg-green-500 h-2 rounded-full"
                    style={{ width: `${(statistics.completedTasks / statistics.totalTasks) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">In Progress</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {statistics.inProgressTasks} tasks ({((statistics.inProgressTasks / statistics.totalTasks) * 100).toFixed(0)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full"
                    style={{ width: `${(statistics.inProgressTasks / statistics.totalTasks) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">To Do</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {statistics.todoTasks} tasks ({((statistics.todoTasks / statistics.totalTasks) * 100).toFixed(0)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gray-600 dark:bg-gray-500 h-2 rounded-full"
                    style={{ width: `${(statistics.todoTasks / statistics.totalTasks) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Insights */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
              Sprint Insights
            </h3>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <li>
                • The team completed {statistics.completionRate.toFixed(0)}% of planned work
              </li>
              <li>
                • Average velocity was {statistics.velocity.toFixed(1)} points per day
              </li>
              <li>
                • {statistics.completedTasks} out of {statistics.totalTasks} tasks were completed
              </li>
              {statistics.completionRate >= 90 && (
                <li className="text-green-700 dark:text-green-300 font-medium">
                  ✓ Excellent sprint! The team met or exceeded goals
                </li>
              )}
              {statistics.completionRate < 70 && (
                <li className="text-orange-700 dark:text-orange-300 font-medium">
                  ⚠ Consider adjusting sprint capacity or task estimates
                </li>
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
