// features/news/api/news.api.ts

import { apiFetch } from '@/libs/api/client';
import type {
  GetAnnouncementsResponse,
  AnnouncementListFilters,
  CreateAnnouncementPayload,
  UpdateAnnouncementPayload,
  CreateAnnouncementResponse,
  UpdateAnnouncementResponse,
  PublishAnnouncementResponse,
  DeleteAnnouncementResponse
} from '../types/news.type';

function buildQuery(params: Record<string, any>) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    sp.set(k, String(v));
  });
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}

export const newsApi = {
  // LIST
  async getAnnouncements(
    filters: AnnouncementListFilters
  ): Promise<GetAnnouncementsResponse> {
    const queryParams: Record<string, any> = {};
    if (filters.status) queryParams.status = filters.status;
    if (filters.priority) queryParams.priority = filters.priority;
    if (filters.startDate) queryParams.startDate = filters.startDate;
    if (filters.endDate) queryParams.endDate = filters.endDate;
    if (filters.search) queryParams.search = filters.search;
    if (filters.sortBy) queryParams.sortBy = filters.sortBy;
    if (filters.sortOrder) queryParams.sortOrder = filters.sortOrder;
    if (filters.page) queryParams.pageNumber = filters.page;
    if (filters.pageSize) queryParams.pageSize = filters.pageSize;

    const qs = buildQuery(queryParams);
    const url = `/admin/announcements${qs}`;

    return apiFetch<GetAnnouncementsResponse>(url, { method: 'GET' });
  },

  // CREATE
  async createAnnouncement(
    data: CreateAnnouncementPayload
  ): Promise<CreateAnnouncementResponse> {
    return apiFetch<CreateAnnouncementResponse>('/admin/announcements', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // UPDATE
  async updateAnnouncement(
    id: string,
    data: UpdateAnnouncementPayload
  ): Promise<UpdateAnnouncementResponse> {
    return apiFetch<UpdateAnnouncementResponse>(`/admin/announcements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  // PUBLISH
  async publishAnnouncement(id: string): Promise<PublishAnnouncementResponse> {
    return apiFetch<PublishAnnouncementResponse>(
      `/admin/announcements/${id}/publish`,
      { method: 'POST' }
    );
  },

  // DELETE
  async deleteAnnouncement(id: string): Promise<DeleteAnnouncementResponse> {
    return apiFetch<DeleteAnnouncementResponse>(`/admin/announcements/${id}`, {
      method: 'DELETE'
    });
  }
};
