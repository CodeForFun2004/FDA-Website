import type { Station } from '../types/station.type';
import { stationsApi } from '../api/station.api';
import { searchParamsCache } from '@/lib/searchparams';

import { StationTable } from './station-tables';
import { columns } from './station-tables/columns';

type StationListingPageProps = {};

export default async function StationListingPage({}: StationListingPageProps) {
  // Showcasing the use of search params cache in nested RSCs
  const page = searchParamsCache.get('page');
  const search = searchParamsCache.get('name');
  const pageLimit = searchParamsCache.get('perPage');

  // (tuỳ bạn) sau này thêm filter status/category... nếu muốn
  // const status = searchParamsCache.get('status');

  // Backend hiện chưa chắc hỗ trợ phân trang/search query
  // => gọi API vẫn ổn, UI vẫn làm server-table (querystring đổi -> request lại)
  const data = await stationsApi.getStations({
    page,
    perPage: pageLimit,
    name: search
  });

  const totalStations = data.totalCount;
  const stations: Station[] = data.stations;

  return (
    <StationTable
      data={stations}
      totalItems={totalStations}
      columns={columns}
    />
  );
}
