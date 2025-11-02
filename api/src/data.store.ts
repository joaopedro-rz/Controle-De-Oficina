import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

export interface VolunteerEntity {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  cpf?: string | null;
  birth_date?: string | null; // ISO date
  entry_date: string; // ISO date
  exit_date: string | null; // ISO date
  is_active: boolean;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  emergency_contact?: string | null;
  emergency_phone?: string | null;
  notes?: string | null;
  created_at: string; // ISO datetime
}

export interface WorkshopEntity {
  id: string;
  name: string;
  description: string | null;
  schedule: string | null;
  location: string | null;
  is_active: boolean;
  created_at: string; // ISO datetime
}

export interface ParticipationEntity {
  id: string;
  volunteer_id: string;
  workshop_id: string;
  date: string | null; // ISO date
  role: string | null;
  hours: number | null;
  notes: string | null;
  created_at: string; // ISO datetime
}

@Injectable()
export class DataStoreService {
  private volunteers: VolunteerEntity[] = [];
  private workshops: WorkshopEntity[] = [];
  private participations: ParticipationEntity[] = [];

  // VOLUNTEERS
  /**
   * List volunteers with optional pagination and filtering.
   * filter: { q?: string, status?: 'active'|'inactive', page?: number, limit?: number }
   */
  listVolunteers(filter?: { q?: string; status?: 'active' | 'inactive'; page?: number; limit?: number }) {
    let list = this.volunteers.slice();
    if (filter?.q) {
      const q = filter.q.toLowerCase();
      list = list.filter((v) => (v.full_name || '').toLowerCase().includes(q));
    }
    if (filter?.status) {
      if (filter.status === 'active') list = list.filter((v) => v.is_active === true);
      else if (filter.status === 'inactive') list = list.filter((v) => v.is_active === false);
    }
    const total = list.length;
    const page = Math.max(1, filter?.page ?? 1);
    const limit = Math.max(1, filter?.limit ?? 20);
    const start = (page - 1) * limit;
    const items = list.slice(start, start + limit);
    return { items, total, page, limit };
  }
  createVolunteer(payload: Omit<VolunteerEntity, 'id' | 'created_at'>): VolunteerEntity {
    const now = new Date().toISOString();
    const entity: VolunteerEntity = { id: randomUUID(), created_at: now, ...payload };
    this.volunteers.push(entity);
    return entity;
  }
  updateVolunteer(id: string, payload: Partial<VolunteerEntity>): VolunteerEntity | undefined {
    const idx = this.volunteers.findIndex(v => v.id === id);
    if (idx === -1) return undefined;
    this.volunteers[idx] = { ...this.volunteers[idx], ...payload };
    return this.volunteers[idx];
  }

  deleteVolunteer(id: string): boolean {
    const idx = this.volunteers.findIndex(v => v.id === id);
    if (idx === -1) return false;
    // marca como inativo e seta exit_date
    this.volunteers[idx] = { ...this.volunteers[idx], is_active: false, exit_date: this.volunteers[idx].exit_date ?? new Date().toISOString() };
    return true;
  }

  // WORKSHOPS
  listWorkshops(): WorkshopEntity[] {
    return this.workshops;
  }
  createWorkshop(payload: Omit<WorkshopEntity, 'id' | 'created_at'>): WorkshopEntity {
    const now = new Date().toISOString();
    const entity: WorkshopEntity = { id: randomUUID(), created_at: now, ...payload };
    this.workshops.push(entity);
    return entity;
  }
  updateWorkshop(id: string, payload: Partial<WorkshopEntity>): WorkshopEntity | undefined {
    const idx = this.workshops.findIndex(w => w.id === id);
    if (idx === -1) return undefined;
    this.workshops[idx] = { ...this.workshops[idx], ...payload };
    return this.workshops[idx];
  }

  // PARTICIPATIONS
  listParticipations(filter?: { workshopId?: string; volunteerId?: string }): ParticipationEntity[] {
    let list = this.participations;
    if (filter?.workshopId) list = list.filter(p => p.workshop_id === filter.workshopId);
    if (filter?.volunteerId) list = list.filter(p => p.volunteer_id === filter.volunteerId);
    return list;
  }
  createParticipation(payload: Omit<ParticipationEntity, 'id' | 'created_at'>): ParticipationEntity | { error: string } {
    // evita duplicidade de vínculo básico (sem considerar data)
    const exists = this.participations.some(
      (p) => p.volunteer_id === payload.volunteer_id && p.workshop_id === payload.workshop_id,
    );
    if (exists) return { error: 'Participation already exists' };
    const now = new Date().toISOString();
    const entity: ParticipationEntity = { id: randomUUID(), created_at: now, ...payload };
    this.participations.push(entity);
    return entity;
  }
  deleteParticipation(id: string): boolean {
    const len = this.participations.length;
    this.participations = this.participations.filter(p => p.id !== id);
    return this.participations.length < len;
  }

  // HELPERS
  getVolunteer(id: string) { return this.volunteers.find(v => v.id === id); }
  getWorkshop(id: string) { return this.workshops.find(w => w.id === id); }
}

