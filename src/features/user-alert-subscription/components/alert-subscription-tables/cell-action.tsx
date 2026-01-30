'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import type { AlertSubscription } from '@/features/user-alert-subscription/types/alert-subscription.type';
import { IconDotsVertical, IconEye } from '@tabler/icons-react';
import { useState } from 'react';
import { AlertSubscriptionDetailDialog } from '../AlertSubscriptionDetailDialog';

interface CellActionProps {
  data: AlertSubscription;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <AlertSubscriptionDetailDialog
        open={open}
        onOpenChange={setOpen}
        subscriptionData={data}
      />

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <span className='sr-only'>Open menu</span>
            <IconDotsVertical className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <IconEye className='mr-2 h-4 w-4' /> View detail
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
