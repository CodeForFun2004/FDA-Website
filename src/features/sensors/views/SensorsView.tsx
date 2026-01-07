'use client';

import React, { useState, useMemo } from 'react';
import { useDevices, useSensorReadings } from '@/lib/api';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  LoadingState
} from '@/components/ui/common';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import {
  Radio,
  Activity,
  Battery,
  BatteryWarning,
  AlertTriangle,
  Settings,
  RefreshCw,
  Ruler,
  Signal
} from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';
import { Device } from '@/lib/types';

export default function SensorsPage() {
  const { data: devices, isLoading: isLoadingDevices } = useDevices();
  // Default to first device or null
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  // Effect to select first device automatically
  React.useEffect(() => {
    if (devices && devices.length > 0 && !selectedDeviceId) {
      setSelectedDeviceId(devices[0].id);
    }
  }, [devices, selectedDeviceId]);

  const { data: sensorData, isLoading: isLoadingData } = useSensorReadings(
    selectedDeviceId || undefined
  );

  const selectedDevice = useMemo(
    () => devices?.find((d) => d.id === selectedDeviceId),
    [devices, selectedDeviceId]
  );

  // Determine Unit from data (e.g., 'm' or 'mm')
  const currentUnit =
    sensorData && sensorData.length > 0 ? sensorData[0].unit : 'm';
  const isWaterLevel = currentUnit === 'm';

  if (isLoadingDevices) return <LoadingState />;

  return (
    <div className='space-y-6'>
      <div className='flex flex-col justify-between gap-4 md:flex-row md:items-center'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Sensor Data</h1>
          <p className='text-muted-foreground mt-1'>
            Real-time water level monitoring and device status.
          </p>
        </div>
        <div className='flex gap-2'>
          <Button variant='outline'>
            <RefreshCw className='mr-2 h-4 w-4' /> Refresh Data
          </Button>
          <Button variant='default'>
            <Settings className='mr-2 h-4 w-4' /> Global Config
          </Button>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        {/* LEFT COLUMN: Device List */}
        <div className='space-y-4 lg:col-span-1'>
          <h2 className='px-1 text-lg font-semibold'>
            Connected Devices ({devices?.length})
          </h2>
          <div className='grid max-h-[calc(100vh-250px)] gap-3 overflow-y-auto pr-1'>
            {devices?.map((device) => (
              <div
                key={device.id}
                onClick={() => setSelectedDeviceId(device.id)}
                className={cn(
                  'group cursor-pointer rounded-xl border p-4 transition-all hover:border-blue-300 hover:shadow-md',
                  selectedDeviceId === device.id
                    ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500 dark:bg-blue-900/20'
                    : 'bg-card hover:bg-accent/50'
                )}
              >
                <div className='mb-2 flex items-start justify-between'>
                  <div className='flex items-center gap-2'>
                    <div
                      className={cn(
                        'rounded-lg p-2',
                        selectedDeviceId === device.id
                          ? 'bg-blue-200 text-blue-700'
                          : 'bg-slate-100 text-slate-500'
                      )}
                    >
                      <Radio className='h-4 w-4' />
                    </div>
                    <div>
                      <h4 className='text-sm font-bold'>{device.name}</h4>
                      <p className='text-muted-foreground text-xs'>
                        {device.location}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      device.status === 'Online'
                        ? 'success'
                        : device.status === 'Warning'
                          ? 'warning'
                          : 'destructive'
                    }
                  >
                    {device.status}
                  </Badge>
                </div>

                <div className='text-muted-foreground mt-3 flex items-center justify-between text-xs'>
                  <div className='flex items-center gap-1'>
                    {device.batteryLevel < 20 ? (
                      <BatteryWarning className='h-3 w-3 text-red-500' />
                    ) : (
                      <Battery className='h-3 w-3 text-emerald-500' />
                    )}
                    {device.batteryLevel}%
                  </div>
                  <div className='flex items-center gap-1'>
                    <Activity className='h-3 w-3' />
                    {device.type}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Detailed View */}
        <div className='space-y-6 lg:col-span-2'>
          {selectedDevice ? (
            <>
              {/* Main Chart Card */}
              <Card className='overflow-hidden border-none bg-gradient-to-br from-white to-slate-50 shadow-lg dark:from-slate-900 dark:to-slate-950'>
                <CardHeader className='flex flex-row items-center justify-between pb-2'>
                  <div>
                    <CardTitle className='flex items-center gap-2'>
                      {selectedDevice.name}
                      <span className='text-muted-foreground text-sm font-normal'>
                        ({selectedDevice.model})
                      </span>
                    </CardTitle>
                    <p className='text-muted-foreground mt-1 text-sm'>
                      Live {isWaterLevel ? 'Water Level' : 'Rainfall'} Data •
                      Last 24 Hours
                    </p>
                  </div>
                  <div className='text-right'>
                    <div className='text-3xl font-bold text-blue-600'>
                      {sensorData && sensorData.length > 0
                        ? sensorData[sensorData.length - 1].value.toFixed(2)
                        : '--'}
                      <span className='text-muted-foreground ml-1 text-lg'>
                        {currentUnit}
                      </span>
                    </div>
                    <div className='flex items-center justify-end gap-1 text-xs font-medium text-emerald-600'>
                      <Signal className='h-3 w-3' /> Signal Strong
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='mt-4 h-[350px] w-full'>
                    {isLoadingData ? (
                      <LoadingState />
                    ) : (
                      <ResponsiveContainer width='100%' height='100%'>
                        <AreaChart data={sensorData}>
                          <defs>
                            <linearGradient
                              id='colorWater'
                              x1='0'
                              y1='0'
                              x2='0'
                              y2='1'
                            >
                              <stop
                                offset='5%'
                                stopColor='#3b82f6'
                                stopOpacity={0.3}
                              />
                              <stop
                                offset='95%'
                                stopColor='#3b82f6'
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            strokeDasharray='3 3'
                            vertical={false}
                            className='stroke-muted/30'
                          />
                          <XAxis
                            dataKey='timestamp'
                            tickFormatter={(t) => new Date(t).getHours() + 'h'}
                            className='text-muted-foreground text-xs'
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            domain={isWaterLevel ? [0, 6] : [0, 'auto']}
                            className='text-muted-foreground text-xs'
                            axisLine={false}
                            tickLine={false}
                            unit={currentUnit}
                          />
                          <Tooltip
                            contentStyle={{
                              borderRadius: '12px',
                              border: 'none',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}
                            labelFormatter={(t) => formatDate(t)}
                            formatter={(value: number) => [
                              `${value} ${currentUnit}`,
                              isWaterLevel ? 'Water Level' : 'Rainfall'
                            ]}
                          />
                          {/* Reference Lines for Water Level Context Only */}
                          {isWaterLevel && (
                            <>
                              <ReferenceLine
                                y={3.5}
                                stroke='#f97316'
                                strokeDasharray='3 3'
                                label={{
                                  value: 'Warning (3.5m)',
                                  fill: '#f97316',
                                  fontSize: 12,
                                  position: 'insideTopRight'
                                }}
                              />
                              <ReferenceLine
                                y={5.0}
                                stroke='#ef4444'
                                strokeDasharray='3 3'
                                label={{
                                  value: 'Critical (5.0m)',
                                  fill: '#ef4444',
                                  fontSize: 12,
                                  position: 'insideTopRight'
                                }}
                              />
                            </>
                          )}

                          <Area
                            type='monotone'
                            dataKey='value'
                            stroke='#3b82f6'
                            strokeWidth={3}
                            fillOpacity={1}
                            fill='url(#colorWater)'
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Device Details Grid */}
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                <Card>
                  <CardHeader>
                    <CardTitle className='text-base'>
                      Technical Specifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div className='flex items-center justify-between border-b py-2'>
                      <span className='text-muted-foreground text-sm'>
                        Device ID
                      </span>
                      <span className='font-mono text-sm font-medium'>
                        {selectedDevice.id}
                      </span>
                    </div>
                    <div className='flex items-center justify-between border-b py-2'>
                      <span className='text-muted-foreground text-sm'>
                        Sensor Model
                      </span>
                      <span className='text-sm font-medium'>
                        {selectedDevice.model || 'N/A'}
                      </span>
                    </div>
                    {selectedDevice.installationHeight && (
                      <div className='flex items-center justify-between border-b py-2'>
                        <span className='text-muted-foreground text-sm'>
                          Installation Height
                        </span>
                        <span className='flex items-center gap-1 text-sm font-medium'>
                          <Ruler className='h-3 w-3' />{' '}
                          {selectedDevice.installationHeight.toFixed(1)}m
                        </span>
                      </div>
                    )}
                    <div className='flex items-center justify-between border-b py-2'>
                      <span className='text-muted-foreground text-sm'>
                        Calibration Offset
                      </span>
                      <span className='text-sm font-medium'>
                        {selectedDevice.calibrationOffset
                          ? `+${selectedDevice.calibrationOffset}m`
                          : '0m'}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className='text-base'>
                      Health & Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div className='flex items-center justify-between rounded-lg border bg-slate-50 p-3'>
                      <div className='flex items-center gap-3'>
                        <div className='rounded-full bg-emerald-100 p-2'>
                          <Activity className='h-4 w-4 text-emerald-600' />
                        </div>
                        <div>
                          <p className='text-sm font-medium'>Last Heartbeat</p>
                          <p className='text-muted-foreground text-xs'>
                            {formatDate(selectedDevice.lastHeartbeat)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className='flex items-center justify-between rounded-lg border bg-slate-50 p-3'>
                      <div className='flex items-center gap-3'>
                        <div className='rounded-full bg-blue-100 p-2'>
                          <Battery className='h-4 w-4 text-blue-600' />
                        </div>
                        <div>
                          <p className='text-sm font-medium'>Battery Status</p>
                          <p className='text-muted-foreground text-xs'>
                            {selectedDevice.batteryLevel}% (Healthy)
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className='grid grid-cols-2 gap-3 pt-2'>
                      <Button variant='outline' className='h-9 text-xs'>
                        Calibrate Sensor
                      </Button>
                      <Button
                        variant='outline'
                        className='h-9 text-xs text-red-600 hover:bg-red-50 hover:text-red-700'
                      >
                        Reset Device
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <div className='text-muted-foreground flex h-full items-center justify-center'>
              Select a device to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Export named for compatibility
export { SensorsPage as SensorsView };
