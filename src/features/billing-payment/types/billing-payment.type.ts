export type PaymentStatus = 'paid' | 'pending' | 'cancelled';

/** Base API envelope */
export interface ApiEnvelope {
  success: boolean;
  message: string;
  statusCode: number;
}

export interface AdminPaymentRecord {
  id: string;
  orderCode: number;
  planName: string;
  planCode: string;
  amount: number;
  currency: string; // "VND"
  paymentMethod: string; // "PAYOS"
  status: PaymentStatus;
  durationMonths: number;
  description: string;
  paidAt: string | null; // ISO 8601 string
  createdAt: string; // ISO 8601 string
  userEmail: string;
  userFullName: string;
}

/** GET /api/v1/admin/payments */
export interface GetAdminPaymentsResponse extends ApiEnvelope {
  totalCount: number;
  data: AdminPaymentRecord[];
}

export type BillingPaymentStatusFilter = 'all' | PaymentStatus;

export type PaymentSummaryStats = {
  totalTransactions: number;
  totalRevenueVnd: number;
  pendingCount: number;
  cancelledCount: number;
};
