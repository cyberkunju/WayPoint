import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import {
  type RecurrencePattern,
  type RecurrenceFrequency,
  recurringTasksService,
} from '@/services/recurring-tasks.service';

interface RecurringTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pattern: RecurrencePattern, endDate?: string, maxOccurrences?: number) => void;
  initialPattern?: RecurrencePattern;
  initialEndDate?: string;
  initialMaxOccurrences?: number;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function RecurringTaskDialog({
  isOpen,
  onClose,
  onSave,
  initialPattern,
  initialEndDate,
  initialMaxOccurrences,
}: RecurringTaskDialogProps) {
  const [frequency, setFrequency] = useState<RecurrenceFrequency>(
    initialPattern?.frequency || 'daily'
  );
  const [interval, setInterval] = useState(initialPattern?.interval || 1);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(
    initialPattern?.daysOfWeek || []
  );
  const [dayOfMonth, setDayOfMonth] = useState(initialPattern?.dayOfMonth || 1);
  const [monthOfYear, setMonthOfYear] = useState(initialPattern?.monthOfYear || 1);
  const [customRule, setCustomRule] = useState(initialPattern?.customRule || '');
  const [endDate, setEndDate] = useState(initialEndDate || '');
  const [maxOccurrences, setMaxOccurrences] = useState(initialMaxOccurrences || 0);
  const [endType, setEndType] = useState<'never' | 'date' | 'count'>(
    initialEndDate ? 'date' : initialMaxOccurrences ? 'count' : 'never'
  );
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialPattern) {
      setFrequency(initialPattern.frequency);
      setInterval(initialPattern.interval || 1);
      setDaysOfWeek(initialPattern.daysOfWeek || []);
      setDayOfMonth(initialPattern.dayOfMonth || 1);
      setMonthOfYear(initialPattern.monthOfYear || 1);
      setCustomRule(initialPattern.customRule || '');
    }
  }, [initialPattern]);

  const toggleDayOfWeek = (day: number) => {
    setDaysOfWeek(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort()
    );
  };

  const handleSave = () => {
    const pattern: RecurrencePattern = {
      frequency,
      interval,
      ...(frequency === 'weekly' && { daysOfWeek }),
      ...(frequency === 'monthly' && { dayOfMonth }),
      ...(frequency === 'yearly' && { monthOfYear, dayOfMonth }),
      ...(frequency === 'custom' && { customRule }),
    };

    // Validate pattern
    const validation = recurringTasksService.validateRecurrencePattern(pattern);
    if (!validation.valid) {
      setError(validation.error || 'Invalid recurrence pattern');
      return;
    }

    // Validate weekly pattern has at least one day selected
    if (frequency === 'weekly' && daysOfWeek.length === 0) {
      setError('Please select at least one day of the week');
      return;
    }

    const finalEndDate = endType === 'date' ? endDate : undefined;
    const finalMaxOccurrences = endType === 'count' ? maxOccurrences : undefined;

    onSave(pattern, finalEndDate, finalMaxOccurrences);
    onClose();
  };

  if (!isOpen) return null;

  const description = recurringTasksService.getRecurrenceDescription({
    frequency,
    interval,
    daysOfWeek,
    dayOfMonth,
    monthOfYear,
    customRule,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Set Recurrence
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Repeat
            </label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as RecurrenceFrequency)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {/* Interval */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Every
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                value={interval}
                onChange={(e) => setInterval(parseInt(e.target.value) || 1)}
                className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {frequency === 'daily' && (interval === 1 ? 'day' : 'days')}
                {frequency === 'weekly' && (interval === 1 ? 'week' : 'weeks')}
                {frequency === 'monthly' && (interval === 1 ? 'month' : 'months')}
                {frequency === 'yearly' && (interval === 1 ? 'year' : 'years')}
              </span>
            </div>
          </div>

          {/* Weekly: Days of week */}
          {frequency === 'weekly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                On
              </label>
              <div className="flex gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <button
                    key={day.value}
                    onClick={() => toggleDayOfWeek(day.value)}
                    className={`flex-1 px-2 py-2 text-sm rounded-md transition-colors ${
                      daysOfWeek.includes(day.value)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Monthly: Day of month */}
          {frequency === 'monthly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                On day
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          )}

          {/* Yearly: Month and day */}
          {frequency === 'yearly' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Month
                </label>
                <select
                  value={monthOfYear}
                  onChange={(e) => setMonthOfYear(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {MONTHS.map((month, index) => (
                    <option key={month} value={index + 1}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Day
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={dayOfMonth}
                  onChange={(e) => setDayOfMonth(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* Custom rule */}
          {frequency === 'custom' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Custom Rule
              </label>
              <input
                type="text"
                value={customRule}
                onChange={(e) => setCustomRule(e.target.value)}
                placeholder="e.g., Last Friday of each month"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          )}

          {/* End condition */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ends
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={endType === 'never'}
                  onChange={() => setEndType('never')}
                  className="text-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Never</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={endType === 'date'}
                  onChange={() => setEndType('date')}
                  className="text-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">On</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setEndType('date');
                  }}
                  disabled={endType !== 'date'}
                  className="flex-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                />
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={endType === 'count'}
                  onChange={() => setEndType('count')}
                  className="text-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">After</span>
                <input
                  type="number"
                  min="1"
                  value={maxOccurrences}
                  onChange={(e) => {
                    setMaxOccurrences(parseInt(e.target.value) || 0);
                    setEndType('count');
                  }}
                  disabled={endType !== 'count'}
                  className="w-20 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">occurrences</span>
              </label>
            </div>
          </div>

          {/* Preview */}
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <span className="font-medium">Repeats:</span> {description}
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
              <p className="text-sm text-red-900 dark:text-red-100">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-md"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
