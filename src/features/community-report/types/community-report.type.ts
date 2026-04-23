export type CommunityFloodReportMedia = {
  id: string;
  mediaType?: string | null;
  mediaUrl?: string | null;
  thumbnailUrl?: string | null;
  createdAt?: string | null;
};

export type CommunityFloodReport = {
  id: string;
  reporterUserId?: string | null;
  reporterName?: string | null;
  reporterEmail?: string | null;
  latitude: number;
  longitude: number;
  address?: string | null;
  description?: string | null;
  severity?: string | null;
  trustScore?: number | null;
  score?: number | null;
  status?: string | null;
  confidenceLevel?: string | number | null;
  priority?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  media?: CommunityFloodReportMedia[];
};

export type CommunityFloodReportsQuery = {
  status?: number | string | null;
  severity?: number | string | null;
  minTrustScore?: number | null;
  from?: string | '';
  to?: string | '';
  pageNumber?: number;
  pageSize?: number;
};

export type CommunityFloodReportsResponse = {
  success: boolean;
  message: string;
  totalCount: number;
  items: CommunityFloodReport[];
};

export type CommunityReporterProfile = {
  name?: string;
  email?: string;
};

export type ModeratorCommunityFilters = {
  status: '' | 'published' | 'hidden';
  severity: '' | 'low' | 'medium' | 'high';
  minTrustScore: string;
  from: string;
  to: string;
};
