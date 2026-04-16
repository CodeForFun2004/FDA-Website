'use client';

import * as React from 'react';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { Button, Badge } from '@/components/ui/common';
import type { OperationalLogDetail } from '../types';
import {
  normalizeDetailsText,
  toPrettyJson,
  levelBadgeClass,
  levelLabelVi
} from '../utils';

export type OperationalLogDetailDrawerProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  log: OperationalLogDetail | null;
  notFound?: boolean;
};

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className='flex items-start justify-between gap-4 border-b py-2 last:border-b-0'>
      <div className='text-muted-foreground text-xs'>{label}</div>
      <div className='min-w-0 text-right text-sm'>{value}</div>
    </div>
  );
}

export function OperationalLogDetailDrawer({
  open,
  onOpenChange,
  log,
  notFound
}: OperationalLogDetailDrawerProps) {
  const detailsText = log ? normalizeDetailsText(log.details) : '';
  const jsonText = log ? toPrettyJson(log.details) : '';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side='right' className='w-full sm:max-w-xl'>
        <SheetHeader>
          <SheetTitle>Chi tiết nhật ký</SheetTitle>
        </SheetHeader>

        <div className='space-y-4 overflow-auto px-4 pb-4'>
          {notFound ? (
            <div className='border-input rounded-xl border p-4 text-sm'>
              Log không tồn tại hoặc đã bị xóa.
            </div>
          ) : !log ? (
            <div className='text-muted-foreground text-sm'>Đang tải…</div>
          ) : (
            <>
              <div className='border-input rounded-xl border p-4'>
                <div className='mb-3 flex items-center justify-between'>
                  <div className='text-sm font-semibold'>Thông tin cơ bản</div>
                  <Badge
                    variant='outline'
                    className={`border ${levelBadgeClass(log.level)}`}
                  >
                    {levelLabelVi(log.level)}
                  </Badge>
                </div>
                <div className='space-y-1'>
                  <Row
                    label='Thời điểm'
                    value={new Date(String(log.createdAt)).toLocaleString(
                      'vi-VN'
                    )}
                  />
                  <Row label='Nhóm' value={String(log.category ?? '—')} />
                  <Row label='Sự kiện' value={String(log.action ?? '—')} />
                </div>
              </div>

              <div className='border-input rounded-xl border p-4'>
                <div className='mb-3 text-sm font-semibold'>Ngữ cảnh</div>
                <div className='space-y-1'>
                  <Row label='User' value={log.userName ?? log.userId ?? '—'} />
                  <Row label='EntityType' value={log.entityType ?? '—'} />
                  <Row label='EntityId' value={log.entityId ?? '—'} />
                  <Row label='IP' value={log.ipAddress ?? '—'} />
                </div>
              </div>

              <div className='border-input rounded-xl border p-4'>
                <div className='mb-3 flex items-center justify-between gap-3'>
                  <div className='text-sm font-semibold'>Chi tiết (JSON)</div>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(
                          jsonText || detailsText
                        );
                        toast.success('Đã copy nội dung');
                      } catch {
                        toast.error('Copy thất bại');
                      }
                    }}
                  >
                    Copy
                  </Button>
                </div>
                <pre className='bg-muted/30 overflow-auto rounded-lg border p-3 text-xs leading-5'>
                  {jsonText || detailsText || '—'}
                </pre>
              </div>

              {log.errorMessage ? (
                <div className='rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700'>
                  <div className='mb-2 font-semibold'>Thông báo lỗi</div>
                  <div className='whitespace-pre-wrap'>{log.errorMessage}</div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
