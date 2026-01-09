// src/features/users/components/BanUserDialog.tsx
'use client';

import React from 'react';
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
import { updateAdminUserApi } from '@/features/admin/api/admin';
import type { User } from '../types';
import { Loader2, Lock } from 'lucide-react';
import { toast } from 'sonner';

// ===== Types =====
export type BanUserDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSuccess?: () => void;
};

// ===== Component =====
export function BanUserDialog({
  open,
  onOpenChange,
  user,
  onSuccess
}: BanUserDialogProps) {
  const queryClient = useQueryClient();

  // Ban/Unban user mutation - uses same PATCH endpoint, but NO frontend validation (works for all users)
  const banUserMutation = useMutation({
    mutationFn: ({
      userId,
      newStatus
    }: {
      userId: string;
      newStatus: string;
    }) => updateAdminUserApi(userId, { status: newStatus }),
    onSuccess: (response) => {
      if (response.success) {
        const action = user?.status === 'Banned' ? 'Mở khóa' : 'Khóa';
        toast.success(`${action} user thành công!`, {
          description: `User ${user?.email} đã được ${action.toLowerCase()}.`
        });
        // Invalidate users query to refetch
        queryClient.invalidateQueries({ queryKey: ['users'] });
        // Close dialog
        onOpenChange(false);
        // Call onSuccess callback
        onSuccess?.();
      } else {
        toast.error('Cập nhật thất bại', {
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

  // Handle ban/unban confirmation
  const handleToggleBan = () => {
    if (!user) return;
    const newStatus = user.status === 'Banned' ? 'ACTIVE' : 'banned';
    banUserMutation.mutate({ userId: user.id, newStatus });
  };

  const isLoading = banUserMutation.isPending;
  const isBanned = user?.status === 'Banned';
  const action = isBanned ? 'Mở khóa' : 'Khóa';

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle className='text-destructive flex items-center gap-2'>
            <Lock className='h-5 w-5' />
            Xác nhận {action.toLowerCase()} user
          </DialogTitle>
          <DialogDescription className='space-y-2 pt-2'>
            <div>
              Bạn có chắc chắn muốn {action.toLowerCase()} user{' '}
              <strong>{user.email}</strong>?
            </div>
            <div className='text-muted-foreground text-sm'>
              {isBanned
                ? 'User sẽ có thể đăng nhập vào hệ thống sau khi được mở khóa.'
                : 'User sẽ không thể đăng nhập vào hệ thống sau khi bị khóa.'}
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className='gap-2'>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button
            onClick={handleToggleBan}
            disabled={isLoading}
            variant={isBanned ? 'default' : 'destructive'}
          >
            {isLoading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Đang cập nhật...
              </>
            ) : (
              <>
                <Lock className='mr-2 h-4 w-4' />
                {action} user
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
