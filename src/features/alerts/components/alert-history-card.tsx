'use client';

import React from 'react';
import type { Alert } from '@/features/alerts/types';
import {
  IconAlertTriangle,
  IconAlertOctagon,
  IconAlertCircle,
  IconInfoCircle,
  IconDots
} from '@tabler/icons-react';

// ─── Severity config ───
type SeverityKey = Alert['severity'];

const SEVERITY_CONFIG: Record<
  SeverityKey,
  {
    iconBg: string;
    icon: typeof IconAlertTriangle;
    accentColor: string;
  }
> = {
  Critical: {
    iconBg: 'bg-gradient-to-br from-red-500 to-rose-600',
    icon: IconAlertOctagon,
    accentColor: 'text-red-500'
  },
  High: {
    iconBg: 'bg-gradient-to-br from-orange-500 to-amber-600',
    icon: IconAlertTriangle,
    accentColor: 'text-orange-500'
  },
  Medium: {
    iconBg: 'bg-gradient-to-br from-yellow-500 to-amber-500',
    icon: IconAlertCircle,
    accentColor: 'text-yellow-600'
  },
  Low: {
    iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-500',
    icon: IconInfoCircle,
    accentColor: 'text-blue-500'
  }
};

// ─── Strip [FloodGuard] or similar bracket prefixes ───
function cleanTitle(title: string): string {
  return title.replace(/\[.*?\]\s*/g, '').trim();
}

// ─── Relative time (Facebook style) ───
function getRelativeTime(timestamp: string): string {
  const now = Date.now();
  const diff = now - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  const weeks = Math.floor(days / 7);

  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút`;
  if (hours < 24) return `${hours} giờ`;
  if (days < 7) return `${days} ngày`;
  return `${weeks} tuần`;
}

// ─── Component ───
interface AlertHistoryCardProps {
  alert: Alert;
  onClick?: (alert: Alert) => void;
}

export function AlertHistoryCard({ alert, onClick }: AlertHistoryCardProps) {
  const config = SEVERITY_CONFIG[alert.severity];
  const SeverityIcon = config.icon;
  const isUnread = !alert.isRead;
  const title = cleanTitle(alert.title);

  return (
    <button
      id={`alert-card-${alert.id}`}
      type='button'
      onClick={() => onClick?.(alert)}
      className={`group hover:bg-accent/70 active:bg-accent relative flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-all duration-150 ease-out ${isUnread ? 'bg-primary/[0.04] dark:bg-primary/[0.06]' : ''} `}
    >
      {/* ── Unread dot (Facebook blue) ── */}
      {isUnread && (
        <span className='bg-primary absolute top-1/2 left-0.5 h-3 w-3 -translate-y-1/2 rounded-full shadow-sm' />
      )}

      {/* ── Icon Avatar ── */}
      <div className='relative mt-0.5 shrink-0'>
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-full ${config.iconBg} shadow-md`}
        >
          <SeverityIcon className='h-6 w-6 text-white' stroke={2} />
        </div>
        {/* Live pulse for critical */}
        {alert.severity === 'Critical' && isUnread && (
          <span className='absolute -top-0.5 -right-0.5 flex h-4 w-4'>
            <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-60' />
            <span className='relative inline-flex h-4 w-4 rounded-full border-2 border-white bg-red-500 dark:border-slate-900' />
          </span>
        )}
      </div>

      {/* ── Text content ── */}
      <div className='min-w-0 flex-1 pr-1'>
        {/* Combined message block — Facebook style: bold name + description in same paragraph */}
        <p
          className={`text-[13.5px] leading-[1.4] ${
            isUnread ? 'text-foreground' : 'text-foreground/70'
          }`}
        >
          <span className={isUnread ? 'font-bold' : 'font-semibold'}>
            {title}
          </span>
          {alert.description && (
            <>
              {' '}
              <span
                className={
                  isUnread ? 'font-normal' : 'text-muted-foreground font-normal'
                }
              >
                {alert.description}
              </span>
            </>
          )}
        </p>

        {/* Relative time */}
        <p
          className={`mt-1 text-[12.5px] font-medium ${
            isUnread ? config.accentColor : 'text-muted-foreground/60'
          }`}
        >
          {getRelativeTime(alert.timestamp)}
        </p>
      </div>

      {/* ── 3-dot menu (Facebook style, visible on hover) ── */}
      <div className='mt-3 shrink-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100'>
        <div className='bg-background hover:bg-accent flex h-8 w-8 items-center justify-center rounded-full border shadow-sm transition-colors'>
          <IconDots className='text-muted-foreground h-4 w-4' />
        </div>
      </div>
    </button>
  );
}
