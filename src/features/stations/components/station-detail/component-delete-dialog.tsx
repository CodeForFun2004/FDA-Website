// src/features/stations/components/station-detail/component-delete-dialog.tsx
'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { stationsApi } from '@/features/stations/api/station.api';
import type { Component } from '@/features/stations/types/station.type';
import { Loader2, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { getAccessToken } from '@/features/stations/utils/auth';

export interface ComponentDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stationId: string;
  component: Component | null;
  onSuccess?: () => void;
}

export function ComponentDeleteDialog({
  open,
  onOpenChange,
  stationId,
  component,
  onSuccess
}: ComponentDeleteDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleDelete = async () => {
    if (!component?.id) return;

    setIsLoading(true);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error('Cần đăng nhập. Vui lòng đăng nhập lại.');

      const res = await stationsApi.deleteComponent(
        stationId,
        component.id,
        token
      );

      if (res.success) {
        toast.success('Xóa thiết bị thành công!', {
          description: `Đã xóa: ${component.name || component.componentType}`
        });
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error('Xóa thiết bị thất bại', { description: res.message });
      }
    } catch (error: any) {
      toast.error('Lỗi khi xóa thiết bị', { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  if (!component) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[420px]'>
        <DialogHeader>
          <DialogTitle className='text-destructive flex items-center gap-2'>
            <AlertTriangle className='h-5 w-5' />
            Xóa thiết bị
          </DialogTitle>
          <DialogDescription>
            Bạn có chắc muốn xóa{' '}
            <span className='font-semibold'>
              {component.name || component.componentType}
            </span>
            ? Thao tác này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className='pt-2'>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button
            variant='destructive'
            onClick={handleDelete}
            disabled={isLoading}
            className='gap-2'
          >
            {isLoading ? (
              <>
                <Loader2 className='h-4 w-4 animate-spin' />
                Đang xóa...
              </>
            ) : (
              <>
                <Trash2 className='h-4 w-4' />
                Xóa
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
