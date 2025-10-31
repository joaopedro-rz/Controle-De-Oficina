(global as any).ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';

vi.mock('@/lib/api', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import WorkshopsList from '../WorkshopsList';

describe('WorkshopsList error handling', () => {
  it('shows toast on fetch error', async () => {
    (apiClient.get as any).mockRejectedValueOnce(new Error('Server failure'));

    render(<WorkshopsList />);

    await waitFor(() => {
      expect((toast.error as any).mock.calls.length).toBeGreaterThan(0);
      expect((toast.error as any).mock.calls[0][0]).toMatch(/Erro ao carregar oficinas/i);
    });
  });
});
