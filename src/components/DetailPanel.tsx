import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { X, CalendarBlank, Tag, User, Clock } from '@phosphor-icons/react';
import { useTaskStore } from '../hooks/use-store';
import { useAppContext } from '../contexts/AppContext';
import { formatDate, getPriorityColor } from '../lib/utils-tasks';
import { TaskDependencies } from './TaskDependencies';
import { CustomFieldsSection } from './CustomFieldsSection';
import { account } from '@/lib/appwrite';
import { useState, useEffect } from 'react';

export function DetailPanel() {
  const { tasks, updateTask } = useTaskStore();
  const { selectedTaskId, setSelectedTaskId, setIsDetailPanelOpen } = useAppContext();
  const [userId, setUserId] = useState<string>('');
  
  const task = tasks?.find(t => t.id === selectedTaskId);

  useEffect(() => {
    const getUserId = async () => {
      try {
        const user = await account.get();
        setUserId(user.$id);
      } catch (err) {
        console.error('Error getting user:', err);
      }
    };
    getUserId();
  }, []);

  if (!task) {
    return null;
  }

  const handleClose = () => {
    setSelectedTaskId(null);
    setIsDetailPanelOpen(false);
  };

  const handleDescriptionChange = (description: string) => {
    updateTask(task.id, { description });
  };

  return (
    <div className="w-96 border-l border-border bg-background slide-in-right">
      <div className="p-6 border-b border-border">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="heading-2 text-foreground mb-2">{task.title}</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {task.dueDate && (
                <div className="flex items-center gap-1">
                  <CalendarBlank size={14} />
                  <span>{formatDate(task.dueDate)}</span>
                </div>
              )}
              <div className={`flex items-center gap-1 ${getPriorityColor(task.priority)}`}>
                <span>Priority {task.priority}</span>
              </div>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleClose}
          >
            <X size={20} />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="details" className="flex-1">
        <TabsList className="w-full px-6 mt-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <div className="p-6">
          <TabsContent value="details" className="space-y-6">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Description
              </label>
              <Textarea
                placeholder="Add a description..."
                value={task.description || ''}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                className="min-h-32"
              />
            </div>

            {task.labels.length > 0 && (
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Labels
                </label>
                <div className="flex flex-wrap gap-2">
                  {task.labels.map((label) => (
                    <Badge key={label} variant="secondary">
                      <Tag size={12} className="mr-1" />
                      {label}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {task.assignee && (
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Assignee
                </label>
                <div className="flex items-center gap-2">
                  <User size={16} />
                  <span className="text-sm">{task.assignee}</span>
                </div>
              </div>
            )}

            {task.estimatedTime && (
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Estimated Time
                </label>
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  <span className="text-sm">{task.estimatedTime} minutes</span>
                </div>
              </div>
            )}

            {/* Task Dependencies */}
            {userId && (
              <div className="pt-4 border-t border-border">
                <TaskDependencies taskId={task.id} userId={userId} />
              </div>
            )}

            {/* Custom Fields */}
            {userId && (
              <div className="pt-4 border-t border-border">
                <CustomFieldsSection
                  taskId={task.id}
                  userId={userId}
                  projectId={task.projectId}
                  customFieldsJson={task.customFields}
                  onUpdate={(customFieldsJson) => updateTask(task.id, { customFields: customFieldsJson })}
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="comments">
            <div className="text-center text-muted-foreground py-8">
              <p>Comments feature coming soon</p>
            </div>
          </TabsContent>

          <TabsContent value="activity">
            <div className="space-y-4">
              <div className="text-sm">
                <span className="text-muted-foreground">Created: </span>
                <span>{new Date(task.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Updated: </span>
                <span>{new Date(task.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}