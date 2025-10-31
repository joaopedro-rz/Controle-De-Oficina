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
import VolunteersList from '../VolunteersList';

describe('VolunteersList', () => {
  it('renders volunteers from apiClient', async () => {
    (apiClient.get as any).mockResolvedValueOnce({ data: [
      { id: '1', full_name: 'João', email: 'a@b.com', phone: null, entry_date: '', exit_date: null, is_active: true, created_at: '' }
    ] });

    render(<VolunteersList />);

  expect(screen.getByText(/Carregando/i)).toBeDefined();

    await waitFor(() => {
  expect(screen.getByText('João')).toBeDefined();
    });
  });
});
