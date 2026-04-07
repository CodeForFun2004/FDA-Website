export type SubscriptionDisputeStatus = 'open' | 'resolved' | 'rejected';

/** Base API envelope */
export interface ApiEnvelope {
  success: boolean;
  message: string;
  statusCode: number;
}

export interface AdminComplaint {
  id: string;
  userId: string;
  userEmail: string;
  userFullName: string;
  subject: string;
  description: string;
  status: SubscriptionDisputeStatus;
  adminResponse: string | null;
  resolvedAt: string | null; // ISO 8601 string
  createdAt: string; // ISO 8601 string
}

export interface CreateComplaintPayload {
  paymentId?: string | null;
  subject: string;
  description: string;
}

/** POST /api/v1/complaints */
export interface CreateComplaintResponse extends ApiEnvelope {
  data: {
    id: string;
    subject: string;
    description: string;
    status: SubscriptionDisputeStatus;
    createdAt: string;
  };
}

/** GET /api/v1/admin/complaints?page=1&pageSize=10&status=open|resolved|rejected */
export interface GetAdminComplaintsResponse extends ApiEnvelope {
  totalCount: number;
  data: AdminComplaint[];
}

export type ResolveNewStatus = 'resolved' | 'rejected';

/** PUT /api/v1/admin/complaints/{id}/resolve */
export interface ResolveComplaintPayload {
  adminResponse: string;
  newStatus: ResolveNewStatus;
}

export interface ResolveComplaintResponse extends ApiEnvelope {
  data: {
    id: string;
    status: SubscriptionDisputeStatus;
    adminResponse: string;
    resolvedAt: string; // ISO 8601 string
  };
}
