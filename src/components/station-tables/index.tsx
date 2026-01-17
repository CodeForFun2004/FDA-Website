// src/components/station-tables/index.tsx
'use client';

import * as React from 'react';
import type { Station } from '@/features/stations/types/station.type';
import type { ColumnDef, SortingState } from '@tanstack/react-table';

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

type StationTableProps = {
  data: Station[];
  totalItems: number;
  columns: ColumnDef<Station, any>[];
  onEdit?: (s: Station) => void;
  onDelete?: (s: Station) => void;
};

function toInt(v: string | null, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function StationTable({
  data,
  totalItems,
  columns,
  onDelete,
  onEdit
}: StationTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const page = toInt(sp.get('page'), 1);
  const perPage = toInt(sp.get('perPage'), 10);
  const name = sp.get('name') ?? '';

  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    meta: { onEdit, onDelete }
  });

  const setQuery = React.useCallback(
    (next: Record<string, string | number | null | undefined>) => {
      const params = new URLSearchParams(sp.toString());
      Object.entries(next).forEach(([k, v]) => {
        if (v === null || v === undefined || v === '') params.delete(k);
        else params.set(k, String(v));
      });
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, sp]
  );

  const onSearch = (value: string) => {
    setQuery({ name: value, page: 1 });
  };

  const goPrev = () => setQuery({ page: Math.max(1, page - 1) });
  const goNext = () => setQuery({ page: Math.min(totalPages, page + 1) });

  return (
    <div className='space-y-4'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div className='w-full sm:max-w-sm'>
          <Input
            defaultValue={name}
            placeholder='Search by name...'
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>

        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            onClick={() => setQuery({ perPage: 10, page: 1 })}
            disabled={perPage === 10}
          >
            10
          </Button>
          <Button
            variant='outline'
            onClick={() => setQuery({ perPage: 20, page: 1 })}
            disabled={perPage === 20}
          >
            20
          </Button>
          <Button
            variant='outline'
            onClick={() => setQuery({ perPage: 50, page: 1 })}
            disabled={perPage === 50}
          >
            50
          </Button>
        </div>
      </div>

      <Card className='overflow-hidden'>
        <div className='w-full overflow-auto'>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className='h-24 text-center'
                  >
                    <img
                      src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcStPS9JVqfaTNagEnEvLeN-Ve92dzflAzBENw&s'
                      alt='No results'
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <div className='flex items-center justify-between'>
        <div className='text-muted-foreground text-sm'>
          Page <span className='text-foreground font-medium'>{page}</span> /{' '}
          <span className='text-foreground font-medium'>{totalPages}</span> •
          Total{' '}
          <span className='text-foreground font-medium'>{totalItems}</span>
        </div>

        <div className='flex items-center gap-2'>
          <Button variant='outline' onClick={goPrev} disabled={page <= 1}>
            Previous
          </Button>
          <Button
            variant='outline'
            onClick={goNext}
            disabled={page >= totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
