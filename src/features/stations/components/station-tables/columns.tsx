'use client';

import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import type { Station } from '@/features/stations/types/station.type';
import type { ColumnDef } from '@tanstack/react-table';
import { CheckCircle2, Wrench, XCircle } from 'lucide-react';
import { CellAction } from './cell-action';

export const STATION_STATUS_OPTIONS = [
  { label: 'Trực tuyến', value: 'online' },
  { label: 'Ngoại tuyến', value: 'offline' },
  { label: 'Bảo trì', value: 'maintenance' }
];

export const STATION_TYPE_OPTIONS = [
  { label: 'Urban Lowland', value: 'urban_lowland' },
  { label: 'Riverbank', value: 'riverbank' },
  { label: 'Drainage', value: 'drainage' },
  { label: 'Floodgate', value: 'floodgate' }
];

// Format last seen to time ago
function formatLastSeen(lastSeenAt: string | null): string {
  if (!lastSeenAt) return '-';
  const date = new Date(lastSeenAt);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays} ngày trước`;
  if (diffHours > 0) return `${diffHours} giờ trước`;
  if (diffMins > 0) return `${diffMins} phút trước`;
  return 'Vừa xong';
}

function getStatusConfig(status: string) {
  switch (status.toLowerCase()) {
    case 'online':
      return {
        variant: 'default' as const,
        className:
          'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
        icon: CheckCircle2,
        iconClassName: 'text-green-600 dark:text-green-400'
      };
    case 'maintenance':
      return {
        variant: 'default' as const,
        className:
          'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
        icon: Wrench,
        iconClassName: 'text-yellow-600 dark:text-yellow-400'
      };
    case 'offline':
      return {
        variant: 'default' as const,
        className:
          'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
        icon: XCircle,
        iconClassName: 'text-red-600 dark:text-red-400'
      };
    default:
      return {
        variant: 'outline' as const,
        className: '',
        icon: XCircle,
        iconClassName: ''
      };
  }
}

function statusLabel(status: string) {
  const s = String(status ?? '').toLowerCase();
  const found = STATION_STATUS_OPTIONS.find((o) => o.value === s);
  return found?.label ?? (s ? s : 'Không xác định');
}

export const columns: ColumnDef<Station>[] = [
  // STT - row index
  {
    id: 'stt',
    header: ({}) => (
      <div className='text-muted-foreground w-full text-center text-xs font-semibold tracking-wider uppercase'>
        #
      </div>
    ),
    cell: ({ row }) => (
      <div className='text-center text-sm text-slate-400 tabular-nums'>
        {String(row.index + 1).padStart(2, '0')}
      </div>
    ),
    size: 50,
    enableSorting: false,
    enableColumnFilter: false
  },
  // Code
  {
    id: 'code',
    accessorKey: 'code',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Mã' />
    ),
    cell: ({ cell }) => (
      <div className='text-primary font-mono font-medium'>
        {String(cell.getValue() ?? '-')}
      </div>
    ),
    enableColumnFilter: true,
    meta: {
      viewLabel: 'Mã'
    }
  },
  // Name
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tên' />
    ),
    cell: ({ cell }) => (
      <div className='text-foreground font-semibold'>
        {String(cell.getValue() ?? '-')}
      </div>
    ),
    meta: {
      label: 'Tên',
      viewLabel: 'Tên',
      placeholder: 'Tìm theo tên trạm…',
      variant: 'text'
    },
    enableColumnFilter: true
  },
  // Location / Road
  {
    id: 'roadName',
    accessorKey: 'roadName',
    header: () => (
      <div className='text-muted-foreground w-full text-center text-xs leading-tight font-semibold tracking-wider whitespace-normal uppercase'>
        Vị trí /<br />
        Tuyến đường
      </div>
    ),
    cell: ({ row }) => {
      const road = row.original.roadName;
      const locationDesc = row.original.locationDesc;
      if (!road && !locationDesc)
        return <div className='text-muted-foreground'>-</div>;
      return (
        <div
          className='text-muted-foreground text-sm'
          title={locationDesc ?? undefined}
        >
          {road || locationDesc}
        </div>
      );
    },
    enableColumnFilter: false,
    enableSorting: false,
    meta: {
      viewLabel: 'Vị trí / Tuyến đường'
    }
  },
  // Status
  {
    id: 'status',
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Trạng thái' />
    ),
    cell: ({ cell }) => {
      const status = String(cell.getValue() ?? '').toLowerCase();
      const config = getStatusConfig(status);
      const Icon = config.icon;

      return (
        <Badge
          variant={config.variant}
          className={`gap-1.5 font-medium capitalize ${config.className}`}
        >
          <Icon className={`h-3.5 w-3.5 ${config.iconClassName}`} />
          {statusLabel(status)}
        </Badge>
      );
    },
    enableColumnFilter: true,
    meta: {
      label: 'Trạng thái',
      viewLabel: 'Trạng thái',
      variant: 'multiSelect',
      options: STATION_STATUS_OPTIONS
    }
  },
  // Threshold (m)
  {
    id: 'threshold',
    header: ({}) => (
      <div className='text-muted-foreground text-center text-xs font-semibold tracking-wider uppercase'>
        Ngưỡng (m)
      </div>
    ),
    cell: ({ row }) => {
      const warning = row.original.thresholdWarning;
      const critical = row.original.thresholdCritical;
      if (warning == null && critical == null)
        return <div className='text-muted-foreground text-center'>-</div>;
      return (
        <div className='text-center font-medium tabular-nums'>
          {warning != null ? warning : '-'}/{critical != null ? critical : '-'}
        </div>
      );
    },
    enableColumnFilter: false,
    size: 110,
    meta: {
      viewLabel: 'Ngưỡng (m)'
    }
  },
  // Health (signal + battery) - placeholder, backend needs signal/battery data
  {
    id: 'health',
    header: ({}) => (
      <div className='text-muted-foreground text-center text-xs font-semibold tracking-wider uppercase'>
        Tín hiệu
      </div>
    ),
    cell: ({ row }) => {
      const status = row.original.status.toLowerCase();
      if (status === 'offline') {
        return (
          <div className='flex items-center justify-center gap-2 opacity-50'>
            <SignalBars activeCount={0} maxBars={4} />
            <BatteryBar level={0} />
          </div>
        );
      }
      // Placeholder: assume good signal/battery for online stations
      return (
        <div className='flex items-center justify-center gap-2'>
          <SignalBars activeCount={4} maxBars={4} />
          <BatteryBar level={85} />
        </div>
      );
    },
    enableColumnFilter: false,
    size: 90,
    meta: {
      viewLabel: 'Tín hiệu'
    }
  },
  // Last Seen / Updated
  {
    id: 'lastSeenAt',
    accessorKey: 'lastSeenAt',
    header: () => (
      <div className='text-muted-foreground w-full text-left text-xs leading-tight font-semibold tracking-wider whitespace-normal uppercase'>
        Lần thấy gần nhất
      </div>
    ),
    cell: ({ row }) => {
      const lastSeen = row.original.lastSeenAt;
      if (!lastSeen)
        return <div className='text-muted-foreground text-left text-xs'>-</div>;
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className='text-muted-foreground cursor-default text-left text-xs'>
                {formatLastSeen(lastSeen)}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className='font-medium'>
                {new Date(lastSeen).toLocaleString('vi-VN')}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
    enableColumnFilter: false,
    enableSorting: false,
    meta: {
      viewLabel: 'Lần thấy gần nhất'
    }
  },
  // Actions
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];

// Sub-components for Health column

function SignalBars({
  activeCount,
  maxBars = 4
}: {
  activeCount: number;
  maxBars?: number;
}) {
  return (
    <div className='flex h-4 items-end gap-0.5'>
      {Array.from({ length: maxBars }).map((_, i) => (
        <div
          key={i}
          className={`w-1 rounded-sm ${i < activeCount ? 'bg-blue-500' : 'bg-slate-300'}`}
          style={{ height: `${((i + 1) / maxBars) * 100}%` }}
        />
      ))}
    </div>
  );
}

function BatteryBar({ level }: { level: number }) {
  const isLow = level < 30;
  const isMedium = level >= 30 && level < 70;
  const bgColor = isLow
    ? 'bg-amber-400'
    : isMedium
      ? 'bg-yellow-400'
      : 'bg-green-500';

  return (
    <div className='relative flex h-3 w-6 items-center rounded-[2px] border border-slate-300 p-px'>
      <div
        className={`h-full rounded-[1px] ${bgColor} transition-all`}
        style={{ width: `${Math.max(level, 0)}%` }}
      />
      <div className='absolute top-1 -right-1 h-1 w-0.5 bg-slate-300' />
    </div>
  );
}
