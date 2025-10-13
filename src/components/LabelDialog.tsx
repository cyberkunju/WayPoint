import { useState, useEffect } from 'react';
import { labelsService, type Label } from '@/services/labels.service';
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
import { Label as UILabel } from './ui/label';
import { toast } from 'sonner';
import { Tag } from '@phosphor-icons/react';

interface LabelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  label: Label | null;
  userId: string;
  onSave: () => void;
}

const PRESET_COLORS = [
  '#2E5AAC', // Deep Blue
  '#27AE60', // Green
  '#9B51E0', // Purple
  '#F2994A', // Orange
  '#EB5757', // Red
  '#F2C94C', // Yellow
  '#56CCF2', // Light Blue
  '#6FCF97', // Light Green
  '#BB6BD9', // Light Purple
  '#F2994A', // Warm Orange
  '#E74C3C', // Bright Red
  '#95A5A6', // Gray
];

export function LabelDialog({ open, onOpenChange, label, userId, onSave }: LabelDialogProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#F2994A');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    if (label) {
      setName(label.name);
      setColor(label.color);
    } else {
      setName('');
      setColor('#F2994A');
    }
    setNameError('');
  }, [label, open]);

  const validateName = async (value: string): Promise<boolean> => {
    if (!value.trim()) {
      setNameError('Label name is required');
      return false;
    }

    if (value.length > 50) {
      setNameError('Label name must be 50 characters or less');
      return false;
    }

    // Check if name already exists (excluding current label if editing)
    try {
      const exists = await labelsService.labelNameExists(
        value.trim(),
        userId,
        label?.$id
      );

      if (exists) {
        setNameError('A label with this name already exists');
        return false;
      }
    } catch (error) {
      console.error('Error checking label name:', error);
    }

    setNameError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = await validateName(name);
    if (!isValid) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (label) {
        // Update existing label
        await labelsService.updateLabel(label.$id, {
          name: name.trim(),
          color,
        });
        toast.success('Label updated successfully');
      } else {
        // Create new label
        await labelsService.createLabel(
          {
            name: name.trim(),
            color,
          },
          userId
        );
        toast.success('Label created successfully');
      }

      onSave();
    } catch (error) {
      console.error('Failed to save label:', error);
      toast.error(`Failed to ${label ? 'update' : 'create'} label`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (nameError) {
      setNameError('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag size={24} />
              {label ? 'Edit Label' : 'Create New Label'}
            </DialogTitle>
            <DialogDescription>
              {label
                ? 'Update the label name and color'
                : 'Create a new label to organize your projects'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-6">
            {/* Label Name */}
            <div className="space-y-2">
              <UILabel htmlFor="name">
                Label Name <span className="text-destructive">*</span>
              </UILabel>
              <Input
                id="name"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g., Client, Internal, Urgent"
                maxLength={50}
                className={nameError ? 'border-destructive' : ''}
                autoFocus
              />
              {nameError && (
                <p className="text-sm text-destructive">{nameError}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {name.length}/50 characters
              </p>
            </div>

            {/* Color Picker */}
            <div className="space-y-3">
              <UILabel>Label Color</UILabel>
              <div className="grid grid-cols-6 gap-2">
                {PRESET_COLORS.map((presetColor) => (
                  <button
                    key={presetColor}
                    type="button"
                    onClick={() => setColor(presetColor)}
                    className={`w-full aspect-square rounded-md transition-all hover:scale-110 ${
                      color === presetColor
                        ? 'ring-2 ring-offset-2 ring-primary scale-110'
                        : ''
                    }`}
                    style={{ backgroundColor: presetColor }}
                    title={presetColor}
                  />
                ))}
              </div>

              {/* Custom Color Input */}
              <div className="flex items-center gap-2 pt-2">
                <UILabel htmlFor="custom-color" className="text-sm">
                  Custom:
                </UILabel>
                <div className="flex items-center gap-2 flex-1">
                  <input
                    id="custom-color"
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="h-10 w-20 rounded border cursor-pointer"
                  />
                  <Input
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="#F2994A"
                    maxLength={7}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <UILabel>Preview</UILabel>
              <div className="p-4 rounded-lg border bg-muted/50">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="font-medium">{name || 'Label Name'}</span>
                </div>
                <div className="mt-3">
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: `${color}20`,
                      color: color,
                    }}
                  >
                    <Tag size={12} />
                    {name || 'Label Name'}
                  </span>
                </div>
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
            <Button type="submit" disabled={isSubmitting || !name.trim()}>
              {isSubmitting ? 'Saving...' : label ? 'Update Label' : 'Create Label'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
