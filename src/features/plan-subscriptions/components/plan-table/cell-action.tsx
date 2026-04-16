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
      if (!token) throw new Error('Cần đăng nhập. Vui lòng đăng nhập lại.');
      return planSubscriptionApi.deactivatePlan(data.id, token);
    },
    onSuccess: async (res) => {
      await queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast.success(res.message || `Đã ngừng kích hoạt gói \"${data.name}\"`);
      setOpenDeactivate(false);
    },
    onError: (error: Error) => {
      toast.error('Ngừng kích hoạt gói thất bại', {
        description: error.message
      });
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
              Ngừng kích hoạt gói
            </DialogTitle>
            <DialogDescription className='pt-1'>
              Bạn có chắc muốn ngừng kích hoạt{' '}
              <strong className='text-foreground'>{data.name}</strong>?
            </DialogDescription>
          </DialogHeader>
          <div className='rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300'>
            Việc này sẽ ẩn gói khỏi người dùng. Người đang đăng ký sẽ{' '}
            <strong>không</strong> bị ảnh hưởng.
          </div>
          <DialogFooter className='gap-2'>
            <Button
              variant='outline'
              onClick={() => setOpenDeactivate(false)}
              disabled={deactivateMutation.isPending}
            >
              Hủy
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
                  Đang ngừng kích hoạt...
                </>
              ) : (
                'Ngừng kích hoạt'
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
            <span className='sr-only'>Mở menu</span>
            <IconDotsVertical className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setOpenEdit(true)}>
            <IconEdit className='mr-2 h-4 w-4' />
            Sửa gói
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => setOpenDeactivate(true)}
            className='text-destructive focus:text-destructive'
            disabled={!data.isActive}
          >
            <IconTrash className='mr-2 h-4 w-4' />
            {data.isActive ? 'Ngừng kích hoạt' : 'Đã ngừng kích hoạt'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
