import { useMemo } from 'react';

const VIRTUALIZATION_THRESHOLD = 100; // Switch to virtualized list when tasks exceed this number

/**
 * Hook to determine if task list should be virtualized based on task count
 * @param taskCount - Number of tasks to display
 * @returns boolean indicating whether to use virtualization
 */
export function useVirtualization(taskCount: number): boolean {
  return useMemo(() => {
    return taskCount > VIRTUALIZATION_THRESHOLD;
  }, [taskCount]);
}

/**
 * Hook to get the optimal item size for virtualized lists
 * @param compact - Whether to use compact mode
 * @returns item size in pixels
 */
export function useVirtualItemSize(compact: boolean = false): number {
  return useMemo(() => {
    return compact ? 80 : 100;
  }, [compact]);
}
