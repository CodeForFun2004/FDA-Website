'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { billingPaymentApi } from '../api/billing-payment.api';
import { getAccessToken } from '@/libs/auth-utils';
import type { PaymentSummaryStats } from '../types/billing-payment.type';
import { Activity, Clock3, Ban, Wallet } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

function formatVnd(value: number) {
  return new Intl.NumberFormat('vi-VN').format(value) + ' VND';
}

async function fetchCountByStatus(status?: string) {
  const token = await getAccessToken();
  if (!token) throw new Error('Authentication required. Please log in again.');
  const res = await billingPaymentApi.getAdminPayments(
    { page: 1, pageSize: 1, status },
    token
  );
  return res.totalCount ?? 0;
}

async function fetchPaidRevenueSample() {
  // Backend does not provide a summary endpoint in FE-41.
  // We sample paid revenue from page=1 with a larger pageSize as a best-effort approximation.
  const token = await getAccessToken();
  if (!token) throw new Error('Authentication required. Please log in again.');
  const res = await billingPaymentApi.getAdminPayments(
    { page: 1, pageSize: 200, status: 'paid' },
    token
  );
  const revenue = (res.data ?? []).reduce((sum, p) => sum + (p.amount ?? 0), 0);
  return {
    revenue,
    sampled: (res.data ?? []).length,
    totalPaid: res.totalCount ?? 0
  };
}

export function PaymentsOverview() {
  const totalQuery = useQuery({
    queryKey: ['admin-payments-summary', 'totalCount'],
    queryFn: () => fetchCountByStatus(undefined),
    retry: false
  });

  const pendingQuery = useQuery({
    queryKey: ['admin-payments-summary', 'pending'],
    queryFn: () => fetchCountByStatus('pending'),
    retry: false
  });

  const cancelledQuery = useQuery({
    queryKey: ['admin-payments-summary', 'cancelled'],
    queryFn: () => fetchCountByStatus('cancelled'),
    retry: false
  });

  const revenueQuery = useQuery({
    queryKey: ['admin-payments-summary', 'revenue-sample'],
    queryFn: () => fetchPaidRevenueSample(),
    retry: false
  });

  const stats: Array<{
    label: string;
    value: React.ReactNode;
    hint?: string;
    icon: any;
    iconBg: string;
    iconColor: string;
  }> = [
    {
      label: 'Total Transactions',
      value: totalQuery.data ?? '-',
      icon: Activity,
      iconBg: 'bg-slate-500/10',
      iconColor: 'text-slate-600 dark:text-slate-300'
    },
    {
      label: 'Total Revenue',
      value:
        revenueQuery.data != null ? formatVnd(revenueQuery.data.revenue) : '-',
      hint:
        revenueQuery.data != null &&
        revenueQuery.data.totalPaid > revenueQuery.data.sampled
          ? `Sampled ${revenueQuery.data.sampled}/${revenueQuery.data.totalPaid} paid records (page 1).`
          : undefined,
      icon: Wallet,
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-600 dark:text-emerald-300'
    },
    {
      label: 'Pending',
      value: pendingQuery.data ?? '-',
      icon: Clock3,
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-600 dark:text-amber-300'
    },
    {
      label: 'Cancelled',
      value: cancelledQuery.data ?? '-',
      icon: Ban,
      iconBg: 'bg-red-500/10',
      iconColor: 'text-red-600 dark:text-red-300'
    }
  ];

  // If everything failed, hide to avoid noisy empty UI
  const allEmpty =
    totalQuery.isError &&
    pendingQuery.isError &&
    cancelledQuery.isError &&
    revenueQuery.isError;
  if (allEmpty) return null;

  return (
    <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <Card key={s.label} className='border-border bg-card'>
            <CardContent className='flex items-center gap-4 p-6'>
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${s.iconBg}`}
              >
                <Icon className={`h-5 w-5 ${s.iconColor}`} />
              </div>
              <div className='min-w-0 flex-1'>
                <p className='text-muted-foreground text-xs font-medium'>
                  {s.label}
                </p>
                <p className='text-foreground mt-0.5 truncate text-2xl font-bold tabular-nums'>
                  {s.value}
                </p>
                {s.hint ? (
                  <p className='text-muted-foreground mt-1 line-clamp-2 text-[11px] leading-snug'>
                    {s.hint}
                  </p>
                ) : null}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
