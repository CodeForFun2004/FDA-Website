'use client';

import * as React from 'react';
import type { FloodFeatureProperties } from '@/features/zones/api/flood-severity.api';

type Props = {
  x: number;
  y: number;
  properties: FloodFeatureProperties;
  realtime?: {
    isLoading: boolean;
    error: string | null;
    refreshedAt: string | null;
    waterLevel: number | null | undefined;
    unit: string | null | undefined;
    measuredAt: string | null | undefined;
    stationStatus: string | null | undefined;
    severity: string | null | undefined;
    alertLevel: string | null | undefined;
  };
};

function formatDateTime(iso: string | null | undefined) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit'
    });
  } catch {
    return iso;
  }
}

function severityTone(severityRaw: string | null | undefined) {
  const s = String(severityRaw ?? 'unknown').toLowerCase();
  if (s === 'critical')
    return { bg: '#FDEBEC', fg: '#9F2F2D', label: 'Critical' };
  if (s === 'warning')
    return { bg: '#FBF3DB', fg: '#956400', label: 'Warning' };
  if (s === 'caution' || s === 'alarm')
    return { bg: '#FBF3DB', fg: '#956400', label: 'Caution' };
  if (s === 'safe') return { bg: '#EDF3EC', fg: '#346538', label: 'Safe' };
  return { bg: '#E1F3FE', fg: '#1F6C9F', label: 'Unknown' };
}

export function StationHoverCard({ x, y, properties, realtime }: Props) {
  const tone = severityTone(
    realtime?.severity ?? (properties as any)?.severity
  );
  const code = String(properties.stationCode ?? properties.code ?? '').trim();
  const name = String(properties.stationName ?? '').trim();
  const roadName = String(properties.roadName ?? '').trim();

  const waterLevel =
    realtime?.waterLevel ?? (properties as any)?.waterLevel ?? null;
  const unit = realtime?.unit ?? (properties as any)?.unit ?? null;
  const measuredAt =
    realtime?.measuredAt ?? (properties as any)?.measuredAt ?? null;
  const stationStatus =
    realtime?.stationStatus ?? (properties as any)?.stationStatus ?? null;
  const alertLevel = realtime?.alertLevel ?? (properties as any)?.alertLevel;

  return (
    <div
      className='pointer-events-none absolute z-[60]'
      style={{ left: x + 14, top: y + 14 }}
    >
      <div
        className='w-[290px] rounded-[12px] border bg-white px-4 py-3'
        style={{ borderColor: '#EAEAEA' }}
      >
        <div className='flex items-start justify-between gap-3'>
          <div className='min-w-0'>
            <div
              className='inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-[0.08em] uppercase'
              style={{ background: tone.bg, color: tone.fg }}
            >
              {String(alertLevel ?? tone.label)}
            </div>
            <div className='mt-2 min-w-0'>
              <div
                className='truncate text-[13px] font-semibold'
                style={{ color: '#111111' }}
              >
                {name || (code ? `Trạm ${code}` : 'Trạm')}
              </div>
              <div
                className='mt-0.5 flex flex-wrap items-center gap-2 text-[11px]'
                style={{ color: '#787774' }}
              >
                {code ? (
                  <span className='font-mono text-[10px] tracking-[0.06em]'>
                    {code}
                  </span>
                ) : null}
                {stationStatus ? (
                  <span className='capitalize'>{stationStatus}</span>
                ) : null}
                {roadName ? <span className='truncate'>{roadName}</span> : null}
              </div>
            </div>
          </div>

          <div className='shrink-0 text-right'>
            <div
              className='text-[22px] leading-none font-semibold tabular-nums'
              style={{ color: '#111111' }}
            >
              {waterLevel == null || !Number.isFinite(Number(waterLevel))
                ? '—'
                : String(waterLevel)}
            </div>
            <div className='mt-1 text-[10px]' style={{ color: '#787774' }}>
              {unit ?? '—'}
            </div>
          </div>
        </div>

        <div
          className='mt-3 flex items-center justify-between border-t pt-2 text-[10px]'
          style={{ borderColor: '#EAEAEA', color: '#787774' }}
        >
          <span>measuredAt: {formatDateTime(measuredAt)}</span>
          {realtime?.isLoading ? (
            <span>Đang cập nhật…</span>
          ) : realtime?.error ? (
            <span style={{ color: '#9F2F2D' }}>Không lấy được realtime</span>
          ) : realtime?.refreshedAt ? (
            <span>sync: {formatDateTime(realtime.refreshedAt)}</span>
          ) : (
            <span />
          )}
        </div>
      </div>
    </div>
  );
}
