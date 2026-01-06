// src/features/users/types.ts
export type Role = 'Admin' | 'Operator' | 'Viewer' | 'Mobile';

export interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
    status: 'Active' | 'Inactive';
    createdAt: string;
    lastLogin: string;
}
