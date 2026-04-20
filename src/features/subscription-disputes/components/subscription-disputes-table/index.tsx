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
import { subscriptionDisputeApi } from '../../api/subscription-dispute.api';
import type {
  AdminComplaint,
  SubscriptionDisputeStatus
} from '../../types/subscription-dispute.type';
import { getAccessToken } from '@/libs/auth-utils';
import { LoadingState } from '@/components/ui/common';
import { MOCK_ADMIN_COMPLAINTS } from '../../mocks/subscription-dispute.mock';
import { getSubscriptionDisputesColumns } from './columns';
import { SubscriptionDisputeDetailsDialog } from '../subscription-dispute-details-dialog';
import type { ColumnDef } from '@tanstack/react-table';

export function SubscriptionDisputesTable() {
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [pageSize] = useQueryState('perPage', parseAsInteger.withDefault(10));

  // These keys MUST match the column ids in `columns.tsx` (subject, status)
  const [filters] = useQueryStates({
    subject: parseAsString.withDefault(''),
    status: parseAsArrayOf(parseAsString, ',').withDefault([])
  });
  const subjectQuery = filters.subject?.trim() ? filters.subject.trim() : '';
  const statusQuery =
    (filters.status?.[0] as SubscriptionDisputeStatus | undefined) ?? undefined;

  const queryKey = [
    'subscription-disputes',
    page,
    pageSize,
    subjectQuery,
    statusQuery
  ];

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      const token = await getAccessToken();
      if (!token) throw new Error('Cần đăng nhập. Vui lòng đăng nhập lại.');

      return subscriptionDisputeApi.getAdminComplaints(
        {
          page: page ?? 1,
          pageSize: pageSize ?? 10,
          status: statusQuery
        },
        token
      );
    },
    retry: false
  });

  const totalCount = data?.totalCount ?? 0;
  const rawComplaints: AdminComplaint[] = data?.data ?? MOCK_ADMIN_COMPLAINTS;

  // Because the table is configured for server-side filtering (manualFiltering=true),
  // we must pre-filter the rows to match toolbar filters.
  const complaints = React.useMemo(() => {
    let next = rawComplaints;

    if (statusQuery) {
      next = next.filter((c) => c.status === statusQuery);
    }

    if (subjectQuery) {
      const q = subjectQuery.toLowerCase();
      next = next.filter((c) => c.subject?.toLowerCase().includes(q));
    }

    return next;
  }, [rawComplaints, statusQuery, subjectQuery]);
  const pageCount =
    totalCount > 0 ? Math.ceil(totalCount / (pageSize ?? 10)) : 1;

  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [selectedComplaint, setSelectedComplaint] =
    React.useState<AdminComplaint | null>(null);

  const columns = React.useMemo<ColumnDef<AdminComplaint>[]>(() => {
    return getSubscriptionDisputesColumns({
      onViewDetails: (c) => {
        setSelectedComplaint(c);
        setDetailsOpen(true);
      }
    });
  }, []);

  const { table } = useDataTable({
    data: complaints,
    columns: columns as ColumnDef<AdminComplaint, unknown>[],
    pageCount,
    shallow: false,
    debounceMs: 500
  });

  // Reset to page 1 when filter changes (avoid "empty page" after filtering)
  React.useEffect(() => {
    if ((page ?? 1) !== 1) setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectQuery, statusQuery]);

  return (
    <>
      <SubscriptionDisputeDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        complaint={selectedComplaint}
      />

      <div className='space-y-4'>
        {isLoading ? (
          <LoadingState />
        ) : (
          <DataTable table={table}>
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
      </div>
    </>
  );
}
