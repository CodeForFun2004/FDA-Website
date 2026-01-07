// src/features/alerts/views/AlertsView.tsx
"use client";

import React, { useMemo, useState } from 'react';
import { useAlerts, type Alert } from '../index';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow, 
  Badge, Button, Card, CardContent, CardHeader, LoadingState,
  Input
} from '@/components/ui/common';
import { formatDate } from '@/lib/utils';
import { Plus, AlertTriangle, CheckCircle, Eye, Search, Filter } from 'lucide-react';

// ===== Sub-components =====

type SeverityBadgeProps = {
  severity: Alert['severity'];
};

const SeverityBadge = ({ severity }: SeverityBadgeProps) => {
  const variants: Record<Alert['severity'], string> = {
    Critical: 'bg-red-100 text-red-700 border-red-200',
    High: 'bg-orange-100 text-orange-700 border-orange-200',
    Medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    Low: 'bg-blue-100 text-blue-700 border-blue-200',
  };
  
  return (
    <Badge className={variants[severity]}>
      {severity}
    </Badge>
  );
};

type StatusBadgeProps = {
  status: Alert['status'];
};

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const variants: Record<Alert['status'], 'default' | 'success' | 'secondary'> = {
    New: 'default',
    Acknowledged: 'secondary',
    Resolved: 'success',
  };
  
  return <Badge variant={variants[status]}>{status}</Badge>;
};

type AlertRowProps = {
  alert: Alert;
  onAcknowledge?: (alert: Alert) => void;
  onResolve?: (alert: Alert) => void;
  onView?: (alert: Alert) => void;
};

const AlertRow = ({ alert, onAcknowledge, onResolve, onView }: AlertRowProps) => (
  <TableRow>
    <TableCell>
      <SeverityBadge severity={alert.severity} />
    </TableCell>
    <TableCell className="font-medium max-w-xs truncate">{alert.message}</TableCell>
    <TableCell>{alert.zone}</TableCell>
    <TableCell>{formatDate(alert.timestamp)}</TableCell>
    <TableCell>
      <StatusBadge status={alert.status} />
    </TableCell>
    <TableCell>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => onView?.(alert)}>
          <Eye className="h-4 w-4" />
        </Button>
        {alert.status === 'New' && (
          <Button variant="outline" size="sm" onClick={() => onAcknowledge?.(alert)}>
            Acknowledge
          </Button>
        )}
        {alert.status !== 'Resolved' && (
          <Button variant="ghost" size="sm" onClick={() => onResolve?.(alert)}>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </Button>
        )}
      </div>
    </TableCell>
  </TableRow>
);

// ===== Main View Component =====

export type AlertsViewProps = {
  onCreateAlert?: () => void;
  onAcknowledgeAlert?: (alert: Alert) => void;
  onResolveAlert?: (alert: Alert) => void;
  onViewAlert?: (alert: Alert) => void;
};

export function AlertsView({ onCreateAlert, onAcknowledgeAlert, onResolveAlert, onViewAlert }: AlertsViewProps) {
  const { data: alerts, isLoading } = useAlerts();
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<Alert['severity'] | 'all'>('all');

  // Business logic: filter and calculate statistics
  const filteredAlerts = useMemo(() => {
    if (!alerts) return [];
    
    return alerts.filter(alert => {
      const matchesSearch = !search.trim() || 
        alert.message.toLowerCase().includes(search.toLowerCase()) ||
        alert.zone.toLowerCase().includes(search.toLowerCase());
      
      const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
      
      return matchesSearch && matchesSeverity;
    });
  }, [alerts, search, severityFilter]);

  const stats = useMemo(() => ({
    total: alerts?.length ?? 0,
    new: alerts?.filter(a => a.status === 'New').length ?? 0,
    acknowledged: alerts?.filter(a => a.status === 'Acknowledged').length ?? 0,
    resolved: alerts?.filter(a => a.status === 'Resolved').length ?? 0,
    critical: alerts?.filter(a => a.severity === 'Critical').length ?? 0,
    high: alerts?.filter(a => a.severity === 'High').length ?? 0,
  }), [alerts]);

  if (isLoading) return <LoadingState />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-orange-500" />
            Alerts
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {stats.total} alerts • 
            <span className="text-red-600 font-medium"> {stats.new} new</span> • 
            {stats.acknowledged} acknowledged
          </p>
        </div>
        <Button onClick={onCreateAlert}>
          <Plus className="mr-2 h-4 w-4" /> Create Alert
        </Button>
      </div>

      {/* Critical Alert Banner */}
      {stats.critical > 0 && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <p className="text-sm text-red-700 dark:text-red-400">
            <strong>{stats.critical} critical alert(s)</strong> require immediate attention
          </p>
        </div>
      )}

      {/* Filters & Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search alerts..." 
                className="pl-8" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'Critical', 'High', 'Medium', 'Low'] as const).map(severity => (
                <Button
                  key={severity}
                  variant={severityFilter === severity ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSeverityFilter(severity)}
                >
                  {severity === 'all' ? 'All' : severity}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Severity</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Zone</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAlerts.map((alert) => (
                <AlertRow 
                  key={alert.id} 
                  alert={alert}
                  onAcknowledge={onAcknowledgeAlert}
                  onResolve={onResolveAlert}
                  onView={onViewAlert}
                />
              ))}
            </TableBody>
          </Table>
          
          {filteredAlerts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No alerts found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
