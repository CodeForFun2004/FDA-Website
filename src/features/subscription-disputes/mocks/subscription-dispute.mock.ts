import type {
  AdminComplaint,
  SubscriptionDisputeStatus
} from '../types/subscription-dispute.type';

function makeComplaint(
  partial: Partial<AdminComplaint> & { id: string }
): AdminComplaint {
  return {
    id: partial.id,
    userId: partial.userId ?? 'user-001',
    userEmail: partial.userEmail ?? 'user@example.com',
    userFullName: partial.userFullName ?? 'Admin User',
    subject: partial.subject ?? 'Payment issue',
    description:
      partial.description ?? 'User reported a payment/subscription issue.',
    status: (partial.status as SubscriptionDisputeStatus) ?? 'open',
    adminResponse: partial.adminResponse ?? null,
    resolvedAt: partial.resolvedAt ?? null,
    createdAt: partial.createdAt ?? new Date().toISOString()
  };
}

export const MOCK_ADMIN_COMPLAINTS: AdminComplaint[] = [
  makeComplaint({
    id: 'cmp-001',
    userId: 'user-001',
    userEmail: 'linh.nguyen@example.com',
    userFullName: 'Linh Nguyen',
    subject: 'Charged but subscription not active',
    description:
      'I was charged, but my subscription status still shows inactive. Please check the payment.',
    status: 'open',
    adminResponse: null,
    resolvedAt: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString()
  }),
  makeComplaint({
    id: 'cmp-002',
    userId: 'user-002',
    userEmail: 'an.tran@example.com',
    userFullName: 'An Tran',
    subject: 'Payment duplicated',
    description:
      'I received two identical charges for the same subscription period. Could you refund or fix it?',
    status: 'resolved',
    adminResponse:
      'We verified your payment and corrected the subscription status.',
    resolvedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString()
  }),
  makeComplaint({
    id: 'cmp-003',
    userId: 'user-003',
    userEmail: 'minh.le@example.com',
    userFullName: 'Minh Le',
    subject: 'Requested cancellation but still active',
    description:
      'I requested cancellation two weeks ago, but the subscription remains active.',
    status: 'rejected',
    adminResponse:
      'Your cancellation request was outside the allowed window for the current billing cycle.',
    resolvedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString()
  })
];
