'use client';

import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { Button } from '@/components/ui/button';
import { useDataTable } from '@/hooks/use-data-table';
import { columns } from './columns';
import { CreatePlanDialog } from '@/features/plan-subscriptions/components/create-plan-dialog';
import type { PricingPlan } from '@/features/plan-subscriptions/types/plan-subscription.type';
import type { ColumnDef } from '@tanstack/react-table';
import { Plus, EyeOff, Eye } from 'lucide-react';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  parseAsInteger,
  parseAsString,
  useQueryState,
  useQueryStates
} from 'nuqs';

interface PlanTableProps {
  data: PricingPlan[];
  totalItems: number;
}

export function PlanTable({ data, totalItems }: PlanTableProps) {
  const [openCreate, setOpenCreate] = useState(false);
  const [showInactive, setShowInactive] = useState(true);
  const queryClient = useQueryClient();
  const [page] = useQueryState('page', parseAsInteger.withDefault(1));
  const [pageSize] = useQueryState('perPage', parseAsInteger.withDefault(10));

  // Must match column id: `name` (single search input)
  const [filters] = useQueryStates({
    name: parseAsString.withDefault('')
  });
  const searchQuery = filters.name?.trim() ? filters.name.trim() : '';

  // Filter based on showInactive toggle
  const baseData = showInactive ? data : data.filter((p) => p.isActive);

  // Because the table is configured for server-side filtering (manualFiltering=true),
  // we must pre-filter the rows to match toolbar filters.
  const filteredData = (() => {
    if (!searchQuery) return baseData;
    const q = searchQuery.toLowerCase();
    return baseData.filter((p) => {
      const hay = `${p.code ?? ''} ${p.name ?? ''}`.toLowerCase();
      return hay.includes(q);
    });
  })();

  const pageCount = Math.ceil(filteredData.length / (pageSize ?? 10));

  const { table } = useDataTable({
    data: filteredData,
    columns: columns as ColumnDef<PricingPlan, unknown>[],
    pageCount,
    shallow: false,
    debounceMs: 500
  });

  return (
    <>
      <CreatePlanDialog
        open={openCreate}
        onOpenChange={setOpenCreate}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['plans'] });
        }}
      />

      <DataTable table={table}>
        <DataTableToolbar table={table}>
          <div className='flex items-center gap-2'>
            {/* Show/Hide Inactive Toggle */}
            <Button
              variant='outline'
              size='sm'
              onClick={() => setShowInactive(!showInactive)}
              className='gap-2 text-xs'
            >
              {showInactive ? (
                <>
                  <EyeOff className='h-3.5 w-3.5' />
                  Ẩn Inactive
                </>
              ) : (
                <>
                  <Eye className='h-3.5 w-3.5' />
                  Hiện Inactive
                </>
              )}
            </Button>

            {/* Create Button */}
            <Button
              onClick={() => setOpenCreate(true)}
              className='gap-2'
              size='sm'
            >
              <Plus className='h-4 w-4' />
              Tạo Gói
            </Button>
          </div>
        </DataTableToolbar>
      </DataTable>
    </>
  );
}
