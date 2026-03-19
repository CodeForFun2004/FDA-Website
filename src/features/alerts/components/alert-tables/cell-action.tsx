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
import type { Alert } from '@/features/alerts/types';
import { IconDotsVertical, IconCheck, IconEye } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface CellActionProps {
  data: Alert;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [openResolve, setOpenResolve] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const onAcknowledge = async () => {
    toast.success('Alert acknowledged successfully');
    // Implement API call when ready
  };

  const onResolve = async () => {
    try {
      setLoading(true);
      // Implement API call when ready

      await queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast.success('Alert resolved successfully');
      setOpenResolve(false);
    } catch (error: any) {
      toast.error('Failed to resolve alert', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={openResolve}
        onClose={() => setOpenResolve(false)}
        onConfirm={onResolve}
        loading={loading}
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
          <DropdownMenuItem onClick={() => {}}>
            <IconEye className='mr-2 h-4 w-4' /> View Details
          </DropdownMenuItem>
          {data.status === 'New' && (
            <DropdownMenuItem onClick={onAcknowledge}>
              <IconCheck className='mr-2 h-4 w-4' /> Acknowledge
            </DropdownMenuItem>
          )}
          {data.status !== 'Resolved' && (
            <DropdownMenuItem onClick={() => setOpenResolve(true)}>
              <IconCheck className='mr-2 h-4 w-4 text-emerald-500' /> Mark
              Resolved
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
