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
import { EditStationDialog } from '@/features/stations/components/edit-station-dialog';
import { stationsApi } from '@/features/stations/api/station.api';
import { getAccessToken } from '@/features/stations/utils/auth';
import {
  IconDotsVertical,
  IconEdit,
  IconEye,
  IconTrash
} from '@tabler/icons-react';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/authenticate/store/auth-store';

const EMPTY_ROLES: string[] = [];

interface CellActionProps {
  data: Station;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const roles = useAuthStore((s) => s.user?.roles ?? EMPTY_ROLES);
  const canManageStations =
    roles.includes('ADMIN') || roles.includes('SUPERADMIN');

  const isModeratorPortal = pathname.startsWith('/moderator');
  const detailPath = isModeratorPortal
    ? `/moderator/stations/${data.id}`
    : `/admin/stations/${data.id}`;

  const onConfirm = async () => {
    try {
      setLoading(true);
      const token = await getAccessToken();

      if (!token) {
        toast.error('Cần đăng nhập', {
          description: 'Vui lòng đăng nhập lại để xóa trạm.'
        });
        setOpenDelete(false);
        return;
      }

      await stationsApi.deleteStation(data.id, token);

      // Invalidate and refetch stations query immediately
      await queryClient.invalidateQueries({ queryKey: ['stations'] });

      // Show success toast after UI updates
      toast.success('Đã xóa trạm');
      setOpenDelete(false);
    } catch (error: any) {
      toast.error('Xóa trạm thất bại', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {canManageStations ? (
        <AlertModal
          isOpen={openDelete}
          onClose={() => setOpenDelete(false)}
          onConfirm={onConfirm}
          loading={loading}
        />
      ) : null}

      {canManageStations ? (
        <EditStationDialog
          open={openEdit}
          onOpenChange={setOpenEdit}
          station={data}
          onSuccess={() => {
            router.refresh();
          }}
        />
      ) : null}

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <span className='sr-only'>Mở menu</span>
            <IconDotsVertical className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Thao tác</DropdownMenuLabel>

          <DropdownMenuItem onClick={() => router.push(detailPath)}>
            <IconEye className='mr-2 h-4 w-4' /> Chi tiết
          </DropdownMenuItem>

          {canManageStations ? (
            <>
              <DropdownMenuItem onClick={() => setOpenEdit(true)}>
                <IconEdit className='mr-2 h-4 w-4' /> Cập nhật
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => setOpenDelete(true)}>
                <IconTrash className='mr-2 h-4 w-4' /> Xóa
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
