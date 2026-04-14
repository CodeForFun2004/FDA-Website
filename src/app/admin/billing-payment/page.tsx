import PageContainer from '@/components/layout/page-container';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import BillingPaymentView from '@/features/billing-payment/views/BillingPaymentView';
import { Suspense } from 'react';

export const metadata = {
  title: 'Admin: Billing & Payments'
};

export default function Page() {
  return (
    <PageContainer
      scrollable={false}
      pageTitle='Giao dịch thanh toán'
      pageDescription='Xem lịch sử thanh toán và chi tiết từng đơn hàng.'
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
            <DataTableSkeleton columnCount={8} rowCount={8} filterCount={2} />
          </div>
        }
      >
        <BillingPaymentView />
      </Suspense>
    </PageContainer>
  );
}
