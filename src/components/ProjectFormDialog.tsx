import { useState, useEffect } from 'react';
import { projectService, type Project, type CreateProjectData } from '@/services/project.service';
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
import { LabelSelector } from './LabelSelector';
import { toast } from 'sonner';
import { FolderOpen, Calendar } from '@phosphor-icons/react';

interface ProjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
  userId: string;
  onSave: () => void;
}

const PROJECT_COLORS = [
  '#2E5AAC', // Deep Blue
  '#27AE60', // Green
  '#9B51E0', // Purple
  '#F2994A', // Orange
  '#EB5757', // Red
  '#F2C94C', // Yellow
  '#56CCF2', // Light Blue
  '#6FCF97', // Light Green
];

const PROJECT_STATUSES = [
  { value: 'planning', label: 'Planning' },
  { value: 'active', label: 'Active' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
  { value: 'blocked', label: 'Blocked' },
] as const;

export function ProjectFormDialog({
  open,
  onOpenChange,
  project,
  userId,
  onSave,
}: ProjectFormDialogProps) {
  const [formData, setFormData] = useState<CreateProjectData>({
    name: '',
    description: '',
    color: '#2E5AAC',
    status: 'active',
    isExpanded: true,
    labels: [],
    position: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description,
        color: project.color,
        status: project.status,
        parentId: project.parentId,
        isExpanded: project.isExpanded,
        startDate: project.startDate,
        endDate: project.endDate,
        labels: project.labels,
        position: project.position,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        color: '#2E5AAC',
        status: 'active',
        isExpanded: true,
        labels: [],
        position: 0,
      });
    }
    setErrors({});
  }, [project, open]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    } else if (formData.name.length > 255) {
      newErrors.name = 'Project name must be 255 characters or less';
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
      if (project) {
        // Update existing project
        await projectService.updateProject(project.$id, formData);
        toast.success('Project updated successfully');
      } else {
        // Create new project
        await projectService.createProject(formData, userId);
        toast.success('Project created successfully');
      }

      onSave();
    } catch (error) {
      console.error('Failed to save project:', error);
      toast.error(`Failed to ${project ? 'update' : 'create'} project`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof CreateProjectData, value: any) => {
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
              <FolderOpen size={24} />
              {project ? 'Edit Project' : 'Create New Project'}
            </DialogTitle>
            <DialogDescription>
              {project
                ? 'Update project details and settings'
                : 'Create a new project to organize your tasks'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-6">
            {/* Project Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Project Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Website Redesign"
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
                placeholder="Describe the project goals and objectives..."
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
                {PROJECT_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Color Picker */}
            <div className="space-y-2">
              <Label>Project Color</Label>
              <div className="flex items-center gap-2">
                {PROJECT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleChange('color', color)}
                    className={`w-8 h-8 rounded-md transition-all hover:scale-110 ${
                      formData.color === color
                        ? 'ring-2 ring-offset-2 ring-primary scale-110'
                        : ''
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => handleChange('color', e.target.value)}
                  className="w-8 h-8 rounded-md border cursor-pointer"
                />
              </div>
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

            {/* Labels */}
            <LabelSelector
              userId={userId}
              selectedLabelIds={formData.labels}
              onLabelsChange={(labels) => handleChange('labels', labels)}
            />
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
                : project
                ? 'Update Project'
                : 'Create Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
