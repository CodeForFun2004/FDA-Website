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

  // Parse status - could be a single value or comma-separated values
  const statusValues = statusParam
    ? statusParam.split(',').map((s) => s.trim())
    : [];

  // Only send status to API if single value is selected
  // API doesn't support multiple status values, so we'll filter client-side
  const apiStatus = statusValues.length === 1 ? statusValues[0] : null;

  console.log('📊 Station Listing Filters:', {
    page,
    perPage,
    search,
    statusParam,
    statusValues,
    apiStatus,
    willFilterClientSide: statusValues.length > 1
  });

  try {
    const data = await stationsApi.getStations({
      page,
      perPage,
      name: search,
      status: apiStatus
    });

    // Client-side filtering when multiple statuses are selected
    let filteredStations = data.stations;
    if (statusValues.length > 1) {
      filteredStations = data.stations.filter((station) =>
        statusValues.includes(station.status.toLowerCase())
      );
      console.log('🔍 Client-side filtered:', {
        original: data.stations.length,
        filtered: filteredStations.length,
        statusValues
      });
    }

    console.log('✅ API Response:', {
      stationsCount: filteredStations.length,
      totalCount: data.totalCount
    });

    // Pass filtered stations to the client-side table
    // Use API's totalCount for pagination, not filtered length
    return (
      <StationTable
        data={filteredStations}
        totalItems={data.totalCount}
        columns={columns}
      />
    );
  } catch (error: any) {
    console.error('❌ API Error:', {
      message: error.message,
      status: error.status,
      payload: error.payload,
      filterUsed: { page, perPage, search, statusParam, apiStatus }
    });
    throw error;
  }
}
