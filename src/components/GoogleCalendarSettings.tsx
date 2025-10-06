import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { useGoogleCalendar } from '../hooks/use-google-calendar';
import { useTaskStore } from '../hooks/use-store';
import { toast } from 'sonner';
import { 
  Calendar, 
  Link, 
  LinkBreak, 
  ArrowsCounterClockwise, 
  Check, 
  X, 
  Warning,
  Clock,
  CloudCheck,
  UploadSimple,
  DownloadSimple,
  ArrowsLeftRight
} from '@phosphor-icons/react';

export function GoogleCalendarSettings() {
  const { addTask } = useTaskStore();
  const {
    settings,
    events,
    isAuthenticated,
    isLoading,
    syncStatus,
    lastSyncTime,
    initializeGoogleCalendar,
    disconnectCalendar,
    syncCalendar,
    convertEventToTask,
    updateSettings,
  } = useGoogleCalendar();

  const handleConnect = async () => {
    const success = await initializeGoogleCalendar();
    if (success) {
      toast.success('Successfully connected to Google Calendar!');
      // Perform initial sync
      await syncCalendar(true);
    } else {
      toast.error('Failed to connect to Google Calendar');
    }
  };

  const handleDisconnect = async () => {
    await disconnectCalendar();
    toast.success('Disconnected from Google Calendar');
  };

  const handleSync = async () => {
    await syncCalendar(true);
    if (syncStatus === 'success') {
      toast.success('Calendar synchronized successfully!');
    } else if (syncStatus === 'error') {
      toast.error('Failed to synchronize calendar');
    }
  };

  const handleCreateTaskFromEvent = (eventId: string) => {
    const event = events?.find(e => e.id === eventId);
    if (!event) return;

    const taskData = convertEventToTask(event);
    addTask(taskData);
    toast.success(`Created task from "${event.summary}"`);
  };

  const getStatusIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return <ArrowsCounterClockwise className="w-4 h-4 animate-spin" />;
      case 'success':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'error':
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getSyncDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'import':
        return <DownloadSimple className="w-4 h-4" />;
      case 'export':
        return <UploadSimple className="w-4 h-4" />;
      case 'both':
        return <ArrowsLeftRight className="w-4 h-4" />;
      default:
        return <ArrowsLeftRight className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Google Calendar Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Connection Status */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Connection Status</Label>
                <div className="flex items-center gap-2">
                  {isAuthenticated ? (
                    <>
                      <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                        <Link className="w-3 h-3 mr-1" />
                        Connected
                      </Badge>
                      {lastSyncTime && (
                        <span className="text-xs text-muted-foreground">
                          Last sync: {lastSyncTime.toLocaleString()}
                        </span>
                      )}
                    </>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      <LinkBreak className="w-3 h-3 mr-1" />
                      Not Connected
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {isAuthenticated ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSync}
                      disabled={isLoading}
                    >
                      {getStatusIcon()}
                      Sync Now
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDisconnect}
                    >
                      Disconnect
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={handleConnect}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Connect Calendar
                  </Button>
                )}
              </div>
            </div>

            {syncStatus === 'error' && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <Warning className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-700">
                  Failed to sync calendar. Please check your connection and try again.
                </span>
              </div>
            )}
          </div>

          <Separator />

          {/* Settings */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Sync Settings</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sync-enabled" className="text-sm">
                  Enable Automatic Sync
                </Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="sync-enabled"
                    checked={settings?.enabled || false}
                    onCheckedChange={(checked) => updateSettings({ enabled: checked })}
                    disabled={!isAuthenticated}
                  />
                  <span className="text-sm text-muted-foreground">
                    {settings?.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sync-direction" className="text-sm">
                  Sync Direction
                </Label>
                <Select
                  value={settings?.syncDirection || 'both'}
                  onValueChange={(value: 'import' | 'export' | 'both') => 
                    updateSettings({ syncDirection: value })
                  }
                  disabled={!isAuthenticated}
                >
                  <SelectTrigger id="sync-direction">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="import">
                      <div className="flex items-center gap-2">
                        <DownloadSimple className="w-4 h-4" />
                        Import Only
                      </div>
                    </SelectItem>
                    <SelectItem value="export">
                      <div className="flex items-center gap-2">
                        <UploadSimple className="w-4 h-4" />
                        Export Only
                      </div>
                    </SelectItem>
                    <SelectItem value="both">
                      <div className="flex items-center gap-2">
                        <ArrowsLeftRight className="w-4 h-4" />
                        Two-way Sync
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sync-interval" className="text-sm">
                  Sync Interval
                </Label>
                <Select
                  value={String(settings?.syncInterval || 15)}
                  onValueChange={(value) => updateSettings({ syncInterval: parseInt(value) })}
                  disabled={!isAuthenticated}
                >
                  <SelectTrigger id="sync-interval">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">Every 5 minutes</SelectItem>
                    <SelectItem value="15">Every 15 minutes</SelectItem>
                    <SelectItem value="30">Every 30 minutes</SelectItem>
                    <SelectItem value="60">Every hour</SelectItem>
                    <SelectItem value="240">Every 4 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="auto-create-tasks" className="text-sm">
                  Auto-create Tasks
                </Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-create-tasks"
                    checked={settings?.autoCreateTasks || false}
                    onCheckedChange={(checked) => updateSettings({ autoCreateTasks: checked })}
                    disabled={!isAuthenticated}
                  />
                  <span className="text-sm text-muted-foreground">
                    Create tasks from calendar events
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Events */}
          {isAuthenticated && events && events.length > 0 && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Recent Calendar Events</h4>
                  <Badge variant="outline">{events.length} events</Badge>
                </div>
                
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {events.slice(0, 5).map((event) => {
                    const startTime = event.start.dateTime 
                      ? new Date(event.start.dateTime).toLocaleString()
                      : event.start.date 
                        ? new Date(event.start.date).toLocaleDateString()
                        : 'No time';

                    return (
                      <div
                        key={event.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                      >
                        <div className="space-y-1 flex-1">
                          <p className="text-sm font-medium">{event.summary}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {startTime}
                            {event.location && (
                              <Badge variant="outline" className="text-xs">
                                {event.location}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCreateTaskFromEvent(event.id)}
                        >
                          Create Task
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}