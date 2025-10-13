import { useState, useEffect } from 'react';
import { labelsService, type Label } from '@/services/labels.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { LabelDialog } from './LabelDialog.tsx';
import { toast } from 'sonner';
import { Plus, PencilSimple, Trash, Tag } from '@phosphor-icons/react';

interface LabelManagementProps {
  userId: string;
}

export function LabelManagement({ userId }: LabelManagementProps) {
  const [labels, setLabels] = useState<Label[]>([]);
  const [selectedLabel, setSelectedLabel] = useState<Label | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLabels();
  }, [userId]);

  const loadLabels = async () => {
    setIsLoading(true);
    try {
      const data = await labelsService.getUserLabels(userId);
      setLabels(data);
    } catch (error) {
      console.error('Failed to load labels:', error);
      toast.error('Failed to load labels');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateLabel = () => {
    setSelectedLabel(null);
    setIsDialogOpen(true);
  };

  const handleEditLabel = (label: Label) => {
    setSelectedLabel(label);
    setIsDialogOpen(true);
  };

  const handleDeleteLabel = async (labelId: string, labelName: string) => {
    if (!confirm(`Are you sure you want to delete the label "${labelName}"? This will remove it from all projects.`)) {
      return;
    }

    try {
      await labelsService.deleteLabel(labelId);
      toast.success('Label deleted successfully');
      loadLabels();
    } catch (error) {
      console.error('Failed to delete label:', error);
      toast.error('Failed to delete label');
    }
  };

  const handleSaveLabel = async () => {
    await loadLabels();
    setIsDialogOpen(false);
    setSelectedLabel(null);
  };

  const handleCreateDefaults = async () => {
    try {
      await labelsService.createDefaultLabels(userId);
      toast.success('Default labels created successfully');
      loadLabels();
    } catch (error) {
      console.error('Failed to create default labels:', error);
      toast.error('Failed to create default labels');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading labels...</p>
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Tag size={24} />
                Project Labels
              </CardTitle>
              <CardDescription>
                Manage labels to organize and categorize your projects
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {labels.length === 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCreateDefaults}
                  className="gap-2"
                >
                  <Plus size={16} />
                  Create Defaults
                </Button>
              )}
              <Button size="sm" onClick={handleCreateLabel} className="gap-2">
                <Plus size={16} />
                New Label
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {labels.length === 0 ? (
            <div className="text-center py-12">
              <Tag size={48} className="mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No labels yet</h3>
              <p className="text-muted-foreground mb-4">
                Create labels to organize your projects by category, client, or priority
              </p>
              <div className="flex gap-2 justify-center">
                <Button onClick={handleCreateDefaults} variant="outline" className="gap-2">
                  <Plus size={16} />
                  Create Default Labels
                </Button>
                <Button onClick={handleCreateLabel} className="gap-2">
                  <Plus size={16} />
                  Create Custom Label
                </Button>
              </div>
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {labels.map((label) => (
                  <div
                    key={label.$id}
                    className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 flex-1">
                        <div
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: label.color }}
                        />
                        <span className="font-medium truncate">{label.name}</span>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditLabel(label)}
                          className="h-8 w-8 p-0"
                        >
                          <PencilSimple size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteLabel(label.$id, label.name)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `${label.color}20`,
                          color: label.color,
                        }}
                      >
                        <Tag size={12} />
                        {label.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <LabelDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        label={selectedLabel}
        userId={userId}
        onSave={handleSaveLabel}
      />
    </>
  );
}
