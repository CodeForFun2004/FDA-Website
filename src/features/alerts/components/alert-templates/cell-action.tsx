'use client';

import { AlertModal } from '@/components/modal/alert-modal';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import type { AlertTemplate } from '@/features/alerts/types/alert-template.type';
import {
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconEye
} from '@tabler/icons-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useDeleteAlertTemplate } from '../../hooks/useAlertTemplates';

interface CellActionProps {
  data: AlertTemplate;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [openDelete, setOpenDelete] = useState(false);
  const deleteMutation = useDeleteAlertTemplate();

  const onConfirmDelete = async () => {
    try {
      await deleteMutation.mutateAsync({ id: data.id });
      toast.success('Alert template deleted successfully');
      setOpenDelete(false);
    } catch (error: any) {
      toast.error('Failed to delete template', {
        description: error.message
      });
    }
  };

  return (
    <>
      <AlertModal
        isOpen={openDelete}
        onClose={() => setOpenDelete(false)}
        onConfirm={onConfirmDelete}
        loading={deleteMutation.isPending}
      />

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <span className='sr-only'>Open menu</span>
            <IconDotsVertical className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => {
              // Document event to open edit modal
              document.dispatchEvent(
                new CustomEvent('edit-alert-template', { detail: data })
              );
            }}
          >
            <IconEdit className='mr-2 h-4 w-4' /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              // Document event to open preview modal
              document.dispatchEvent(
                new CustomEvent('preview-alert-template', { detail: data })
              );
            }}
          >
            <IconEye className='mr-2 h-4 w-4' /> Preview
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenDelete(true)}>
            <IconTrash className='mr-2 h-4 w-4 text-red-600' /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
