import { useState, useEffect } from 'react';
import { labelsService, type Label } from '@/services/labels.service';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { LabelBadge } from './LabelBadge';
import { toast } from 'sonner';
import { Funnel, MagnifyingGlass, Check, X, Tag } from '@phosphor-icons/react';

interface LabelFilterProps {
  userId: string;
  selectedLabelIds: string[];
  onFilterChange: (labelIds: string[]) => void;
  className?: string;
}

export function LabelFilter({
  userId,
  selectedLabelIds,
  onFilterChange,
  className = '',
}: LabelFilterProps) {
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
      onFilterChange(selectedLabelIds.filter((id) => id !== labelId));
    } else {
      onFilterChange([...selectedLabelIds, labelId]);
    }
  };

  const handleClearFilters = () => {
    onFilterChange([]);
    setIsOpen(false);
  };

  const hasActiveFilters = selectedLabelIds.length > 0;

  return (
    <div className={className}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={hasActiveFilters ? 'default' : 'outline'}
            size="sm"
            className="gap-2"
          >
            <Funnel size={16} />
            Filter by Label
            {hasActiveFilters && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-background/20 text-xs font-semibold">
                {selectedLabelIds.length}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          {/* Header */}
          <div className="p-3 border-b">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Funnel size={16} />
                Filter by Labels
              </h4>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="h-7 text-xs gap-1"
                >
                  <X size={14} />
                  Clear
                </Button>
              )}
            </div>
            <div className="relative">
              <MagnifyingGlass
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                placeholder="Search labels..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-8"
              />
            </div>
          </div>

          {/* Selected Labels */}
          {selectedLabels.length > 0 && (
            <div className="p-3 border-b bg-muted/50">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Active Filters ({selectedLabels.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {selectedLabels.map((label) => (
                  <LabelBadge
                    key={label.$id}
                    label={label}
                    size="sm"
                    onRemove={() => handleToggleLabel(label.$id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Label List */}
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
                      className={`w-full flex items-center gap-3 p-2 rounded-md transition-colors ${
                        isSelected
                          ? 'bg-primary/10 hover:bg-primary/20'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: label.color }}
                      />
                      <span className="flex-1 text-left text-sm font-medium">
                        {label.name}
                      </span>
                      {isSelected && (
                        <Check size={16} className="text-primary flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          {!isLoading && allLabels.length > 0 && (
            <div className="p-2 border-t bg-muted/50">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {selectedLabels.length} of {allLabels.length} selected
                </span>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                    className="h-6 text-xs"
                  >
                    Clear all
                  </Button>
                )}
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
