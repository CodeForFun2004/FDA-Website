// features/news/types/news.type.ts

export type AnnouncementStatus =
  | 'draft'
  | 'pending'
  | 'published'
  | 'cancelled';

export type AnnouncementPriority = 'low' | 'normal' | 'high' | 'urgent';

export type AnnouncementTarget = 'all' | 'region' | 'role';

export interface Announcement {
  id: string;
  title: string;
  summary: string | null;
  content: string | null;
  imageUrl: string | null;
  attachments: string | null;
  status: AnnouncementStatus;
  scheduledAt: string | null;
  publishedAt: string | null;
  target: AnnouncementTarget;
  targetValue: string | null;
  priority: AnnouncementPriority;
  createdAt: string;
  authorName: string;
  viewCount: number;
  deliveryCount: number;
  readCount: number;
}

export interface ApiEnvelope {
  success: boolean;
  message: string;
  statusCode: number;
}

export interface GetAnnouncementsResponse extends ApiEnvelope {
  data: Announcement[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AnnouncementListFilters {
  page: number;
  pageSize: number;
  status?: AnnouncementStatus | null;
  priority?: AnnouncementPriority | null;
  startDate?: string | null;
  endDate?: string | null;
  search?: string | null;
  sortBy?: string | null;
  sortOrder?: 'asc' | 'desc' | null;
}

export interface CreateAnnouncementPayload {
  title: string;
  content: string;
  summary?: string | null;
  imageUrl?: string | null;
  attachments?: string | null;
  scheduledAt?: string | null;
  target: AnnouncementTarget;
  targetValue?: string | null;
  priority: AnnouncementPriority;
}

export interface UpdateAnnouncementPayload {
  title?: string;
  content?: string;
  summary?: string | null;
  imageUrl?: string | null;
  attachments?: string | null;
  scheduledAt?: string | null;
  target?: AnnouncementTarget;
  targetValue?: string | null;
  priority?: AnnouncementPriority;
}

export interface CreateAnnouncementResponse extends ApiEnvelope {
  data: Announcement;
}

export interface UpdateAnnouncementResponse extends ApiEnvelope {
  data: Announcement;
}

export interface PublishAnnouncementResponse extends ApiEnvelope {
  data: {
    id: string;
    status: AnnouncementStatus;
    publishedAt: string;
    scheduledAt: string | null;
  };
}

export interface DeleteAnnouncementResponse {
  success: boolean;
  message: string;
  statusCode: number;
}
