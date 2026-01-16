import type { Station } from '../types/station.type';
import { stationsApi } from '../api/station.api';
import { searchParamsCache } from '@/lib/searchparams';

import { StationTable } from './station-tables';
import { columns } from './station-tables/columns';

type StationListingPageProps = {};

export default async function StationListingPage({}: StationListingPageProps) {
  // Fetch all stations from API with filters
  const page = searchParamsCache.get('page');
  const perPage = searchParamsCache.get('perPage');
  const search = searchParamsCache.get('name') ?? '';
  const statusParam = searchParamsCache.get('status');

  // Transform status to capitalize first letter (e.g., "inactive" -> "Inactive")
  // The API might expect capitalized status values
  const status = statusParam
    ? statusParam.charAt(0).toUpperCase() + statusParam.slice(1).toLowerCase()
    : null;

  console.log('📊 Station Listing Filters:', {
    page,
    perPage,
    search,
    statusRaw: statusParam,
    statusTransformed: status,
    statusType: typeof status
  });

  try {
    const data = await stationsApi.getStations({
      page,
      perPage,
      name: search,
      status: status
    });

    console.log('✅ API Response:', {
      stationsCount: data.stations.length,
      totalCount: data.totalCount
    });

    // Pass all stations to the client-side table
    // The table will handle pagination on the client
    return (
      <StationTable
        data={data.stations}
        totalItems={data.stations.length}
        columns={columns}
      />
    );
  } catch (error: any) {
    console.error('❌ API Error:', {
      message: error.message,
      status: error.status,
      payload: error.payload,
      filterUsed: { page, perPage, search, status }
    });
    throw error;
  }
}
