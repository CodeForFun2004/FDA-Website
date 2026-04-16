import PageContainer from '@/components/layout/page-container';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import StationListingPage from '@/features/stations/components/station-listing';
import { searchParamsCache } from '@/libs/searchparams';
import type { SearchParams } from 'nuqs/server';
import { Suspense } from 'react';

export const metadata = {
  title: 'Moderator: Stations'
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function Page(props: PageProps) {
  const searchParams = await props.searchParams;
  await searchParamsCache.parse(searchParams);

  return (
    <PageContainer
      scrollable={false}
      pageTitle='Trạm Quan Trắc'
      pageDescription='Theo dõi trạng thái vận hành và thông tin từng trạm.'
    >
      <Suspense
        fallback={
          <DataTableSkeleton columnCount={10} rowCount={8} filterCount={2} />
        }
      >
        <StationListingPage />
      </Suspense>
    </PageContainer>
  );
}
