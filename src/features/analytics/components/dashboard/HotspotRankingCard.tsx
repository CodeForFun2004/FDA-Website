'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type { HotspotItem } from '@/features/analytics/types/analytics.dashboard.types';

function fmt(n: number) {
  return Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(n);
}

export function HotspotRankingCard(props: {
  items: HotspotItem[];
  topN: number;
}) {
  const rows = props.items.slice(0, props.topN);
  const maxScore = rows.reduce((m, r) => Math.max(m, r.score), 0) || 1;

  return (
    <Card className='border-border shadow-none'>
      <CardHeader className='pb-3'>
        <CardTitle className='text-sm'>Hotspot ranking</CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        <div className='text-muted-foreground text-xs leading-relaxed'>
          Ranking for reporting purposes. Hotspot map (FE-18) is not yet
          implemented, but the leaderboard is already usable.
        </div>

        <div className='space-y-2'>
          {rows.length === 0 ? (
            <div className='text-muted-foreground rounded-md border p-4 text-center text-sm'>
              No hotspot data.
            </div>
          ) : (
            rows.map((r) => {
              const pct = Math.round((r.score / maxScore) * 100);
              return (
                <div key={r.areaId} className='rounded-md border p-3'>
                  <div className='flex items-start justify-between gap-3'>
                    <div className='min-w-0'>
                      <div className='flex items-center gap-2'>
                        <Badge variant='secondary'>#{r.rank}</Badge>
                        <div className='truncate text-sm font-medium'>
                          {r.areaName}
                        </div>
                      </div>
                      <div className='text-muted-foreground mt-1 text-[11px]'>
                        calculatedAt {new Date(r.calculatedAt).toLocaleString()}
                      </div>
                    </div>
                    <div className='text-right'>
                      <div className='text-foreground text-sm font-semibold'>
                        {fmt(r.score)}
                      </div>
                      <div className='text-muted-foreground text-[11px]'>
                        score
                      </div>
                    </div>
                  </div>

                  <Progress value={pct} className='mt-3 h-1.5' />

                  <div className='mt-3 grid grid-cols-3 gap-2 text-[11px]'>
                    <div className='bg-muted/40 rounded-md p-2'>
                      <div className='text-muted-foreground'>frequency</div>
                      <div className='font-medium'>{fmt(r.frequencyScore)}</div>
                    </div>
                    <div className='bg-muted/40 rounded-md p-2'>
                      <div className='text-muted-foreground'>severity</div>
                      <div className='font-medium'>{fmt(r.severityScore)}</div>
                    </div>
                    <div className='bg-muted/40 rounded-md p-2'>
                      <div className='text-muted-foreground'>duration</div>
                      <div className='font-medium'>{fmt(r.durationScore)}</div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
