import { useEffect, useState } from 'react';
import { projectStatusService, ProjectStatusHistoryDocument } from '@/services/project-status.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { formatDistanceToNow } from 'date-fns';
import {
  ClipboardText,
  HourglassHigh,
  PlayCircle,
  CheckCircle,
  Archive,
  WarningCircle,
  Lightbulb,
  ArrowRight,
} from '@phosphor-icons/react';

interface ProjectStatusHistoryProps {
  projectId: string;
  userId?: string;
}

const STATUS_CONFIG = {
  planning: { label: 'Planning', icon: Lightbulb, color: '#9B59B6' },
  in_progress: { label: 'In Progress', icon: PlayCircle, color: '#3498DB' },
  on_hold: { label: 'On Hold', icon: HourglassHigh, color: '#F39C12' },
  completed: { label: 'Completed', icon: CheckCircle, color: '#27AE60' },
  archived: { label: 'Archived', icon: Archive, color: '#95A5A6' },
  blocked: { label: 'Blocked', icon: WarningCircle, color: '#E74C3C' },
  active: { label: 'Active', icon: ClipboardText, color: '#2E5AAC' },
} as const;

export function ProjectStatusHistory({ projectId, userId }: ProjectStatusHistoryProps) {
  const [history, setHistory] = useState<ProjectStatusHistoryDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, [projectId, userId]);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const data = await projectStatusService.getProjectStatusHistory(projectId, userId);
      setHistory(data);
    } catch (error) {
      console.error('Failed to load status history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.active;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Status History</CardTitle>
          <CardDescription>Loading status changes...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Status History</CardTitle>
          <CardDescription>No status changes recorded yet</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status History</CardTitle>
        <CardDescription>
          {history.length} status {history.length === 1 ? 'change' : 'changes'} recorded
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {history.map((entry, index) => {
              const fromConfig = getStatusConfig(entry.fromStatus);
              const toConfig = getStatusConfig(entry.toStatus);
              const FromIcon = fromConfig.icon;
              const ToIcon = toConfig.icon;

              return (
                <div
                  key={entry.$id}
                  className="flex gap-4 pb-4 border-b border-border last:border-0"
                >
                  {/* Timeline indicator */}
                  <div className="flex flex-col items-center">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: toConfig.color }}
                    />
                    {index < history.length - 1 && (
                      <div className="w-0.5 h-full bg-border mt-2" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-2">
                    {/* Status change */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant="outline"
                        className="gap-1.5"
                        style={{ borderColor: fromConfig.color }}
                      >
                        <FromIcon size={14} style={{ color: fromConfig.color }} />
                        {fromConfig.label}
                      </Badge>
                      <ArrowRight size={16} className="text-muted-foreground" />
                      <Badge
                        variant="outline"
                        className="gap-1.5"
                        style={{ borderColor: toConfig.color }}
                      >
                        <ToIcon size={14} style={{ color: toConfig.color }} />
                        {toConfig.label}
                      </Badge>
                    </div>

                    {/* Notes */}
                    {entry.notes && (
                      <p className="text-sm text-muted-foreground">{entry.notes}</p>
                    )}

                    {/* Timestamp */}
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(entry.changedAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
