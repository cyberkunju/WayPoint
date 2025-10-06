import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { TaskCard } from './TaskCard';
import { useTaskStore } from '../hooks/use-store';
import { useAppContext } from '../contexts/AppContext';
import { filterTasks } from '../lib/utils-tasks';
import { Task } from '../lib/types';
import { cn } from '../lib/utils';
import { 
  CaretLeft, 
  CaretRight, 
  CalendarBlank,
  Plus,
  Calendar
} from '@phosphor-icons/react';

export function CalendarView() {
  const { tasks, updateTask, addTask } = useTaskStore();
  const { searchQuery, currentView } = useAppContext();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  const getFilteredTasks = () => {
    let filtered = tasks || [];

    // Apply current view filters first
    if (currentView !== 'inbox' && currentView !== 'analytics' && currentView !== 'settings') {
      filtered = filterTasks(filtered, { projectId: currentView });
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filterTasks(filtered, { search: searchQuery });
    }

    return filtered;
  };

  const filteredTasks = getFilteredTasks();

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days: Date[] = [];
    
    // Add previous month's trailing days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push(prevDate);
    }
    
    // Add current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    // Add next month's leading days to complete the grid
    const remainingDays = 42 - days.length; // 6 rows × 7 days = 42
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i));
    }
    
    return days;
  };

  const getTasksForDate = (date: Date): Task[] => {
    const dateStr = date.toISOString().split('T')[0];
    return filteredTasks.filter(task => 
      task.dueDate && task.dueDate.startsWith(dateStr)
    );
  };

  const handleTaskDrop = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    const dateStr = date.toISOString().split('T')[0];
    
    if (taskId) {
      updateTask(taskId, { dueDate: dateStr });
    }
  };

  const handleDateClick = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const taskTitle = prompt('Add new task for ' + date.toLocaleDateString());
    
    if (taskTitle?.trim()) {
      addTask({
        title: taskTitle,
        dueDate: dateStr,
        projectId: currentView !== 'inbox' ? currentView : undefined
      });
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === currentDate.getMonth();
  };

  const days = getDaysInMonth(currentDate);
  const monthYear = currentDate.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="heading-1 text-foreground mb-2">Calendar</h1>
            <p className="text-muted-foreground">
              Organize tasks by due date
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="gap-2"
            >
              <Calendar size={16} />
              Today
            </Button>
            
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('prev')}
              >
                <CaretLeft size={16} />
              </Button>
              
              <h2 className="text-lg font-semibold min-w-48 text-center">
                {monthYear}
              </h2>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('next')}
              >
                <CaretRight size={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Card className="flex-1 flex flex-col">
        <CardHeader className="pb-4">
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-0">
          <div className="grid grid-cols-7 gap-0 h-full">
            {days.map((date, index) => {
              const tasksForDate = getTasksForDate(date);
              const isDateToday = isToday(date);
              const isDateCurrentMonth = isCurrentMonth(date);
              
              return (
                <div
                  key={index}
                  className={cn(
                    "border-r border-b border-border p-2 min-h-32 flex flex-col cursor-pointer transition-colors",
                    "hover:bg-muted/50",
                    !isDateCurrentMonth && "text-muted-foreground bg-muted/20",
                    isDateToday && "bg-primary/5 border-primary"
                  )}
                  onDrop={(e) => handleTaskDrop(e, date)}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => handleDateClick(date)}
                >
                  <div className={cn(
                    "text-sm font-medium mb-2",
                    isDateToday && "text-primary font-bold"
                  )}>
                    {date.getDate()}
                  </div>
                  
                  <div className="space-y-1 flex-1 overflow-hidden">
                    {tasksForDate.slice(0, 3).map((task) => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => {
                          e.stopPropagation();
                          e.dataTransfer.setData('text/plain', task.id);
                        }}
                        className={cn(
                          "text-xs p-1 rounded bg-card border border-border truncate cursor-move",
                          "hover:shadow-sm transition-shadow",
                          task.completed && "opacity-60 line-through"
                        )}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-1">
                          {task.priority <= 2 && (
                            <div className={cn(
                              "w-1.5 h-1.5 rounded-full flex-shrink-0",
                              task.priority === 1 ? "bg-red-500" : "bg-orange-500"
                            )} />
                          )}
                          <span className="truncate">{task.title}</span>
                        </div>
                      </div>
                    ))}
                    
                    {tasksForDate.length > 3 && (
                      <div className="text-xs text-muted-foreground text-center">
                        +{tasksForDate.length - 3} more
                      </div>
                    )}
                    
                    {tasksForDate.length === 0 && (
                      <div className="flex items-center justify-center h-full opacity-0 hover:opacity-100 transition-opacity">
                        <Plus size={16} className="text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}