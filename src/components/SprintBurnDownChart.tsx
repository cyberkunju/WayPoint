import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { sprintService, type Sprint, type SprintStatistics } from '@/services/sprint.service';
import { TrendUp, TrendDown, Target } from '@phosphor-icons/react';

interface SprintBurnDownChartProps {
  sprint: Sprint;
  tasks: any[];
}

export function SprintBurnDownChart({ sprint, tasks }: SprintBurnDownChartProps) {
  const [statistics, setStatistics] = useState<SprintStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, [sprint, tasks]);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const stats = await sprintService.calculateSprintStatistics(sprint.$id, tasks);
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading sprint statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !statistics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Loading chart...</div>
      </div>
    );
  }

  // Get the latest burn-down data point for comparison
  const latestBurnDown = statistics.burnDownData[statistics.burnDownData.length - 1];
  const isAheadOfSchedule = latestBurnDown ? latestBurnDown.actual < latestBurnDown.ideal : false;
  const velocityTrend = statistics.velocity > 0 ? 'up' : 'neutral';

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Points</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {statistics.totalPoints}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Completed</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {statistics.completedPoints}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Remaining</div>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {statistics.remainingPoints}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Velocity</div>
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {statistics.velocity.toFixed(1)}
            </div>
            {velocityTrend === 'up' && (
              <TrendUp size={20} className="text-green-600 dark:text-green-400" />
            )}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">points/day</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Sprint Progress
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {statistics.completionRate.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className="bg-blue-600 dark:bg-blue-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(statistics.completionRate, 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-gray-600 dark:text-gray-400">
          <span>{statistics.daysElapsed} days elapsed</span>
          <span>{statistics.daysRemaining} days remaining</span>
        </div>
      </div>

      {/* Status Indicator */}
      <div className={`p-4 rounded-lg border ${
        isAheadOfSchedule
          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
          : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
      }`}>
        <div className="flex items-center gap-2">
          {isAheadOfSchedule ? (
            <>
              <TrendUp size={20} className="text-green-600 dark:text-green-400" />
              <span className="font-medium text-green-900 dark:text-green-100">
                Ahead of Schedule
              </span>
            </>
          ) : (
            <>
              <TrendDown size={20} className="text-orange-600 dark:text-orange-400" />
              <span className="font-medium text-orange-900 dark:text-orange-100">
                Behind Schedule
              </span>
            </>
          )}
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
          {isAheadOfSchedule && latestBurnDown
            ? `You're ${(latestBurnDown.ideal - latestBurnDown.actual).toFixed(1)} points ahead of the ideal burn rate.`
            : latestBurnDown
            ? `You're ${(latestBurnDown.actual - latestBurnDown.ideal).toFixed(1)} points behind the ideal burn rate.`
            : 'No burn-down data available yet.'
          }
        </p>
      </div>

      {/* Burn-down Chart */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Target size={20} />
          Burn-down Chart
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={statistics.burnDownData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
            <XAxis
              dataKey="date"
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
            />
            <YAxis
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              label={{ value: 'Story Points', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB'
              }}
              labelFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString();
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="ideal"
              stroke="#9CA3AF"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="Ideal"
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#3B82F6"
              strokeWidth={3}
              dot={{ fill: '#3B82F6', r: 4 }}
              name="Actual"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Task Breakdown */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Tasks</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {statistics.totalTasks}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Completed</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {statistics.completedTasks}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">In Progress</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {statistics.inProgressTasks}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">To Do</div>
          <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
            {statistics.todoTasks}
          </div>
        </div>
      </div>
    </div>
  );
}
