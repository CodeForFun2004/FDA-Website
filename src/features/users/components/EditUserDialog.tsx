// src/features/users/components/EditUserDialog.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { updateAdminUserApi } from '@/features/admin/api/admin';
import type { UpdateUserRequest } from '@/features/admin/types/admin.type';
import type { User } from '../types';
import {
  Loader2,
  Edit,
  Phone,
  User as UserIcon,
  Shield,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';

// ===== Types =====
export type EditUserDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSuccess?: () => void;
};

// Available roles for selection
const ROLE_OPTIONS = [
  { value: 'USER', label: 'User' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
  { value: 'AUTHORITY', label: 'Authority' }
];

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'banned', label: 'Banned' }
];

// ===== Component =====
export function EditUserDialog({
  open,
  onOpenChange,
  user,
  onSuccess
}: EditUserDialogProps) {
  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    status: 'ACTIVE',
    role: 'USER'
  });

  // Form errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.name || '',
        phoneNumber: '',
        status:
          user.status === 'Active'
            ? 'ACTIVE'
            : user.status === 'Inactive'
              ? 'INACTIVE'
              : user.status,
        role: user.role
      });
      setErrors({});
    }
  }, [user]);

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: ({
      userId,
      data
    }: {
      userId: string;
      data: UpdateUserRequest;
    }) => updateAdminUserApi(userId, data),
    onSuccess: (response) => {
      if (response.success) {
        toast.success('Cập nhật user thành công!');
        // Invalidate users query to refetch
        queryClient.invalidateQueries({ queryKey: ['users'] });
        // Close dialog
        onOpenChange(false);
        // Call onSuccess callback
        onSuccess?.();
      } else {
        toast.error('Cập nhật user thất bại', {
          description: response.message
        });
      }
    },
    onError: (error: Error) => {
      toast.error('Lỗi cập nhật user', {
        description: error.message
      });
    }
  });

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Họ tên là bắt buộc';
    }

    if (formData.phoneNumber && !/^[0-9]{10,11}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Số điện thoại không hợp lệ (10-11 số)';
    }

    if (!formData.role) {
      newErrors.role = 'Phải chọn vai trò';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !validateForm()) return;

    const payload: UpdateUserRequest = {
      fullName: formData.fullName.trim(),
      phoneNumber: formData.phoneNumber.trim() || undefined,
      status: formData.status,
      roleNames: [formData.role]
    };

    updateUserMutation.mutate({ userId: user.id, data: payload });
  };

  // Handle input change
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // Handle role change
  const handleRoleChange = (role: string) => {
    setFormData((prev) => ({
      ...prev,
      role: role
    }));
    // Clear error
    if (errors.role) {
      setErrors((prev) => ({ ...prev, role: '' }));
    }
  };

  const isLoading = updateUserMutation.isPending;

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Edit className='text-primary h-5 w-5' />
            Chỉnh sửa User
          </DialogTitle>
          <DialogDescription>
            Cập nhật thông tin user. Chỉ áp dụng cho user được tạo bởi admin.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          {/* Email (Read-only) */}
          <div className='space-y-2'>
            <Label className='text-muted-foreground text-sm'>Email</Label>
            <Input value={user.email} disabled className='bg-muted' />
          </div>

          {/* Full Name */}
          <div className='space-y-2'>
            <Label htmlFor='fullName' className='flex items-center gap-2'>
              <UserIcon className='text-muted-foreground h-4 w-4' />
              Họ và tên <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='fullName'
              type='text'
              placeholder='Nguyễn Văn A'
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              disabled={isLoading}
              className={errors.fullName ? 'border-destructive' : ''}
            />
            {errors.fullName && (
              <p className='text-destructive text-sm'>{errors.fullName}</p>
            )}
          </div>

          {/* Phone Number */}
          <div className='space-y-2'>
            <Label htmlFor='phoneNumber' className='flex items-center gap-2'>
              <Phone className='text-muted-foreground h-4 w-4' />
              Số điện thoại
            </Label>
            <Input
              id='phoneNumber'
              type='tel'
              placeholder='0901234567'
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              disabled={isLoading}
              className={errors.phoneNumber ? 'border-destructive' : ''}
            />
            {errors.phoneNumber && (
              <p className='text-destructive text-sm'>{errors.phoneNumber}</p>
            )}
          </div>

          {/* Status */}
          <div className='space-y-2'>
            <Label htmlFor='status' className='flex items-center gap-2'>
              <Activity className='text-muted-foreground h-4 w-4' />
              Trạng thái <span className='text-destructive'>*</span>
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleInputChange('status', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder='Chọn trạng thái' />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Roles */}
          <div className='space-y-2'>
            <Label className='flex items-center gap-2'>
              <Shield className='text-muted-foreground h-4 w-4' />
              Vai trò <span className='text-destructive'>*</span>
            </Label>
            <div className='space-y-2 rounded-md border p-3'>
              {ROLE_OPTIONS.map((option) => (
                <div key={option.value} className='flex items-center space-x-2'>
                  <input
                    type='radio'
                    id={`role-${option.value}`}
                    name='role'
                    checked={formData.role === option.value}
                    onChange={() => handleRoleChange(option.value)}
                    disabled={isLoading}
                    className='text-primary accent-primary h-4 w-4 cursor-pointer'
                  />
                  <label
                    htmlFor={`role-${option.value}`}
                    className='cursor-pointer text-sm leading-none font-medium'
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
            {errors.role && (
              <p className='text-destructive text-sm'>{errors.role}</p>
            )}
          </div>

          <DialogFooter className='pt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button type='submit' disabled={isLoading} className='gap-2'>
              {isLoading ? (
                <>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  Đang cập nhật...
                </>
              ) : (
                <>
                  <Edit className='h-4 w-4' />
                  Cập nhật
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
