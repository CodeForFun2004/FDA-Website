// src/features/users/views/UsersView.tsx
"use client";

import React, { useState, useMemo } from 'react';
import { useUsers, type User } from '../index';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow, 
  Badge, Button, Input, Card, CardHeader, CardTitle, CardContent, LoadingState 
} from '@/components/ui/common';
import { formatDate } from '@/lib/utils';
import { Search, Plus, Edit, Trash2, MoreHorizontal } from 'lucide-react';

// ===== Sub-components =====

type UserRowProps = {
  user: User;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
};

const UserRow = ({ user, onEdit, onDelete }: UserRowProps) => (
  <TableRow>
    <TableCell className="font-medium">{user.name}</TableCell>
    <TableCell>{user.email}</TableCell>
    <TableCell>
      <Badge variant="outline">{user.role}</Badge>
    </TableCell>
    <TableCell>
      <Badge variant={user.status === 'Active' ? 'success' : 'secondary'}>
        {user.status}
      </Badge>
    </TableCell>
    <TableCell>{formatDate(user.lastLogin)}</TableCell>
    <TableCell>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => onEdit?.(user)}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onDelete?.(user)}>
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>
    </TableCell>
  </TableRow>
);

// ===== Main View Component =====

export type UsersViewProps = {
  onCreateUser?: () => void;
  onEditUser?: (user: User) => void;
  onDeleteUser?: (user: User) => void;
};

export function UsersView({ onCreateUser, onEditUser, onDeleteUser }: UsersViewProps) {
  const { data: users, isLoading } = useUsers();
  const [search, setSearch] = useState('');

  // Business logic: filter users by search
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    if (!search.trim()) return users;
    
    const searchLower = search.toLowerCase();
    return users.filter(u => 
      u.name.toLowerCase().includes(searchLower) || 
      u.email.toLowerCase().includes(searchLower)
    );
  }, [users, search]);

  // Statistics
  const stats = useMemo(() => ({
    total: users?.length ?? 0,
    active: users?.filter(u => u.status === 'Active').length ?? 0,
    inactive: users?.filter(u => u.status === 'Inactive').length ?? 0,
  }), [users]);

  if (isLoading) return <LoadingState />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users & Roles</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {stats.total} users • {stats.active} active • {stats.inactive} inactive
          </p>
        </div>
        <Button onClick={onCreateUser}>
          <Plus className="mr-2 h-4 w-4" /> Create User
        </Button>
      </div>

      {/* Search & Table */}
      <Card>
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search users..." 
              className="pl-8" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <UserRow 
                  key={user.id} 
                  user={user} 
                  onEdit={onEditUser}
                  onDelete={onDeleteUser}
                />
              ))}
            </TableBody>
          </Table>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {search ? 'No users found matching your search.' : 'No users yet.'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
