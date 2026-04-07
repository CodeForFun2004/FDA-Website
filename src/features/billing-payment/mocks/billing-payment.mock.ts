import type { AdminPaymentRecord } from '../types/billing-payment.type';

export const MOCK_ADMIN_PAYMENTS: AdminPaymentRecord[] = [
  {
    id: 'pay-001',
    orderCode: 2026032801,
    planName: 'Premium Plan',
    planCode: 'PREMIUM',
    amount: 149000,
    currency: 'VND',
    paymentMethod: 'PAYOS',
    status: 'paid',
    durationMonths: 1,
    description: 'Monthly subscription payment',
    paidAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    userEmail: 'son.nguyen@example.com',
    userFullName: 'Sơn Nguyễn'
  },
  {
    id: 'pay-002',
    orderCode: 2026032802,
    planName: 'Basic Plan',
    planCode: 'BASIC',
    amount: 49000,
    currency: 'VND',
    paymentMethod: 'PAYOS',
    status: 'pending',
    durationMonths: 1,
    description: 'Waiting for payment confirmation',
    paidAt: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    userEmail: 'an.tran@example.com',
    userFullName: 'An Trần'
  },
  {
    id: 'pay-003',
    orderCode: 2026032803,
    planName: 'Enterprise Plan',
    planCode: 'ENTERPRISE',
    amount: 499000,
    currency: 'VND',
    paymentMethod: 'PAYOS',
    status: 'cancelled',
    durationMonths: 12,
    description: 'Payment cancelled by user',
    paidAt: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    userEmail: 'linh.le@example.com',
    userFullName: 'Linh Lê'
  }
];
