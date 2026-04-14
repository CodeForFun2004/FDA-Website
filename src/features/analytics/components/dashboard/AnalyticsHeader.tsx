'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { RefreshCcw, ServerCog, ChevronDown } from 'lucide-react';

type TriggerType = 'frequency' | 'severity' | 'hotspots';

export function AnalyticsHeader(props: {
  onRefresh: () => void;
  onTrigger: (type: TriggerType) => void;
  isRefreshing?: boolean;
}) {
  return (
    <div className='flex flex-col gap-3 md:flex-row md:items-start md:justify-between'>
      <div className='space-y-1'>
        <h2 className='text-3xl font-bold tracking-tight'>Phân tích</h2>
        <p className='text-muted-foreground max-w-xl text-sm'>
          Xem xếp hạng khu vực ngập nổi bật và xu hướng tần suất/mức độ theo
          thời gian và khu vực đã chọn.
        </p>
      </div>

      <div className='grid w-full grid-cols-1 gap-2 sm:max-w-xl sm:grid-cols-3'>
        <Button
          type='button'
          variant='outline'
          className='h-10 w-full justify-center gap-2'
          onClick={props.onRefresh}
          disabled={props.isRefreshing}
        >
          <RefreshCcw className='h-4 w-4 shrink-0' />
          Làm mới
        </Button>

        <Button
          type='button'
          variant='outline'
          asChild
          className='h-10 w-full justify-center'
        >
          <Link
            href='/admin/tasks'
            className='inline-flex items-center justify-center gap-2'
          >
            <ServerCog className='h-4 w-4 shrink-0' />
            Tác vụ nền
          </Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type='button' className='h-10 w-full justify-center gap-2'>
              Chạy gom dữ liệu
              <ChevronDown className='h-4 w-4 shrink-0' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-56'>
            <DropdownMenuLabel>Gom lại thủ công</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => props.onTrigger('frequency')}>
              Gom theo tần suất
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => props.onTrigger('severity')}>
              Gom theo mức độ
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => props.onTrigger('hotspots')}>
              Xếp hạng điểm nóng
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
