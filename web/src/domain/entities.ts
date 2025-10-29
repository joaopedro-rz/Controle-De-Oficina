// Tipos de domínio para o frontend (React + TS)
// Inclui DTOs (formas vindas/indo para a API) e Models (formas usadas no UI)

export type UUID = string;

// Enums compatíveis com o backend
export enum VolunteerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  LEFT = 'LEFT',
}

export enum ParticipationRole {
  FACILITATOR = 'FACILITATOR',
  ASSISTANT = 'ASSISTANT',
  OBSERVER = 'OBSERVER',
}

export enum TermStatus {
  GENERATED = 'GENERATED',
  SIGNED = 'SIGNED',
  EXPIRED = 'EXPIRED',
}

// DTOs (datas como ISO string)
export interface BaseEntityDTO {
  id: UUID;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserDTO extends BaseEntityDTO {
  name: string;
  email: string;
  passwordHash: string;
  lastLoginAt?: string | null;
  isSuperAdmin: boolean;
}

export interface VolunteerDTO extends BaseEntityDTO {
  firstName: string;
  lastName: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  cpf?: string | null;
  birthDate?: string | null;
  address?: string | null;
  startDate: string;
  endDate?: string | null;
  status: VolunteerStatus;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  notes?: string | null;
}

export interface WorkshopDTO extends BaseEntityDTO {
  name: string;
  description?: string | null;
  isActive: boolean;
  weekday?: number | null; // 0-6
  startTime?: string | null; // HH:mm
  endTime?: string | null; // HH:mm
  capacity?: number | null;
}

export interface ParticipationDTO extends BaseEntityDTO {
  volunteerId: UUID;
  workshopId: UUID;
  date: string; // ISO date
  role?: ParticipationRole | null;
  hours?: number | null;
  notes?: string | null;
}

export interface VolunteerTermDTO extends BaseEntityDTO {
  volunteerId: UUID;
  version: string;
  filePath: string;
  status: TermStatus;
  generatedAt: string;
  signedAt?: string | null;
  expiresAt?: string | null;
}

export interface AuditLogDTO extends BaseEntityDTO {
  actorUserId: UUID;
  entity: 'Volunteer' | 'Workshop' | 'Participation' | 'VolunteerTerm' | 'AdminUser';
  entityId: UUID;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'GENERATE' | 'SIGN' | 'LOGIN';
  payload?: Record<string, unknown> | null;
}

// Models (datas como Date para facilitar no UI)
export interface BaseEntityModel {
  id: UUID;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminUserModel extends BaseEntityModel {
  name: string;
  email: string;
  passwordHash: string;
  lastLoginAt?: Date | null;
  isSuperAdmin: boolean;
}

export interface VolunteerModel extends BaseEntityModel {
  firstName: string;
  lastName: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  cpf?: string | null;
  birthDate?: Date | null;
  address?: string | null;
  startDate: Date;
  endDate?: Date | null;
  status: VolunteerStatus;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  notes?: string | null;
}

export interface WorkshopModel extends BaseEntityModel {
  name: string;
  description?: string | null;
  isActive: boolean;
  weekday?: number | null;
  startTime?: string | null;
  endTime?: string | null;
  capacity?: number | null;
}

export interface ParticipationModel extends BaseEntityModel {
  volunteerId: UUID;
  workshopId: UUID;
  date: Date;
  role?: ParticipationRole | null;
  hours?: number | null;
  notes?: string | null;
}

export interface VolunteerTermModel extends BaseEntityModel {
  volunteerId: UUID;
  version: string;
  filePath: string;
  status: TermStatus;
  generatedAt: Date;
  signedAt?: Date | null;
  expiresAt?: Date | null;
}

export interface AuditLogModel extends BaseEntityModel {
  actorUserId: UUID;
  entity: 'Volunteer' | 'Workshop' | 'Participation' | 'VolunteerTerm' | 'AdminUser';
  entityId: UUID;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'GENERATE' | 'SIGN' | 'LOGIN';
  payload?: Record<string, unknown> | null;
}

// Helpers
const toDate = (v?: string | null): Date | null => (v ? new Date(v) : null);
const toISO = (v?: Date | null): string | null => (v ? v.toISOString() : null);

export const parseBase = (dto: BaseEntityDTO): BaseEntityModel => ({
  id: dto.id,
  createdAt: new Date(dto.createdAt),
  updatedAt: new Date(dto.updatedAt),
});

export const serializeBase = (m: BaseEntityModel): BaseEntityDTO => ({
  id: m.id,
  createdAt: m.createdAt.toISOString(),
  updatedAt: m.updatedAt.toISOString(),
});

export const parseVolunteer = (dto: VolunteerDTO): VolunteerModel => ({
  ...parseBase(dto),
  firstName: dto.firstName,
  lastName: dto.lastName,
  fullName: dto.fullName,
  email: dto.email ?? null,
  phone: dto.phone ?? null,
  cpf: dto.cpf ?? null,
  birthDate: toDate(dto.birthDate),
  address: dto.address ?? null,
  startDate: new Date(dto.startDate),
  endDate: toDate(dto.endDate),
  status: dto.status,
  emergencyContactName: dto.emergencyContactName ?? null,
  emergencyContactPhone: dto.emergencyContactPhone ?? null,
  notes: dto.notes ?? null,
});

export const serializeVolunteer = (m: VolunteerModel): VolunteerDTO => ({
  ...serializeBase(m),
  firstName: m.firstName,
  lastName: m.lastName,
  fullName: m.fullName,
  email: m.email ?? null,
  phone: m.phone ?? null,
  cpf: m.cpf ?? null,
  birthDate: toISO(m.birthDate),
  address: m.address ?? null,
  startDate: m.startDate.toISOString(),
  endDate: toISO(m.endDate),
  status: m.status,
  emergencyContactName: m.emergencyContactName ?? null,
  emergencyContactPhone: m.emergencyContactPhone ?? null,
  notes: m.notes ?? null,
});

export const parseWorkshop = (dto: WorkshopDTO): WorkshopModel => ({
  ...parseBase(dto),
  name: dto.name,
  description: dto.description ?? null,
  isActive: dto.isActive,
  weekday: dto.weekday ?? null,
  startTime: dto.startTime ?? null,
  endTime: dto.endTime ?? null,
  capacity: dto.capacity ?? null,
});

export const serializeWorkshop = (m: WorkshopModel): WorkshopDTO => ({
  ...serializeBase(m),
  name: m.name,
  description: m.description ?? null,
  isActive: m.isActive,
  weekday: m.weekday ?? null,
  startTime: m.startTime ?? null,
  endTime: m.endTime ?? null,
  capacity: m.capacity ?? null,
});

export const parseParticipation = (dto: ParticipationDTO): ParticipationModel => ({
  ...parseBase(dto),
  volunteerId: dto.volunteerId,
  workshopId: dto.workshopId,
  date: new Date(dto.date),
  role: dto.role ?? null,
  hours: dto.hours ?? null,
  notes: dto.notes ?? null,
});

export const serializeParticipation = (m: ParticipationModel): ParticipationDTO => ({
  ...serializeBase(m),
  volunteerId: m.volunteerId,
  workshopId: m.workshopId,
  date: m.date.toISOString(),
  role: m.role ?? null,
  hours: m.hours ?? null,
  notes: m.notes ?? null,
});

export const parseVolunteerTerm = (dto: VolunteerTermDTO): VolunteerTermModel => ({
  ...parseBase(dto),
  volunteerId: dto.volunteerId,
  version: dto.version,
  filePath: dto.filePath,
  status: dto.status,
  generatedAt: new Date(dto.generatedAt),
  signedAt: toDate(dto.signedAt),
  expiresAt: toDate(dto.expiresAt),
});

export const serializeVolunteerTerm = (m: VolunteerTermModel): VolunteerTermDTO => ({
  ...serializeBase(m),
  volunteerId: m.volunteerId,
  version: m.version,
  filePath: m.filePath,
  status: m.status,
  generatedAt: m.generatedAt.toISOString(),
  signedAt: toISO(m.signedAt),
  expiresAt: toISO(m.expiresAt),
});

