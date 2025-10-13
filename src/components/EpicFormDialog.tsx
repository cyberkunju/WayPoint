import { useState, useEffect } from 'react';
import { epicService, type Epic, type CreateEpicData } from '@/services/epic.service';
import { projectService, type Project } from '@/services/project.service';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { Rocket, Calendar } from '@phosphor-icons/react';

interface EpicFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  epic: Epic | null;
  userId: string;
  onSave: () => void;
  parentEpicId?: string;
  projectId?: string;
}

const EPIC_STATUSES = [
  { value: 'planning', label: 'Planning' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
  { value: 'blocked', label: 'Blocked' },
] as const;

export function EpicFormDialog({
  open,
  onOpenChange,
  epic,
  userId,
  onSave,
  parentEpicId,
  projectId,
}: EpicFormDialogProps) {
  const [formData, setFormData] = useState<CreateEpicData>({
    name: '',
    description: '',
    status: 'planning',
    projectId: projectId,
    parentEpicId: parentEpicId,
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [parentEpics, setParentEpics] = useState<Epic[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      loadProjects();
      loadParentEpics();
    }
  }, [open, userId]);

  useEffect(() => {
    if (epic) {
      setFormData({
        name: epic.name,
        description: epic.description,
        status: epic.status,
        projectId: epic.projectId,
        parentEpicId: epic.parentEpicId,
        startDate: epic.startDate,
        endDate: epic.endDate,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        status: 'planning',
        projectId: projectId,
        parentEpicId: parentEpicId,
      });
    }
    setErrors({});
  }, [epic, open, projectId, parentEpicId]);

  const loadProjects = async () => {
    try {
      const data = await projectService.listProjects({ userId });
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const loadParentEpics = async () => {
    try {
      // Load top-level epics (no parent) for selection
      const data = await epicService.getTopLevelEpics(userId);
      // Filter out the current epic if editing (can't be its own parent)
      const filtered = epic ? data.filter(e => e.$id !== epic.$id) : data;
      setParentEpics(filtered);
    } catch (error) {
      console.error('Failed to load parent epics:', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Epic name is required';
    } else if (formData.name.length > 255) {
      newErrors.name = 'Epic name must be 255 characters or less';
    }

    if (formData.description && formData.description.length > 10000) {
      newErrors.description = 'Description must be 10,000 characters or less';
    }

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.startDate) > new Date(formData.endDate)) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (epic) {
        // Update existing epic
        await epicService.updateEpic(epic.$id, formData);
        toast.success('Epic updated successfully');
      } else {
        // Create new epic
        await epicService.createEpic(formData, userId);
        toast.success('Epic created successfully');
      }

      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save epic:', error);
      toast.error(`Failed to ${epic ? 'update' : 'create'} epic`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof CreateEpicData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Rocket size={24} />
              {epic ? 'Edit Epic' : 'Create New Epic'}
            </DialogTitle>
            <DialogDescription>
              {epic
                ? 'Update epic details and settings'
                : 'Create a new epic to organize large initiatives'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-6">
            {/* Epic Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Epic Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Q1 Product Launch"
                maxLength={255}
                className={errors.name ? 'border-destructive' : ''}
                autoFocus
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Describe the epic goals and success criteria..."
                rows={3}
                maxLength={10000}
                className={errors.description ? 'border-destructive' : ''}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description}</p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
              >
                {EPIC_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Project */}
            <div className="space-y-2">
              <Label htmlFor="projectId">Project (Optional)</Label>
              <select
                id="projectId"
                value={formData.projectId || ''}
                onChange={(e) => handleChange('projectId', e.target.value || undefined)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
              >
                <option value="">No Project</option>
                {projects.map((project) => (
                  <option key={project.$id} value={project.$id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Parent Epic */}
            <div className="space-y-2">
              <Label htmlFor="parentEpicId">Parent Epic (Optional)</Label>
              <select
                id="parentEpicId"
                value={formData.parentEpicId || ''}
                onChange={(e) => handleChange('parentEpicId', e.target.value || undefined)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
              >
                <option value="">No Parent (Top-Level Epic)</option>
                {parentEpics.map((parentEpic) => (
                  <option key={parentEpic.$id} value={parentEpic.$id}>
                    {parentEpic.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Nested epics help organize large initiatives into smaller components
              </p>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="flex items-center gap-2">
                  <Calendar size={16} />
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate || ''}
                  onChange={(e) => handleChange('startDate', e.target.value || undefined)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="flex items-center gap-2">
                  <Calendar size={16} />
                  End Date
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate || ''}
                  onChange={(e) => handleChange('endDate', e.target.value || undefined)}
                  className={errors.endDate ? 'border-destructive' : ''}
                />
                {errors.endDate && (
                  <p className="text-sm text-destructive">{errors.endDate}</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !formData.name.trim()}>
              {isSubmitting
                ? 'Saving...'
                : epic
                ? 'Update Epic'
                : 'Create Epic'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
