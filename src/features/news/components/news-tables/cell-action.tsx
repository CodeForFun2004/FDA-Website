'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import type { Announcement } from '@/features/news/types/news.type';
import {
  IconDotsVertical,
  IconEye,
  IconEdit,
  IconSend,
  IconTrash
} from '@tabler/icons-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { NewsDetailDialog } from '../news-detail-dialog';
import { EditNewsDialog } from '../edit-news-dialog';
import { newsApi } from '@/features/news/api/news.api';
import { Modal } from '@/components/ui/modal';

interface CellActionProps {
  data: Announcement;
  onRefresh?: () => void;
}

export const CellAction: React.FC<CellActionProps> = ({ data, onRefresh }) => {
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const canEdit = data.status === 'draft' || data.status === 'pending';
  const canPublish = data.status === 'draft' || data.status === 'pending';

  const handlePublish = async () => {
    try {
      setPublishing(true);
      await newsApi.publishAnnouncement(data.id);
      toast.success('Đã đăng thông báo thành công!');
      onRefresh?.();
    } catch (error: any) {
      toast.error(error?.message || 'Không thể đăng thông báo');
    } finally {
      setPublishing(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await newsApi.deleteAnnouncement(data.id);
      toast.success('Đã xóa thông báo!');
      onRefresh?.();
    } catch (error: any) {
      toast.error(error?.message || 'Không thể xóa thông báo');
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  const isSoftDelete =
    data.status === 'published' || data.status === 'cancelled';

  return (
    <>
      <NewsDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        announcementData={data}
      />

      <EditNewsDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        announcementData={data}
        onSuccess={() => {
          onRefresh?.();
          setEditOpen(false);
        }}
      />

      <Modal
        title='Xóa thông báo'
        description={
          isSoftDelete
            ? `Thông báo "${data.title}" sẽ bị ẩn khỏi danh sách (soft delete).`
            : `Thông báo "${data.title}" sẽ bị xóa vĩnh viễn (hard delete).`
        }
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
      >
        <div className='flex w-full items-center justify-end gap-2 pt-4'>
          <Button variant='outline' onClick={() => setDeleteOpen(false)}>
            Hủy
          </Button>
          <Button
            variant='destructive'
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Đang xóa...' : 'Xóa'}
          </Button>
        </div>
      </Modal>

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <span className='sr-only'>Open menu</span>
            <IconDotsVertical className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Hành động</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setDetailOpen(true)}>
            <IconEye className='mr-2 h-4 w-4' /> Xem chi tiết
          </DropdownMenuItem>

          {canEdit && (
            <DropdownMenuItem onClick={() => setEditOpen(true)}>
              <IconEdit className='mr-2 h-4 w-4' /> Chỉnh sửa
            </DropdownMenuItem>
          )}

          {canPublish && (
            <DropdownMenuItem onClick={handlePublish} disabled={publishing}>
              <IconSend className='mr-2 h-4 w-4' />
              {publishing ? 'Đang đăng...' : 'Đăng ngay'}
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setDeleteOpen(true)}
            className='text-destructive focus:text-destructive'
          >
            <IconTrash className='mr-2 h-4 w-4' /> Xóa
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
