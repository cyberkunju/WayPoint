import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test case
afterEach(() => {
  cleanup();
});

// Mock @github/spark runtime
const mockKV = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
  keys: vi.fn(),
};

globalThis.window = globalThis.window || ({} as any);
(globalThis.window as any).spark = {
  kv: mockKV,
  llm: vi.fn(),
  llmPrompt: vi.fn(),
  user: vi.fn(),
};

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any;

// Mock HTMLMediaElement
window.HTMLMediaElement.prototype.load = () => {};
window.HTMLMediaElement.prototype.play = () => Promise.resolve();
window.HTMLMediaElement.prototype.pause = () => {};

// Mock SpeechRecognition
(window as any).SpeechRecognition = class SpeechRecognition {
  start() {}
  stop() {}
  abort() {}
} as any;

(window as any).webkitSpeechRecognition = (window as any).SpeechRecognition;
