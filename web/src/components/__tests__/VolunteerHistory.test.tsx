import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import VolunteerHistory from '../VolunteerHistory';

vi.mock('@/lib/api', () => {
  return {
    apiClient: {
      get: vi.fn(async (url: string) => {
        if (url.startsWith('/participacoes/')) {
          return {
            data: [
              { id: 'p1', volunteerId: 'v1', workshopId: 'w1', date: '2025-01-02', role: 'ASSISTANT', hours: 2, notes: 'ok' },
            ],
          } as any;
        }
        if (url === '/workshops') {
          return {
            data: { items: [{ id: 'w1', name: 'Robótica', isActive: true }] },
          } as any;
        }
        return { data: [] } as any;
      }),
    },
  };
});

describe('VolunteerHistory', () => {
  it('renderiza histórico com nome da oficina e status', async () => {
    render(
      <VolunteerHistory volunteerId="v1" volunteerName="Maria Silva" onClose={() => void 0} />,
    );

    await waitFor(() => {
      expect(screen.getByText('Histórico de Participações')).toBeInTheDocument();
      expect(screen.getByText('Robótica')).toBeInTheDocument();
      expect(screen.getByText('Ativa')).toBeInTheDocument();
      // Valida formatação dd/mm/aaaa independentemente do fuso horário do ambiente de teste
      expect(screen.getByText(/\b\d{2}\/\d{2}\/\d{4}\b/)).toBeInTheDocument();
    });
  });
});
