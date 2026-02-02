'use client';

import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import type { User } from '@/features/users/types';
import type { Column, ColumnDef } from '@tanstack/react-table';
import { CheckCircle2, MinusCircle, Text, XCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { UserCellAction } from './cell-action';

export const ROLE_OPTIONS = [
  { label: 'Admin', value: 'ADMIN' },
  { label: 'User', value: 'USER' },
  { label: 'Super Admin', value: 'SUPER_ADMIN' },
  { label: 'Authority', value: 'AUTHORITY' }
];

export const STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Banned', value: 'banned' }
];

export const columns: ColumnDef<User>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }: { column: Column<User, unknown> }) => (
      <DataTableColumnHeader column={column} title='User' />
    ),
    cell: ({ row }) => (
      <div className='flex min-w-[220px] items-center gap-3'>
        <div className='bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-full font-semibold'>
          {row.original.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className='font-medium'>{row.original.name}</p>
          <p className='text-muted-foreground text-xs'>{row.original.email}</p>
        </div>
      </div>
    ),
    meta: {
      label: 'Search',
      placeholder: 'Search name or email...',
      variant: 'text',
      icon: Text
    },
    enableColumnFilter: true
  },
  {
    id: 'role',
    accessorKey: 'roles',
    header: ({ column }: { column: Column<User, unknown> }) => (
      <DataTableColumnHeader column={column} title='Role' />
    ),
    cell: ({ row }) => {
      const roles = row.original.roles ?? [];

      const getRoleBadgeClass = (role: string) => {
        if (role === 'SUPER_ADMIN')
          return 'border-red-500 bg-red-50 text-red-600';
        if (role === 'ADMIN')
          return 'border-purple-500 bg-purple-50 text-purple-600';
        if (role === 'AUTHORITY')
          return 'border-blue-500 bg-blue-50 text-blue-600';
        return 'border-green-500 bg-green-50 text-green-600';
      };

      const getRoleLabel = (role: string) =>
        role === 'SUPER_ADMIN'
          ? 'Super Admin'
          : role.charAt(0) + role.slice(1).toLowerCase();

      return (
        <div className='flex flex-wrap gap-1'>
          {roles.length > 0 ? (
            roles.map((role) => (
              <Badge
                key={role}
                variant='outline'
                className={getRoleBadgeClass(role)}
              >
                {getRoleLabel(role)}
              </Badge>
            ))
          ) : (
            <Badge variant='outline' className='border-gray-300 text-gray-600'>
              User
            </Badge>
          )}
        </div>
      );
    },
    meta: {
      label: 'Role',
      variant: 'select',
      options: ROLE_OPTIONS
    },
    enableColumnFilter: true
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: ({ column }: { column: Column<User, unknown> }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const status = row.original.status.toLowerCase();
      const getBadgeConfig = (value: string) => {
        switch (value) {
          case 'active':
            return {
              className:
                'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20 hover:bg-green-500/20',
              icon: CheckCircle2,
              iconClassName: 'text-green-600 dark:text-green-400'
            };
          case 'banned':
            return {
              className:
                'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20 hover:bg-red-500/20',
              icon: XCircle,
              iconClassName: 'text-red-600 dark:text-red-400'
            };
          default:
            return {
              className:
                'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20 hover:bg-gray-500/20',
              icon: MinusCircle,
              iconClassName: 'text-gray-600 dark:text-gray-400'
            };
        }
      };

      const config = getBadgeConfig(status);
      const Icon = config.icon;

      return (
        <Badge
          variant='default'
          className={`gap-1.5 font-medium ${config.className}`}
        >
          <Icon className={`h-3.5 w-3.5 ${config.iconClassName}`} />
          {row.original.status}
        </Badge>
      );
    },
    meta: {
      label: 'Status',
      variant: 'select',
      options: STATUS_OPTIONS
    },
    enableColumnFilter: true
  },
  {
    id: 'lastLogin',
    accessorKey: 'lastLogin',
    header: ({ column }: { column: Column<User, unknown> }) => (
      <DataTableColumnHeader column={column} title='Last Login' />
    ),
    cell: ({ row }) => (
      <div className='text-muted-foreground'>
        {formatDate(row.original.lastLogin)}
      </div>
    )
  },
  {
    id: 'actions',
    cell: ({ row }) => <UserCellAction data={row.original} />
  }
];
