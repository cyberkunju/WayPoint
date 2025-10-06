import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useUserStore, useTaskStore } from '../hooks/use-store';
import { GoogleCalendarSettings } from './GoogleCalendarSettings';
import { CustomViewManager } from './CustomViewManager';
import { ViewType } from '../lib/types';
import { toast } from 'sonner';

export function SettingsPanel() {
  const { preferences, updatePreferences } = useUserStore();
  const { tasks, projects, labels } = useTaskStore();

  const colorOptions = [
    { name: 'Deep Blue', value: '#2E5AAC' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Green', value: '#10B981' },
    { name: 'Orange', value: '#F59E0B' },
    { name: 'Red', value: '#EF4444' },
  ];

  const handleExportData = () => {
    const data = {
      tasks: tasks || [],
      projects: projects || [],
      labels: labels || [],
      preferences: preferences,
      exportDate: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clarityflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Data exported successfully!');
  };

  const handleClearData = async () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      try {
        // Clear all KV data
        const keys = await window.spark.kv.keys();
        const clarityKeys = keys.filter(key => key.startsWith('clarity-'));
        
        for (const key of clarityKeys) {
          await window.spark.kv.delete(key);
        }
        
        toast.success('All data cleared successfully!');
        
        // Refresh the page to reset state
        setTimeout(() => window.location.reload(), 1000);
      } catch (error) {
        console.error('Error clearing data:', error);
        toast.error('Error clearing data. Please try again.');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="heading-1 text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">Customize your ClarityFlow experience</p>
      </div>

      <Tabs defaultValue="appearance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="views">Custom Views</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="data">Data & Privacy</TabsTrigger>
        </TabsList>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Theme</Label>
                <Select 
                  value={preferences?.theme || 'light'} 
                  onValueChange={(value: 'light' | 'dark' | 'auto') => 
                    updatePreferences({ theme: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="auto">Auto (System)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Information Density</Label>
                <Select 
                  value={preferences?.density || 'comfortable'} 
                  onValueChange={(value: 'compact' | 'comfortable' | 'spacious') => 
                    updatePreferences({ density: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compact">Compact</SelectItem>
                    <SelectItem value="comfortable">Comfortable</SelectItem>
                    <SelectItem value="spacious">Spacious</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Brand Color</Label>
                <Select 
                  value={preferences?.primaryColor || '#2E5AAC'} 
                  onValueChange={(value) => updatePreferences({ primaryColor: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full border border-border" 
                            style={{ backgroundColor: color.value }}
                          />
                          {color.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Font Size</Label>
                <Select 
                  value={preferences?.fontSize || 'medium'} 
                  onValueChange={(value: 'small' | 'medium' | 'large') => 
                    updatePreferences({ fontSize: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="views" className="space-y-6">
          <CustomViewManager />
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <GoogleCalendarSettings />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="task-reminders">Task Reminders</Label>
                    <p className="text-sm text-muted-foreground">Get notified about upcoming tasks</p>
                  </div>
                  <Switch
                    id="task-reminders"
                    checked={preferences?.taskReminders || false}
                    onCheckedChange={(checked) => updatePreferences({ taskReminders: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="daily-summary">Daily Summary</Label>
                    <p className="text-sm text-muted-foreground">Receive a summary of your daily progress</p>
                  </div>
                  <Switch
                    id="daily-summary"
                    checked={preferences?.dailySummary || false}
                    onCheckedChange={(checked) => updatePreferences({ dailySummary: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="overdue-alerts">Overdue Alerts</Label>
                    <p className="text-sm text-muted-foreground">Get alerts for overdue tasks</p>
                  </div>
                  <Switch
                    id="overdue-alerts"
                    checked={preferences?.overdueAlerts || true}
                    onCheckedChange={(checked) => updatePreferences({ overdueAlerts: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Productivity Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Default View</Label>
                <Select 
                  value={preferences?.defaultView || 'list'} 
                  onValueChange={(value) => updatePreferences({ defaultView: value as ViewType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inbox">Inbox</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="list">List View</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data & Privacy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full" onClick={handleExportData}>
                Export All Data
              </Button>
              <Button variant="destructive" className="w-full" onClick={handleClearData}>
                Clear All Data
              </Button>
              <p className="text-xs text-muted-foreground">
                Your data is stored locally in your browser. Clearing data cannot be undone.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}