import type { ReactNode } from 'react';
import { AnalyticsSubNav } from '@/features/analytics/components/analytics-sub-nav';

export default function AnalyticsLayout({ children }: { children: ReactNode }) {
  return (
    <div className='flex min-h-0 flex-1 flex-col'>
      <AnalyticsSubNav />
      <div className='min-h-0 flex-1'>{children}</div>
    </div>
  );
}
