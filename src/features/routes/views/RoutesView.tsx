// src/features/routes/views/RoutesView.tsx
"use client";

import React, { useMemo } from 'react';
import { useRoutes, type Route } from '../index';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow, 
  Badge, Button, Card, CardContent, LoadingState 
} from '@/components/ui/common';
import { formatDate } from '@/lib/utils';
import { Plus, Navigation, MapPin, AlertTriangle, CheckCircle } from 'lucide-react';

// ===== Sub-components =====

type RouteStatusBadgeProps = {
  status: Route['status'];
};

const RouteStatusBadge = ({ status }: RouteStatusBadgeProps) => {
  const config = {
    Open: { variant: 'success' as const, icon: CheckCircle, label: 'Open' },
    Risky: { variant: 'secondary' as const, icon: AlertTriangle, label: 'Risky' },
    Blocked: { variant: 'destructive' as const, icon: AlertTriangle, label: 'Blocked' },
  };
  
  const { variant, icon: Icon, label } = config[status];
  
  return (
    <Badge variant={variant} className="flex items-center gap-1 w-fit">
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
};

type RouteRowProps = {
  route: Route;
  onViewRoute?: (route: Route) => void;
  onEditRoute?: (route: Route) => void;
};

const RouteRow = ({ route, onViewRoute, onEditRoute }: RouteRowProps) => (
  <TableRow>
    <TableCell className="font-medium">{route.name}</TableCell>
    <TableCell>
      <div className="flex items-center gap-1">
        <MapPin className="h-4 w-4 text-emerald-500" />
        {route.startPoint}
      </div>
    </TableCell>
    <TableCell>
      <div className="flex items-center gap-1">
        <MapPin className="h-4 w-4 text-red-500" />
        {route.endPoint}
      </div>
    </TableCell>
    <TableCell>
      <RouteStatusBadge status={route.status} />
    </TableCell>
    <TableCell>{formatDate(route.lastUpdated)}</TableCell>
    <TableCell>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => onViewRoute?.(route)}>
          <Navigation className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onEditRoute?.(route)}>
          Edit
        </Button>
      </div>
    </TableCell>
  </TableRow>
);

// ===== Main View Component =====

export type RoutesViewProps = {
  onAddRoute?: () => void;
  onViewRoute?: (route: Route) => void;
  onEditRoute?: (route: Route) => void;
};

export function RoutesView({ onAddRoute, onViewRoute, onEditRoute }: RoutesViewProps) {
  const { data: routes, isLoading } = useRoutes();

  // Business logic: calculate statistics
  const stats = useMemo(() => ({
    total: routes?.length ?? 0,
    open: routes?.filter(r => r.status === 'Open').length ?? 0,
    risky: routes?.filter(r => r.status === 'Risky').length ?? 0,
    blocked: routes?.filter(r => r.status === 'Blocked').length ?? 0,
  }), [routes]);

  if (isLoading) return <LoadingState />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Navigation className="h-6 w-6 text-blue-500" />
            Safe Routes
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {stats.total} routes • 
            <span className="text-emerald-600"> {stats.open} open</span> • 
            <span className="text-orange-500"> {stats.risky} risky</span> • 
            <span className="text-red-600"> {stats.blocked} blocked</span>
          </p>
        </div>
        <Button onClick={onAddRoute}>
          <Plus className="mr-2 h-4 w-4" /> Add Route
        </Button>
      </div>

      {/* Blocked Routes Alert */}
      {stats.blocked > 0 && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <p className="text-sm text-red-700 dark:text-red-400">
            <strong>{stats.blocked} route(s)</strong> are currently blocked due to flooding
          </p>
        </div>
      )}

      {/* Routes Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Route Name</TableHead>
                <TableHead>Start Point</TableHead>
                <TableHead>End Point</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {routes?.map((route) => (
                <RouteRow 
                  key={route.id} 
                  route={route}
                  onViewRoute={onViewRoute}
                  onEditRoute={onEditRoute}
                />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
