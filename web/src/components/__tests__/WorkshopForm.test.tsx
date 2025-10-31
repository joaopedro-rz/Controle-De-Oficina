import React from 'react';
(global as any).ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';

vi.mock('@/lib/api', () => ({
  apiClient: {
    post: vi.fn(),
    put: vi.fn(),
  },
}));

import { apiClient } from '@/lib/api';
import WorkshopForm from '../WorkshopForm';

describe('WorkshopForm', () => {
  it('submits new workshop via POST', async () => {
    (apiClient.post as any).mockResolvedValueOnce({ status: 201 });

    render(<WorkshopForm onClose={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/Nome da Oficina/i), { target: { value: 'Nova Oficina' } });
  const [saveBtn] = screen.getAllByText(/Salvar/i);
  fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/workshops', expect.any(Object));
    });
  });

  it('updates existing workshop via PUT', async () => {
    (apiClient.put as any).mockResolvedValueOnce({ status: 200 });

  const workshop = { id: '1', name: 'X', description: '', schedule: '', location: '', is_active: true };
  const { container } = render(<WorkshopForm workshop={workshop} onClose={vi.fn()} />);

  fireEvent.change(screen.getByLabelText(/Nome da Oficina/i), { target: { value: 'Atualizada' } });
  const form = container.querySelector('form')!;
  fireEvent.submit(form);

    await waitFor(() => {
      expect(apiClient.put).toHaveBeenCalledWith('/workshops/1', expect.any(Object));
    });
  });
});
