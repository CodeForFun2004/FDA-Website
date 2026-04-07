'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import type { PricingPlan } from '@/features/plan-subscriptions/types/plan-subscription.type';
import { planSubscriptionApi } from '@/features/plan-subscriptions/api/plan-subscription.api';
import { getAccessToken } from '@/libs/auth-utils';
import { EditPlanDialog } from '@/features/plan-subscriptions/components/edit-plan-dialog';
import { IconDotsVertical, IconEdit, IconTrash } from '@tabler/icons-react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CellActionProps {
  data: PricingPlan;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [openDeactivate, setOpenDeactivate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const queryClient = useQueryClient();

  const deactivateMutation = useMutation({
    mutationFn: async () => {
      const token = await getAccessToken();
      if (!token)
        throw new Error('Authentication required. Please log in again.');
      return planSubscriptionApi.deactivatePlan(data.id, token);
    },
    onSuccess: async (res) => {
      await queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast.success(
        res.message || `Plan "${data.name}" deactivated successfully`
      );
      setOpenDeactivate(false);
    },
    onError: (error: Error) => {
      toast.error('Failed to deactivate plan', { description: error.message });
    }
  });

  return (
    <>
      {/* Deactivate Confirmation Dialog */}
      <Dialog open={openDeactivate} onOpenChange={setOpenDeactivate}>
        <DialogContent className='sm:max-w-[420px]'>
          <DialogHeader>
            <DialogTitle className='text-destructive flex items-center gap-2'>
              <AlertTriangle className='h-5 w-5' />
              Deactivate Plan
            </DialogTitle>
            <DialogDescription className='pt-1'>
              Are you sure you want to deactivate{' '}
              <strong className='text-foreground'>{data.name}</strong>?
            </DialogDescription>
          </DialogHeader>
          <div className='rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300'>
            ⚠️ This will hide the plan from users. Existing subscribers will{' '}
            <strong>not</strong> be affected.
          </div>
          <DialogFooter className='gap-2'>
            <Button
              variant='outline'
              onClick={() => setOpenDeactivate(false)}
              disabled={deactivateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={() => deactivateMutation.mutate()}
              disabled={deactivateMutation.isPending}
              className='gap-2'
            >
              {deactivateMutation.isPending ? (
                <>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  Deactivating...
                </>
              ) : (
                'Deactivate'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <EditPlanDialog
        open={openEdit}
        onOpenChange={setOpenEdit}
        plan={data}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['plans'] });
        }}
      />

      {/* Actions Dropdown */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <span className='sr-only'>Open menu</span>
            <IconDotsVertical className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setOpenEdit(true)}>
            <IconEdit className='mr-2 h-4 w-4' />
            Edit Plan
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => setOpenDeactivate(true)}
            className='text-destructive focus:text-destructive'
            disabled={!data.isActive}
          >
            <IconTrash className='mr-2 h-4 w-4' />
            {data.isActive ? 'Deactivate' : 'Already Inactive'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
