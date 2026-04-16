'use client';

import * as React from 'react';
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/common';
import type {
  OperationalLogCategory,
  OperationalLogLevel,
  OperationalLogsQueryParams
} from '../../types';

const CATEGORY_OPTIONS: Array<{
  value: OperationalLogCategory;
  label: string;
}> = [
  { value: 'system', label: 'Hệ thống' },
  { value: 'alert', label: 'Cảnh báo' },
  { value: 'sensor', label: 'Cảm biến' },
  { value: 'moderation', label: 'Điều phối' }
];

const LEVEL_OPTIONS: Array<{ value: OperationalLogLevel; label: string }> = [
  { value: 'info', label: 'Thông tin' },
  { value: 'warning', label: 'Cảnh báo' },
  { value: 'error', label: 'Lỗi' }
];

export type OperationalLogsFiltersBarProps = {
  value: OperationalLogsQueryParams;
  onChange: (next: OperationalLogsQueryParams) => void;
  isAuthority?: boolean;
  onReset?: () => void;
};

function toIsoOrUndefined(v: string) {
  if (!v) return undefined;
  const d = new Date(v);
  const t = d.getTime();
  if (Number.isNaN(t)) return undefined;
  return d.toISOString();
}

export function OperationalLogsFiltersBar({
  value,
  onChange,
  isAuthority,
  onReset
}: OperationalLogsFiltersBarProps) {
  const [advanced, setAdvanced] = React.useState(false);

  const categoryOptions = React.useMemo(() => {
    if (!isAuthority) return CATEGORY_OPTIONS;
    // Authority không xem system/moderation
    return CATEGORY_OPTIONS.filter(
      (c) => c.value !== 'system' && c.value !== 'moderation'
    );
  }, [isAuthority]);

  return (
    <div className='space-y-3'>
      <div className='flex flex-wrap items-center gap-2'>
        <div className='min-w-[260px] flex-1'>
          <Input
            value={value.searchText ?? ''}
            onChange={(e) => onChange({ ...value, searchText: e.target.value })}
            placeholder='Tìm trong chi tiết/lỗi...'
          />
        </div>

        <Select
          value={value.category ?? 'all'}
          onValueChange={(v) =>
            onChange({
              ...value,
              category: v === 'all' ? undefined : (v as any)
            })
          }
        >
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder='Nhóm' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Tất cả nhóm</SelectItem>
            {categoryOptions.map((c) => (
              <SelectItem key={String(c.value)} value={String(c.value)}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={value.level ?? 'all'}
          onValueChange={(v) =>
            onChange({ ...value, level: v === 'all' ? undefined : (v as any) })
          }
        >
          <SelectTrigger className='w-[160px]'>
            <SelectValue placeholder='Mức độ' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Tất cả mức</SelectItem>
            {LEVEL_OPTIONS.map((l) => (
              <SelectItem key={l.value} value={l.value}>
                {l.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant='outline'
          onClick={() => setAdvanced((v) => !v)}
          className='whitespace-nowrap'
        >
          {advanced ? 'Ẩn nâng cao' : 'Bộ lọc nâng cao'}
        </Button>

        <Button
          variant='outline'
          onClick={() => onReset?.()}
          className='whitespace-nowrap'
        >
          Đặt lại
        </Button>
      </div>

      {advanced ? (
        <div className='grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4'>
          <Input
            value={value.action ?? ''}
            onChange={(e) => onChange({ ...value, action: e.target.value })}
            placeholder='Action (vd: job_failed)'
          />
          <Input
            value={value.entityType ?? ''}
            onChange={(e) => onChange({ ...value, entityType: e.target.value })}
            placeholder='EntityType (vd: Station)'
          />
          <Input
            value={value.userId ?? ''}
            onChange={(e) => onChange({ ...value, userId: e.target.value })}
            placeholder='UserId'
          />
          <Input
            value={value.entityId ?? ''}
            onChange={(e) => onChange({ ...value, entityId: e.target.value })}
            placeholder='EntityId'
          />

          <div className='flex items-center gap-2 sm:col-span-2'>
            <Input
              type='datetime-local'
              onChange={(e) =>
                onChange({
                  ...value,
                  fromDate: toIsoOrUndefined(e.target.value)
                })
              }
            />
            <span className='text-muted-foreground text-sm'>→</span>
            <Input
              type='datetime-local'
              onChange={(e) =>
                onChange({ ...value, toDate: toIsoOrUndefined(e.target.value) })
              }
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
