(global as any).ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';

vi.mock('@/lib/api', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

import { apiClient } from '@/lib/api';
import WorkshopsList from '../WorkshopsList';

describe('WorkshopsList', () => {
  it('renders workshops from apiClient', async () => {
    (apiClient.get as any).mockResolvedValueOnce({ data: [
      { id: '1', name: 'Oficina A', description: 'Descrição A', schedule: null, location: null, is_active: true, created_at: '' }
    ] });

    render(<WorkshopsList />);

  expect(screen.getByText(/Carregando/i)).toBeDefined();

    await waitFor(() => {
  expect(screen.getByText('Oficina A')).toBeDefined();
    });
  });
});
