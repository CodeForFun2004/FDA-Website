"use client";

import React from 'react';
import { useAlerts } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, LoadingState } from '@/components/ui/common';
import { formatDate } from '@/lib/utils';
import { AlertTriangle, CheckCircle } from 'lucide-react';

export default function AlertsPage() {
  const { data: alerts, isLoading } = useAlerts();

  if (isLoading) return <LoadingState />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Flood Alerts</h1>
      </div>

      <div className="grid gap-4">
        {alerts?.map((alert) => (
            <Card key={alert.id} className="border-l-4 border-l-transparent data-[severity=High]:border-l-red-500 data-[severity=Medium]:border-l-orange-500" data-severity={alert.severity}>
                <CardContent className="flex items-center p-4">
                    <div className="mr-4">
                        {alert.severity === 'High' ? (
                            <div className="p-2 bg-red-100 rounded-full dark:bg-red-900/30">
                                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                            </div>
                        ) : (
                            <div className="p-2 bg-orange-100 rounded-full dark:bg-orange-900/30">
                                <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{alert.message}</h3>
                            <Badge variant={alert.severity === 'High' ? 'destructive' : 'warning'}>{alert.severity}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{alert.zone} • Triggered at {formatDate(alert.timestamp)}</p>
                    </div>
                    <div className="flex gap-2">
                        {alert.status !== 'Resolved' && (
                            <Button size="sm" variant="outline"><CheckCircle className="mr-2 h-4 w-4"/> Acknowledge</Button>
                        )}
                        <Button size="sm" variant="ghost">View Map</Button>
                    </div>
                </CardContent>
            </Card>
        ))}
      </div>
    </div>
  );
}