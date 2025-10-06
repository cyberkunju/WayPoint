import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Robot, 
  Lightbulb, 
  Clock, 
  Target, 
  TrendUp,
  Bell,
  X,
  CheckCircle,
  Calendar
} from '@phosphor-icons/react';
import { useTaskStore } from '../hooks/use-store';
import { Task, Project } from '../lib/types';
import { toast } from 'sonner';

interface AISuggestion {
  id: string;
  type: 'productivity' | 'overdue' | 'optimization' | 'habit' | 'scheduling';
  title: string;
  description: string;
  actionLabel?: string;
  actionHandler?: () => void;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
}

export function AIAssistant() {
  const { tasks, projects, addTask, updateTask } = useTaskStore();
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<string[]>([]);

  // Generate AI suggestions based on current data
  const generateSuggestions = (): AISuggestion[] => {
    const newSuggestions: AISuggestion[] = [];
    const now = new Date();

    if (!tasks) return newSuggestions;

    // 1. Overdue tasks alert
    const overdueTasks = tasks.filter(task => {
      if (task.completed || !task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate < now;
    });

    if (overdueTasks.length > 0) {
      newSuggestions.push({
        id: 'overdue-alert',
        type: 'overdue',
        title: `${overdueTasks.length} task(s) are overdue`,
        description: `You have ${overdueTasks.length} overdue tasks that need attention. Consider rescheduling or prioritizing them.`,
        actionLabel: 'Review Overdue',
        actionHandler: () => {
          // Focus on the first overdue task
          const firstOverdue = overdueTasks[0];
          toast.info(`Focusing on: ${firstOverdue.title}`);
        },
        priority: 'high',
        createdAt: now
      });
    }

    // 2. Task breakdown suggestions for complex tasks
    const complexTasks = tasks.filter(task => 
      !task.completed && 
      task.title.length > 50 && 
      (!task.subtasks || task.subtasks.length === 0)
    );

    if (complexTasks.length > 0) {
      const complexTask = complexTasks[0];
      newSuggestions.push({
        id: `breakdown-${complexTask.id}`,
        type: 'productivity',
        title: 'Break down complex task',
        description: `"${complexTask.title}" seems complex. Consider breaking it into smaller, actionable subtasks.`,
        actionLabel: 'Create Subtasks',
        actionHandler: () => {
          // Create suggested subtasks
          const subtasks = generateSubtasks(complexTask.title);
          subtasks.forEach(subtask => {
            addTask({
              title: subtask,
              parentId: complexTask.id,
              projectId: complexTask.projectId,
              priority: complexTask.priority
            });
          });
          toast.success(`Created ${subtasks.length} subtasks for "${complexTask.title}"`);
        },
        priority: 'medium',
        createdAt: now
      });
    }

    // 3. Daily planning suggestion
    const todayTasks = tasks.filter(task => {
      if (task.completed) return false;
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate).toDateString();
      return taskDate === now.toDateString();
    });

    if (todayTasks.length > 5) {
      newSuggestions.push({
        id: 'daily-planning',
        type: 'scheduling',
        title: 'Optimize your day',
        description: `You have ${todayTasks.length} tasks for today. Consider prioritizing the most important ones.`,
        actionLabel: 'Prioritize Tasks',
        actionHandler: () => {
          // Sort by priority and suggest focusing on top 3
          const prioritized = todayTasks.sort((a, b) => a.priority - b.priority);
          const topTasks = prioritized.slice(0, 3);
          toast.info(`Focus on these 3 tasks today: ${topTasks.map(t => t.title).join(', ')}`);
        },
        priority: 'medium',
        createdAt: now
      });
    }

    // 4. Project progress suggestion
    if (projects && projects.length > 0) {
      const projectsWithTasks = projects.map(project => {
        const projectTasks = tasks.filter(task => task.projectId === project.id);
        const completedTasks = projectTasks.filter(task => task.completed);
        const progress = projectTasks.length > 0 ? (completedTasks.length / projectTasks.length) * 100 : 0;
        
        return { ...project, progress, totalTasks: projectTasks.length, completedTasks: completedTasks.length };
      });

      const stagnantProjects = projectsWithTasks.filter(p => 
        p.totalTasks > 0 && p.progress < 20 && p.totalTasks > 3
      );

      if (stagnantProjects.length > 0) {
        const project = stagnantProjects[0];
        newSuggestions.push({
          id: `project-stagnant-${project.id}`,
          type: 'optimization',
          title: 'Project needs attention',
          description: `"${project.name}" has ${project.totalTasks} tasks but only ${Math.round(project.progress)}% complete. Consider reviewing the approach.`,
          actionLabel: 'Review Project',
          priority: 'medium',
          createdAt: now
        });
      }
    }

    // 5. Habit formation suggestion
    const consecutiveDays = getConsecutiveCompletionDays(tasks);
    if (consecutiveDays >= 3 && consecutiveDays < 7) {
      newSuggestions.push({
        id: 'habit-streak',
        type: 'habit',
        title: 'Building momentum!',
        description: `You've completed tasks for ${consecutiveDays} consecutive days. Keep the streak going!`,
        priority: 'low',
        createdAt: now
      });
    }

    // 6. Energy optimization suggestion
    const morningTasks = tasks.filter(task => {
      const createdHour = new Date(task.createdAt).getHours();
      return !task.completed && createdHour >= 6 && createdHour <= 10;
    });

    const eveningTasks = tasks.filter(task => {
      const createdHour = new Date(task.createdAt).getHours();
      return !task.completed && createdHour >= 18 && createdHour <= 22;
    });

    if (morningTasks.length > 0 && eveningTasks.length > 0) {
      newSuggestions.push({
        id: 'energy-optimization',
        type: 'scheduling',
        title: 'Optimize task timing',
        description: 'Consider scheduling high-priority tasks during your most productive hours (typically mornings).',
        priority: 'low',
        createdAt: now
      });
    }

    return newSuggestions.filter(s => !dismissedSuggestions.includes(s.id));
  };

  // Helper function to generate subtasks
  const generateSubtasks = (taskTitle: string): string[] => {
    const keywords = taskTitle.toLowerCase();
    
    if (keywords.includes('meeting') || keywords.includes('presentation')) {
      return [
        'Prepare agenda',
        'Send calendar invites',
        'Gather materials',
        'Review objectives',
        'Follow up after meeting'
      ];
    }
    
    if (keywords.includes('project') || keywords.includes('plan')) {
      return [
        'Define objectives',
        'Research requirements',
        'Create timeline',
        'Assign responsibilities',
        'Set up monitoring'
      ];
    }
    
    if (keywords.includes('report') || keywords.includes('analysis')) {
      return [
        'Gather data',
        'Analyze findings',
        'Create draft',
        'Review and edit',
        'Finalize and share'
      ];
    }
    
    // Default subtasks
    return [
      'Break down into steps',
      'Gather resources',
      'Execute main work',
      'Review and finalize'
    ];
  };

  // Helper function to calculate consecutive completion days
  const getConsecutiveCompletionDays = (tasks: Task[]): number => {
    const completedTasks = tasks.filter(task => task.completed);
    const dates = completedTasks.map(task => new Date(task.updatedAt).toDateString());
    const uniqueDates = [...new Set(dates)].sort();
    
    let consecutiveDays = 0;
    const today = new Date().toDateString();
    
    for (let i = uniqueDates.length - 1; i >= 0; i--) {
      const checkDate = new Date();
      checkDate.setDate(checkDate.getDate() - consecutiveDays);
      
      if (uniqueDates[i] === checkDate.toDateString()) {
        consecutiveDays++;
      } else {
        break;
      }
    }
    
    return consecutiveDays;
  };

  // Dismiss a suggestion
  const dismissSuggestion = (suggestionId: string) => {
    setDismissedSuggestions(prev => [...prev, suggestionId]);
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
  };

  // Update suggestions when tasks change
  useEffect(() => {
    const newSuggestions = generateSuggestions();
    setSuggestions(newSuggestions);
    
    // Show AI assistant if there are high-priority suggestions
    const hasHighPriority = newSuggestions.some(s => s.priority === 'high');
    if (hasHighPriority && !isVisible) {
      setIsVisible(true);
    }
  }, [tasks, projects, dismissedSuggestions]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'productivity': return Lightbulb;
      case 'overdue': return Clock;
      case 'optimization': return TrendUp;
      case 'habit': return Target;
      case 'scheduling': return Calendar;
      default: return Robot;
    }
  };

  if (!isVisible || suggestions.length === 0) {
    // Show a small floating button when hidden but suggestions exist
    if (suggestions.length > 0) {
      return (
        <Button
          className="fixed bottom-6 right-6 rounded-full w-12 h-12 p-0 shadow-lg z-50"
          onClick={() => setIsVisible(true)}
        >
          <Robot size={20} />
          {suggestions.some(s => s.priority === 'high') && (
            <Badge className="absolute -top-1 -right-1 rounded-full w-3 h-3 p-0 bg-destructive" />
          )}
        </Button>
      );
    }
    return null;
  }

  return (
    <Card className="fixed bottom-6 right-6 w-80 max-h-96 overflow-y-auto shadow-xl z-50 border border-border bg-card">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Robot size={20} className="text-primary" />
            <h3 className="font-semibold text-sm">AI Assistant</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setIsVisible(false)}
          >
            <X size={14} />
          </Button>
        </div>

        <div className="space-y-3">
          {suggestions.map((suggestion) => {
            const Icon = getTypeIcon(suggestion.type);
            
            return (
              <div key={suggestion.id} className="border border-border rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Icon size={16} className="text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-sm text-foreground">
                        {suggestion.title}
                      </h4>
                      <div className="flex items-center gap-1">
                        <Badge 
                          variant={getPriorityColor(suggestion.priority) as any}
                          className="text-xs"
                        >
                          {suggestion.priority}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0"
                          onClick={() => dismissSuggestion(suggestion.id)}
                        >
                          <X size={10} />
                        </Button>
                      </div>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {suggestion.description}
                    </p>
                    
                    {suggestion.actionLabel && suggestion.actionHandler && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 h-7 text-xs"
                        onClick={() => {
                          suggestion.actionHandler?.();
                          dismissSuggestion(suggestion.id);
                        }}
                      >
                        {suggestion.actionLabel}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {suggestions.length > 3 && (
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              AI learns from your patterns to provide better suggestions
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}