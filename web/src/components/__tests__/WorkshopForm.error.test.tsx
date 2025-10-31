(global as any).ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';

vi.mock('@/lib/api', () => ({
  apiClient: {
    post: vi.fn(),
    put: vi.fn(),
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
import WorkshopForm from '../WorkshopForm';

describe('WorkshopForm error handling', () => {
  it('shows toast on submit error', async () => {
    // Simula erro no POST
    (apiClient.post as any).mockRejectedValueOnce(new Error('Server error'));

    const onClose = vi.fn();
    const { container, getByLabelText } = render(<WorkshopForm onClose={onClose} />);

    // preencher campo obrigatório
    const nameInput = getByLabelText(/Nome da Oficina/i) as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'Teste Oficina' } });

    const form = container.querySelector('form') as HTMLFormElement;
    fireEvent.submit(form);

    await waitFor(() => {
      expect((toast.error as any).mock.calls.length).toBeGreaterThan(0);
      expect((toast.error as any).mock.calls[0][0]).toMatch(/Server error|Erro ao salvar oficina/i);
    });
  });
});
