"use client";

import React, { useState } from 'react';
import { useUsers } from '../../../lib/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge, Button, Input, Card, CardHeader, CardTitle, CardContent, LoadingState } from '../../../components/ui/common';
import { formatDate } from '../../../lib/utils';
import { Search, Plus } from 'lucide-react';

export default function UsersPage() {
  const { data: users, isLoading } = useUsers();
  const [search, setSearch] = useState('');

  const filteredUsers = users?.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  if (isLoading) return <LoadingState />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users & Roles</h1>
        <Button><Plus className="mr-2 h-4 w-4" /> Create User</Button>
      </div>

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
              {filteredUsers?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'Active' ? 'success' : 'secondary'}>{user.status}</Badge>
                  </TableCell>
                  <TableCell>{formatDate(user.lastLogin)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}