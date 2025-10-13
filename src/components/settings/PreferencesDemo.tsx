import { usePreferences } from '@/hooks/use-preferences';

/**
 * Demo component showing how to use the preferences system
 * This demonstrates the integration with Appwrite backend
 */
export function PreferencesDemo() {
  const { 
    preferences, 
    updatePreference, 
    updatePreferences,
    resetPreferences,
    isLoggedIn 
  } = usePreferences();

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">User Preferences</h2>
        <p className="text-sm text-gray-600">
          {isLoggedIn 
            ? '✅ Synced with Appwrite Cloud' 
            : '⚠️ Offline mode - Login to sync'}
        </p>
      </div>

      {/* Theme Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">Theme</label>
        <select
          value={preferences.theme}
          onChange={(e) => updatePreference('theme', e.target.value as any)}
          className="w-full px-3 py-2 border rounded-lg"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="auto">Auto</option>
        </select>
      </div>

      {/* Density Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">Density</label>
        <select
          value={preferences.density}
          onChange={(e) => updatePreference('density', e.target.value as any)}
          className="w-full px-3 py-2 border rounded-lg"
        >
          <option value="comfortable">Comfortable</option>
          <option value="compact">Compact</option>
          <option value="spacious">Spacious</option>
        </select>
      </div>

      {/* Font Size Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">Font Size</label>
        <select
          value={preferences.fontSize}
          onChange={(e) => updatePreference('fontSize', e.target.value as any)}
          className="w-full px-3 py-2 border rounded-lg"
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </div>

      {/* Primary Color */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">Primary Color</label>
        <input
          type="color"
          value={preferences.primaryColor}
          onChange={(e) => updatePreference('primaryColor', e.target.value)}
          className="w-full h-10 border rounded-lg cursor-pointer"
        />
      </div>

      {/* Notification Preferences */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Notifications</h3>
        
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={preferences.taskReminders}
            onChange={(e) => updatePreference('taskReminders', e.target.checked)}
            className="w-4 h-4"
          />
          <span>Task Reminders</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={preferences.dailySummary}
            onChange={(e) => updatePreference('dailySummary', e.target.checked)}
            className="w-4 h-4"
          />
          <span>Daily Summary</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={preferences.overdueAlerts}
            onChange={(e) => updatePreference('overdueAlerts', e.target.checked)}
            className="w-4 h-4"
          />
          <span>Overdue Alerts</span>
        </label>
      </div>

      {/* UI Preferences */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">UI Preferences</h3>
        
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={preferences.sidebarCollapsed}
            onChange={(e) => updatePreference('sidebarCollapsed', e.target.checked)}
            className="w-4 h-4"
          />
          <span>Collapse Sidebar by Default</span>
        </label>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Default View</label>
          <select
            value={preferences.defaultView}
            onChange={(e) => updatePreference('defaultView', e.target.value as any)}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="list">List</option>
            <option value="kanban">Kanban</option>
            <option value="calendar">Calendar</option>
            <option value="gantt">Gantt</option>
            <option value="mindmap">Mind Map</option>
            <option value="focus">Focus</option>
          </select>
        </div>
      </div>

      {/* Bulk Update Example */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Quick Presets</h3>
        <div className="flex gap-2">
          <button
            onClick={() => updatePreferences({
              theme: 'dark',
              density: 'compact',
              fontSize: 'small',
            })}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
          >
            Focus Mode
          </button>
          
          <button
            onClick={() => updatePreferences({
              theme: 'light',
              density: 'spacious',
              fontSize: 'large',
            })}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500"
          >
            Comfortable Mode
          </button>
          
          <button
            onClick={resetPreferences}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500"
          >
            Reset to Defaults
          </button>
        </div>
      </div>

      {/* Current Preferences Display */}
      <div className="mt-6 p-4 bg-gray-100 rounded-lg">
        <h3 className="text-sm font-semibold mb-2">Current Preferences (JSON)</h3>
        <pre className="text-xs overflow-auto">
          {JSON.stringify(preferences, null, 2)}
        </pre>
      </div>
    </div>
  );
}
