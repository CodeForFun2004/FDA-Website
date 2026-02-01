'use client';

import { LoadingState } from '@/components/ui/common';
import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  useQueryState,
  useQueryStates
} from 'nuqs';
import { useUsers } from '../hooks/useUsers';
import { UserTable } from './user-tables';
import { columns } from '@/features/users/components/user-tables/columns';

export default function UserListingPage() {
  const [page] = useQueryState('page', parseAsInteger.withDefault(1));
  const [pageSize] = useQueryState('perPage', parseAsInteger.withDefault(10));
  const [filters] = useQueryStates({
    name: parseAsString.withDefault(''),
    role: parseAsArrayOf(parseAsString, ',').withDefault([]),
    status: parseAsArrayOf(parseAsString, ',').withDefault([])
  });

  const searchTerm = filters.name?.trim() ? filters.name : undefined;
  const role = filters.role?.[0];
  const status = filters.status?.[0];

  const { data, isLoading } = useUsers({
    pageNumber: page,
    pageSize,
    searchTerm,
    role,
    status
  });

  if (isLoading) return <LoadingState />;

  return (
    <UserTable
      data={data?.users ?? []}
      totalItems={data?.totalCount ?? 0}
      columns={columns}
    />
  );
}
