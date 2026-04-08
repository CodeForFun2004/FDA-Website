'use client';

import * as React from 'react';
import type { StationExtended } from '@/features/stations/types/station.type';
import { useMapStationsList } from '@/features/zones/hooks/useMapStationsList';
import { cn } from '@/libs/utils';

type Props = {
  enabled: boolean;
};

function statusClass(status: string) {
  const s = status.toLowerCase();
  if (s === 'online')
    return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  if (s === 'maintenance')
    return 'bg-amber-100 text-amber-900 border-amber-200';
  return 'bg-slate-100 text-slate-700 border-slate-200';
}

function fmtDate(iso: string | null | undefined) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function fmtVal(v: unknown): string {
  if (v === null || v === undefined) return '—';
  if (typeof v === 'boolean') return v ? 'Có' : 'Không';
  return String(v);
}

function StationRow({ s }: { s: StationExtended }) {
  const summaryLine =
    s.roadName?.trim() ||
    s.locationDesc?.trim() ||
    `${s.latitude.toFixed(5)}, ${s.longitude.toFixed(5)}`;

  return (
    <details className='group rounded-lg border border-slate-200 bg-white text-xs'>
      <summary className='cursor-pointer list-none px-2.5 py-2 [&::-webkit-details-marker]:hidden'>
        <div className='flex items-start justify-between gap-2'>
          <div className='min-w-0 flex-1'>
            <div className='flex flex-wrap items-center gap-1.5'>
              <span className='font-mono font-semibold text-slate-900'>
                {s.code}
              </span>
              <span
                className={cn(
                  'rounded border px-1.5 py-0.5 text-[10px] font-medium uppercase',
                  statusClass(s.status)
                )}
              >
                {s.status}
              </span>
            </div>
            <div className='mt-0.5 line-clamp-2 font-medium text-slate-800'>
              {s.name}
            </div>
            <div className='text-muted-foreground mt-0.5 line-clamp-1 text-[11px]'>
              {summaryLine}
            </div>
          </div>
          <span className='text-muted-foreground shrink-0 text-[10px] group-open:hidden'>
            Chi tiết
          </span>
        </div>
      </summary>
      <div className='border-t border-slate-100 px-2.5 py-2 text-[11px] text-slate-700'>
        <dl className='grid grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-x-2 gap-y-1.5'>
          <Detail label='ID' value={s.id} />
          <Detail label='Mã' value={s.code} />
          <Detail label='Tên' value={s.name} />
          <Detail label='Mô tả vị trí' value={s.locationDesc} />
          <Detail label='Vĩ độ' value={fmtVal(s.latitude)} />
          <Detail label='Kinh độ' value={fmtVal(s.longitude)} />
          <Detail label='Đường' value={s.roadName} />
          <Detail label='Hướng' value={s.direction} />
          <Detail label='Trạng thái' value={s.status} />
          <Detail label='Ngưỡng cảnh báo' value={fmtVal(s.thresholdWarning)} />
          <Detail
            label='Ngưỡng nguy hiểm'
            value={fmtVal(s.thresholdCritical)}
          />
          <Detail
            label='Hiệu chỉnh (offset)'
            value={fmtVal(s.calibrationOffset)}
          />
          <Detail label='Chiều cao cảm biến' value={fmtVal(s.sensorHeight)} />
          <Detail label='Loại trạm' value={s.type} />
          <Detail
            label='Sự cố đang hoạt động'
            value={fmtVal(s.isIncidentActive)}
          />
          <Detail label='Khu hành chính (ID)' value={s.administrativeAreaId} />
          <Detail label='Lắp đặt' value={fmtDate(s.installedAt)} />
          <Detail label='Lần thấy gần nhất' value={fmtDate(s.lastSeenAt)} />
          <Detail label='Tạo lúc' value={fmtDate(s.createdAt)} />
          <Detail label='Tạo bởi' value={s.createdBy} />
          <Detail label='Cập nhật lúc' value={fmtDate(s.updatedAt)} />
          <Detail label='Cập nhật bởi' value={s.updatedBy} />
        </dl>
      </div>
    </details>
  );
}

function Detail({
  label,
  value
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <>
      <dt className='text-muted-foreground'>{label}</dt>
      <dd className='min-w-0 font-medium break-words'>{value ?? '—'}</dd>
    </>
  );
}

export function StationListPanel({ enabled }: Props) {
  const { data, isLoading, isError, error, refetch } =
    useMapStationsList(enabled);

  if (!enabled) return null;

  return (
    <div className='border-t pt-3'>
      <div className='mb-2 flex items-center justify-between gap-2'>
        <div className='text-sm font-medium'>Trạm đo</div>
        <button
          type='button'
          onClick={() => void refetch()}
          className='text-muted-foreground hover:text-foreground text-[11px] underline-offset-2 hover:underline'
        >
          Tải lại
        </button>
      </div>
      <p className='text-muted-foreground mb-2 text-[11px] leading-snug'>
        Tóm tắt trên mỗi dòng; mở &quot;Chi tiết&quot; để xem đầy đủ.
      </p>

      {isLoading && (
        <div className='text-muted-foreground py-4 text-center text-xs'>
          Đang tải trạm…
        </div>
      )}
      {isError && (
        <div className='border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-2 py-2 text-[11px]'>
          {error instanceof Error
            ? error.message
            : 'Không tải được danh sách trạm'}
        </div>
      )}
      {!isLoading && !isError && data && data.length === 0 && (
        <div className='text-muted-foreground py-2 text-center text-xs'>
          Không có trạm nào.
        </div>
      )}
      {!isLoading && data && data.length > 0 && (
        <div className='max-h-56 space-y-1.5 overflow-y-auto pr-0.5'>
          {data.map((s) => (
            <StationRow key={s.id} s={s} />
          ))}
        </div>
      )}
    </div>
  );
}
