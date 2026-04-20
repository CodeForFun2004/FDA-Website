'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { AdminComplaint } from '../types/subscription-dispute.type';

interface SubscriptionDisputeDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  complaint: AdminComplaint | null;
}

export function SubscriptionDisputeDetailsDialog({
  open,
  onOpenChange,
  complaint
}: SubscriptionDisputeDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[680px]'>
        <DialogHeader>
          <DialogTitle>Chi tiết khiếu nại</DialogTitle>
          <DialogDescription>
            Thông tin khiếu nại đã chọn (chỉ xem).
          </DialogDescription>
        </DialogHeader>

        {complaint ? (
          <div className='space-y-4'>
            <div className='space-y-1'>
              <p className='text-muted-foreground text-xs'>Tiêu đề</p>
              <p className='font-semibold'>{complaint.subject}</p>
            </div>

            <div className='space-y-1'>
              <p className='text-muted-foreground text-xs'>Người dùng</p>
              <p className='font-semibold'>
                {complaint.userFullName} ({complaint.userEmail})
              </p>
            </div>

            <div className='space-y-1'>
              <p className='text-muted-foreground text-xs'>Nội dung</p>
              <pre className='text-sm leading-relaxed whitespace-pre-wrap'>
                {complaint.description}
              </pre>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-1'>
                <p className='text-muted-foreground text-xs'>Trạng thái</p>
                <p className='font-semibold'>{complaint.status}</p>
              </div>
              <div className='space-y-1'>
                <p className='text-muted-foreground text-xs'>Tạo lúc</p>
                <p className='font-semibold'>
                  {new Date(complaint.createdAt).toLocaleString('vi-VN')}
                </p>
              </div>
            </div>

            {complaint.adminResponse ? (
              <div className='space-y-1'>
                <p className='text-muted-foreground text-xs'>
                  Phản hồi quản trị
                </p>
                <pre className='text-sm leading-relaxed whitespace-pre-wrap'>
                  {complaint.adminResponse}
                </pre>
              </div>
            ) : null}

            {complaint.resolvedAt ? (
              <div className='space-y-1'>
                <p className='text-muted-foreground text-xs'>Xử lý lúc</p>
                <p className='font-semibold'>
                  {new Date(complaint.resolvedAt).toLocaleString('vi-VN')}
                </p>
              </div>
            ) : null}
          </div>
        ) : (
          <div className='text-muted-foreground text-sm'>
            Chưa chọn khiếu nại.
          </div>
        )}

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
