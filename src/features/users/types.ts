// src/features/users/types.ts
export type Role = 'ADMIN' | 'USER' | 'SUPER_ADMIN' | 'AUTHORITY';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: 'Active' | 'Inactive';
  createdAt: string;
  lastLogin: string;
}
