import PageContainer from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import StationListingPage from '@/features/stations/components/station-listing';
import { searchParamsCache } from '@/lib/searchparams';
import { cn } from '@/lib/utils';
import { IconPlus } from '@tabler/icons-react';
import Link from 'next/link';
import type { SearchParams } from 'nuqs/server';
import { Suspense } from 'react';

// (tuỳ bạn) nếu có infoContent riêng cho stations thì add sau
// import { stationInfoContent } from '@/config/infoconfig';

export const metadata = {
  title: 'Admin: Stations'
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function Page(props: PageProps) {
  const searchParams = await props.searchParams;

  // ✅ nuqs parse (bạn nhớ: nếu version yêu cầu await parse thì dùng await)
  // Nếu project bạn đang dùng parse sync OK thì giữ như dưới:
  await searchParamsCache.parse(searchParams);

  return (
    <PageContainer
      scrollable={false}
      pageTitle='Stations'
      pageDescription='Manage stations (Server side table functionalities.)'
      // infoContent={stationInfoContent}
    >
      <Suspense
        fallback={
          <DataTableSkeleton columnCount={7} rowCount={8} filterCount={2} />
        }
      >
        <StationListingPage />
      </Suspense>
    </PageContainer>
  );
}
