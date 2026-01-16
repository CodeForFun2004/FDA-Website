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
import type { Station } from '@/features/stations/types/station.type';
import { EditStationDialog } from '@/features/stations/components/EditStationDialog';
import { stationsApi } from '@/features/stations/api/station.api';
import { getAccessToken } from '@/features/stations/utils/auth';
import { IconDotsVertical, IconEdit, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

interface CellActionProps {
  data: Station;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const router = useRouter();

  const onConfirm = async () => {
    try {
      setLoading(true);
      const token = getAccessToken();
      await stationsApi.deleteStation(data.id, token ?? undefined);
      toast.success('Station deleted successfully');
      setOpenDelete(false);
      router.refresh();
    } catch (error: any) {
      toast.error('Failed to delete station', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={openDelete}
        onClose={() => setOpenDelete(false)}
        onConfirm={onConfirm}
        loading={loading}
      />

      <EditStationDialog
        open={openEdit}
        onOpenChange={setOpenEdit}
        station={data}
        onSuccess={() => {
          router.refresh();
        }}
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

          <DropdownMenuItem onClick={() => setOpenEdit(true)}>
            <IconEdit className='mr-2 h-4 w-4' /> Update
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setOpenDelete(true)}>
            <IconTrash className='mr-2 h-4 w-4' /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
