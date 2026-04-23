'use client';

import { Button } from '@/components/ui/common';
import { Modal } from '@/components/ui/modal';
import type { CommunityFloodReport } from '../types/community-report.type';

type Props = {
  report: CommunityFloodReport | null;
  open: boolean;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
};

export function CommunityReportHideDialog({
  report,
  open,
  isPending,
  onClose,
  onConfirm
}: Props) {
  return (
    <Modal
      title='Ẩn bài phản ánh'
      description={
        report
          ? 'Bài phản ánh sẽ bị chuyển sang trạng thái "Đã ẩn" và không còn hiển thị cho người dùng.'
          : 'Bài phản ánh sẽ bị chuyển sang trạng thái "Đã ẩn".'
      }
      isOpen={open}
      onClose={() => {
        if (isPending) return;
        onClose();
      }}
    >
      <div className='flex w-full items-center justify-end gap-2 pt-4'>
        <Button variant='outline' onClick={onClose} disabled={isPending}>
          Hủy
        </Button>
        <Button
          variant='destructive'
          onClick={() => void onConfirm()}
          disabled={isPending || !report}
          className='text-white'
        >
          {isPending ? 'Đang ẩn...' : 'Ẩn bài'}
        </Button>
      </div>
    </Modal>
  );
}
