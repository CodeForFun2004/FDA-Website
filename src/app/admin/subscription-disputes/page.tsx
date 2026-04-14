import PageContainer from '@/components/layout/page-container';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import SubscriptionDisputesView from '@/features/subscription-disputes/views/SubscriptionDisputesView';
import { Suspense } from 'react';

export const metadata = {
  title: 'Admin: Subscription Disputes'
};

export default function Page() {
  return (
    <PageContainer
      scrollable={false}
      pageTitle='Khiếu nại gói'
      pageDescription='Xem xét và xử lý khiếu nại liên quan đến gói đăng ký.'
    >
      <Suspense
        fallback={
          <div className='space-y-6'>
            <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
              <div className='bg-muted h-28 animate-pulse rounded-xl' />
              <div className='bg-muted h-28 animate-pulse rounded-xl' />
              <div className='bg-muted h-28 animate-pulse rounded-xl' />
              <div className='bg-muted h-28 animate-pulse rounded-xl' />
            </div>
            <DataTableSkeleton columnCount={7} rowCount={6} filterCount={0} />
          </div>
        }
      >
        <SubscriptionDisputesView />
      </Suspense>
    </PageContainer>
  );
}
