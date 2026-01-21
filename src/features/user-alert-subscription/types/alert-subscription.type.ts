// features/user-alert-subscription/types/alert-subscription.type.ts

export type AlertSeverity = 'caution' | 'warning' | 'critical' | string;

export interface AlertSubscription {
  subscriptionId: string;
  userId: string;
  userEmail: string;
  userPhone: string;
  stationId: string | null;
  stationName: string | null;
  areaId: string | null;
  areaName: string | null;
  minSeverity: AlertSeverity;
  enablePush: boolean;
  enableEmail: boolean;
  enableSms: boolean;
  createdAt: string;
}

/** Base envelope backend trả về */
export interface ApiEnvelope {
  success: boolean;
  message: string;
  statusCode: number;
}

/** GET all alert subscriptions */
export interface GetAlertSubscriptionsResponse extends ApiEnvelope {
  data: {
    subscriptions: AlertSubscription[];
    pagination: {
      hasMore: boolean;
      nextCursor: string | null;
      totalCount: number;
      currentPage: number;
      pageSize: number;
      totalPages: number;
    };
  };
}

/** Filters map với searchParamsCache */
export type AlertSubscriptionListFilters = {
  page: number;
  perPage: number;
  userEmail?: string | null; // search keyword
  severity?: string | null; // severity filter
  areaId?: string | null; // area filter
};

export type DeleteAlertSubscriptionResponse = {
  success: boolean;
  message: string;
  statusCode: number;
};
