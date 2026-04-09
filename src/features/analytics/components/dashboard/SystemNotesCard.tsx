'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

export function SystemNotesCard() {
  return (
    <Card className='border-border shadow-none'>
      <CardHeader className='pb-3'>
        <CardTitle className='text-sm'>System notes</CardTitle>
      </CardHeader>
      <CardContent className='space-y-3 text-xs leading-relaxed'>
        <div className='space-y-1'>
          <div className='font-medium'>Idempotent aggregation</div>
          <div className='text-muted-foreground'>
            Re-run will <span className='font-medium'>upsert/overwrite</span> by
            bucket/area. No double counting.
          </div>
        </div>

        <Separator />

        <div className='space-y-1'>
          <div className='font-medium'>Scheduling policy</div>
          <div className='text-muted-foreground'>
            <div className='flex flex-wrap items-center gap-2'>
              <Badge variant='outline'>Daily 02:00</Badge>
              <Badge variant='outline'>Weekly Mon</Badge>
              <Badge variant='outline'>Monthly 1st</Badge>
              <Badge variant='outline'>TZ: Asia/Ho_Chi_Minh</Badge>
            </div>
          </div>
        </div>

        <Separator />

        <div className='space-y-1'>
          <div className='font-medium'>Data sources</div>
          <div className='text-muted-foreground'>
            Sensor readings / flood events / administrative areas.
          </div>
        </div>

        <Separator />

        <div className='space-y-1'>
          <div className='font-medium'>Hotspot (FE-18 ready)</div>
          <div className='text-muted-foreground'>
            Currently used for reporting & analysis. FE-18 will leverage this
            data to render hotspot maps.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
