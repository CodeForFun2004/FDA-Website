// features/areas/types/area.type.ts

export interface Area {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  addressText: string;
}

export interface AreaDetail extends Area {
  userId: string;
  createdAt: string;
  updatedAt: string;
}

/** Base envelope */
export interface ApiEnvelope {
  success: boolean;
  message: string;
  statusCode?: number;
}

/** GET all areas */
export interface GetAreasResponse extends ApiEnvelope {
  areas: Area[];
  totalCount: number;
}

/** GET area by id */
export interface GetAreaByIdResponse extends ApiEnvelope {
  data: AreaDetail;
}

/** Filters (hiện tại chỉ paging/search cho UI) */
export type AreaListFilters = {
  page: number;
  perPage: number;
  name?: string | null;
};
