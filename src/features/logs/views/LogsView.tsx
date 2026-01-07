// src/features/logs/views/LogsView.tsx
"use client";

import React, { useState, useMemo } from 'react';
import { useSystemLogs, type SystemLog } from '../index';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow, 
  Badge, Button, Card, CardContent, CardHeader, LoadingState, Input 
} from '@/components/ui/common';
import { formatDate } from '@/lib/utils';
import { Search, Download, Filter, AlertCircle, Info, AlertTriangle, XCircle } from 'lucide-react';

// ===== Sub-components =====

type LogLevelBadgeProps = {
  level: SystemLog['level'];
};

const LogLevelBadge = ({ level }: LogLevelBadgeProps) => {
  const config = {
    INFO: { className: 'bg-blue-100 text-blue-700', icon: Info },
    WARNING: { className: 'bg-orange-100 text-orange-700', icon: AlertTriangle },
    ERROR: { className: 'bg-red-100 text-red-700', icon: XCircle },
    CRITICAL: { className: 'bg-red-200 text-red-800 font-bold', icon: AlertCircle },
  };
  
  const { className, icon: Icon } = config[level];
  
  return (
    <Badge className={`${className} flex items-center gap-1 w-fit`}>
      <Icon className="h-3 w-3" />
      {level}
    </Badge>
  );
};

type SourceBadgeProps = {
  source: SystemLog['source'];
};

const SourceBadge = ({ source }: SourceBadgeProps) => (
  <Badge variant="outline">{source}</Badge>
);

type LogRowProps = {
  log: SystemLog;
};

const LogRow = ({ log }: LogRowProps) => (
  <TableRow className={log.level === 'CRITICAL' ? 'bg-red-50 dark:bg-red-950/20' : ''}>
    <TableCell>
      <LogLevelBadge level={log.level} />
    </TableCell>
    <TableCell>{formatDate(log.timestamp)}</TableCell>
    <TableCell>
      <SourceBadge source={log.source} />
    </TableCell>
    <TableCell className="font-medium">{log.action}</TableCell>
    <TableCell className="max-w-xs truncate">{log.details}</TableCell>
    <TableCell className="text-muted-foreground text-sm">{log.userOrDeviceId}</TableCell>
  </TableRow>
);

// ===== Main View Component =====

export type LogsViewProps = {
  onExportLogs?: () => void;
};

export function LogsView({ onExportLogs }: LogsViewProps) {
  const { data: logs, isLoading } = useSystemLogs();
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<SystemLog['level'] | 'all'>('all');
  const [sourceFilter, setSourceFilter] = useState<SystemLog['source'] | 'all'>('all');

  // Business logic: filter and calculate statistics
  const filteredLogs = useMemo(() => {
    if (!logs) return [];
    
    return logs.filter(log => {
      const matchesSearch = !search.trim() || 
        log.action.toLowerCase().includes(search.toLowerCase()) ||
        log.details.toLowerCase().includes(search.toLowerCase()) ||
        (log.userOrDeviceId?.toLowerCase().includes(search.toLowerCase()) ?? false);
      
      const matchesLevel = levelFilter === 'all' || log.level === levelFilter;
      const matchesSource = sourceFilter === 'all' || log.source === sourceFilter;
      
      return matchesSearch && matchesLevel && matchesSource;
    });
  }, [logs, search, levelFilter, sourceFilter]);

  const stats = useMemo(() => ({
    total: logs?.length ?? 0,
    critical: logs?.filter(l => l.level === 'CRITICAL').length ?? 0,
    error: logs?.filter(l => l.level === 'ERROR').length ?? 0,
    warning: logs?.filter(l => l.level === 'WARNING').length ?? 0,
    info: logs?.filter(l => l.level === 'INFO').length ?? 0,
  }), [logs]);

  if (isLoading) return <LoadingState />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">System Logs</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {stats.total} entries • 
            <span className="text-red-600"> {stats.critical} critical</span> • 
            <span className="text-red-500"> {stats.error} errors</span> • 
            <span className="text-orange-500"> {stats.warning} warnings</span>
          </p>
        </div>
        <Button variant="outline" onClick={onExportLogs}>
          <Download className="mr-2 h-4 w-4" /> Export Logs
        </Button>
      </div>

      {/* Critical Alert */}
      {stats.critical > 0 && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <p className="text-sm text-red-700 dark:text-red-400">
            <strong>{stats.critical} critical event(s)</strong> require immediate attention
          </p>
        </div>
      )}

      {/* Filters & Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search logs..." 
                className="pl-8" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <span className="text-sm text-muted-foreground self-center">Level:</span>
              {(['all', 'CRITICAL', 'ERROR', 'WARNING', 'INFO'] as const).map(level => (
                <Button
                  key={level}
                  variant={levelFilter === level ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLevelFilter(level)}
                >
                  {level === 'all' ? 'All' : level}
                </Button>
              ))}
            </div>
            
            <div className="flex gap-2">
              <span className="text-sm text-muted-foreground self-center">Source:</span>
              {(['all', 'System', 'User', 'Sensor', 'Alert'] as const).map(source => (
                <Button
                  key={source}
                  variant={sourceFilter === source ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSourceFilter(source)}
                >
                  {source === 'all' ? 'All' : source}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Level</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>User/Device</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <LogRow key={log.id} log={log} />
              ))}
            </TableBody>
          </Table>
          
          {filteredLogs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No logs found matching your filters.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
