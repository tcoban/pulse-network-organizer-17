import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(() => Promise.resolve({ 
        data: { user: { id: 'test-user-id' } }, 
        error: null 
      }))
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [], error: null })),
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
          maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null }))
        })),
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: {}, error: null }))
          }))
        })),
        update: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ error: null }))
        })),
        delete: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ error: null }))
        }))
      }))
    }))
  }
}));

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));
