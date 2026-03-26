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
      if (!token)
        throw new Error('Authentication required. Please log in again.');

      const res = await stationsApi.deleteComponent(
        stationId,
        component.id,
        token
      );

      if (res.success) {
        toast.success('Component deleted successfully!', {
          description: `Removed: ${component.name || component.componentType}`
        });
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error('Failed to delete component', { description: res.message });
      }
    } catch (error: any) {
      toast.error('Error deleting component', { description: error.message });
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
            Delete Component
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{' '}
            <span className='font-semibold'>
              {component.name || component.componentType}
            </span>
            ? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className='pt-2'>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
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
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className='h-4 w-4' />
                Delete
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
