import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  recurringTasksService,
  type RecurrencePattern,
} from '../recurring-tasks.service';

describe('RecurringTasksService', () => {
  describe('calculateNextOccurrence', () => {
    it('should calculate next daily occurrence', () => {
      const pattern: RecurrencePattern = {
        frequency: 'daily',
        interval: 1,
      };

      const fromDate = new Date('2024-01-15T10:00:00Z');
      const nextDate = recurringTasksService.calculateNextOccurrence(pattern, fromDate);

      expect(nextDate.getDate()).toBe(16);
      expect(nextDate.getMonth()).toBe(0); // January
      expect(nextDate.getFullYear()).toBe(2024);
    });

    it('should calculate next daily occurrence with interval', () => {
      const pattern: RecurrencePattern = {
        frequency: 'daily',
        interval: 3,
      };

      const fromDate = new Date('2024-01-15T10:00:00Z');
      const nextDate = recurringTasksService.calculateNextOccurrence(pattern, fromDate);

      expect(nextDate.getDate()).toBe(18);
    });

    it('should calculate next weekly occurrence', () => {
      const pattern: RecurrencePattern = {
        frequency: 'weekly',
        interval: 1,
        daysOfWeek: [1, 3, 5], // Mon, Wed, Fri
      };

      // Start on Monday (Jan 15, 2024)
      const fromDate = new Date('2024-01-15T10:00:00Z');
      const nextDate = recurringTasksService.calculateNextOccurrence(pattern, fromDate);

      // Should be Wednesday (Jan 17)
      expect(nextDate.getDate()).toBe(17);
      expect(nextDate.getDay()).toBe(3); // Wednesday
    });

    it('should calculate next monthly occurrence', () => {
      const pattern: RecurrencePattern = {
        frequency: 'monthly',
        interval: 1,
        dayOfMonth: 15,
      };

      const fromDate = new Date('2024-01-10T10:00:00Z');
      const nextDate = recurringTasksService.calculateNextOccurrence(pattern, fromDate);

      expect(nextDate.getDate()).toBe(15);
      expect(nextDate.getMonth()).toBe(1); // February
    });

    it('should handle months with fewer days', () => {
      const pattern: RecurrencePattern = {
        frequency: 'monthly',
        interval: 1,
        dayOfMonth: 31,
      };

      const fromDate = new Date('2024-01-31T10:00:00Z');
      const nextDate = recurringTasksService.calculateNextOccurrence(pattern, fromDate);

      // February only has 29 days in 2024 (leap year)
      expect(nextDate.getDate()).toBe(29);
      expect(nextDate.getMonth()).toBe(1); // February
    });

    it('should calculate next yearly occurrence', () => {
      const pattern: RecurrencePattern = {
        frequency: 'yearly',
        interval: 1,
        monthOfYear: 12,
        dayOfMonth: 25,
      };

      const fromDate = new Date('2024-01-15T10:00:00Z');
      const nextDate = recurringTasksService.calculateNextOccurrence(pattern, fromDate);

      expect(nextDate.getDate()).toBe(25);
      expect(nextDate.getMonth()).toBe(11); // December
      expect(nextDate.getFullYear()).toBe(2025);
    });
  });

  describe('getRecurrenceDescription', () => {
    it('should describe daily recurrence', () => {
      const pattern: RecurrencePattern = {
        frequency: 'daily',
        interval: 1,
      };

      const description = recurringTasksService.getRecurrenceDescription(pattern);
      expect(description).toBe('Daily');
    });

    it('should describe daily recurrence with interval', () => {
      const pattern: RecurrencePattern = {
        frequency: 'daily',
        interval: 3,
      };

      const description = recurringTasksService.getRecurrenceDescription(pattern);
      expect(description).toBe('Every 3 days');
    });

    it('should describe weekly recurrence', () => {
      const pattern: RecurrencePattern = {
        frequency: 'weekly',
        interval: 1,
        daysOfWeek: [1, 3, 5],
      };

      const description = recurringTasksService.getRecurrenceDescription(pattern);
      expect(description).toContain('Monday');
      expect(description).toContain('Wednesday');
      expect(description).toContain('Friday');
    });

    it('should describe monthly recurrence', () => {
      const pattern: RecurrencePattern = {
        frequency: 'monthly',
        interval: 1,
        dayOfMonth: 15,
      };

      const description = recurringTasksService.getRecurrenceDescription(pattern);
      expect(description).toContain('15th');
    });

    it('should describe yearly recurrence', () => {
      const pattern: RecurrencePattern = {
        frequency: 'yearly',
        interval: 1,
        monthOfYear: 12,
        dayOfMonth: 25,
      };

      const description = recurringTasksService.getRecurrenceDescription(pattern);
      expect(description).toContain('December');
      expect(description).toContain('25th');
    });
  });

  describe('validateRecurrencePattern', () => {
    it('should validate valid daily pattern', () => {
      const pattern: RecurrencePattern = {
        frequency: 'daily',
        interval: 1,
      };

      const result = recurringTasksService.validateRecurrencePattern(pattern);
      expect(result.valid).toBe(true);
    });

    it('should reject pattern without frequency', () => {
      const pattern = {
        interval: 1,
      } as RecurrencePattern;

      const result = recurringTasksService.validateRecurrencePattern(pattern);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Frequency is required');
    });

    it('should reject pattern with invalid interval', () => {
      const pattern: RecurrencePattern = {
        frequency: 'daily',
        interval: 0,
      };

      const result = recurringTasksService.validateRecurrencePattern(pattern);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Interval must be at least 1');
    });

    it('should reject weekly pattern with invalid days', () => {
      const pattern: RecurrencePattern = {
        frequency: 'weekly',
        interval: 1,
        daysOfWeek: [1, 7], // 7 is invalid
      };

      const result = recurringTasksService.validateRecurrencePattern(pattern);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Days of week must be between 0 and 6');
    });

    it('should reject monthly pattern with invalid day', () => {
      const pattern: RecurrencePattern = {
        frequency: 'monthly',
        interval: 1,
        dayOfMonth: 32,
      };

      const result = recurringTasksService.validateRecurrencePattern(pattern);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Day of month must be between 1 and 31');
    });

    it('should reject yearly pattern with invalid month', () => {
      const pattern: RecurrencePattern = {
        frequency: 'yearly',
        interval: 1,
        monthOfYear: 13,
        dayOfMonth: 1,
      };

      const result = recurringTasksService.validateRecurrencePattern(pattern);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Month of year must be between 1 and 12');
    });
  });

  describe('parseRecurrencePattern', () => {
    it('should parse valid JSON pattern', () => {
      const patternJson = JSON.stringify({
        frequency: 'daily',
        interval: 1,
      });

      const pattern = recurringTasksService.parseRecurrencePattern(patternJson);
      expect(pattern.frequency).toBe('daily');
      expect(pattern.interval).toBe(1);
    });

    it('should throw error for invalid JSON', () => {
      expect(() => {
        recurringTasksService.parseRecurrencePattern('invalid json');
      }).toThrow('Invalid recurrence pattern JSON');
    });
  });

  describe('stringifyRecurrencePattern', () => {
    it('should stringify pattern to JSON', () => {
      const pattern: RecurrencePattern = {
        frequency: 'weekly',
        interval: 2,
        daysOfWeek: [1, 3, 5],
      };

      const json = recurringTasksService.stringifyRecurrencePattern(pattern);
      const parsed = JSON.parse(json);

      expect(parsed.frequency).toBe('weekly');
      expect(parsed.interval).toBe(2);
      expect(parsed.daysOfWeek).toEqual([1, 3, 5]);
    });
  });

  describe('shouldContinueRecurrence', () => {
    it('should continue when no limits are set', () => {
      const recurringTask = {
        occurrencesCount: 5,
      } as any;

      const result = recurringTasksService.shouldContinueRecurrence(recurringTask);
      expect(result).toBe(true);
    });

    it('should stop when max occurrences is reached', () => {
      const recurringTask = {
        occurrencesCount: 10,
        maxOccurrences: 10,
      } as any;

      const result = recurringTasksService.shouldContinueRecurrence(recurringTask);
      expect(result).toBe(false);
    });

    it('should stop when end date is passed', () => {
      const recurringTask = {
        occurrencesCount: 5,
        endDate: '2020-01-01T00:00:00Z',
      } as any;

      const result = recurringTasksService.shouldContinueRecurrence(recurringTask);
      expect(result).toBe(false);
    });

    it('should continue when end date is in future', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const recurringTask = {
        occurrencesCount: 5,
        endDate: futureDate.toISOString(),
      } as any;

      const result = recurringTasksService.shouldContinueRecurrence(recurringTask);
      expect(result).toBe(true);
    });
  });
});
