// src/components/ui/pagination.tsx
'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

// ===== Types =====
export interface PaginationProps {
  page: number;
  total: number;
  onChange: (page: number) => void;
  siblingCount?: number;
  className?: string;
}

// ===== Helper function to generate page numbers =====
function generatePaginationRange(
  currentPage: number,
  totalPages: number,
  siblingCount: number = 1
): (number | 'ellipsis')[] {
  const totalPageNumbers = siblingCount * 2 + 5; // siblings + first + last + current + 2 ellipsis

  // Case 1: Total pages fit within display limit
  if (totalPages <= totalPageNumbers) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  const shouldShowLeftEllipsis = leftSiblingIndex > 2;
  const shouldShowRightEllipsis = rightSiblingIndex < totalPages - 1;

  // Case 2: No left ellipsis, but right ellipsis
  if (!shouldShowLeftEllipsis && shouldShowRightEllipsis) {
    const leftItemCount = 3 + 2 * siblingCount;
    const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
    return [...leftRange, 'ellipsis', totalPages];
  }

  // Case 3: Left ellipsis, but no right ellipsis
  if (shouldShowLeftEllipsis && !shouldShowRightEllipsis) {
    const rightItemCount = 3 + 2 * siblingCount;
    const rightRange = Array.from(
      { length: rightItemCount },
      (_, i) => totalPages - rightItemCount + 1 + i
    );
    return [1, 'ellipsis', ...rightRange];
  }

  // Case 4: Both ellipsis
  const middleRange = Array.from(
    { length: rightSiblingIndex - leftSiblingIndex + 1 },
    (_, i) => leftSiblingIndex + i
  );
  return [1, 'ellipsis', ...middleRange, 'ellipsis', totalPages];
}

// ===== Pagination Component =====
export function Pagination({
  page,
  total,
  onChange,
  siblingCount = 1,
  className
}: PaginationProps) {
  const paginationRange = generatePaginationRange(page, total, siblingCount);

  const handlePrevious = () => {
    if (page > 1) onChange(page - 1);
  };

  const handleNext = () => {
    if (page < total) onChange(page + 1);
  };

  if (total <= 1) return null;

  return (
    <nav
      role='navigation'
      aria-label='Pagination'
      className={cn('flex items-center justify-center gap-1', className)}
    >
      {/* Previous Button */}
      <Button
        variant='outline'
        size='icon'
        className='h-9 w-9 rounded-lg'
        onClick={handlePrevious}
        disabled={page === 1}
        aria-label='Go to previous page'
      >
        <ChevronLeft className='h-4 w-4' />
      </Button>

      {/* Page Numbers */}
      {paginationRange.map((pageNumber, index) => {
        if (pageNumber === 'ellipsis') {
          return (
            <span
              key={`ellipsis-${index}`}
              className='text-muted-foreground flex h-9 w-9 items-center justify-center'
              aria-hidden
            >
              <MoreHorizontal className='h-4 w-4' />
            </span>
          );
        }

        const isActive = pageNumber === page;

        return (
          <Button
            key={pageNumber}
            variant={isActive ? 'default' : 'outline'}
            size='icon'
            className={cn(
              'h-9 w-9 rounded-lg text-sm font-medium',
              isActive && 'bg-primary text-primary-foreground shadow-sm'
            )}
            onClick={() => onChange(pageNumber)}
            aria-label={`Go to page ${pageNumber}`}
            aria-current={isActive ? 'page' : undefined}
          >
            {pageNumber}
          </Button>
        );
      })}

      {/* Next Button */}
      <Button
        variant='outline'
        size='icon'
        className='h-9 w-9 rounded-lg'
        onClick={handleNext}
        disabled={page === total}
        aria-label='Go to next page'
      >
        <ChevronRight className='h-4 w-4' />
      </Button>
    </nav>
  );
}

export default Pagination;
