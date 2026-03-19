// import { SearchParams } from 'nuqs';
// import UserListingPage from '../components/user-listing';
// import { searchParamsCache } from '@/lib/searchparams';
// import { Suspense } from 'react';
// import PageContainer from '@/components/layout/page-container';
// import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';

// export const metadata = {
//   title: 'Admin: User Management'
// };

// export default async function UsersView(props: PageProps) {
//   const searchParams = await props.searchParams;

//   await searchParamsCache.parse(searchParams);

//   return (
//     <PageContainer
//       scrollable={false}
//       pageTitle='Stations'
//       pageDescription='Manage stations (Server side table functionalities.)'
//       // infoContent={stationInfoContent}
//     >
//       <Suspense
//         fallback={
//           <DataTableSkeleton columnCount={7} rowCount={8} filterCount={2} />
//         }
//       >
//         <UserListingPage />
//       </Suspense>
//     </PageContainer>
//   );
// }
