import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { 
  CheckCircle, 
  Clock, 
  TrendUp, 
  Target, 
  Calendar,
  ChartBar,
  Download,
  DotsSix,
  Fire,
  Lightning
} from '@phosphor-icons/react';
import { useTaskStore, useUserStore } from '../hooks/use-store';
import { useKV } from '@github/spark/hooks';
import { cn } from '../lib/utils';

interface AnalyticsWidget {
  id: string;
  title: string;
  type: 'metric' | 'chart' | 'heatmap' | 'streak';
  position: number;
  enabled: boolean;
}

export function AnalyticsDashboard() {
  const { tasks, projects } = useTaskStore();
  const [dashboardLayout, setDashboardLayout] = useKV<AnalyticsWidget[]>('analytics-layout', [
    { id: 'overview', title: 'Overview Metrics', type: 'metric', position: 0, enabled: true },
    { id: 'velocity', title: 'Task Velocity', type: 'chart', position: 1, enabled: true },
    { id: 'heatmap', title: 'Time Allocation', type: 'heatmap', position: 2, enabled: true },
    { id: 'streak', title: 'Completion Streaks', type: 'streak', position: 3, enabled: true },
  ]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'week' | 'month' | 'quarter'>('week');

  const allTasks = tasks || [];
  const allProjects = projects || [];
  
  // Enhanced analytics calculations
  const analytics = useMemo(() => {
    const completedTasks = allTasks.filter(t => t.completed);
    const pendingTasks = allTasks.filter(t => !t.completed);
    const overdueTasks = allTasks.filter(t => 
      !t.completed && 
      t.dueDate && 
      new Date(t.dueDate) < new Date()
    );

    const todayTasks = allTasks.filter(t => {
      if (!t.dueDate) return false;
      const today = new Date().toDateString();
      return new Date(t.dueDate).toDateString() === today;
    });

    const completionRate = allTasks.length > 0 
      ? Math.round((completedTasks.length / allTasks.length) * 100)
      : 0;

    const todayCompletionRate = todayTasks.length > 0
      ? Math.round((todayTasks.filter(t => t.completed).length / todayTasks.length) * 100)
      : 0;

    // Task velocity (tasks completed per day in the last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toDateString();
    }).reverse();

    const velocityData = last7Days.map(date => {
      const dayTasks = completedTasks.filter(task => 
        new Date(task.updatedAt).toDateString() === date
      );
      return {
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        completed: dayTasks.length
      };
    });

    // Time allocation by project
    const projectStats = allProjects.map(project => {
      const projectTasks = allTasks.filter(t => t.projectId === project.id);
      const completedProjectTasks = projectTasks.filter(t => t.completed);
      const progress = projectTasks.length > 0 ? (completedProjectTasks.length / projectTasks.length) * 100 : 0;
      
      return {
        name: project.name,
        totalTasks: projectTasks.length,
        completedTasks: completedProjectTasks.length,
        progress: Math.round(progress),
        color: project.color
      };
    });

    // Priority distribution
    const priorityStats = {
      p1: allTasks.filter(t => t.priority === 1).length,
      p2: allTasks.filter(t => t.priority === 2).length,
      p3: allTasks.filter(t => t.priority === 3).length,
      p4: allTasks.filter(t => t.priority === 4).length,
    };

    // Productivity score (weighted completion rate with priority)
    const productivityScore = allTasks.length > 0 ? Math.round(
      (completedTasks.reduce((score, task) => {
        const priorityWeight = 5 - task.priority; // P1=4, P2=3, P3=2, P4=1
        return score + priorityWeight;
      }, 0) / allTasks.reduce((total, task) => total + (5 - task.priority), 0)) * 100
    ) : 0;

    // Consecutive completion days
    const completionDates = completedTasks.map(task => 
      new Date(task.updatedAt).toDateString()
    );
    const uniqueDates = [...new Set(completionDates)].sort();
    
    let currentStreak = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      
      if (uniqueDates.includes(checkDate.toDateString())) {
        currentStreak++;
      } else if (i === 0) {
        // If no tasks today, check if there were any yesterday
        continue;
      } else {
        break;
      }
    }

    return {
      total: allTasks.length,
      completed: completedTasks.length,
      pending: pendingTasks.length,
      overdue: overdueTasks.length,
      todayTasks: todayTasks.length,
      todayCompleted: todayTasks.filter(t => t.completed).length,
      completionRate,
      todayCompletionRate,
      velocityData,
      projectStats,
      priorityStats,
      productivityScore,
      currentStreak
    };
  }, [allTasks, allProjects]);

  // Export analytics data
  const exportData = () => {
    const data = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalTasks: analytics.total,
        completedTasks: analytics.completed,
        completionRate: analytics.completionRate,
        productivityScore: analytics.productivityScore,
        currentStreak: analytics.currentStreak
      },
      projectBreakdown: analytics.projectStats,
      velocityData: analytics.velocityData,
      tasks: allTasks.map(task => ({
        id: task.id,
        title: task.title,
        completed: task.completed,
        priority: task.priority,
        dueDate: task.dueDate,
        projectId: task.projectId,
        createdAt: task.createdAt,
        completedAt: task.completed ? task.updatedAt : null
      }))
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clarityflow-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Render heatmap for time allocation
  const renderTimeHeatmap = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    // Sample heatmap data - in a real app, this would be based on actual task completion times
    const heatmapData = days.map(day => 
      hours.map(hour => ({
        day,
        hour,
        intensity: Math.random() * 100 // This would be actual task data
      }))
    ).flat();

    return (
      <div className="space-y-2">
        <div className="grid grid-cols-24 gap-1">
          {hours.map(hour => (
            <div key={hour} className="text-xs text-center text-muted-foreground">
              {hour % 4 === 0 ? hour : ''}
            </div>
          ))}
        </div>
        {days.map(day => (
          <div key={day} className="flex items-center gap-1">
            <div className="w-8 text-xs text-muted-foreground">{day}</div>
            <div className="grid grid-cols-24 gap-1 flex-1">
              {hours.map(hour => {
                const intensity = heatmapData.find(d => d.day === day && d.hour === hour)?.intensity || 0;
                return (
                  <div
                    key={`${day}-${hour}`}
                    className="w-3 h-3 rounded-sm"
                    style={{
                      backgroundColor: `hsl(var(--primary) / ${intensity / 100})`
                    }}
                    title={`${day} ${hour}:00 - ${Math.round(intensity)}% activity`}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="heading-1 text-foreground mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track your productivity and task management insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportData}>
            <Download size={16} className="mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <Target size={16} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.total}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.completed} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendUp size={16} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.completionRate}%</div>
            <Progress value={analytics.completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Progress</CardTitle>
            <CheckCircle size={16} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.todayCompletionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {analytics.todayCompleted} of {analytics.todayTasks} tasks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
            <Clock size={16} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{analytics.overdue}</div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productivity Score</CardTitle>
            <Lightning size={16} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{analytics.productivityScore}</div>
            <p className="text-xs text-muted-foreground">
              Weighted by priority
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Task Velocity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChartBar size={20} />
              Task Velocity (7 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.velocityData.map((day, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-8">{day.date}</span>
                  <div className="flex-1">
                    <Progress 
                      value={(day.completed / Math.max(...analytics.velocityData.map(d => d.completed))) * 100} 
                      className="h-2"
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-8 text-right">{day.completed}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Project Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Project Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics.projectStats.slice(0, 5).map((project, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    <span className="text-sm font-medium">{project.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {project.completedTasks}/{project.totalTasks}
                  </span>
                </div>
                <Progress value={project.progress} className="h-2" />
              </div>
            ))}
            {analytics.projectStats.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No projects yet. Create a project to see progress here.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Advanced Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Completion Streak */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Fire size={20} className="text-orange-500" />
              Completion Streak
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-4xl font-bold text-orange-500 mb-2">
              {analytics.currentStreak}
            </div>
            <p className="text-sm text-muted-foreground">
              {analytics.currentStreak === 1 ? 'day' : 'days'} in a row
            </p>
            <div className="mt-4">
              {analytics.currentStreak >= 7 ? (
                <Badge className="bg-orange-500">Week Warrior! 🔥</Badge>
              ) : analytics.currentStreak >= 3 ? (
                <Badge className="bg-blue-500">Building Momentum! 💪</Badge>
              ) : analytics.currentStreak >= 1 ? (
                <Badge variant="outline">Getting Started! 🌟</Badge>
              ) : (
                <Badge variant="secondary">Ready to Start! 🚀</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Priority Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">High Priority (P1)</span>
              <Badge variant="destructive">{analytics.priorityStats.p1}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Medium Priority (P2)</span>
              <Badge className="bg-orange-500">{analytics.priorityStats.p2}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Normal Priority (P3)</span>
              <Badge variant="secondary">{analytics.priorityStats.p3}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Low Priority (P4)</span>
              <Badge variant="outline">{analytics.priorityStats.p4}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Task Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Task Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Completed Tasks</span>
              <Badge variant="secondary">{analytics.completed}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Pending Tasks</span>
              <Badge variant="outline">{analytics.pending}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Overdue Tasks</span>
              <Badge variant="destructive">{analytics.overdue}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Allocation Heatmap */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar size={20} />
            Time Allocation Heatmap
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Visual representation of when you're most productive
          </p>
        </CardHeader>
        <CardContent>
          {renderTimeHeatmap()}
          <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
            <span>Less active</span>
            <div className="flex gap-1">
              {[0, 25, 50, 75, 100].map(intensity => (
                <div
                  key={intensity}
                  className="w-3 h-3 rounded-sm"
                  style={{
                    backgroundColor: `hsl(var(--primary) / ${intensity / 100})`
                  }}
                />
              ))}
            </div>
            <span>More active</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}