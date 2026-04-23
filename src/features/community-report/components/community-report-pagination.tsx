'use client';

import { Button } from '@/components/ui/common';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

type Props = {
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  onChangePageSize: (nextSize: number) => void;
  onGoToPage: (nextPage: number) => void;
};

export function CommunityReportPagination({
  totalCount,
  pageNumber,
  pageSize,
  totalPages,
  onChangePageSize,
  onGoToPage
}: Props) {
  return (
    <div className='flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-white p-4'>
      <div className='text-muted-foreground text-sm'>
        Tổng {totalCount} dòng.
      </div>

      <div className='flex flex-col-reverse items-center gap-4 sm:flex-row sm:gap-6 lg:gap-8'>
        <div className='flex items-center space-x-2'>
          <p className='text-sm font-medium whitespace-nowrap'>Số dòng/trang</p>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => onChangePageSize(Number(value))}
          >
            <SelectTrigger className='h-8 w-[4.5rem] [&[data-size]]:h-8'>
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side='top'>
              {[10, 20, 30, 40, 50].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='flex items-center justify-center text-sm font-medium'>
          Trang {pageNumber} / {totalPages}
        </div>

        <div className='flex items-center space-x-2'>
          <Button
            aria-label='Về trang đầu'
            variant='outline'
            size='icon'
            className='hidden size-8 lg:flex'
            onClick={() => onGoToPage(1)}
            disabled={pageNumber <= 1}
          >
            <ChevronsLeft className='h-4 w-4' />
          </Button>
          <Button
            aria-label='Trang trước'
            variant='outline'
            size='icon'
            className='size-8'
            onClick={() => onGoToPage(pageNumber - 1)}
            disabled={pageNumber <= 1}
          >
            <ChevronLeft className='h-4 w-4' />
          </Button>
          <Button
            aria-label='Trang sau'
            variant='outline'
            size='icon'
            className='size-8'
            onClick={() => onGoToPage(pageNumber + 1)}
            disabled={pageNumber >= totalPages}
          >
            <ChevronRight className='h-4 w-4' />
          </Button>
          <Button
            aria-label='Về trang cuối'
            variant='outline'
            size='icon'
            className='hidden size-8 lg:flex'
            onClick={() => onGoToPage(totalPages)}
            disabled={pageNumber >= totalPages}
          >
            <ChevronsRight className='h-4 w-4' />
          </Button>
        </div>
      </div>
    </div>
  );
}
