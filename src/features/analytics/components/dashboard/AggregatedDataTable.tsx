'use client';

import * as React from 'react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table';
import { DataTable } from '@/components/ui/table/data-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import type {
  AnalyticsMetricType,
  FrequencyAnalyticsPoint,
  HotspotItem,
  SeverityAnalyticsPoint
} from '@/features/analytics/types/analytics.dashboard.types';

function fmtNum(n: number) {
  return Intl.NumberFormat('en-US').format(n);
}

function fmtFloat(n: number) {
  return Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(n);
}

function dt(iso: string) {
  return new Date(iso).toLocaleString();
}

function makeColumns(metric: AnalyticsMetricType): ColumnDef<any>[] {
  if (metric === 'severity') {
    const cols: ColumnDef<SeverityAnalyticsPoint>[] = [
      {
        accessorKey: 'timeBucket',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Bucket' />
        ),
        cell: ({ row }) => dt(row.original.timeBucket)
      },
      {
        accessorKey: 'maxLevel',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='maxLevel' />
        ),
        cell: ({ row }) => fmtFloat(row.original.maxLevel)
      },
      {
        accessorKey: 'avgLevel',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='avgLevel' />
        ),
        cell: ({ row }) => fmtFloat(row.original.avgLevel)
      },
      {
        accessorKey: 'minLevel',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='minLevel' />
        ),
        cell: ({ row }) => fmtFloat(row.original.minLevel)
      },
      {
        accessorKey: 'durationHours',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='durationHours' />
        ),
        cell: ({ row }) => fmtFloat(row.original.durationHours)
      },
      {
        accessorKey: 'readingCount',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='readingCount' />
        ),
        cell: ({ row }) => fmtNum(row.original.readingCount)
      },
      {
        accessorKey: 'calculatedAt',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='calculatedAt' />
        ),
        cell: ({ row }) => dt(row.original.calculatedAt)
      }
    ];
    return cols as any;
  }

  if (metric === 'hotspots') {
    const cols: ColumnDef<HotspotItem>[] = [
      {
        accessorKey: 'rank',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Rank' />
        )
      },
      {
        accessorKey: 'areaName',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Area' />
        )
      },
      {
        accessorKey: 'score',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Score' />
        ),
        cell: ({ row }) => fmtFloat(row.original.score)
      },
      {
        accessorKey: 'frequencyScore',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='frequencyScore' />
        ),
        cell: ({ row }) => fmtFloat(row.original.frequencyScore)
      },
      {
        accessorKey: 'severityScore',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='severityScore' />
        ),
        cell: ({ row }) => fmtFloat(row.original.severityScore)
      },
      {
        accessorKey: 'durationScore',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='durationScore' />
        ),
        cell: ({ row }) => fmtFloat(row.original.durationScore)
      },
      {
        accessorKey: 'calculatedAt',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='calculatedAt' />
        ),
        cell: ({ row }) => dt(row.original.calculatedAt)
      }
    ];
    return cols as any;
  }

  const cols: ColumnDef<FrequencyAnalyticsPoint>[] = [
    {
      accessorKey: 'timeBucket',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Bucket' />
      ),
      cell: ({ row }) => dt(row.original.timeBucket)
    },
    {
      accessorKey: 'eventCount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='eventCount' />
      ),
      cell: ({ row }) => fmtNum(row.original.eventCount)
    },
    {
      accessorKey: 'exceedCount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='exceedCount' />
      ),
      cell: ({ row }) => fmtNum(row.original.exceedCount)
    },
    {
      accessorKey: 'calculatedAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='calculatedAt' />
      ),
      cell: ({ row }) => dt(row.original.calculatedAt)
    }
  ];
  return cols as any;
}

export function AggregatedDataTable(props: {
  metric: AnalyticsMetricType;
  frequency: FrequencyAnalyticsPoint[];
  severity: SeverityAnalyticsPoint[];
  hotspots: HotspotItem[];
}) {
  const metric = props.metric === 'all' ? 'frequency' : props.metric;
  const data =
    metric === 'severity'
      ? props.severity
      : metric === 'hotspots'
        ? props.hotspots
        : props.frequency;

  const columns = React.useMemo(() => makeColumns(metric), [metric]);
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data: data as any[],
    columns: columns as any,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  });

  return (
    <Card className='border-border shadow-none'>
      <CardHeader className='pb-3'>
        <CardTitle className='text-sm'>Aggregated data</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable table={table} />
      </CardContent>
    </Card>
  );
}
