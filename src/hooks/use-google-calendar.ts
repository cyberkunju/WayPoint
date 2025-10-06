import { useState, useEffect, useCallback } from 'react';
import { useKV } from '@github/spark/hooks';
import { Task } from '../lib/types';

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  location?: string;
  attendees?: Array<{
    email: string;
    displayName?: string;
  }>;
}

export interface CalendarIntegrationSettings {
  enabled: boolean;
  syncDirection: 'import' | 'export' | 'both';
  calendarId: string;
  autoCreateTasks: boolean;
  syncInterval: number; // minutes
  lastSync?: string;
}

const defaultSettings: CalendarIntegrationSettings = {
  enabled: false,
  syncDirection: 'both',
  calendarId: 'primary',
  autoCreateTasks: true,
  syncInterval: 15,
};

export function useGoogleCalendar() {
  const [settings, setSettings] = useKV<CalendarIntegrationSettings>('calendar-integration-settings', defaultSettings);
  const [events, setEvents] = useKV<CalendarEvent[]>('calendar-events', []);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error' | 'success'>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Check if user has granted calendar permissions
  const checkAuthStatus = useCallback(async () => {
    try {
      // Check if we have stored access token
      const token = await window.spark.kv.get<string>('google-calendar-token');
      setIsAuthenticated(!!token);
      
      if (token) {
        const lastSync = await window.spark.kv.get<string>('last-calendar-sync');
        if (lastSync) {
          setLastSyncTime(new Date(lastSync));
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
    }
  }, []);

  // Initialize Google Calendar API (mock implementation for demo)
  const initializeGoogleCalendar = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // In a real implementation, this would load the Google Calendar API
      // and handle OAuth flow. For this demo, we'll simulate the process.
      
      // Simulate OAuth flow
      const mockToken = `mock_token_${Date.now()}`;
      await window.spark.kv.set('google-calendar-token', mockToken);
      
      setIsAuthenticated(true);
      setSyncStatus('success');
      
      return true;
    } catch (error) {
      console.error('Error initializing Google Calendar:', error);
      setSyncStatus('error');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Disconnect from Google Calendar
  const disconnectCalendar = useCallback(async () => {
    try {
      await window.spark.kv.delete('google-calendar-token');
      await window.spark.kv.delete('last-calendar-sync');
      setIsAuthenticated(false);
      setEvents([]);
      setLastSyncTime(null);
      setSyncStatus('idle');
    } catch (error) {
      console.error('Error disconnecting calendar:', error);
    }
  }, [setEvents]);

  // Mock function to generate sample calendar events
  const generateMockEvents = (): CalendarEvent[] => {
    const now = new Date();
    const events: CalendarEvent[] = [];
    
    for (let i = 0; i < 10; i++) {
      const startDate = new Date(now.getTime() + (i * 24 * 60 * 60 * 1000) + (Math.random() * 12 * 60 * 60 * 1000));
      const endDate = new Date(startDate.getTime() + (Math.random() * 3 * 60 * 60 * 1000) + (30 * 60 * 1000));
      
      events.push({
        id: `mock_event_${i}`,
        summary: [
          'Team Meeting',
          'Project Review',
          'Client Call',
          'Design Session',
          'Code Review',
          'Planning Meeting',
          'Lunch with Client',
          'Workshop',
          'Training Session',
          'Quarterly Review'
        ][i],
        description: `This is a mock calendar event for demonstration purposes.`,
        start: {
          dateTime: startDate.toISOString(),
        },
        end: {
          dateTime: endDate.toISOString(),
        },
        location: i % 3 === 0 ? 'Conference Room A' : undefined,
        attendees: i % 2 === 0 ? [
          { email: 'colleague@company.com', displayName: 'Colleague Name' }
        ] : undefined,
      });
    }
    
    return events;
  };

  // Sync calendar events
  const syncCalendar = useCallback(async (force: boolean = false) => {
    if (!isAuthenticated || isLoading) return;
    
    try {
      setSyncStatus('syncing');
      setIsLoading(true);
      
      // Check if we need to sync based on interval
      if (!force && lastSyncTime) {
        const timeSinceLastSync = Date.now() - lastSyncTime.getTime();
        const syncIntervalMs = (settings?.syncInterval || 15) * 60 * 1000;
        
        if (timeSinceLastSync < syncIntervalMs) {
          setSyncStatus('success');
          return;
        }
      }
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real implementation, this would fetch events from Google Calendar API
      const mockEvents = generateMockEvents();
      setEvents(mockEvents);
      
      const now = new Date();
      setLastSyncTime(now);
      await window.spark.kv.set('last-calendar-sync', now.toISOString());
      
      setSyncStatus('success');
      
    } catch (error) {
      console.error('Error syncing calendar:', error);
      setSyncStatus('error');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, isLoading, lastSyncTime, settings?.syncInterval, setEvents]);

  // Convert calendar event to task
  const convertEventToTask = useCallback((event: CalendarEvent): Omit<Task, 'id' | 'createdAt' | 'updatedAt'> => {
    const startDate = event.start.dateTime || event.start.date;
    const dueDate = startDate ? startDate.split('T')[0] : undefined;
    
    return {
      title: event.summary,
      description: event.description || '',
      dueDate,
      priority: 3 as const, // Medium priority by default
      completed: false,
      labels: event.location ? [`location:${event.location}`] : [],
      dependencies: [],
      subtasks: [],
    };
  }, []);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<CalendarIntegrationSettings>) => {
    setSettings(current => current ? { ...current, ...newSettings } : { ...defaultSettings, ...newSettings });
  }, [setSettings]);

  // Auto-sync effect
  useEffect(() => {
    if (settings?.enabled && isAuthenticated) {
      const interval = setInterval(() => {
        syncCalendar(false);
      }, (settings?.syncInterval || 15) * 60 * 1000);
      
      return () => clearInterval(interval);
    }
  }, [settings?.enabled, settings?.syncInterval, isAuthenticated, syncCalendar]);

  // Initialize on mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return {
    // State
    settings,
    events,
    isAuthenticated,
    isLoading,
    syncStatus,
    lastSyncTime,
    
    // Actions
    initializeGoogleCalendar,
    disconnectCalendar,
    syncCalendar,
    convertEventToTask,
    updateSettings,
    checkAuthStatus,
  };
}