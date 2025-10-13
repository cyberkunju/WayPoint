import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Plus, X } from '@phosphor-icons/react';
import { customFieldsService, type CustomFieldType } from '@/services/custom-fields.service';

interface CustomFieldsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  projectId?: string;
  onFieldCreated?: () => void;
}

export function CustomFieldsDialog({
  open,
  onOpenChange,
  userId,
  projectId,
  onFieldCreated
}: CustomFieldsDialogProps) {
  const [name, setName] = useState('');
  const [fieldType, setFieldType] = useState<CustomFieldType>('text');
  const [description, setDescription] = useState('');
  const [isRequired, setIsRequired] = useState(false);
  const [isGlobal, setIsGlobal] = useState(true);
  const [options, setOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState('');
  const [defaultValue, setDefaultValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fieldTypes: { value: CustomFieldType; label: string }[] = [
    { value: 'text', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'date', label: 'Date' },
    { value: 'dropdown', label: 'Dropdown' },
    { value: 'multi-select', label: 'Multi-Select' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'url', label: 'URL' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
  ];

  const needsOptions = fieldType === 'dropdown' || fieldType === 'multi-select';

  const handleAddOption = () => {
    if (newOption.trim() && !options.includes(newOption.trim())) {
      setOptions([...options, newOption.trim()]);
      setNewOption('');
    }
  };

  const handleRemoveOption = (option: string) => {
    setOptions(options.filter(o => o !== option));
  };

  const handleSubmit = async () => {
    setError('');

    // Validation
    if (!name.trim()) {
      setError('Field name is required');
      return;
    }

    if (needsOptions && options.length === 0) {
      setError('At least one option is required for dropdown/multi-select fields');
      return;
    }

    setIsSubmitting(true);

    try {
      await customFieldsService.createCustomField(
        {
          name: name.trim(),
          fieldType,
          description: description.trim() || undefined,
          options: needsOptions ? options : undefined,
          defaultValue: defaultValue.trim() || undefined,
          isRequired,
          isGlobal,
          projectId: isGlobal ? undefined : projectId,
          position: 0,
        },
        userId
      );

      // Reset form
      setName('');
      setFieldType('text');
      setDescription('');
      setIsRequired(false);
      setIsGlobal(true);
      setOptions([]);
      setDefaultValue('');
      
      onFieldCreated?.();
      onOpenChange(false);
    } catch (err) {
      console.error('Error creating custom field:', err);
      setError('Failed to create custom field. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Custom Field</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Field Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Client Name, Budget, Status"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fieldType">Field Type *</Label>
            <Select value={fieldType} onValueChange={(value) => setFieldType(value as CustomFieldType)}>
              <SelectTrigger id="fieldType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fieldTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description for this field"
              rows={2}
            />
          </div>

          {needsOptions && (
            <div className="space-y-2">
              <Label>Options *</Label>
              <div className="flex gap-2">
                <Input
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  placeholder="Add an option"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddOption();
                    }
                  }}
                />
                <Button type="button" onClick={handleAddOption} size="sm">
                  <Plus size={16} />
                </Button>
              </div>
              {options.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {options.map((option) => (
                    <div
                      key={option}
                      className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-md text-sm"
                    >
                      <span>{option}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(option)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="defaultValue">Default Value</Label>
            <Input
              id="defaultValue"
              value={defaultValue}
              onChange={(e) => setDefaultValue(e.target.value)}
              placeholder="Optional default value"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="isRequired">Required Field</Label>
            <Switch
              id="isRequired"
              checked={isRequired}
              onCheckedChange={setIsRequired}
            />
          </div>

          {projectId && (
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="isGlobal">Global Field</Label>
                <p className="text-xs text-muted-foreground">
                  Apply to all projects or just this project
                </p>
              </div>
              <Switch
                id="isGlobal"
                checked={isGlobal}
                onCheckedChange={setIsGlobal}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Field'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
