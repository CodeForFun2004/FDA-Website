// features/areas/components/area-listing.tsx

import { areasApi } from '../api/area.api';
import { searchParamsCache } from '@/lib/searchparams';
import { AreaTable } from './areas-tables';
import { columns } from './areas-tables/columns';

export default async function AreaListingPage() {
  const page = searchParamsCache.get('page');
  const perPage = searchParamsCache.get('perPage');
  const searchTerm = searchParamsCache.get('name');

  // Fetch all areas (backend doesn't support filtering yet)
  const data = await areasApi.getAreas({
    page,
    perPage,
    name: null // Backend ignores this anyway
  });

  // Client-side filtering by name or address
  let filteredAreas = data.areas;
  if (searchTerm) {
    const lowerSearch = searchTerm.toLowerCase();
    filteredAreas = data.areas.filter((area) => {
      const nameMatch = area.name.toLowerCase().includes(lowerSearch);
      const addressMatch = area.addressText.toLowerCase().includes(lowerSearch);
      return nameMatch || addressMatch;
    });
  }

  console.log('📊 Areas Listing:', {
    total: data.areas.length,
    filtered: filteredAreas.length,
    searchTerm
  });

  return (
    <AreaTable
      data={filteredAreas}
      totalItems={filteredAreas.length}
      columns={columns}
    />
  );
}
