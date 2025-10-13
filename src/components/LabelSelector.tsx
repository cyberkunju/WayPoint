import { useState, useEffect } from 'react';
import { labelsService, type Label } from '@/services/labels.service';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label as UILabel } from './ui/label';
import { ScrollArea } from './ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { LabelBadge } from './LabelBadge';
import { toast } from 'sonner';
import { Tag, Plus, MagnifyingGlass, Check } from '@phosphor-icons/react';

interface LabelSelectorProps {
  userId: string;
  selectedLabelIds: string[];
  onLabelsChange: (labelIds: string[]) => void;
  className?: string;
}

export function LabelSelector({
  userId,
  selectedLabelIds,
  onLabelsChange,
  className = '',
}: LabelSelectorProps) {
  const [allLabels, setAllLabels] = useState<Label[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLabels();
  }, [userId]);

  const loadLabels = async () => {
    setIsLoading(true);
    try {
      const data = await labelsService.getUserLabels(userId);
      setAllLabels(data);
    } catch (error) {
      console.error('Failed to load labels:', error);
      toast.error('Failed to load labels');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedLabels = allLabels.filter((label) =>
    selectedLabelIds.includes(label.$id)
  );

  const filteredLabels = allLabels.filter((label) =>
    label.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleLabel = (labelId: string) => {
    if (selectedLabelIds.includes(labelId)) {
      onLabelsChange(selectedLabelIds.filter((id) => id !== labelId));
    } else {
      onLabelsChange([...selectedLabelIds, labelId]);
    }
  };

  const handleRemoveLabel = (labelId: string) => {
    onLabelsChange(selectedLabelIds.filter((id) => id !== labelId));
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <UILabel className="flex items-center gap-2">
        <Tag size={16} />
        Labels
      </UILabel>

      {/* Selected Labels Display */}
      {selectedLabels.length > 0 && (
        <div className="flex flex-wrap gap-1.5 p-2 rounded-md border bg-muted/50">
          {selectedLabels.map((label) => (
            <LabelBadge
              key={label.$id}
              label={label}
              size="sm"
              onRemove={() => handleRemoveLabel(label.$id)}
            />
          ))}
        </div>
      )}

      {/* Label Selector Popover */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start gap-2"
          >
            <Plus size={16} />
            {selectedLabels.length === 0
              ? 'Add labels'
              : `${selectedLabels.length} label${selectedLabels.length > 1 ? 's' : ''} selected`}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <div className="p-3 border-b">
            <div className="relative">
              <MagnifyingGlass
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                placeholder="Search labels..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <ScrollArea className="h-[300px]">
            {isLoading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Loading labels...
              </div>
            ) : filteredLabels.length === 0 ? (
              <div className="p-4 text-center">
                <Tag size={32} className="mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? 'No labels found' : 'No labels available'}
                </p>
                {!searchQuery && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Create labels in Settings
                  </p>
                )}
              </div>
            ) : (
              <div className="p-2">
                {filteredLabels.map((label) => {
                  const isSelected = selectedLabelIds.includes(label.$id);
                  return (
                    <button
                      key={label.$id}
                      type="button"
                      onClick={() => handleToggleLabel(label.$id)}
                      className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors"
                    >
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: label.color }}
                      />
                      <span className="flex-1 text-left text-sm">{label.name}</span>
                      {isSelected && (
                        <Check size={16} className="text-primary flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          {!isLoading && allLabels.length > 0 && (
            <div className="p-2 border-t text-xs text-muted-foreground text-center">
              {selectedLabels.length} of {allLabels.length} labels selected
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
