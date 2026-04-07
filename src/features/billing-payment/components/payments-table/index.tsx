'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { useDataTable } from '@/hooks/use-data-table';
import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  useQueryState,
  useQueryStates
} from 'nuqs';
import { billingPaymentApi } from '../../api/billing-payment.api';
import type {
  AdminPaymentRecord,
  PaymentStatus
} from '../../types/billing-payment.type';
import { getAccessToken } from '@/libs/auth-utils';
import { LoadingState } from '@/components/ui/common';
import { MOCK_ADMIN_PAYMENTS } from '../../mocks/billing-payment.mock';
import { getPaymentColumns } from './columns';
import type { ColumnDef } from '@tanstack/react-table';
import { PaymentDetailsDialog } from '../payment-details-dialog';
export function PaymentsTable() {
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [pageSize] = useQueryState('perPage', parseAsInteger.withDefault(10));

  // Must match column ids: orderCode (text) and status (select)
  const [filters] = useQueryStates({
    orderCode: parseAsString.withDefault(''),
    status: parseAsArrayOf(parseAsString, ',').withDefault([])
  });

  const searchQuery = filters.orderCode?.trim() ? filters.orderCode.trim() : '';
  const statusQuery =
    (filters.status?.[0] as PaymentStatus | undefined) ?? undefined;

  const queryKey = ['admin-payments', page, pageSize, statusQuery];

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      const token = await getAccessToken();
      if (!token)
        throw new Error('Authentication required. Please log in again.');

      return billingPaymentApi.getAdminPayments(
        { page: page ?? 1, pageSize: pageSize ?? 10, status: statusQuery },
        token
      );
    },
    retry: false
  });

  const totalCount = data?.totalCount ?? 0;
  const raw: AdminPaymentRecord[] = data?.data ?? MOCK_ADMIN_PAYMENTS;
  const pageCount =
    totalCount > 0 ? Math.ceil(totalCount / (pageSize ?? 10)) : 1;

  const [detailOpen, setDetailOpen] = React.useState(false);
  const [selectedPayment, setSelectedPayment] =
    React.useState<AdminPaymentRecord | null>(null);

  const filtered = React.useMemo(() => {
    let next = raw;
    if (statusQuery) next = next.filter((p) => p.status === statusQuery);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      next = next.filter((p) => {
        const hay = [
          String(p.orderCode ?? ''),
          p.userFullName ?? '',
          p.userEmail ?? '',
          p.planName ?? '',
          p.planCode ?? ''
        ]
          .join(' ')
          .toLowerCase();
        return hay.includes(q);
      });
    }
    return next;
  }, [raw, statusQuery, searchQuery]);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    if ((page ?? 1) !== 1) setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, statusQuery]);

  const columns = React.useMemo<ColumnDef<AdminPaymentRecord>[]>(() => {
    return getPaymentColumns({
      onRowClick: (p) => {
        setSelectedPayment(p);
        setDetailOpen(true);
      }
    });
  }, []);

  const { table } = useDataTable({
    data: filtered,
    columns: columns as ColumnDef<AdminPaymentRecord, unknown>[],
    pageCount,
    shallow: false,
    debounceMs: 500
  });

  return (
    <>
      <PaymentDetailsDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        payment={selectedPayment}
      />

      {isLoading ? (
        <LoadingState />
      ) : (
        <DataTable
          table={table}
          actionBar={
            filtered.length === 0 ? (
              <div className='text-muted-foreground rounded-lg border p-4 text-sm'>
                {statusQuery || searchQuery
                  ? 'No payments match the selected filter.'
                  : 'No payment records found.'}
              </div>
            ) : null
          }
        >
          <DataTableToolbar table={table}>
            {isError ? (
              <button
                type='button'
                className='text-primary text-sm underline underline-offset-4'
                onClick={() => void refetch()}
              >
                Retry
              </button>
            ) : null}
          </DataTableToolbar>
        </DataTable>
      )}
    </>
  );
}
