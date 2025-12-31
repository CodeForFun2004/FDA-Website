"use client";

import React, { useState } from 'react';
import { useSystemLogs } from '@/lib/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge, Button, Input, Card, CardHeader, CardTitle, CardContent, LoadingState } from '@/components/ui/common';
import { formatDate } from '@/lib/utils';
import { Search, Filter, Download, AlertCircle, Info, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function LogsPage() {
  const { data: logs, isLoading } = useSystemLogs();
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('ALL');

  const filteredLogs = logs?.filter(log => {
    const matchesSearch = 
        log.action.toLowerCase().includes(search.toLowerCase()) || 
        log.details.toLowerCase().includes(search.toLowerCase()) ||
        log.source.toLowerCase().includes(search.toLowerCase());
    
    const matchesLevel = levelFilter === 'ALL' || log.level === levelFilter;

    return matchesSearch && matchesLevel;
  });

  if (isLoading) return <LoadingState />;

  const getLevelBadge = (level: string) => {
      switch(level) {
          case 'CRITICAL': return <Badge variant="destructive" className="flex w-fit items-center gap-1"><AlertCircle className="h-3 w-3"/> CRITICAL</Badge>;
          case 'ERROR': return <Badge variant="destructive" className="flex w-fit items-center gap-1 bg-red-100 text-red-700 hover:bg-red-200"><AlertTriangle className="h-3 w-3"/> ERROR</Badge>;
          case 'WARNING': return <Badge variant="warning" className="flex w-fit items-center gap-1"><AlertTriangle className="h-3 w-3"/> WARNING</Badge>;
          default: return <Badge variant="secondary" className="flex w-fit items-center gap-1 text-blue-700 bg-blue-50 hover:bg-blue-100"><Info className="h-3 w-3"/> INFO</Badge>;
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold">System Logs & Audit</h1>
            <p className="text-muted-foreground">Track system events, alerts, and user activities.</p>
        </div>
        <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export CSV</Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
           <div className="flex flex-col md:flex-row gap-4 justify-between">
               <div className="relative w-full md:w-80">
                 <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                 <Input 
                    placeholder="Search logs..." 
                    className="pl-8" 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                 />
               </div>
               <div className="flex gap-2">
                   {['ALL', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'].map((level) => (
                       <button
                          key={level}
                          onClick={() => setLevelFilter(level)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${levelFilter === level ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
                       >
                           {level}
                       </button>
                   ))}
               </div>
           </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Timestamp</TableHead>
                <TableHead className="w-[120px]">Level</TableHead>
                <TableHead className="w-[100px]">Source</TableHead>
                <TableHead>Event</TableHead>
                <TableHead className="text-right">User / Device</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs?.length === 0 ? (
                  <TableRow>
                      <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">No logs found matching your criteria.</TableCell>
                  </TableRow>
              ) : (
                  filteredLogs?.map((log) => (
                    <TableRow key={log.id} className="group">
                      <TableCell className="text-muted-foreground font-mono text-xs">
                          {formatDate(log.timestamp)}
                      </TableCell>
                      <TableCell>{getLevelBadge(log.level)}</TableCell>
                      <TableCell>
                          <span className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">{log.source}</span>
                      </TableCell>
                      <TableCell>
                          <div className="flex flex-col">
                              <span className="font-medium text-sm text-foreground">{log.action}</span>
                              <span className="text-xs text-muted-foreground truncate max-w-md" title={log.details}>{log.details}</span>
                          </div>
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-muted-foreground">
                        {log.userOrDeviceId || '-'}
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
