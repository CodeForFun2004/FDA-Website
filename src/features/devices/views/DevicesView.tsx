// src/features/devices/views/DevicesView.tsx
"use client";

import React, { useMemo } from 'react';
import { useDevices, type Device } from '../index';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow, 
  Badge, Button, Card, CardContent, LoadingState 
} from '@/components/ui/common';
import { formatDate } from '@/lib/utils';
import { Plus, Battery, BatteryWarning, Settings, MapPin } from 'lucide-react';

// ===== Sub-components =====

type StatusIndicatorProps = {
  status: Device['status'];
};

const StatusIndicator = ({ status }: StatusIndicatorProps) => {
  const colorClass = status === 'Online' 
    ? 'bg-emerald-500' 
    : status === 'Offline' 
    ? 'bg-red-500' 
    : 'bg-orange-400';
  
  return <div className={`h-2.5 w-2.5 rounded-full ${colorClass}`} />;
};

type BatteryIndicatorProps = {
  level: number;
};

const BatteryIndicator = ({ level }: BatteryIndicatorProps) => (
  <div className="flex items-center gap-1">
    {level < 20 
      ? <BatteryWarning className="h-4 w-4 text-red-500"/> 
      : <Battery className="h-4 w-4 text-emerald-500"/>
    }
    <span className={level < 20 ? 'text-red-500 font-medium' : ''}>{level}%</span>
  </div>
);

type DeviceRowProps = {
  device: Device;
  onConfig?: (device: Device) => void;
  onLocate?: (device: Device) => void;
};

const DeviceRow = ({ device, onConfig, onLocate }: DeviceRowProps) => (
  <TableRow>
    <TableCell>
      <StatusIndicator status={device.status} />
    </TableCell>
    <TableCell className="font-medium">
      {device.name} 
      <span className="text-xs text-muted-foreground block">{device.id}</span>
    </TableCell>
    <TableCell>
      <Badge variant="outline">{device.type}</Badge>
    </TableCell>
    <TableCell>{device.location}</TableCell>
    <TableCell>
      <BatteryIndicator level={device.batteryLevel} />
    </TableCell>
    <TableCell>{formatDate(device.lastHeartbeat)}</TableCell>
    <TableCell>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => onConfig?.(device)}>
          <Settings className="h-4 w-4" />
        </Button>
        {device.coordinates && (
          <Button variant="ghost" size="sm" onClick={() => onLocate?.(device)}>
            <MapPin className="h-4 w-4" />
          </Button>
        )}
      </div>
    </TableCell>
  </TableRow>
);

// ===== Main View Component =====

export type DevicesViewProps = {
  onAddDevice?: () => void;
  onConfigDevice?: (device: Device) => void;
  onLocateDevice?: (device: Device) => void;
};

export function DevicesView({ onAddDevice, onConfigDevice, onLocateDevice }: DevicesViewProps) {
  const { data: devices, isLoading } = useDevices();

  // Business logic: calculate statistics
  const stats = useMemo(() => ({
    total: devices?.length ?? 0,
    online: devices?.filter(d => d.status === 'Online').length ?? 0,
    offline: devices?.filter(d => d.status === 'Offline').length ?? 0,
    warning: devices?.filter(d => d.status === 'Warning').length ?? 0,
    lowBattery: devices?.filter(d => d.batteryLevel < 20).length ?? 0,
  }), [devices]);

  if (isLoading) return <LoadingState />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">IoT Devices</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {stats.total} devices • 
            <span className="text-emerald-600"> {stats.online} online</span> • 
            <span className="text-red-600"> {stats.offline} offline</span>
            {stats.warning > 0 && <span className="text-orange-500"> • {stats.warning} warning</span>}
          </p>
        </div>
        <Button onClick={onAddDevice}>
          <Plus className="mr-2 h-4 w-4" /> Register Device
        </Button>
      </div>

      {/* Low Battery Alert */}
      {stats.lowBattery > 0 && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg p-4 flex items-center gap-3">
          <BatteryWarning className="h-5 w-5 text-red-500" />
          <p className="text-sm text-red-700 dark:text-red-400">
            <strong>{stats.lowBattery} device(s)</strong> have low battery (below 20%)
          </p>
        </div>
      )}

      {/* Devices Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Device Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Battery</TableHead>
                <TableHead>Last Heartbeat</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devices?.map((device) => (
                <DeviceRow 
                  key={device.id} 
                  device={device}
                  onConfig={onConfigDevice}
                  onLocate={onLocateDevice}
                />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
