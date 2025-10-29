// Entidades de domínio (sem ORM) para o projeto ELLP — Controle de Voluntários

export type UUID = string;

// Enums
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

// Base
export interface BaseEntity {
  id: UUID;
  createdAt: Date;
  updatedAt: Date;
}

// Usuário administrador (super user)
export interface AdminUser extends BaseEntity {
  name: string;
  email: string; // único
  passwordHash: string;
  lastLoginAt?: Date | null;
  isSuperAdmin: boolean; // sempre true por enquanto
}

// Voluntário
export interface Volunteer extends BaseEntity {
  firstName: string;
  lastName: string;
  fullName: string; // denormalizado para busca
  email?: string | null;
  phone?: string | null;
  cpf?: string | null; // BR
  birthDate?: Date | null;
  address?: string | null; // simplificado; pode virar objeto depois
  startDate: Date; // data de entrada
  endDate?: Date | null; // saída
  status: VolunteerStatus;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  notes?: string | null;
}

// Oficina
export interface Workshop extends BaseEntity {
  name: string;
  description?: string | null;
  isActive: boolean;
  // campos opcionais para planejamento
  weekday?: number | null; // 0-6
  startTime?: string | null; // HH:mm
  endTime?: string | null; // HH:mm
  capacity?: number | null;
}

// Participação (histórico do voluntário em oficinas)
export interface Participation extends BaseEntity {
  volunteerId: UUID;
  workshopId: UUID;
  date: Date; // quando ocorreu a participação (ou início, se for período)
  role?: ParticipationRole | null;
  hours?: number | null; // carga horária
  notes?: string | null;
}

// Termo de voluntariado gerado em PDF
export interface VolunteerTerm extends BaseEntity {
  volunteerId: UUID;
  version: string; // versão do template/política
  filePath: string; // caminho local ou URL (S3)
  status: TermStatus;
  generatedAt: Date;
  signedAt?: Date | null;
  expiresAt?: Date | null;
}

// Log simples para auditoria
export interface AuditLog extends BaseEntity {
  actorUserId: UUID;
  entity:
    | 'Volunteer'
    | 'Workshop'
    | 'Participation'
    | 'VolunteerTerm'
    | 'AdminUser';
  entityId: UUID;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'GENERATE' | 'SIGN' | 'LOGIN';
  payload?: Record<string, unknown> | null;
}
