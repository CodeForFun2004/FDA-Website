'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  IconFilter,
  IconChevronDown,
  IconChevronUp
} from '@tabler/icons-react';
import {
  PeriodPreset,
  TrendsGranularity,
  HistoryGranularity,
  mockStations,
  UUID
} from '../mock';

export type ViewMode = 'trend' | 'detailed-history';

export interface FloodFilterState {
  stationId: UUID;
  stationIds: UUID[];
  compare: boolean;
  period: PeriodPreset;
  viewMode: ViewMode;
  compareWithPrevious: boolean;
}

interface FloodFilterBarProps {
  filters: FloodFilterState;
  onFiltersChange: (filters: FloodFilterState) => void;
  onApply: () => void;
}

export function FloodFilterBar({
  filters,
  onFiltersChange,
  onApply
}: FloodFilterBarProps) {
  const [isClient, setIsClient] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const updateFilters = (updates: Partial<FloodFilterState>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const handleStationChange = (stationId: string) => {
    if (filters.compare) {
      // In compare mode, toggle selection
      const currentIds = filters.stationIds;
      if (currentIds.includes(stationId)) {
        // Remove if already selected (but keep at least 1)
        const newIds = currentIds.filter((id) => id !== stationId);
        updateFilters({ stationIds: newIds.length > 0 ? newIds : [stationId] });
      } else {
        // Add if not selected (max 3)
        if (currentIds.length < 3) {
          updateFilters({ stationIds: [...currentIds, stationId] });
        }
      }
    } else {
      // Single station mode
      updateFilters({ stationId, stationIds: [stationId] });
    }
  };

  const handleCompareToggle = (compare: boolean) => {
    updateFilters({
      compare,
      stationIds: compare ? [filters.stationId] : [filters.stationId],
      viewMode: compare ? 'detailed-history' : filters.viewMode
    });
  };

  const handleViewModeChange = (viewMode: ViewMode) => {
    updateFilters({ viewMode });
  };

  if (!isClient) {
    return null;
  }

  return (
    <Card className='bg-background/95 supports-[backdrop-filter]:bg-background/95 sticky top-4 max-w-md shadow-lg backdrop-blur'>
      {/* Compact Header with Toggle */}
      <CardHeader
        className='cursor-pointer pb-2'
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <IconFilter className='text-primary h-4 w-4' />
            <CardTitle className='text-base font-semibold'>Filters</CardTitle>
          </div>
          <div className='flex items-center gap-2'>
            <Badge variant='secondary' className='text-xs'>
              {filters.compare
                ? `${filters.stationIds.length} stations`
                : '1 station'}
            </Badge>
            {isExpanded ? (
              <IconChevronUp className='text-muted-foreground h-4 w-4' />
            ) : (
              <IconChevronDown className='text-muted-foreground h-4 w-4' />
            )}
          </div>
        </div>
      </CardHeader>

      {/* Collapsible Content */}
      {isExpanded && (
        <CardContent className='space-y-3 pt-2'>
          {/* Station Selection */}
          <div className='space-y-1.5'>
            <Label className='text-muted-foreground text-xs font-medium'>
              Station{filters.compare ? 's' : ''}
            </Label>
            <div className='mb-2 flex items-center space-x-2'>
              <Switch
                id='compare-mode'
                checked={filters.compare}
                onCheckedChange={handleCompareToggle}
                className='scale-75'
              />
              <Label htmlFor='compare-mode' className='cursor-pointer text-xs'>
                Compare Mode (max 3)
              </Label>
            </div>

            {filters.compare ? (
              <div className='grid grid-cols-1 gap-1.5'>
                {mockStations.map((station) => {
                  const isSelected = filters.stationIds.includes(station.id);
                  return (
                    <Button
                      key={station.id}
                      variant={isSelected ? 'default' : 'outline'}
                      size='sm'
                      onClick={() => handleStationChange(station.id)}
                      className='h-8 justify-start text-xs'
                    >
                      <span className='truncate'>
                        {station.name.replace('Station ', '')}
                      </span>
                      {isSelected && <span className='ml-auto'>✓</span>}
                    </Button>
                  );
                })}
              </div>
            ) : (
              <Select
                value={filters.stationId}
                onValueChange={(value) =>
                  updateFilters({ stationId: value, stationIds: [value] })
                }
              >
                <SelectTrigger className='h-9 w-full text-xs'>
                  <SelectValue placeholder='Select a station' />
                </SelectTrigger>
                <SelectContent>
                  {mockStations.map((station) => (
                    <SelectItem
                      key={station.id}
                      value={station.id}
                      className='text-xs'
                    >
                      {station.name} ({station.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Period Selection */}
          <div className='space-y-1.5'>
            <Label className='text-muted-foreground text-xs font-medium'>
              Period
            </Label>
            <Select
              value={filters.period}
              onValueChange={(value) =>
                updateFilters({ period: value as PeriodPreset })
              }
            >
              <SelectTrigger className='h-9 w-full text-xs'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='last24hours' className='text-xs'>
                  Last 24 Hours
                </SelectItem>
                <SelectItem value='last7days' className='text-xs'>
                  Last 7 Days
                </SelectItem>
                <SelectItem value='last30days' className='text-xs'>
                  Last 30 Days
                </SelectItem>
                <SelectItem value='last90days' className='text-xs'>
                  Last 90 Days
                </SelectItem>
                <SelectItem value='last365days' className='text-xs'>
                  Last 365 Days
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* View Mode Selection */}
          <div className='space-y-1.5'>
            <Label className='text-muted-foreground text-xs font-medium'>
              View Mode
            </Label>
            <Select
              value={filters.viewMode}
              onValueChange={(value) => handleViewModeChange(value as ViewMode)}
            >
              <SelectTrigger className='h-9 w-full text-xs'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='trend' className='text-xs'>
                  Trend Analysis
                </SelectItem>
                <SelectItem value='detailed-history' className='text-xs'>
                  Detailed History
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Compare with Previous Toggle */}
          {filters.viewMode === 'trend' && !filters.compare && (
            <div className='flex items-center space-x-2 py-1'>
              <Switch
                id='compare-previous'
                checked={filters.compareWithPrevious}
                onCheckedChange={(checked) =>
                  updateFilters({ compareWithPrevious: checked })
                }
                className='scale-75'
              />
              <Label
                htmlFor='compare-previous'
                className='cursor-pointer text-xs'
              >
                Compare vs Previous
              </Label>
            </div>
          )}

          {/* Apply Button */}
          <Button onClick={onApply} className='h-9 w-full text-xs' size='sm'>
            <IconFilter className='mr-1.5 h-3 w-3' />
            Apply Filters
          </Button>
        </CardContent>
      )}
    </Card>
  );
}
