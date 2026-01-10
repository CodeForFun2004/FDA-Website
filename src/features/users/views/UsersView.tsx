// src/features/users/views/UsersView.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { useUsers, type User } from '../index';
import type { UseUsersParams } from '../hooks/useUsers';
import { CreateUserDialog, EditUserDialog, BanUserDialog } from '../components';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  LoadingState,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/common';
import { Pagination } from '@/components/ui/pagination';
import { formatDate } from '@/lib/utils';
import { Search, Plus, Edit, Lock, Filter, X, Users } from 'lucide-react';
import { toast } from 'sonner';

// ===== Constants =====
const USERS_PER_PAGE = 5;

const ROLE_OPTIONS = [
  { value: 'all', label: 'Tất cả Role' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'USER', label: 'User' },
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
  { value: 'AUTHORITY', label: 'Authority' }
];

// ===== Sub-components =====

type UserRowProps = {
  user: User;
  onEdit?: (user: User) => void;
  onBan?: (user: User) => void;
};

const UserRow = ({ user, onEdit, onBan }: UserRowProps) => (
  <TableRow className='hover:bg-muted/50 transition-colors'>
    <TableCell className='font-medium'>
      <div className='flex items-center gap-3'>
        <div className='bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-full font-semibold'>
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className='font-medium'>{user.name}</p>
          <p className='text-muted-foreground text-xs'>{user.email}</p>
        </div>
      </div>
    </TableCell>
    <TableCell>
      <Badge
        variant='outline'
        className={
          user.role === 'SUPER_ADMIN'
            ? 'border-red-500 bg-red-50 text-red-600'
            : user.role === 'ADMIN'
              ? 'border-purple-500 bg-purple-50 text-purple-600'
              : user.role === 'AUTHORITY'
                ? 'border-blue-500 bg-blue-50 text-blue-600'
                : 'border-green-500 bg-green-50 text-green-600'
        }
      >
        {user.role === 'SUPER_ADMIN'
          ? 'Super Admin'
          : user.role.charAt(0) + user.role.slice(1).toLowerCase()}
      </Badge>
    </TableCell>
    <TableCell>
      <Badge
        variant={user.status === 'Active' ? 'success' : 'secondary'}
        className={
          user.status === 'Active'
            ? 'bg-green-100 text-green-700'
            : user.status === 'Banned'
              ? 'bg-red-100 text-red-700'
              : 'bg-gray-100 text-gray-600'
        }
      >
        <span
          className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${
            user.status === 'Active'
              ? 'bg-green-500'
              : user.status === 'Banned'
                ? 'bg-red-500'
                : 'bg-gray-400'
          }`}
        />
        {user.status}
      </Badge>
    </TableCell>
    <TableCell className='text-muted-foreground'>
      {formatDate(user.lastLogin)}
    </TableCell>
    <TableCell>
      <div className='flex items-center gap-1'>
        {user.isAdminCreated && (
          <Button
            variant='ghost'
            size='sm'
            onClick={() => onEdit?.(user)}
            className='h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600'
            title='Chỉnh sửa user'
          >
            <Edit className='h-4 w-4' />
          </Button>
        )}
        <Button
          variant='ghost'
          size='sm'
          onClick={() => onBan?.(user)}
          className={
            user.status === 'Banned'
              ? 'h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600'
              : 'h-8 w-8 p-0 hover:bg-orange-50 hover:text-orange-600'
          }
          title={user.status === 'Banned' ? 'Mở khóa user' : 'Khóa user'}
        >
          <Lock className='h-4 w-4' />
        </Button>
      </div>
    </TableCell>
  </TableRow>
);

// ===== Main View Component =====

export type UsersViewProps = {
  onCreateUser?: () => void;
  onEditUser?: (user: User) => void;
  onBanUser?: (user: User) => void;
};

export function UsersView({
  onCreateUser,
  onEditUser,
  onBanUser
}: UsersViewProps) {
  // State for dialogs
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // State for filters & pagination (server-side)
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [adminCreatedFilter, setAdminCreatedFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1); // Reset to first page when search changes
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Build API params
  const apiParams: UseUsersParams = useMemo(
    () => ({
      pageNumber: currentPage,
      pageSize: USERS_PER_PAGE,
      searchTerm: debouncedSearch || undefined,
      role: roleFilter !== 'all' ? roleFilter : undefined,
      createdBy: adminCreatedFilter ? 'admin' : undefined
    }),
    [currentPage, debouncedSearch, roleFilter, adminCreatedFilter]
  );

  // Fetch users from API with server-side pagination
  const { data, isLoading } = useUsers(apiParams);

  // Extract users and totalCount from API response
  const users = data?.users ?? [];
  const totalCount = data?.totalCount ?? 0;

  // Calculate total pages from server totalCount
  const totalPages = Math.ceil(totalCount / USERS_PER_PAGE);

  // Handle filter changes
  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleClearFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setRoleFilter('all');
    setAdminCreatedFilter(false);
    setCurrentPage(1);
  };

  // Handle edit user
  const handleEditUser = (user: User) => {
    // Frontend validation: Only allow editing admin-created users
    if (!user.isAdminCreated) {
      toast.error('Lỗi cập nhật user', {
        description: 'Bạn chỉ có thể chỉnh sửa user được tạo bởi admin.'
      });
      return;
    }

    setSelectedUser(user);
    setEditDialogOpen(true);
    onEditUser?.(user);
  };

  // Handle ban user
  const handleBanUser = (user: User) => {
    setSelectedUser(user);
    setBanDialogOpen(true);
    onBanUser?.(user);
  };

  // Statistics (from API data)
  const stats = useMemo(
    () => ({
      total: totalCount,
      active: users.filter((u) => u.status === 'Active').length,
      inactive: users.filter((u) => u.status === 'Inactive').length,
      banned: users.filter((u) => u.status === 'Banned').length,
      currentPageCount: users.length
    }),
    [users, totalCount]
  );

  const hasActiveFilters =
    search.trim() || roleFilter !== 'all' || adminCreatedFilter;

  if (isLoading) return <LoadingState />;

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold'>Users & Roles</h1>
          <p className='text-muted-foreground mt-1 text-sm'>
            {stats.total} users • {stats.active} active • {stats.inactive}{' '}
            inactive
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className='gap-2'>
          <Plus className='h-4 w-4' /> Create User
        </Button>
      </div>

      {/* Filters Card */}
      <Card>
        <CardHeader className='pb-4'>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            {/* Search Input */}
            <div className='relative max-w-md flex-1'>
              <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
              <Input
                placeholder='Tìm kiếm theo tên hoặc email...'
                className='pr-10 pl-10'
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
              {search && (
                <button
                  onClick={() => handleSearchChange('')}
                  className='text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2'
                >
                  <X className='h-4 w-4' />
                </button>
              )}
            </div>

            {/* Filters */}
            <div className='flex items-center gap-3'>
              {/* Role Filter */}
              <div className='flex items-center gap-2'>
                <Filter className='text-muted-foreground h-4 w-4' />
                <Select
                  value={roleFilter}
                  onValueChange={handleRoleFilterChange}
                >
                  <SelectTrigger className='w-[160px]'>
                    <SelectValue placeholder='Lọc theo Role' />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Admin Created Filter */}
              <div className='flex items-center space-x-2 rounded-md border px-3 py-2'>
                <input
                  type='checkbox'
                  id='adminCreated'
                  checked={adminCreatedFilter}
                  onChange={(e) => {
                    setAdminCreatedFilter(e.target.checked);
                    setCurrentPage(1);
                  }}
                  className='h-4 w-4 cursor-pointer rounded border-gray-300'
                />
                <label
                  htmlFor='adminCreated'
                  className='cursor-pointer text-sm font-medium select-none'
                >
                  Tạo bởi Admin
                </label>
              </div>
            </div>
          </div>

          {/* Active Filters Info */}
          {hasActiveFilters && (
            <div className='text-muted-foreground mt-3 flex items-center gap-2 text-sm'>
              <Users className='h-4 w-4' />
              <span>
                Hiển thị {stats.currentPageCount} / {stats.total} users
                {search && ` • Tìm kiếm: "${search}"`}
                {roleFilter !== 'all' &&
                  ` • Role: ${ROLE_OPTIONS.find((r) => r.value === roleFilter)?.label}`}
                {adminCreatedFilter && ` • Tạo bởi Admin`}
              </span>
            </div>
          )}
        </CardHeader>

        <CardContent>
          {/* Table */}
          <div className='rounded-lg border'>
            <Table>
              <TableHeader>
                <TableRow className='bg-muted/50'>
                  <TableHead className='w-[300px]'>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className='w-[100px]'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    onEdit={handleEditUser}
                    onBan={handleBanUser}
                  />
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Empty State */}
          {users.length === 0 && (
            <div className='flex flex-col items-center justify-center py-12 text-center'>
              <div className='bg-muted mb-4 flex h-16 w-16 items-center justify-center rounded-full'>
                <Users className='text-muted-foreground h-8 w-8' />
              </div>
              <h3 className='text-lg font-medium'>
                {hasActiveFilters ? 'Không tìm thấy user' : 'Chưa có user nào'}
              </h3>
              <p className='text-muted-foreground mt-1 max-w-sm text-sm'>
                {hasActiveFilters
                  ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để xem thêm kết quả.'
                  : 'Bắt đầu bằng cách tạo user mới.'}
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalCount > 0 && totalPages > 1 && (
            <div className='mt-6 flex items-center justify-between border-t pt-4'>
              <p className='text-muted-foreground text-sm'>
                Hiển thị {(currentPage - 1) * USERS_PER_PAGE + 1} -{' '}
                {Math.min(currentPage * USERS_PER_PAGE, totalCount)} trong{' '}
                {totalCount} users
              </p>
              <Pagination
                page={currentPage}
                total={totalPages}
                onChange={(page) => setCurrentPage(page)}
              />
            </div>
          )}

          {/* Single Page Info */}
          {totalCount > 0 && totalPages === 1 && (
            <div className='text-muted-foreground mt-4 text-center text-sm'>
              Hiển thị tất cả {totalCount} users
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <CreateUserDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => {
          onCreateUser?.();
        }}
      />

      {/* Edit User Dialog */}
      <EditUserDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        user={selectedUser}
        onSuccess={() => {
          // Refresh handled by mutation
        }}
      />

      {/* Ban User Dialog */}
      <BanUserDialog
        open={banDialogOpen}
        onOpenChange={setBanDialogOpen}
        user={selectedUser}
        onSuccess={() => {
          // Refresh handled by mutation
        }}
      />
    </div>
  );
}
