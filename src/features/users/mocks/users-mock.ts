// src/features/users/mocks/users-mock.ts
import type { User } from "../types";

export const generateUsers = (): User[] => [
    {
        id: '1',
        name: 'Alice Admin',
        email: 'alice@fda.gov',
        role: 'Admin',
        status: 'Active',
        createdAt: '2023-01-10',
        lastLogin: '2023-10-25T08:30:00Z'
    },
    {
        id: '2',
        name: 'Bob Operator',
        email: 'bob@fda.gov',
        role: 'Operator',
        status: 'Active',
        createdAt: '2023-02-15',
        lastLogin: '2023-10-24T14:20:00Z'
    },
    {
        id: '3',
        name: 'Charlie View',
        email: 'charlie@public.com',
        role: 'Viewer',
        status: 'Inactive',
        createdAt: '2023-05-20',
        lastLogin: '2023-09-10T09:00:00Z'
    },
    {
        id: '4',
        name: 'Mobile User 1',
        email: 'm1@mobile.com',
        role: 'Mobile',
        status: 'Active',
        createdAt: '2023-10-01',
        lastLogin: '2023-10-26T10:15:00Z'
    },
];
