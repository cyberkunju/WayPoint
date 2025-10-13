import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { projectService, type Project } from '@/services/project.service';
import { projectStatusService } from '@/services/project-status.service';
import { toast } from 'sonner';
import {
  ClipboardText,
  HourglassHigh,
  PlayCircle,
  CheckCircle,
  Archive,
  WarningCircle,
  Lightbulb,
} from '@phosphor-icons/react';

interface ProjectStatusDialogProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChanged?: () => void;
}

const STATUS_OPTIONS = [
  {
    value: 'planning',
    label: 'Planning',
    icon: Lightbulb,
    color: '#9B59B6',
    description: 'Project is in planning phase',
  },
  {
    value: 'in_progress',
    label: 'In Progress',
    icon: PlayCircle,
    color: '#3498DB',
    description: 'Project is actively being worked on',
  },
  {
    value: 'on_hold',
    label: 'On Hold',
    icon: HourglassHigh,
    color: '#F39C12',
    description: 'Project is temporarily paused',
  },
  {
    value: 'completed',
    label: 'Completed',
    icon: CheckCircle,
    color: '#27AE60',
    description: 'Project has been completed',
  },
  {
    value: 'archived',
    label: 'Archived',
    icon: Archive,
    color: '#95A5A6',
    description: 'Project is archived',
  },
  {
    value: 'blocked',
    label: 'Blocked',
    icon: WarningCircle,
    color: '#E74C3C',
    description: 'Project is blocked by dependencies',
  },
  {
    value: 'active',
    label: 'Active',
    icon: ClipboardText,
    color: '#2E5AAC',
    description: 'Project is active (default)',
  },
] as const;

export function ProjectStatusDialog({
  project,
  open,
  onOpenChange,
  onStatusChanged,
}: ProjectStatusDialogProps) {
  const [newStatus, setNewStatus] = useState<string>(project.status);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentStatusOption = STATUS_OPTIONS.find((opt) => opt.value === project.status);
  const newStatusOption = STATUS_OPTIONS.find((opt) => opt.value === newStatus);

  const handleSubmit = async () => {
    if (newStatus === project.status) {
      toast.info('Status unchanged');
      onOpenChange(false);
      return;
    }

    setIsSubmitting(true);

    try {
      // Update project status
      await projectService.updateProjectStatus(project.$id, newStatus as any);

      // Record status change in history
      await projectStatusService.recordStatusChange(
        project.$id,
        project.userId,
        project.status,
        newStatus,
        notes || undefined
      );

      toast.success(`Project status changed to ${newStatusOption?.label}`);
      onStatusChanged?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update project status:', error);
      toast.error('Failed to update project status');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Change Project Status</DialogTitle>
          <DialogDescription>
            Update the status of "{project.name}" and optionally add notes about the change.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Status */}
          <div className="space-y-2">
            <Label>Current Status</Label>
            <div className="flex items-center gap-3 p-3 rounded-md bg-secondary/50">
              {currentStatusOption && (
                <>
                  <currentStatusOption.icon
                    size={20}
                    style={{ color: currentStatusOption.color }}
                  />
                  <div>
                    <div className="font-medium">{currentStatusOption.label}</div>
                    <div className="text-sm text-muted-foreground">
                      {currentStatusOption.description}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* New Status */}
          <div className="space-y-2">
            <Label htmlFor="status">New Status</Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <option.icon size={16} style={{ color: option.color }} />
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {newStatusOption && newStatus !== project.status && (
              <p className="text-sm text-muted-foreground">
                {newStatusOption.description}
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add notes about this status change..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              These notes will be saved in the project's status history.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || newStatus === project.status}
          >
            {isSubmitting ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
