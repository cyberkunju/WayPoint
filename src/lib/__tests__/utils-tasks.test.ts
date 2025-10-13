import { describe, it, expect } from 'vitest';
import { 
  parseNaturalLanguage, 
  generateId, 
  formatDate, 
  getPriorityColor,
  isOverdue 
} from '../utils-tasks';

describe('Task Utilities', () => {
  describe('generateId', () => {
    it('generates unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      
      expect(id1).toBeTruthy();
      expect(id2).toBeTruthy();
      expect(id1).not.toBe(id2);
    });

    it('generates string IDs', () => {
      const id = generateId();
      expect(typeof id).toBe('string');
    });
  });

  describe('parseNaturalLanguage', () => {
    it('parses project from #tag', () => {
      const result = parseNaturalLanguage('Task #project1');
      expect(result.projectId).toBe('project1');
      expect(result.title).toBe('Task');
    });

    it('parses multiple labels from +tag', () => {
      const result = parseNaturalLanguage('Task +urgent +work');
      expect(result.labels).toEqual(['urgent', 'work']);
      expect(result.title).toBe('Task');
    });

    it('parses priority from !p1-!p4', () => {
      const result1 = parseNaturalLanguage('High priority task !p1');
      expect(result1.priority).toBe(1);
      expect(result1.title).toBe('High priority task');

      const result2 = parseNaturalLanguage('Low priority task !p4');
      expect(result2.priority).toBe(4);
    });

    it('parses assignee from @username', () => {
      const result = parseNaturalLanguage('Task for @john');
      expect(result.assignee).toBe('john');
      expect(result.title).toBe('Task for');
    });

    it('parses "today" as due date', () => {
      const result = parseNaturalLanguage('Task due today');
      const today = new Date().toISOString().split('T')[0];
      expect(result.dueDate).toBe(today);
    });

    it('parses "tomorrow" as due date', () => {
      const result = parseNaturalLanguage('Task due tomorrow');
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      expect(result.dueDate).toBe(tomorrowStr);
    });

    it('combines multiple parsing patterns', () => {
      const result = parseNaturalLanguage('Review code #backend +urgent !p1 @alice tomorrow');
      
      expect(result.title).toBe('Review code');
      expect(result.projectId).toBe('backend');
      expect(result.labels).toContain('urgent');
      expect(result.priority).toBe(1);
      expect(result.assignee).toBe('alice');
      expect(result.dueDate).toBeTruthy();
    });

    it('handles plain text without special syntax', () => {
      const result = parseNaturalLanguage('Simple task');
      expect(result.title).toBe('Simple task');
      expect(result.labels).toEqual([]);
      expect(result.projectId).toBeUndefined();
    });

    it('does not strip multiple project tags', () => {
        const result = parseNaturalLanguage('Task #project1 #project2');
        expect(result.projectId).toBe('project1');
        expect(result.title).toBe('Task #project2');
    });

    it('does not strip multiple assignee tags', () => {
        const result = parseNaturalLanguage('Task for @john @jane');
        expect(result.assignee).toBe('john');
        expect(result.title).toBe('Task for @jane');
    });

    it('does not strip multiple priority tags', () => {
        const result = parseNaturalLanguage('Task !p1 !p2');
        expect(result.priority).toBe(1);
        expect(result.title).toBe('Task !p2');
    });
  });

  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = '2024-01-15';
      const formatted = formatDate(date);
      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe('string');
    });

    it('handles invalid dates gracefully', () => {
      const formatted = formatDate('invalid-date');
      expect(formatted).toBeTruthy();
    });
  });

  describe('getPriorityColor', () => {
    it('returns correct color for priority 1', () => {
      const color = getPriorityColor(1);
      expect(color).toBeTruthy();
      expect(typeof color).toBe('string');
    });

    it('returns correct color for priority 4', () => {
      const color = getPriorityColor(4);
      expect(color).toBeTruthy();
      expect(typeof color).toBe('string');
    });

    it('handles undefined priority', () => {
      const color = getPriorityColor(undefined);
      expect(color).toBeTruthy();
    });
  });

  describe('isOverdue', () => {
    it('identifies overdue tasks', () => {
      const pastDate = '2020-01-01';
      expect(isOverdue(pastDate)).toBe(true);
    });

    it('identifies non-overdue tasks', () => {
      const futureDate = '2099-12-31';
      expect(isOverdue(futureDate)).toBe(false);
    });

    it('handles tasks without due date', () => {
      expect(isOverdue(undefined)).toBe(false);
    });

    it('handles today as not overdue', () => {
      const today = new Date().toISOString().split('T')[0];
      expect(isOverdue(today)).toBe(false);
    });
  });
});
