// src/features/users/components/CreateUserDialog.tsx
'use client';

import React, { useState } from 'react';
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
import { createAdminUserApi } from '@/features/admin/api/admin.api';
import type { CreateUserRequest } from '@/features/admin/types/admin.type';
import {
  Loader2,
  UserPlus,
  Mail,
  Lock,
  Phone,
  User,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';

// ===== Types =====
export type CreateUserDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

// Available roles for selection
const ROLE_OPTIONS = [
  { value: 'USER', label: 'User' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'SUPERADMIN', label: 'Super Admin' },
  { value: 'MODERATOR', label: 'Moderator' }
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'banned', label: 'Banned' }
];

// ===== Component =====
export function CreateUserDialog({
  open,
  onOpenChange,
  onSuccess
}: CreateUserDialogProps) {
  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phoneNumber: '',
    status: 'active',
    role: 'USER'
  });

  // Form errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: (data: CreateUserRequest) => createAdminUserApi(data),
    onSuccess: (response) => {
      if (response.success) {
        toast.success('User created successfully!', {
          description: `User ID: ${response.userId}`
        });
        // Invalidate users query to refetch
        queryClient.invalidateQueries({ queryKey: ['users'] });
        // Reset form
        resetForm();
        // Close dialog
        onOpenChange(false);
        // Call onSuccess callback
        onSuccess?.();
      } else {
        toast.error('Failed to create user', {
          description: response.message
        });
      }
    },
    onError: (error: Error) => {
      toast.error('User creation error', {
        description: error.message
      });
    }
  });

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      fullName: '',
      phoneNumber: '',
      status: 'active',
      role: 'USER'
    });
    setErrors({});
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (formData.phoneNumber && !/^[0-9]{10,11}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Invalid phone number (10-11 digits)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const payload: CreateUserRequest = {
      email: formData.email.trim(),
      password: formData.password,
      fullName: formData.fullName.trim(),
      phoneNumber: formData.phoneNumber.trim() || undefined,
      status: formData.status,
      roleNames: [formData.role]
    };

    createUserMutation.mutate(payload);
  };

  // Handle input change
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // Handle dialog close
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      resetForm();
    }
    onOpenChange(isOpen);
  };

  const isLoading = createUserMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <UserPlus className='text-primary h-5 w-5' />
            Create New User
          </DialogTitle>
          <DialogDescription>
            Fill in the details to create a new user account. Fields marked *
            are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          {/* Email */}
          <div className='space-y-2'>
            <Label htmlFor='email' className='flex items-center gap-2'>
              <Mail className='text-muted-foreground h-4 w-4' />
              Email <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='email'
              type='email'
              placeholder='user@example.com'
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              disabled={isLoading}
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && (
              <p className='text-destructive text-sm'>{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className='space-y-2'>
            <Label htmlFor='password' className='flex items-center gap-2'>
              <Lock className='text-muted-foreground h-4 w-4' />
              Password <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='password'
              type='password'
              placeholder='Enter password (at least 6 characters)'
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              disabled={isLoading}
              className={errors.password ? 'border-destructive' : ''}
            />
            {errors.password && (
              <p className='text-destructive text-sm'>{errors.password}</p>
            )}
          </div>

          {/* Full Name */}
          <div className='space-y-2'>
            <Label htmlFor='fullName' className='flex items-center gap-2'>
              <User className='text-muted-foreground h-4 w-4' />
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
              <Shield className='text-muted-foreground h-4 w-4' />
              Status
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

          {/* Role */}
          <div className='space-y-2'>
            <Label htmlFor='role' className='flex items-center gap-2'>
              <Shield className='text-muted-foreground h-4 w-4' />
              Role <span className='text-destructive'>*</span>
            </Label>
            <Select
              value={formData.role}
              onValueChange={(value) => handleInputChange('role', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder='Select role' />
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

          <DialogFooter className='pt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={isLoading} className='gap-2'>
              {isLoading ? (
                <>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus className='h-4 w-4' />
                  Create User
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
