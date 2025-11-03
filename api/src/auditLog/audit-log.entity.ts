import { AuditAction } from '../common/enums/audit-action.enum';

export class AuditLogEntity {
  id: string;
  actorUserId: string;
  entity:
    | 'Volunteer'
    | 'Workshop'
    | 'Participation'
    | 'VolunteerTerm'
    | 'AdminUser';
  entityId: string;
  action: AuditAction;
  payload?: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}
