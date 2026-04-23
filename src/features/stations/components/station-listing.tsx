import { stationsApi } from '../api/station.api';
import { searchParamsCache } from '@/libs/searchparams';
import { generateMockStations } from '../mocks/stations-mock';

import { StationTable } from './station-tables';
import { columns } from './station-tables/columns';
import { StationOverview } from './station-overview';

export default async function StationListingPage() {
  const page = searchParamsCache.get('page');
  const perPage = searchParamsCache.get('perPage');
  const search =
    searchParamsCache.get('searchTerm') ?? searchParamsCache.get('name') ?? '';
  const statusParam = searchParamsCache.get('status');

  const statusValues = statusParam
    ? statusParam.split(',').map((s) => s.trim())
    : [];

  const apiStatus = statusValues.length === 1 ? statusValues[0] : null;

  let stations: ReturnType<typeof generateMockStations> = [];
  let totalCount = 0;

  try {
    const data = await stationsApi.getStations({
      page,
      perPage,
      name: search,
      status: apiStatus
    });
    stations = data.stations;
    totalCount = data.totalCount;
  } catch (error: any) {
    // Fallback to mock data when API is unavailable
    console.warn('API unavailable, using mock data:', error.message);
    const mockStations = generateMockStations();

    // Client-side filter mock data
    let filtered = mockStations;
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (st) =>
          st.name.toLowerCase().includes(s) ||
          st.code.toLowerCase().includes(s) ||
          (st.roadName ?? '').toLowerCase().includes(s)
      );
    }
    if (statusValues.length > 0) {
      filtered = filtered.filter((st) =>
        statusValues.includes(st.status.toLowerCase())
      );
    }

    stations = filtered;
    totalCount = filtered.length;
  }

  // Client-side filter when multiple statuses selected
  let filteredStations = stations;
  if (statusValues.length > 1) {
    filteredStations = stations.filter((st) =>
      statusValues.includes(st.status.toLowerCase())
    );
  }

  return (
    <div className='space-y-6'>
      <StationOverview />
      <StationTable
        data={filteredStations}
        totalItems={totalCount || filteredStations.length}
        columns={columns}
      />
    </div>
  );
}
