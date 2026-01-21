// features/user-alert-subscription/api/alert-subscription.api.ts

import { apiFetch } from '@/lib/api/client';
import type {
  GetAlertSubscriptionsResponse,
  AlertSubscriptionListFilters,
  AlertSubscription,
  DeleteAlertSubscriptionResponse
} from '../types/alert-subscription.type';

function buildQuery(params: Record<string, any>) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    sp.set(k, String(v));
  });
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}

export const alertSubscriptionsApi = {
  // LIST (hiện tại bạn đang tạm không query)
  async getAlertSubscriptions(
    filters: AlertSubscriptionListFilters
  ): Promise<GetAlertSubscriptionsResponse> {
    // Build query string with filters
    const queryParams: Record<string, any> = {};
    if (filters.userEmail) queryParams.userEmail = filters.userEmail;
    if (filters.severity) queryParams.severity = filters.severity;
    if (filters.areaId) queryParams.areaId = filters.areaId;
    if (filters.page) queryParams.pageNumber = filters.page;
    if (filters.perPage) queryParams.pageSize = filters.perPage;

    const qs = buildQuery(queryParams);
    const url = `/admin/alerts/subscriptions${qs}`;

    console.log('[getAlertSubscriptions] Calling URL:', url);
    console.log('[getAlertSubscriptions] Filters:', filters);
    console.log('[getAlertSubscriptions] Query params:', queryParams);

    try {
      const result = await apiFetch<GetAlertSubscriptionsResponse>(url, {
        method: 'GET'
      });

      console.log('[getAlertSubscriptions] API Response:', result);
      return result;
    } catch (error) {
      console.error('[getAlertSubscriptions] API Error:', error);
      throw error;
    }
  },

  // DELETE
  async deleteAlertSubscription(
    id: string
  ): Promise<DeleteAlertSubscriptionResponse> {
    return apiFetch<DeleteAlertSubscriptionResponse>(
      `/admin/alerts/subscriptions/${id}`,
      {
        method: 'DELETE'
      }
    );
  }
};
