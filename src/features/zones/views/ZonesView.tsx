// src/features/zones/views/ZonesView.tsx
"use client";

import React, { useMemo } from 'react';
import { useZones, type Zone } from '../index';
import { 
  Card, CardContent, CardHeader, CardTitle, Badge, Button, LoadingState 
} from '@/components/ui/common';
import { Plus, MapPin, Users, Radio, AlertTriangle } from 'lucide-react';

// ===== Sub-components =====

type RiskBadgeProps = {
  riskLevel: Zone['riskLevel'];
};

const RiskBadge = ({ riskLevel }: RiskBadgeProps) => {
  const config = {
    Safe: { variant: 'success' as const, className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    Watch: { variant: 'secondary' as const, className: 'bg-orange-100 text-orange-700 border-orange-200' },
    Flooded: { variant: 'destructive' as const, className: 'bg-red-100 text-red-700 border-red-200' },
  };
  
  return (
    <Badge className={config[riskLevel].className}>
      {riskLevel}
    </Badge>
  );
};

type ZoneCardProps = {
  zone: Zone;
  onViewZone?: (zone: Zone) => void;
};

const ZoneCard = ({ zone, onViewZone }: ZoneCardProps) => (
  <Card 
    className={`cursor-pointer hover:shadow-md transition-shadow ${
      zone.riskLevel === 'Flooded' ? 'border-red-200 dark:border-red-900' :
      zone.riskLevel === 'Watch' ? 'border-orange-200 dark:border-orange-900' :
      ''
    }`}
    onClick={() => onViewZone?.(zone)}
  >
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <CardTitle className="text-lg">{zone.name}</CardTitle>
        <RiskBadge riskLevel={zone.riskLevel} />
      </div>
      <Badge variant="outline" className="w-fit">{zone.type}</Badge>
    </CardHeader>
    <CardContent>
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Radio className="h-4 w-4" />
          <span>{zone.deviceCount} devices</span>
        </div>
        {zone.population && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{zone.population.toLocaleString()} residents</span>
          </div>
        )}
        {zone.details && (
          <p className="text-muted-foreground mt-2 line-clamp-2">{zone.details}</p>
        )}
      </div>
    </CardContent>
  </Card>
);

// ===== Main View Component =====

export type ZonesViewProps = {
  onAddZone?: () => void;
  onViewZone?: (zone: Zone) => void;
};

export function ZonesView({ onAddZone, onViewZone }: ZonesViewProps) {
  const { data: zones, isLoading } = useZones();

  // Business logic: group and calculate statistics
  const { districts, hotspots, stats } = useMemo(() => {
    const districts = zones?.filter(z => z.type === 'District') ?? [];
    const hotspots = zones?.filter(z => z.type === 'Custom') ?? [];
    
    return {
      districts,
      hotspots,
      stats: {
        total: zones?.length ?? 0,
        safe: zones?.filter(z => z.riskLevel === 'Safe').length ?? 0,
        watch: zones?.filter(z => z.riskLevel === 'Watch').length ?? 0,
        flooded: zones?.filter(z => z.riskLevel === 'Flooded').length ?? 0,
        totalDevices: zones?.reduce((sum, z) => sum + z.deviceCount, 0) ?? 0,
        totalPopulation: zones?.reduce((sum, z) => sum + (z.population ?? 0), 0) ?? 0,
      }
    };
  }, [zones]);

  if (isLoading) return <LoadingState />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MapPin className="h-6 w-6 text-emerald-500" />
            Monitored Zones
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {stats.total} zones • {stats.totalDevices} devices • {stats.totalPopulation.toLocaleString()} residents covered
          </p>
        </div>
        <Button onClick={onAddZone}>
          <Plus className="mr-2 h-4 w-4" /> Add Zone
        </Button>
      </div>

      {/* Flooded Zones Alert */}
      {stats.flooded > 0 && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <p className="text-sm text-red-700 dark:text-red-400">
            <strong>{stats.flooded} zone(s)</strong> are currently flooded
          </p>
        </div>
      )}

      {/* Risk Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-emerald-700 font-medium">Safe Zones</p>
              <p className="text-2xl font-bold text-emerald-800">{stats.safe}</p>
            </div>
            <MapPin className="h-8 w-8 text-emerald-500" />
          </CardContent>
        </Card>
        <Card className="bg-orange-50 dark:bg-orange-950/20 border-orange-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-orange-700 font-medium">Watch Zones</p>
              <p className="text-2xl font-bold text-orange-800">{stats.watch}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-500" />
          </CardContent>
        </Card>
        <Card className="bg-red-50 dark:bg-red-950/20 border-red-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-red-700 font-medium">Flooded Zones</p>
              <p className="text-2xl font-bold text-red-800">{stats.flooded}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </CardContent>
        </Card>
      </div>

      {/* Districts */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Districts</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {districts.map(zone => (
            <ZoneCard key={zone.id} zone={zone} onViewZone={onViewZone} />
          ))}
        </div>
      </div>

      {/* Flood Hotspots */}
      {hotspots.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Flood Hotspots</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {hotspots.map(zone => (
              <ZoneCard key={zone.id} zone={zone} onViewZone={onViewZone} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
