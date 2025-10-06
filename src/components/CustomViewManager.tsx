import { useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { Switch } from './ui/switch';
import { toast } from 'sonner';
import { 
  Plus, 
  Pencil, 
  Trash, 
  Eye, 
  Funnel, 
  SortAscending,
  Copy,
  Star,
  BookmarkSimple
} from '@phosphor-icons/react';

interface CustomView {
  id: string;
  name: string;
  description?: string;
  filters: {
    projectId?: string;
    status?: string;
    priority?: number[];
    dueDate?: {
      type: 'before' | 'after' | 'between' | 'overdue' | 'today' | 'this_week';
      value?: string;
      endValue?: string;
    };
    labels?: string[];
    assignee?: string;
    search?: string;
  };
  sorting: {
    field: 'title' | 'priority' | 'dueDate' | 'createdAt' | 'updatedAt';
    direction: 'asc' | 'desc';
  };
  viewType: 'list' | 'kanban' | 'calendar' | 'gantt';
  isDefault?: boolean;
  isFavorite?: boolean;
  createdAt: string;
  updatedAt: string;
}

const defaultView: Omit<CustomView, 'id' | 'createdAt' | 'updatedAt'> = {
  name: '',
  description: '',
  filters: {},
  sorting: {
    field: 'createdAt',
    direction: 'desc',
  },
  viewType: 'list',
  isDefault: false,
  isFavorite: false,
};

export function CustomViewManager() {
  const [customViews, setCustomViews] = useKV<CustomView[]>('custom-views', []);
  const [isCreating, setIsCreating] = useState(false);
  const [editingView, setEditingView] = useState<CustomView | null>(null);
  const [newView, setNewView] = useState<Omit<CustomView, 'id' | 'createdAt' | 'updatedAt'>>(defaultView);

  const handleCreateView = () => {
    if (!newView.name.trim()) {
      toast.error('Please enter a view name');
      return;
    }

    const view: CustomView = {
      ...newView,
      id: `view_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCustomViews(current => [...(current || []), view]);
    setNewView(defaultView);
    setIsCreating(false);
    toast.success(`Custom view "${view.name}" created successfully!`);
  };

  const handleEditView = (view: CustomView) => {
    setEditingView(view);
    setNewView({
      name: view.name,
      description: view.description,
      filters: view.filters,
      sorting: view.sorting,
      viewType: view.viewType,
      isDefault: view.isDefault,
      isFavorite: view.isFavorite,
    });
  };

  const handleUpdateView = () => {
    if (!editingView || !newView.name.trim()) return;

    const updatedView: CustomView = {
      ...editingView,
      ...newView,
      updatedAt: new Date().toISOString(),
    };

    setCustomViews(current => 
      (current || []).map(view => 
        view.id === editingView.id ? updatedView : view
      )
    );

    setEditingView(null);
    setNewView(defaultView);
    toast.success(`View "${updatedView.name}" updated successfully!`);
  };

  const handleDeleteView = (viewId: string) => {
    if (confirm('Are you sure you want to delete this custom view?')) {
      setCustomViews(current => 
        (current || []).filter(view => view.id !== viewId)
      );
      toast.success('Custom view deleted');
    }
  };

  const handleDuplicateView = (view: CustomView) => {
    const duplicatedView: CustomView = {
      ...view,
      id: `view_${Date.now()}`,
      name: `${view.name} (Copy)`,
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCustomViews(current => [...(current || []), duplicatedView]);
    toast.success(`View "${duplicatedView.name}" duplicated successfully!`);
  };

  const handleToggleFavorite = (viewId: string) => {
    setCustomViews(current => 
      (current || []).map(view => 
        view.id === viewId 
          ? { ...view, isFavorite: !view.isFavorite, updatedAt: new Date().toISOString() }
          : view
      )
    );
  };

  const handleSetDefault = (viewId: string) => {
    setCustomViews(current => 
      (current || []).map(view => ({
        ...view,
        isDefault: view.id === viewId,
        updatedAt: new Date().toISOString(),
      }))
    );
    toast.success('Default view updated');
  };

  const renderViewCard = (view: CustomView) => (
    <Card key={view.id} className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">{view.name}</CardTitle>
              {view.isFavorite && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
              {view.isDefault && <Badge variant="secondary" className="text-xs">Default</Badge>}
            </div>
            {view.description && (
              <p className="text-sm text-muted-foreground">{view.description}</p>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleToggleFavorite(view.id)}
              className="h-8 w-8 p-0"
            >
              <Star className={`w-4 h-4 ${view.isFavorite ? 'text-yellow-500 fill-current' : 'text-muted-foreground'}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditView(view)}
              className="h-8 w-8 p-0"
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDuplicateView(view)}
              className="h-8 w-8 p-0"
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteView(view.id)}
              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
            >
              <Trash className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* View Details */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span className="capitalize">{view.viewType}</span>
            </div>
            <div className="flex items-center gap-1">
              <SortAscending className="w-4 h-4" />
              <span className="capitalize">{view.sorting.field}</span>
              <span>({view.sorting.direction})</span>
            </div>
          </div>

          {/* Filters Summary */}
          {Object.keys(view.filters).length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Funnel className="w-4 h-4" />
                <span>Filters:</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {view.filters.projectId && (
                  <Badge variant="outline" className="text-xs">Project: {view.filters.projectId}</Badge>
                )}
                {view.filters.status && (
                  <Badge variant="outline" className="text-xs">Status: {view.filters.status}</Badge>
                )}
                {view.filters.priority && view.filters.priority.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    Priority: {view.filters.priority.join(', ')}
                  </Badge>
                )}
                {view.filters.labels && view.filters.labels.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    Labels: {view.filters.labels.length}
                  </Badge>
                )}
                {view.filters.dueDate && (
                  <Badge variant="outline" className="text-xs">
                    Due: {view.filters.dueDate.type}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Eye className="w-4 h-4 mr-2" />
              Apply View
            </Button>
            {!view.isDefault && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSetDefault(view.id)}
              >
                <BookmarkSimple className="w-4 h-4 mr-2" />
                Set Default
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderViewForm = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="view-name">View Name</Label>
          <Input
            id="view-name"
            value={newView.name}
            onChange={(e) => setNewView(current => ({ ...current, name: e.target.value }))}
            placeholder="Enter view name..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="view-description">Description (Optional)</Label>
          <Input
            id="view-description"
            value={newView.description || ''}
            onChange={(e) => setNewView(current => ({ ...current, description: e.target.value }))}
            placeholder="Describe this view..."
          />
        </div>

        <div className="space-y-2">
          <Label>View Type</Label>
          <Select
            value={newView.viewType}
            onValueChange={(value: 'list' | 'kanban' | 'calendar' | 'gantt') =>
              setNewView(current => ({ ...current, viewType: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="list">List View</SelectItem>
              <SelectItem value="kanban">Kanban Board</SelectItem>
              <SelectItem value="calendar">Calendar</SelectItem>
              <SelectItem value="gantt">Gantt Chart</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      <Tabs defaultValue="filters" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="filters">Filters</TabsTrigger>
          <TabsTrigger value="sorting">Sorting</TabsTrigger>
        </TabsList>

        <TabsContent value="filters" className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Status Filter</Label>
              <Select
                value={newView.filters.status || ''}
                onValueChange={(value) =>
                  setNewView(current => ({
                    ...current,
                    filters: { ...current.filters, status: value || undefined }
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="progress">In Progress</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Due Date Filter</Label>
              <Select
                value={newView.filters.dueDate?.type || ''}
                onValueChange={(value) =>
                  setNewView(current => ({
                    ...current,
                    filters: {
                      ...current.filters,
                      dueDate: value ? { type: value as any } : undefined
                    }
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All dates" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All dates</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="today">Due Today</SelectItem>
                  <SelectItem value="this_week">Due This Week</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Search Filter</Label>
              <Input
                value={newView.filters.search || ''}
                onChange={(e) =>
                  setNewView(current => ({
                    ...current,
                    filters: { ...current.filters, search: e.target.value || undefined }
                  }))
                }
                placeholder="Search in titles and descriptions..."
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sorting" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Sort By</Label>
              <Select
                value={newView.sorting.field}
                onValueChange={(value: any) =>
                  setNewView(current => ({
                    ...current,
                    sorting: { ...current.sorting, field: value }
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="dueDate">Due Date</SelectItem>
                  <SelectItem value="createdAt">Created Date</SelectItem>
                  <SelectItem value="updatedAt">Updated Date</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Direction</Label>
              <Select
                value={newView.sorting.direction}
                onValueChange={(value: 'asc' | 'desc') =>
                  setNewView(current => ({
                    ...current,
                    sorting: { ...current.sorting, direction: value }
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="is-favorite">Add to Favorites</Label>
            <p className="text-sm text-muted-foreground">Pin this view for quick access</p>
          </div>
          <Switch
            id="is-favorite"
            checked={newView.isFavorite || false}
            onCheckedChange={(checked) =>
              setNewView(current => ({ ...current, isFavorite: checked }))
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="is-default">Set as Default</Label>
            <p className="text-sm text-muted-foreground">Use this view when opening ClarityFlow</p>
          </div>
          <Switch
            id="is-default"
            checked={newView.isDefault || false}
            onCheckedChange={(checked) =>
              setNewView(current => ({ ...current, isDefault: checked }))
            }
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => {
            setIsCreating(false);
            setEditingView(null);
            setNewView(defaultView);
          }}
        >
          Cancel
        </Button>
        <Button onClick={editingView ? handleUpdateView : handleCreateView}>
          {editingView ? 'Update View' : 'Create View'}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="heading-2 text-foreground">Custom Views</h2>
          <p className="text-muted-foreground">Create personalized views with custom filters and layouts</p>
        </div>
        
        <Dialog open={isCreating || !!editingView} onOpenChange={(open) => {
          if (!open) {
            setIsCreating(false);
            setEditingView(null);
            setNewView(defaultView);
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create View
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingView ? 'Edit Custom View' : 'Create Custom View'}
              </DialogTitle>
            </DialogHeader>
            {renderViewForm()}
          </DialogContent>
        </Dialog>
      </div>

      {/* Views List */}
      {customViews && customViews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customViews
            .sort((a, b) => {
              // Sort by: favorites first, then default, then by creation date
              if (a.isFavorite && !b.isFavorite) return -1;
              if (!a.isFavorite && b.isFavorite) return 1;
              if (a.isDefault && !b.isDefault) return -1;
              if (!a.isDefault && b.isDefault) return 1;
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            })
            .map(renderViewCard)}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-medium">No Custom Views</h3>
                <p className="text-muted-foreground">
                  Create your first custom view to organize tasks exactly how you want.
                </p>
              </div>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First View
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}