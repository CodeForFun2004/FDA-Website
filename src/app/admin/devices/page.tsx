"use client";

import React from 'react';
import { useDevices } from '@/lib/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge, Button, Card, CardContent, CardHeader, LoadingState } from '@/components/ui/common';
import { formatDate } from '@/lib/utils';
import { Plus, Battery, BatteryWarning } from 'lucide-react';

export default function DevicesPage() {
  const { data: devices, isLoading } = useDevices();

  if (isLoading) return <LoadingState />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">IoT Devices</h1>
        <Button><Plus className="mr-2 h-4 w-4" /> Register Device</Button>
      </div>

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
                <TableRow key={device.id}>
                  <TableCell>
                     <div className={`h-2.5 w-2.5 rounded-full ${device.status === 'Online' ? 'bg-emerald-500' : device.status === 'Offline' ? 'bg-red-500' : 'bg-orange-400'}`} />
                  </TableCell>
                  <TableCell className="font-medium">{device.name} <span className="text-xs text-muted-foreground block">{device.id}</span></TableCell>
                  <TableCell>{device.type}</TableCell>
                  <TableCell>{device.location}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                        {device.batteryLevel < 20 ? <BatteryWarning className="h-4 w-4 text-red-500"/> : <Battery className="h-4 w-4 text-emerald-500"/>}
                        {device.batteryLevel}%
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(device.lastHeartbeat)}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">Config</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}