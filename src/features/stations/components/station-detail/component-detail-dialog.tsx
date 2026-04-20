// src/features/stations/components/station-detail/component-detail-dialog.tsx
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Component } from '@/features/stations/types/station.type';
import {
  Cpu,
  Radio,
  Thermometer,
  Battery,
  Camera,
  Edit,
  Trash2,
  Info
} from 'lucide-react';

function getComponentIcon(type: string) {
  switch (type) {
    case 'esp32':
      return Cpu;
    case 'srt04':
      return Radio;
    case 'temperature_sensor':
      return Thermometer;
    case 'battery':
      return Battery;
    default:
      return Camera;
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'active':
      return (
        <Badge
          variant='outline'
          className='border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-400'
        >
          Hoạt động
        </Badge>
      );
    case 'faulty':
      return (
        <Badge
          variant='outline'
          className='border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400'
        >
          Lỗi
        </Badge>
      );
    default:
      return (
        <Badge
          variant='outline'
          className='border-yellow-500/20 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400'
        >
          Không hoạt động
        </Badge>
      );
  }
}

const COMPONENT_TYPE_LABELS: Record<string, string> = {
  esp32: 'ESP32 (MCU)',
  srt04: 'Cảm biến siêu âm (SRT04)',
  temperature_sensor: 'Cảm biến nhiệt độ',
  battery: 'Pin',
  speaker: 'Loa',
  gsm_module: 'GSM Module',
  solar_panel: 'Tấm pin năng lượng mặt trời',
  rain_sensor: 'Cảm biến mưa'
};

function DetailRow({
  label,
  value
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className='flex items-start justify-between gap-4 border-b py-2.5 last:border-b-0'>
      <span className='text-muted-foreground text-sm font-medium'>{label}</span>
      <span className='text-foreground text-right text-sm'>{value || '-'}</span>
    </div>
  );
}

export interface ComponentDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  component: Component | null;
  onEdit?: (component: Component) => void;
  onDelete?: (component: Component) => void;
}

export function ComponentDetailDialog({
  open,
  onOpenChange,
  component,
  onEdit,
  onDelete
}: ComponentDetailDialogProps) {
  if (!component) return null;

  const Icon = getComponentIcon(component.componentType);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[480px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Info className='text-primary h-5 w-5' />
            Component Details
          </DialogTitle>
          <DialogDescription>
            View full information about this component.
          </DialogDescription>
        </DialogHeader>

        {/* Component header */}
        <div className='flex items-center gap-3 rounded-lg border p-3'>
          <div className='bg-muted text-muted-foreground flex h-10 w-10 items-center justify-center rounded-lg'>
            <Icon className='h-5 w-5' />
          </div>
          <div className='flex-1'>
            <p className='text-foreground font-semibold'>
              {component.name || component.componentType}
            </p>
            <p className='text-muted-foreground text-xs'>
              {COMPONENT_TYPE_LABELS[component.componentType] ??
                component.componentType}
            </p>
          </div>
          {getStatusBadge(component.status)}
        </div>

        {/* Details list */}
        <div className='space-y-0'>
          <DetailRow label='Mẫu' value={component.model} />
          <DetailRow label='Số serial' value={component.serialNumber} />
          <DetailRow
            label='Phiên bản firmware'
            value={component.firmwareVersion}
          />
          <DetailRow
            label='Thời điểm lắp đặt'
            value={
              component.installedAt
                ? new Date(component.installedAt).toLocaleString('vi-VN')
                : null
            }
          />
          <DetailRow
            label='Bảo trì gần nhất'
            value={
              component.lastMaintenanceAt
                ? new Date(component.lastMaintenanceAt).toLocaleString('vi-VN')
                : null
            }
          />
          <DetailRow label='Ghi chú' value={component.notes} />
          <DetailRow
            label='Tạo lúc'
            value={
              component.createdAt
                ? new Date(component.createdAt).toLocaleString('vi-VN')
                : null
            }
          />
          <DetailRow
            label='Cập nhật lúc'
            value={
              component.updatedAt
                ? new Date(component.updatedAt).toLocaleString('vi-VN')
                : null
            }
          />
        </div>

        <DialogFooter className='flex gap-2 pt-2'>
          {onDelete ? (
            <Button
              variant='outline'
              size='sm'
              className='text-destructive hover:bg-destructive/10 gap-1.5'
              onClick={() => {
                onOpenChange(false);
                onDelete(component);
              }}
            >
              <Trash2 className='h-4 w-4' />
              Xóa
            </Button>
          ) : null}
          {onEdit ? (
            <Button
              size='sm'
              className='gap-1.5'
              onClick={() => {
                onOpenChange(false);
                onEdit(component);
              }}
            >
              <Edit className='h-4 w-4' />
              Sửa
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
