// src/features/users/types.ts
export type Role = 'ADMIN' | 'USER' | 'SUPERADMIN' | 'MODERATOR';

export interface User {
  id: string;
  name: string;
  email: string;
  roles: Role[];
  status: 'Active' | 'Inactive' | 'Banned';
  isAdminCreated: boolean;
  createdAt: string;
  lastLogin: string;
}
