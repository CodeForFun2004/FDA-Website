'use client';

import {
  IconTrendingUp,
  IconTrendingDown,
  IconDroplets,
  IconClock,
  IconAlertTriangle
} from '@tabler/icons-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { FloodStatisticsDto } from '../types/flood-history.type';

interface FloodKpiCardsProps {
  statistics: FloodStatisticsDto[];
  isLoading?: boolean;
}

export function FloodKpiCards({ statistics, isLoading }: FloodKpiCardsProps) {
  if (isLoading) {
    return (
      <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4'>
        {[...Array(4)].map((_, i) => (
          <Card key={i} className='@container/card animate-pulse'>
            <CardHeader className='flex flex-col space-y-0 pb-2'>
              <CardDescription className='bg-muted h-4 rounded'></CardDescription>
              <CardTitle className='bg-muted mt-2 h-8 rounded'></CardTitle>
            </CardHeader>
            <CardContent>
              <div className='bg-muted h-4 rounded'></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!statistics || statistics.length === 0) {
    return (
      <div className='text-muted-foreground py-8 text-center'>
        No statistics available
      </div>
    );
  }

  // Use first station's data for single station, or aggregate for multiple
  const stats = statistics[0];
  const isMultiple = statistics.length > 1;

  const kpis = [
    {
      title: 'Max Water Level',
      value: `${stats.summary.maxWaterLevel} cm`,
      description: isMultiple
        ? 'Highest across selected stations'
        : stats.stationName,
      icon: IconDroplets,
      trend: stats.comparison?.avgLevelChange,
      color: 'text-blue-600'
    },
    {
      title: 'Avg Water Level',
      value: `${stats.summary.avgWaterLevel} cm`,
      description: isMultiple
        ? 'Average across selected stations'
        : stats.stationName,
      icon: IconDroplets,
      trend: stats.comparison?.avgLevelChange,
      color: 'text-blue-500'
    },
    {
      title: 'Total Flood Hours',
      value: `${stats.summary.totalFloodHours}h`,
      description: isMultiple ? 'Combined flood hours' : stats.stationName,
      icon: IconClock,
      trend: stats.comparison?.floodHoursChange,
      color: 'text-orange-600'
    },
    {
      title: 'Data Completeness',
      value: `${stats.dataQuality?.completeness ?? 95}%`,
      description: isMultiple
        ? 'Average completeness'
        : `${stats.summary.missingIntervals} missing intervals`,
      icon: IconAlertTriangle,
      trend: null,
      color:
        (stats.dataQuality?.completeness ?? 95) > 90
          ? 'text-green-600'
          : 'text-yellow-600'
    }
  ];

  return (
    <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4'>
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        const trendValue = kpi.trend;
        const isPositive =
          trendValue !== null && trendValue !== undefined && trendValue > 0;

        return (
          <Card key={index} className='@container/card'>
            <CardHeader className='flex flex-col space-y-0 pb-2'>
              <CardDescription className='flex items-center gap-1.5'>
                <Icon className={`h-4 w-4 ${kpi.color}`} />
                {kpi.title}
              </CardDescription>
              <CardTitle
                className={`text-2xl font-semibold tabular-nums @[250px]/card:text-3xl ${kpi.color}`}
              >
                {kpi.value}
              </CardTitle>
            </CardHeader>
            <CardContent className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                {kpi.description}
              </div>
              {trendValue !== null && trendValue !== undefined && (
                <div className='flex items-center gap-1'>
                  <Badge
                    variant='outline'
                    className={`${
                      isPositive
                        ? 'border-green-200 text-green-600'
                        : 'border-red-200 text-red-600'
                    }`}
                  >
                    {isPositive ? (
                      <IconTrendingUp className='mr-1 h-3 w-3' />
                    ) : (
                      <IconTrendingDown className='mr-1 h-3 w-3' />
                    )}
                    {Math.abs(trendValue)}%
                  </Badge>
                  <span className='text-muted-foreground text-xs'>
                    vs previous period
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
