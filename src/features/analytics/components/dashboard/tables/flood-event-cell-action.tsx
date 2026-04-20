'use client';

import * as React from 'react';
import { useState } from 'react';
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
import { AlertModal } from '@/components/modal/alert-modal';
import { FloodEventDialog } from '@/features/analytics/components/dashboard/dialogs/FloodEventDialog';
import { deleteFloodEventApi } from '@/features/admin/api/admin.api';
import type { FloodEvent } from '@/features/admin/types/admin.type';
import {
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconCopy
} from '@tabler/icons-react';
import { toast } from 'sonner';

interface Props {
  event: FloodEvent;
}

export function FloodEventCellAction({ event }: Props) {
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => deleteFloodEventApi(event.id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-flood-events'] });
      toast.success('Flood event deleted.');
      setOpenDelete(false);
    },
    onError: (err: any) => {
      toast.error('Failed to delete flood event', {
        description: err?.message
      });
      setOpenDelete(false);
    }
  });

  return (
    <>
      <AlertModal
        isOpen={openDelete}
        onClose={() => setOpenDelete(false)}
        onConfirm={() => deleteMutation.mutate()}
        loading={deleteMutation.isPending}
      />

      <FloodEventDialog
        open={openEdit}
        onOpenChange={setOpenEdit}
        event={event}
      />

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <span className='sr-only'>Mở menu</span>
            <IconDotsVertical className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Thao tác</DropdownMenuLabel>

          <DropdownMenuItem
            onClick={() => {
              void navigator.clipboard.writeText(event.id);
              toast.success('Đã sao chép ID');
            }}
          >
            <IconCopy className='mr-2 h-4 w-4' />
            Sao chép ID
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setOpenEdit(true)}>
            <IconEdit className='mr-2 h-4 w-4' />
            Edit
          </DropdownMenuItem>

          <DropdownMenuItem
            className='text-destructive focus:text-destructive'
            onClick={() => setOpenDelete(true)}
          >
            <IconTrash className='mr-2 h-4 w-4' />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
