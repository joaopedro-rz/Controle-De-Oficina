(global as any).ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, beforeAll, afterAll, afterEach, expect } from 'vitest';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import Auth from '@/pages/Auth';
import WorkshopsList from '@/components/WorkshopsList';

// In-memory store used by handlers
let workshops: Array<any> = [];

const server = setupServer(
  rest.post('http://localhost:3001/auth/login', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ token: 'fake-token', user: { id: 'u1', name: 'Admin' } }));
  }),

  rest.get('http://localhost:3001/workshops', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ items: workshops }));
  }),

  rest.post('http://localhost:3001/workshops', async (req, res, ctx) => {
    const body = await req.json();
    const newItem = {
      id: String(Date.now()),
      name: body.name,
      description: body.description ?? null,
      schedule: body.schedule ?? null,
      location: body.location ?? null,
      is_active: body.is_active ?? true,
      created_at: new Date().toISOString(),
    };
    workshops.push(newItem);
    return res(ctx.status(201), ctx.json(newItem));
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  workshops = [];
});
afterAll(() => server.close());

describe('Auth + Workshops CRUD (integration)', () => {
  it('logs in, navigates to dashboard and creates a workshop', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/dashboard" element={<WorkshopsList />} />
        </Routes>
      </MemoryRouter>
    );

    // Fill login form
    const email = screen.getByLabelText(/Email/i);
    const password = screen.getByLabelText(/Senha/i);
    fireEvent.change(email, { target: { value: 'admin@example.com' } });
    fireEvent.change(password, { target: { value: 'password' } });

    const loginButton = screen.getByRole('button', { name: /Entrar/i });
    fireEvent.click(loginButton);

    // After successful login, navigate to dashboard where WorkshopsList is rendered
    const title = await screen.findByText((content, element) => {
      return element?.tagName === 'H3' && /Oficinas/i.test(content);
    });
    expect(title).toBeDefined();

    // Open form to create a new workshop
    const newButton = screen.getByRole('button', { name: /Nova Oficina/i });
    fireEvent.click(newButton);

    // Fill workshop form
    const nameInput = screen.getByLabelText(/Nome da Oficina/i);
    fireEvent.change(nameInput, { target: { value: 'Oficina Integracao' } });

    const submitButton = screen.getByRole('button', { name: /Salvar/i });
    fireEvent.click(submitButton);

    // After submit, WorkshopsList should refetch and show the new workshop
    await waitFor(() => expect(screen.getByText('Oficina Integracao')).toBeDefined());
  });
});
