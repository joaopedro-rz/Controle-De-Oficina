(global as any).ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';

vi.mock('@/lib/api', () => ({
  apiClient: {
    post: vi.fn(),
    put: vi.fn(),
  },
}));

import { apiClient } from '@/lib/api';
import VolunteerForm from '../VolunteerForm';

describe('VolunteerForm', () => {
  it('submits new volunteer via POST', async () => {
    (apiClient.post as any).mockResolvedValueOnce({ status: 201 });

    render(<VolunteerForm onClose={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/Nome Completo/i), { target: { value: 'Fulano' } });
  const [saveBtn] = screen.getAllByText(/Salvar/i);
  fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/volunteers', expect.any(Object));
    });
  });

  it('updates existing volunteer via PUT', async () => {
    (apiClient.put as any).mockResolvedValueOnce({ status: 200 });

  const volunteer = { id: '1', full_name: 'X', entry_date: new Date().toISOString().split('T')[0] } as any;
  const { container } = render(<VolunteerForm volunteer={volunteer} onClose={vi.fn()} />);

  fireEvent.change(screen.getByLabelText(/Nome Completo/i), { target: { value: 'Atualizado' } });
  const form = container.querySelector('form')!;
  fireEvent.submit(form);

    await waitFor(() => {
      expect(apiClient.put).toHaveBeenCalledWith('/volunteers/1', expect.any(Object));
    });
  });
});
