import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useVirtualization, useVirtualItemSize } from '../use-virtualization';

describe('Virtualization Hooks', () => {
  describe('useVirtualization', () => {
    it('returns false for small task counts', () => {
      const { result } = renderHook(() => useVirtualization(10));
      expect(result.current).toBe(false);
    });

    it('returns false for task count at threshold', () => {
      const { result } = renderHook(() => useVirtualization(100));
      expect(result.current).toBe(false);
    });

    it('returns true for task count above threshold', () => {
      const { result } = renderHook(() => useVirtualization(101));
      expect(result.current).toBe(true);
    });

    it('returns true for large task counts', () => {
      const { result } = renderHook(() => useVirtualization(1000));
      expect(result.current).toBe(true);
    });

    it('returns true for very large task counts', () => {
      const { result } = renderHook(() => useVirtualization(10000));
      expect(result.current).toBe(true);
    });
  });

  describe('useVirtualItemSize', () => {
    it('returns default size when not compact', () => {
      const { result } = renderHook(() => useVirtualItemSize(false));
      expect(result.current).toBe(100);
    });

    it('returns compact size when compact is true', () => {
      const { result } = renderHook(() => useVirtualItemSize(true));
      expect(result.current).toBe(80);
    });

    it('returns default size when no argument provided', () => {
      const { result } = renderHook(() => useVirtualItemSize());
      expect(result.current).toBe(100);
    });
  });
});
