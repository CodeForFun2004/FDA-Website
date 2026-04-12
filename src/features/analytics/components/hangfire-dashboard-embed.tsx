'use client';

import * as React from 'react';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getHangfireDashboardUrl } from '@/libs/hangfire-url';

export function HangfireDashboardEmbed() {
  const url = React.useMemo(() => getHangfireDashboardUrl(), []);
  const [loaded, setLoaded] = React.useState(false);

  return (
    <div className='flex flex-col gap-3'>
      <div className='flex justify-end'>
        <Button variant='outline' size='sm' asChild>
          <a href={url} target='_blank' rel='noopener noreferrer'>
            <ExternalLink className='mr-2 h-3.5 w-3.5' />
            Mở Hangfire
          </a>
        </Button>
      </div>

      <div className='border-border bg-muted/30 relative overflow-hidden rounded-xl border shadow-sm'>
        {!loaded ? (
          <div className='bg-muted/50 absolute inset-0 z-10 flex items-center justify-center text-sm'>
            Đang tải…
          </div>
        ) : null}
        <iframe
          title='Hangfire'
          src={url}
          className='bg-background h-[min(78dvh,900px)] min-h-[480px] w-full border-0'
          onLoad={() => setLoaded(true)}
          referrerPolicy='strict-origin-when-cross-origin'
        />
      </div>
    </div>
  );
}
