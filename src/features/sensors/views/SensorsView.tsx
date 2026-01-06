// src/features/sensors/views/SensorsView.tsx
"use client";

import React, { useState, useMemo } from 'react';
import { useSensorReadings, type SensorReading } from '../index';
import { useDevices } from '@/features/devices';
import { 
  Card, CardContent, CardHeader, CardTitle, LoadingState, Button 
} from '@/components/ui/common';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { formatDate } from '@/lib/utils';
import { Activity, Droplets, Thermometer, RefreshCw } from 'lucide-react';

// ===== Sub-components =====

type SensorCardProps = {
  title: string;
  value: string | number;
  unit: string;
  icon: React.ElementType;
  colorClass: string;
  trend?: 'up' | 'down' | 'stable';
};

const SensorCard = ({ title, value, unit, icon: Icon, colorClass }: SensorCardProps) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg ${colorClass}`}>
          <Icon className="h-5 w-5" />
        </div>
        <h4 className="font-semibold text-foreground">{title}</h4>
      </div>
      <div className="flex items-end gap-2">
        <p className="text-3xl font-bold text-foreground">{value}</p>
        <p className="text-lg text-muted-foreground mb-1">{unit}</p>
      </div>
    </CardContent>
  </Card>
);

function ChartTooltip({ active, label, payload }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border bg-background px-4 py-3 shadow-md">
      <div className="text-sm font-medium text-foreground">{formatDate(label)}</div>
      <div className="text-sm text-primary">Value: {payload[0].value} {payload[0].payload.unit}</div>
    </div>
  );
}

// ===== Main View Component =====

export type SensorsViewProps = {
  initialDeviceId?: string;
  onRefresh?: () => void;
};

export function SensorsView({ initialDeviceId, onRefresh }: SensorsViewProps) {
  const { data: devices } = useDevices();
  const [selectedDeviceId, setSelectedDeviceId] = useState(initialDeviceId || 'dev-001');
  const { data: sensorData, isLoading, refetch } = useSensorReadings(selectedDeviceId);

  // Business logic: calculate statistics
  const stats = useMemo(() => {
    if (!sensorData?.length) return { avg: '0', min: '0', max: '0', latest: '0', unit: '', type: 'Unknown' as const };
    
    const values = sensorData.map(s => s.value);
    return {
      avg: (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2),
      min: Math.min(...values).toFixed(2),
      max: Math.max(...values).toFixed(2),
      latest: sensorData[sensorData.length - 1]?.value.toFixed(2) ?? '0',
      unit: sensorData[0]?.unit ?? '',
      type: sensorData[0]?.type ?? 'Unknown',
    };
  }, [sensorData]);

  const selectedDevice = devices?.find(d => d.id === selectedDeviceId);

  const handleRefresh = () => {
    refetch();
    onRefresh?.();
  };

  if (isLoading) return <LoadingState />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sensor Readings</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Real-time data from IoT sensors
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" /> Refresh
        </Button>
      </div>

      {/* Device Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Device</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {devices?.filter(d => d.type !== 'Camera').map(device => (
              <Button
                key={device.id}
                variant={selectedDeviceId === device.id ? 'default' : 'outline'}
                onClick={() => setSelectedDeviceId(device.id)}
              >
                {device.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <SensorCard
          title="Latest Reading"
          value={stats.latest}
          unit={stats.unit}
          icon={stats.type === 'WaterLevel' ? Activity : Droplets}
          colorClass="bg-blue-100 text-blue-600"
        />
        <SensorCard
          title="Average"
          value={stats.avg}
          unit={stats.unit}
          icon={Activity}
          colorClass="bg-emerald-100 text-emerald-600"
        />
        <SensorCard
          title="Minimum"
          value={stats.min}
          unit={stats.unit}
          icon={Activity}
          colorClass="bg-cyan-100 text-cyan-600"
        />
        <SensorCard
          title="Maximum"
          value={stats.max}
          unit={stats.unit}
          icon={Activity}
          colorClass="bg-purple-100 text-purple-600"
        />
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedDevice?.name ?? 'Sensor'} - {stats.type} (Last 24 Hours)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sensorData}>
                <defs>
                  <linearGradient id="colorSensor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/50" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(t) => new Date(t).getHours() + "h"}
                  className="text-xs text-muted-foreground"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  className="text-xs text-muted-foreground"
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#2563eb"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorSensor)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
