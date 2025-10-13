import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Plus, Trash } from '@phosphor-icons/react';
import { customFieldsService, type CustomField, type CustomFieldValue } from '@/services/custom-fields.service';
import { CustomFieldsDialog } from './CustomFieldsDialog';

interface CustomFieldsSectionProps {
  taskId: string;
  userId: string;
  projectId?: string;
  customFieldsJson?: string;
  onUpdate: (customFieldsJson: string) => void;
}

export function CustomFieldsSection({
  taskId,
  userId,
  projectId,
  customFieldsJson,
  onUpdate
}: CustomFieldsSectionProps) {
  const [fields, setFields] = useState<CustomField[]>([]);
  const [values, setValues] = useState<CustomFieldValue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    loadFields();
  }, [userId, projectId]);

  useEffect(() => {
    setValues(customFieldsService.parseCustomFieldValues(customFieldsJson));
  }, [customFieldsJson]);

  const loadFields = async () => {
    setIsLoading(true);
    try {
      const loadedFields = projectId
        ? await customFieldsService.getFieldsForProject(userId, projectId)
        : await customFieldsService.getGlobalFields(userId);
      setFields(loadedFields);
    } catch (error) {
      console.error('Error loading custom fields:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getFieldValue = (fieldId: string): string | number | boolean | string[] => {
    const fieldValue = values.find(v => v.fieldId === fieldId);
    return fieldValue?.value ?? '';
  };

  const handleFieldChange = (fieldId: string, value: string | number | boolean | string[]) => {
    const newCustomFieldsJson = customFieldsService.setFieldValue(customFieldsJson, fieldId, value);
    onUpdate(newCustomFieldsJson);
  };

  const handleDeleteField = async (fieldId: string) => {
    if (!confirm('Are you sure you want to delete this custom field? This will remove it from all tasks.')) {
      return;
    }

    try {
      await customFieldsService.deleteCustomField(fieldId);
      await loadFields();
      
      // Remove the value from this task
      const newCustomFieldsJson = customFieldsService.removeFieldValue(customFieldsJson, fieldId);
      onUpdate(newCustomFieldsJson);
    } catch (error) {
      console.error('Error deleting custom field:', error);
    }
  };

  const renderFieldInput = (field: CustomField) => {
    const value = getFieldValue(field.$id);

    switch (field.fieldType) {
      case 'text':
      case 'email':
      case 'phone':
      case 'url':
        return (
          <Input
            type={field.fieldType === 'email' ? 'email' : field.fieldType === 'url' ? 'url' : 'text'}
            value={String(value)}
            onChange={(e) => handleFieldChange(field.$id, e.target.value)}
            placeholder={field.defaultValue || `Enter ${field.name.toLowerCase()}`}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={String(value)}
            onChange={(e) => handleFieldChange(field.$id, e.target.value ? Number(e.target.value) : '')}
            placeholder={field.defaultValue || `Enter ${field.name.toLowerCase()}`}
          />
        );

      case 'date':
        return (
          <Input
            type="date"
            value={String(value)}
            onChange={(e) => handleFieldChange(field.$id, e.target.value)}
          />
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`field-${field.$id}`}
              checked={Boolean(value)}
              onCheckedChange={(checked) => handleFieldChange(field.$id, checked as boolean)}
            />
            <label
              htmlFor={`field-${field.$id}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {field.description || 'Enable'}
            </label>
          </div>
        );

      case 'dropdown':
        return (
          <Select
            value={String(value)}
            onValueChange={(newValue) => handleFieldChange(field.$id, newValue)}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${field.name.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'multi-select':
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`field-${field.$id}-${option}`}
                  checked={selectedValues.includes(option)}
                  onCheckedChange={(checked) => {
                    const newValues = checked
                      ? [...selectedValues, option]
                      : selectedValues.filter(v => v !== option);
                    handleFieldChange(field.$id, newValues);
                  }}
                />
                <label
                  htmlFor={`field-${field.$id}-${option}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {option}
                </label>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="text-sm text-muted-foreground">
        Loading custom fields...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Custom Fields</Label>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDialog(true)}
        >
          <Plus size={16} className="mr-1" />
          Add Field
        </Button>
      </div>

      {fields.length === 0 ? (
        <div className="text-sm text-muted-foreground text-center py-4">
          No custom fields defined.
          <br />
          Click "Add Field" to create one.
        </div>
      ) : (
        <div className="space-y-4">
          {fields.map((field) => (
            <div key={field.$id} className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor={`field-${field.$id}`} className="text-sm">
                  {field.name}
                  {field.isRequired && <span className="text-destructive ml-1">*</span>}
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteField(field.$id)}
                  className="h-6 w-6 p-0"
                >
                  <Trash size={14} />
                </Button>
              </div>
              {field.description && (
                <p className="text-xs text-muted-foreground">{field.description}</p>
              )}
              {renderFieldInput(field)}
            </div>
          ))}
        </div>
      )}

      <CustomFieldsDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        userId={userId}
        projectId={projectId}
        onFieldCreated={loadFields}
      />
    </div>
  );
}
