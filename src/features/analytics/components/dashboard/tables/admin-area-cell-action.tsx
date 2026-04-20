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
import { AdminAreaDialog } from '@/features/analytics/components/dashboard/dialogs/AdminAreaDialog';
import { deleteAdministrativeAreaApi } from '@/features/admin/api/admin.api';
import type { AdministrativeArea } from '@/features/admin/types/admin.type';
import {
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconCopy
} from '@tabler/icons-react';
import { toast } from 'sonner';

interface Props {
  area: AdministrativeArea;
}

export function AdminAreaCellAction({ area }: Props) {
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => deleteAdministrativeAreaApi(area.id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-areas'] });
      await queryClient.invalidateQueries({ queryKey: ['admin-areas-all'] });
      toast.success('Administrative area deleted.');
      setOpenDelete(false);
    },
    onError: (err: any) => {
      toast.error('Failed to delete area', { description: err?.message });
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

      <AdminAreaDialog open={openEdit} onOpenChange={setOpenEdit} area={area} />

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
              void navigator.clipboard.writeText(area.id);
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
