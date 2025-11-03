export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  isSuperAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
  refreshToken?: string | null; // <--- novo campo
}
