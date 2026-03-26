// import { UsersView } from '@/features/users';
// import { SearchParams } from 'nuqs';

// type PageProps = {
//   searchParams: Promise<SearchParams>;
// };

// export default function UsersPage() {
//   return <UsersView />;
// }

import { SearchParams } from 'nuqs';
import UserListingPage from '@/features/users/components/user-listing';
import { searchParamsCache } from '@/libs/searchparams';
import { Suspense } from 'react';
import PageContainer from '@/components/layout/page-container';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';

export const metadata = {
  title: 'Admin: User Management'
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function UsersView(props: PageProps) {
  const searchParams = await props.searchParams;

  await searchParamsCache.parse(searchParams);

  return (
    <PageContainer
      scrollable={false}
      pageTitle='User Management'
      pageDescription='Manage users (Server side table functionalities.)'
      // infoContent={stationInfoContent}
    >
      <Suspense
        fallback={
          <DataTableSkeleton columnCount={7} rowCount={8} filterCount={2} />
        }
      >
        <UserListingPage />
      </Suspense>
    </PageContainer>
  );
}
