'use client';

import * as React from 'react';
import {
  addDays,
  addMonths,
  addYears,
  endOfDay,
  format,
  startOfDay,
  subDays
} from 'date-fns';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from './Modal';
import { Icons } from './analytics-icons';
import { cn } from '@/libs/utils';
import type {
  AdministrativeArea,
  BucketType,
  FrequencyAggregationRequest,
  HotspotAggregationRequest,
  SeverityAggregationRequest
} from '../types/analytics.types';

export interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobType: 'frequency' | 'severity' | 'hotspots';
  areas: AdministrativeArea[];
  onTrigger: (
    payload:
      | FrequencyAggregationRequest
      | SeverityAggregationRequest
      | HotspotAggregationRequest
  ) => Promise<void>;
}

function toDateInputValue(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

function parseDateInputLocal(dateStr: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

/** Local calendar day start → ISO */
function toStartIsoFromInput(dateStr: string): string {
  const d = parseDateInputLocal(dateStr);
  if (!d) return new Date().toISOString();
  return startOfDay(d).toISOString();
}

/** Local calendar day end → ISO */
function toEndIsoFromInput(dateStr: string): string {
  const d = parseDateInputLocal(dateStr);
  if (!d) return new Date().toISOString();
  return endOfDay(d).toISOString();
}

function bucketEndDateFromStart(
  startInput: string,
  bucket: BucketType
): string {
  const start = parseDateInputLocal(startInput);
  if (!start) return toDateInputValue(new Date());
  let endCal: Date;
  switch (bucket) {
    case 'day':
      endCal = start;
      break;
    case 'week':
      endCal = addDays(start, 6);
      break;
    case 'month':
      endCal = subDays(addMonths(start, 1), 1);
      break;
    case 'year':
      endCal = subDays(addYears(start, 1), 1);
      break;
  }
  return toDateInputValue(endCal);
}

const BUCKETS: BucketType[] = ['day', 'week', 'month', 'year'];

export default function QuickActionModal({
  isOpen,
  onClose,
  jobType,
  areas,
  onTrigger
}: QuickActionModalProps) {
  const todayStr = toDateInputValue(new Date());
  const [bucketType, setBucketType] = React.useState<BucketType>('day');
  const [startDate, setStartDate] = React.useState(todayStr);
  const [endDate, setEndDate] = React.useState(todayStr);
  const [scopeAll, setScopeAll] = React.useState(true);
  const [selectedAreaIds, setSelectedAreaIds] = React.useState<Set<string>>(
    () => new Set()
  );
  const [periodStart, setPeriodStart] = React.useState(todayStr);
  const [periodEnd, setPeriodEnd] = React.useState(
    toDateInputValue(addDays(new Date(), 6))
  );
  const [topN, setTopN] = React.useState(10);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!isOpen) return;
    if (jobType === 'frequency' || jobType === 'severity') {
      setEndDate(bucketEndDateFromStart(startDate, bucketType));
    }
  }, [isOpen, jobType, startDate, bucketType]);

  React.useEffect(() => {
    if (!isOpen) return;
    if (jobType === 'hotspots') {
      const s = parseDateInputLocal(periodStart);
      if (s) {
        setPeriodEnd(toDateInputValue(addDays(s, 6)));
      }
    }
  }, [isOpen, jobType, periodStart]);

  const title =
    jobType === 'frequency'
      ? 'Configure Frequency Analysis'
      : jobType === 'severity'
        ? 'Configure Severity Analysis'
        : 'Configure Hotspot Identification';

  const builtPayload:
    | FrequencyAggregationRequest
    | SeverityAggregationRequest
    | HotspotAggregationRequest
    | null = React.useMemo(() => {
    if (jobType === 'frequency') {
      return {
        bucketType,
        startDate: toStartIsoFromInput(startDate),
        endDate: toEndIsoFromInput(endDate),
        administrativeAreaIds: scopeAll ? [] : Array.from(selectedAreaIds)
      };
    }
    if (jobType === 'severity') {
      return {
        bucketType,
        startDate: toStartIsoFromInput(startDate),
        endDate: toEndIsoFromInput(endDate),
        administrativeAreaIds: scopeAll ? [] : Array.from(selectedAreaIds)
      };
    }
    return {
      periodStart: toStartIsoFromInput(periodStart),
      periodEnd: toEndIsoFromInput(periodEnd),
      topN: Math.min(50, Math.max(1, topN))
    };
  }, [
    jobType,
    bucketType,
    startDate,
    endDate,
    scopeAll,
    selectedAreaIds,
    periodStart,
    periodEnd,
    topN
  ]);

  const canSubmit = React.useMemo(() => {
    if (!builtPayload) return false;
    if (jobType === 'frequency' || jobType === 'severity') {
      if (!scopeAll && selectedAreaIds.size === 0) return false;
      const s = parseDateInputLocal(startDate);
      const e = parseDateInputLocal(endDate);
      if (!s || !e) return false;
      return true;
    }
    const s = parseDateInputLocal(periodStart);
    const e = parseDateInputLocal(periodEnd);
    if (!s || !e) return false;
    if (topN < 1 || topN > 50) return false;
    return true;
  }, [
    builtPayload,
    jobType,
    scopeAll,
    selectedAreaIds,
    startDate,
    endDate,
    periodStart,
    periodEnd,
    topN
  ]);

  const toggleArea = (id: string) => {
    setSelectedAreaIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!builtPayload || !canSubmit) return;
    setIsSubmitting(true);
    try {
      await onTrigger(builtPayload);
      onClose();
    } catch {
      // Parent may toast; modal stays open
    } finally {
      setIsSubmitting(false);
    }
  };

  const primaryLabel =
    jobType === 'frequency'
      ? 'Trigger frequency aggregation'
      : jobType === 'severity'
        ? 'Trigger severity aggregation'
        : 'Trigger hotspot aggregation';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description='Set scope, period, and options. The request runs as a background job on the server.'
      footer={
        <div className='flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
          <Button
            type='button'
            variant='outline'
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type='button'
            onClick={() => void handleSubmit()}
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Icons.Spinner className='mr-2 h-4 w-4' />
                Starting…
              </>
            ) : (
              primaryLabel
            )}
          </Button>
        </div>
      }
    >
      <div className='space-y-5'>
        {(jobType === 'frequency' || jobType === 'severity') && (
          <>
            <div className='space-y-2'>
              <Label>Bucket</Label>
              <div className='flex flex-wrap gap-1'>
                {BUCKETS.map((b) => (
                  <Button
                    key={b}
                    type='button'
                    size='sm'
                    variant={bucketType === b ? 'default' : 'outline'}
                    className={cn(
                      'capitalize',
                      bucketType === b ? '' : 'border-dashed'
                    )}
                    onClick={() => setBucketType(b)}
                  >
                    {b}
                  </Button>
                ))}
              </div>
            </div>

            <div className='space-y-2'>
              <Label>Area scope</Label>
              <div className='flex flex-col gap-2'>
                <label className='flex cursor-pointer items-center gap-2 text-sm'>
                  <input
                    type='radio'
                    name='area-scope'
                    checked={scopeAll}
                    onChange={() => setScopeAll(true)}
                  />
                  All areas
                </label>
                <label className='flex cursor-pointer items-center gap-2 text-sm'>
                  <input
                    type='radio'
                    name='area-scope'
                    checked={!scopeAll}
                    onChange={() => setScopeAll(false)}
                  />
                  Select specific areas
                </label>
              </div>
              {!scopeAll && (
                <div className='border-border bg-muted/30 max-h-40 overflow-y-auto rounded-md border p-2 text-sm'>
                  {areas.length === 0 ? (
                    <p className='text-muted-foreground'>No areas loaded.</p>
                  ) : (
                    <ul className='space-y-1'>
                      {areas.map((a) => (
                        <li key={a.id}>
                          <label className='flex cursor-pointer items-center gap-2'>
                            <input
                              type='checkbox'
                              checked={selectedAreaIds.has(a.id)}
                              onChange={() => toggleArea(a.id)}
                            />
                            <span>
                              {a.name}{' '}
                              <span className='text-muted-foreground text-xs'>
                                ({a.level})
                              </span>
                            </span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <Label htmlFor='qa-start'>Start date</Label>
                <Input
                  id='qa-start'
                  type='date'
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className='space-y-1.5'>
                <Label htmlFor='qa-end'>End date</Label>
                <Input
                  id='qa-end'
                  type='date'
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
                <p className='text-muted-foreground text-[11px] leading-snug'>
                  Default follows the selected bucket; you can adjust manually.
                </p>
              </div>
            </div>
          </>
        )}

        {jobType === 'hotspots' && (
          <>
            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <Label htmlFor='qa-pstart'>Period start</Label>
                <Input
                  id='qa-pstart'
                  type='date'
                  value={periodStart}
                  onChange={(e) => setPeriodStart(e.target.value)}
                />
              </div>
              <div className='space-y-1.5'>
                <Label htmlFor='qa-pend'>Period end</Label>
                <Input
                  id='qa-pend'
                  type='date'
                  value={periodEnd}
                  onChange={(e) => setPeriodEnd(e.target.value)}
                />
              </div>
            </div>
            <div className='space-y-1.5'>
              <Label htmlFor='qa-topn'>Top N hotspots</Label>
              <Input
                id='qa-topn'
                type='number'
                min={1}
                max={50}
                value={topN}
                onChange={(e) => setTopN(Number(e.target.value) || 1)}
              />
              <p className='text-muted-foreground text-[11px]'>
                Between 1 and 50.
              </p>
            </div>
          </>
        )}

        <div className='space-y-1.5'>
          <Label>Payload preview</Label>
          <pre className='border-border bg-muted/40 max-h-48 overflow-auto rounded-md border p-3 font-mono text-[11px] leading-relaxed'>
            {builtPayload ? JSON.stringify(builtPayload, null, 2) : ''}
          </pre>
        </div>
      </div>
    </Modal>
  );
}
