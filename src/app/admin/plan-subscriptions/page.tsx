import PageContainer from '@/components/layout/page-container';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import PlanSubscriptionsView from '@/features/plan-subscriptions/views/PlanSubscriptionsView';
import { Suspense } from 'react';

export const metadata = {
  title: 'Admin: Plan Subscriptions'
};

export default function Page() {
  return (
    <PageContainer
      scrollable={false}
      pageTitle='Gói đăng ký'
      pageDescription='Cấu hình gói, mức giá và tính năng đi kèm.'
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
            <DataTableSkeleton columnCount={8} rowCount={5} filterCount={0} />
          </div>
        }
      >
        <PlanSubscriptionsView />
      </Suspense>
    </PageContainer>
  );
}
