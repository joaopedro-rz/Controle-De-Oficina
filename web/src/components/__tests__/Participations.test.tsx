import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import Participations from '../Participations';

// Radix UI usa scrollIntoView em jsdom; fazemos stub para evitar erro
(window.HTMLElement.prototype as any).scrollIntoView = () => {};

const getMock = vi.fn(async (url: string, opts?: any) => {
  if (url === '/workshops') {
    return { data: { items: [{ id: 'w1', name: 'Robótica', isActive: true }] } } as any;
  }
  if (url === '/volunteers') {
    return { data: { items: [{ id: 'v1', fullName: 'Maria Silva' }] } } as any;
  }
  if (url.startsWith('/participations')) {
    if (opts?.params?.workshopId === 'w1') {
      return { data: [] } as any;
    }
    return { data: [] } as any;
  }
  return { data: [] } as any;
});

const postMock = vi.fn(async (_url: string, body: any) => {
  // garante que enviamos camelCase
  if (!('workshopId' in body) || !('volunteerId' in body)) {
    throw new Error('payload inválido');
  }
  return { data: { success: true } } as any;
});

vi.mock('@/lib/api', () => ({
  apiClient: {
    get: (...args: any[]) => getMock(args[0], args[1]),
    post: (...args: any[]) => postMock(args[0], args[1]),
    delete: vi.fn(),
  },
}));

describe('Participations', () => {
  it('carrega oficinas e voluntários e adiciona participação com payload camelCase', async () => {
    render(<Participations />);

    // aguarda carregamento inicial
    await waitFor(() => {
      expect(screen.getByText('Participações')).toBeInTheDocument();
    });

    // seleciona voluntário
    const trigger = screen.getByText('Selecionar voluntário para adicionar');
    fireEvent.click(trigger);
    const option = await screen.findByText('Maria Silva');
    fireEvent.click(option);

    const addBtn = screen.getByRole('button', { name: /Adicionar/i });
    fireEvent.click(addBtn);

    await waitFor(() => {
      expect(postMock).toHaveBeenCalledWith('/participations', {
        workshopId: 'w1',
        volunteerId: 'v1',
      });
    });
  });
});
