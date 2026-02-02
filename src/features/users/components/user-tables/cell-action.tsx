'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import type { User } from '@/features/users/types';
import { BanUserDialog } from '@/features/users/components/ban-user-dialog';
import { EditUserDialog } from '@/features/users/components/edit-user-dialog';
import { IconDotsVertical } from '@tabler/icons-react';
import { Lock, Pencil } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface UserCellActionProps {
  data: User;
}

export function UserCellAction({ data }: UserCellActionProps) {
  const [openEdit, setOpenEdit] = useState(false);
  const [openBan, setOpenBan] = useState(false);

  const handleEdit = () => {
    if (!data.isAdminCreated) {
      toast.error('Lỗi cập nhật user', {
        description: 'Bạn chỉ có thể chỉnh sửa user được tạo bởi admin.'
      });
      return;
    }
    setOpenEdit(true);
  };

  return (
    <>
      <EditUserDialog
        open={openEdit}
        onOpenChange={setOpenEdit}
        user={data}
        onSuccess={() => {
          // React Query handles cache invalidation
        }}
      />

      <BanUserDialog
        open={openBan}
        onOpenChange={setOpenBan}
        user={data}
        onSuccess={() => {
          // React Query handles cache invalidation
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
          <DropdownMenuItem
            onClick={handleEdit}
            disabled={!data.isAdminCreated}
          >
            <Pencil className='mr-2 h-4 w-4' /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenBan(true)}>
            <Lock className='mr-2 h-4 w-4' />
            {data.status === 'Banned' ? 'Unban' : 'Ban'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
