'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import type { Area } from '../../types/area.type';
import { IconDotsVertical, IconEye } from '@tabler/icons-react';
import { useState } from 'react';
import { AreaDetailDialog } from '../AreaDetailDialog';

export function CellAction({ data }: { data: Area }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <AreaDetailDialog open={open} onOpenChange={setOpen} areaId={data.id} />

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
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
}
