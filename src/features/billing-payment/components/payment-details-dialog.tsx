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
import type { AdminPaymentRecord } from '../types/billing-payment.type';
import { Badge } from '@/components/ui/badge';

function formatVnd(value: number) {
  return new Intl.NumberFormat('vi-VN').format(value) + ' VND';
}

function formatDateTime(iso: string | null) {
  if (!iso) return '-';
  try {
    return new Date(iso).toLocaleString('vi-VN');
  } catch {
    return iso;
  }
}

function StatusBadge({ status }: { status: AdminPaymentRecord['status'] }) {
  switch (status) {
    case 'paid':
      return (
        <Badge className='border border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-400'>
          Paid
        </Badge>
      );
    case 'pending':
      return (
        <Badge className='border border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300'>
          Pending
        </Badge>
      );
    case 'cancelled':
      return (
        <Badge className='border border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400'>
          Cancelled
        </Badge>
      );
    default:
      return <Badge variant='outline'>{status}</Badge>;
  }
}

export function PaymentDetailsDialog({
  open,
  onOpenChange,
  payment
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: AdminPaymentRecord | null;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[760px]'>
        <DialogHeader>
          <DialogTitle>Chi tiết thanh toán</DialogTitle>
          <DialogDescription>Bản ghi thanh toán (chỉ xem).</DialogDescription>
        </DialogHeader>

        {payment ? (
          <div className='space-y-5'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-1'>
                <p className='text-muted-foreground text-xs'>Mã đơn</p>
                <p className='font-semibold tabular-nums'>
                  {payment.orderCode}
                </p>
              </div>
              <div className='space-y-1'>
                <p className='text-muted-foreground text-xs'>Trạng thái</p>
                <div>
                  <StatusBadge status={payment.status} />
                </div>
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-1'>
                <p className='text-muted-foreground text-xs'>User</p>
                <p className='font-semibold'>{payment.userFullName}</p>
                <p className='text-muted-foreground text-sm'>
                  {payment.userEmail}
                </p>
              </div>
              <div className='space-y-1'>
                <p className='text-muted-foreground text-xs'>Plan</p>
                <p className='font-semibold'>
                  {payment.planName}{' '}
                  <span className='text-muted-foreground font-mono'>
                    ({payment.planCode})
                  </span>
                </p>
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-1'>
                <p className='text-muted-foreground text-xs'>Amount</p>
                <p className='font-semibold tabular-nums'>
                  {formatVnd(payment.amount)}
                </p>
              </div>
              <div className='space-y-1'>
                <p className='text-muted-foreground text-xs'>Duration</p>
                <p className='font-semibold'>
                  {payment.durationMonths} month
                  {payment.durationMonths === 1 ? '' : 's'}
                </p>
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-1'>
                <p className='text-muted-foreground text-xs'>Payment Method</p>
                <p className='font-semibold'>{payment.paymentMethod}</p>
              </div>
              <div className='space-y-1'>
                <p className='text-muted-foreground text-xs'>Currency</p>
                <p className='font-semibold'>{payment.currency}</p>
              </div>
            </div>

            <div className='space-y-1'>
              <p className='text-muted-foreground text-xs'>Description</p>
              <pre className='text-sm leading-relaxed whitespace-pre-wrap'>
                {payment.description}
              </pre>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-1'>
                <p className='text-muted-foreground text-xs'>Created At</p>
                <p className='font-semibold'>
                  {formatDateTime(payment.createdAt)}
                </p>
              </div>
              <div className='space-y-1'>
                <p className='text-muted-foreground text-xs'>Paid At</p>
                <p className='font-semibold'>
                  {formatDateTime(payment.paidAt)}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className='text-muted-foreground text-sm'>
            Chưa chọn thanh toán.
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
