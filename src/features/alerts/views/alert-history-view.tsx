'use client';

import React, { useState, useMemo } from 'react';
import { useAlerts, type Alert } from '@/features/alerts';
import { AlertHistoryCard } from '../components/alert-history-card';
import { AlertHistoryCardDetail } from '../components/alert-history-card-detail';
import { LoadingState } from '@/components/ui/common';
import {
  IconBellRinging,
  IconFilter,
  IconCheck,
  IconChevronDown
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

type SeverityFilter = Alert['severity'] | 'all';

export function AlertHistoryView() {
  const { data: alerts, isLoading } = useAlerts();
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all');

  const handleCardClick = (alert: Alert) => {
    setSelectedAlert(alert);
    setDetailOpen(true);
  };

  const handleAcknowledge = (alert: Alert) => {
    toast.success('Đã xác nhận cảnh báo', {
      description: alert.title
    });
    setDetailOpen(false);
  };

  const handleResolve = (alert: Alert) => {
    toast.success('Đã đánh dấu xử lý', {
      description: alert.title
    });
    setDetailOpen(false);
  };

  const handleMarkAllRead = () => {
    toast.success('Đã đánh dấu tất cả đã đọc');
  };

  // Filter & sort
  const filteredAlerts = useMemo(() => {
    const list = alerts ?? [];
    const filtered =
      severityFilter === 'all'
        ? list
        : list.filter((a) => a.severity === severityFilter);
    return [...filtered].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [alerts, severityFilter]);

  const unreadCount = useMemo(
    () => filteredAlerts.filter((a) => !a.isRead).length,
    [filteredAlerts]
  );

  if (isLoading) return <LoadingState />;

  return (
    <div className='space-y-0'>
      {/* ── Toolbar ── */}
      <div className='bg-background/80 sticky top-0 z-10 flex items-center justify-between border-b px-4 py-3 backdrop-blur-lg'>
        {/* Left: Count */}
        <div className='flex items-center gap-2.5'>
          <div className='relative'>
            <IconBellRinging className='text-primary h-5 w-5' />
            {unreadCount > 0 && (
              <span className='absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white shadow-lg'>
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h2 className='text-foreground text-sm font-bold'>Cảnh báo</h2>
            <p className='text-muted-foreground text-[11px]'>
              {filteredAlerts.length} cảnh báo
              {unreadCount > 0 && (
                <span className='text-primary font-semibold'>
                  {' '}
                  • {unreadCount} chưa đọc
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className='flex items-center gap-1.5'>
          {/* Filter dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                size='sm'
                className={`h-8 gap-1.5 rounded-full text-xs ${
                  severityFilter !== 'all'
                    ? 'bg-primary/10 text-primary font-semibold'
                    : ''
                }`}
              >
                <IconFilter className='h-3.5 w-3.5' />
                {severityFilter === 'all' ? 'Lọc' : severityFilter}
                <IconChevronDown className='h-3 w-3' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-44 rounded-xl'>
              <DropdownMenuLabel className='text-muted-foreground text-xs'>
                Mức độ nghiêm trọng
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(['all', 'Critical', 'High', 'Medium', 'Low'] as const).map(
                (val) => (
                  <DropdownMenuCheckboxItem
                    key={val}
                    checked={severityFilter === val}
                    onCheckedChange={() => setSeverityFilter(val)}
                    className='rounded-lg text-xs'
                  >
                    {val === 'all'
                      ? 'Tất cả'
                      : val === 'Critical'
                        ? '🔴 Nguy hiểm'
                        : val === 'High'
                          ? '🟠 Cao'
                          : val === 'Medium'
                            ? '🟡 Trung bình'
                            : '🔵 Thấp'}
                  </DropdownMenuCheckboxItem>
                )
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mark all read */}
          <Button
            variant='ghost'
            size='sm'
            className='h-8 gap-1.5 rounded-full text-xs'
            onClick={handleMarkAllRead}
          >
            <IconCheck className='h-3.5 w-3.5' />
            Đã đọc
          </Button>
        </div>
      </div>

      {/* ── Alert List ── */}
      <div className='divide-border/30 divide-y'>
        {filteredAlerts.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-16 text-center'>
            <div className='bg-muted/50 mb-3 flex h-16 w-16 items-center justify-center rounded-full'>
              <IconBellRinging className='text-muted-foreground/50 h-8 w-8' />
            </div>
            <h3 className='text-foreground text-sm font-semibold'>
              Không có cảnh báo nào
            </h3>
            <p className='text-muted-foreground mt-1 text-xs'>
              {severityFilter !== 'all'
                ? 'Thử thay đổi bộ lọc để xem thêm'
                : 'Hệ thống đang hoạt động bình thường'}
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <AlertHistoryCard
              key={alert.id}
              alert={alert}
              onClick={handleCardClick}
            />
          ))
        )}
      </div>

      {/* ── Detail Dialog ── */}
      <AlertHistoryCardDetail
        alert={selectedAlert}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onAcknowledge={handleAcknowledge}
        onResolve={handleResolve}
      />
    </div>
  );
}
