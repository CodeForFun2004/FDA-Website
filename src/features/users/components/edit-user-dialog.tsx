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
import { updateAdminUserApi } from '@/features/admin/api/admin.api';
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
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
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
    status: 'active',
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
        status: user.status.toLowerCase(),
        role: user.roles?.[0] ?? 'USER'
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
        toast.success('User updated successfully!');
        // Invalidate users query to refetch
        queryClient.invalidateQueries({ queryKey: ['users'] });
        // Close dialog
        onOpenChange(false);
        // Call onSuccess callback
        onSuccess?.();
      } else {
        toast.error('Failed to update user', {
          description: response.message
        });
      }
    },
    onError: (error: Error) => {
      toast.error('User update error', {
        description: error.message
      });
    }
  });

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (formData.phoneNumber && !/^[0-9]{10,11}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Invalid phone number (10-11 digits)';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
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
            Edit User
          </DialogTitle>
          <DialogDescription>
            Update user information. Applies only to users created by admin.
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
              Full name <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='fullName'
              type='text'
              placeholder='John Doe'
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
              Phone number
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
              Status <span className='text-destructive'>*</span>
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleInputChange('status', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder='Select status' />
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
              Role <span className='text-destructive'>*</span>
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
              Cancel
            </Button>
            <Button type='submit' disabled={isLoading} className='gap-2'>
              {isLoading ? (
                <>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  Updating...
                </>
              ) : (
                <>
                  <Edit className='h-4 w-4' />
                  Update
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
