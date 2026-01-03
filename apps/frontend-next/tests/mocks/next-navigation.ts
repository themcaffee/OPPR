import { vi } from 'vitest';

export function createMockRouter() {
  return {
    push: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  };
}

export function createMockSearchParams(params: Record<string, string> = {}) {
  return new URLSearchParams(params);
}

export function setupNavigationMocks(
  mockRouter = createMockRouter(),
  mockSearchParams = createMockSearchParams(),
  mockPathname = '/'
) {
  vi.mock('next/navigation', () => ({
    useRouter: () => mockRouter,
    useSearchParams: () => mockSearchParams,
    usePathname: () => mockPathname,
    useParams: () => ({}),
  }));

  return { mockRouter, mockSearchParams, mockPathname };
}
