'use client';

import { IconAlertTriangle, IconCircleCheck } from '@tabler/icons-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { FloodStatisticsDto } from '../types/flood-history.type';

interface FloodDataQualityProps {
  statistics: FloodStatisticsDto | null;
  isCompareMode?: boolean;
  isLoading?: boolean;
}

export function FloodDataQuality({
  statistics,
  isCompareMode,
  isLoading
}: FloodDataQualityProps) {
  if (isLoading) {
    return (
      <Card className='@container/card'>
        <CardHeader>
          <div className='bg-muted h-6 animate-pulse rounded'></div>
          <div className='bg-muted mt-2 h-4 animate-pulse rounded'></div>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            {[...Array(3)].map((_, i) => (
              <div key={i} className='bg-muted h-4 animate-pulse rounded'></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isCompareMode) {
    return (
      <Card className='@container/card'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <IconAlertTriangle className='text-muted-foreground h-5 w-5' />
            Data Quality
          </CardTitle>
          <CardDescription>
            Quality metrics for selected stations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='text-muted-foreground py-6 text-center'>
            <IconAlertTriangle className='mx-auto mb-2 h-8 w-8 opacity-50' />
            <p className='text-sm'>
              Select a single station to see detailed missing intervals and data
              quality metrics.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!statistics?.dataQuality) {
    return (
      <Card className='@container/card'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <IconCircleCheck className='h-5 w-5 text-green-600' />
            Data Quality
          </CardTitle>
          <CardDescription>No quality data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='text-muted-foreground py-6 text-center'>
            No data quality information available
          </div>
        </CardContent>
      </Card>
    );
  }

  const completenessValue = statistics.dataQuality?.completeness ?? null;
  const completeness = completenessValue ?? 0;
  const missingIntervals = statistics.dataQuality?.missingIntervals ?? [];
  const isGoodQuality = completenessValue !== null && completenessValue >= 95;
  const hasMissingIntervals = missingIntervals.length > 0;
  const completenessLabel =
    completenessValue === null ? 'N/A' : `${completenessValue}%`;

  return (
    <Card className='@container/card'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          {isGoodQuality ? (
            <IconCircleCheck className='h-5 w-5 text-green-600' />
          ) : (
            <IconAlertTriangle className='h-5 w-5 text-yellow-600' />
          )}
          Data Quality
        </CardTitle>
        <CardDescription>
          {statistics.stationName} - Data completeness and missing intervals
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Completeness Score */}
        <div className='flex items-center justify-between'>
          <span className='text-sm font-medium'>Completeness</span>
          <Badge
            variant={isGoodQuality ? 'default' : 'secondary'}
            className={
              isGoodQuality
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }
          >
            {completenessLabel}
          </Badge>
        </div>

        {/* Missing Intervals */}
        {hasMissingIntervals ? (
          <div className='space-y-3'>
            <div className='text-muted-foreground text-sm font-medium'>
              Missing Intervals ({missingIntervals.length})
            </div>
            <div className='max-h-40 space-y-2 overflow-y-auto'>
              {missingIntervals.map((interval, index) => (
                <div
                  key={index}
                  className='bg-muted/50 flex items-center justify-between rounded-md p-2 text-xs'
                >
                  <div className='flex flex-col'>
                    <span className='font-medium'>
                      {new Date(interval.start).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    <span className='text-muted-foreground'>
                      to{' '}
                      {new Date(interval.end).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <Badge variant='outline' className='text-xs'>
                    {interval.durationMinutes}min
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className='text-muted-foreground py-4 text-center'>
            <IconCircleCheck className='mx-auto mb-2 h-6 w-6 text-green-600' />
            <p className='text-sm'>No missing intervals detected</p>
          </div>
        )}

        {/* Quality Summary */}
        <div className='border-t pt-2'>
          <div className='text-muted-foreground text-xs'>
            Total readings: {statistics.summary.totalReadings} | Missing
            intervals: {statistics.summary.missingIntervals}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
