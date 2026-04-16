'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { IconPlus } from '@tabler/icons-react';
import { NewsListingPage, CreateNewsDialog } from '@/features/news';

export default function NewsPageClient() {
  const [createOpen, setCreateOpen] = useState(false);
  const [refreshSignal, setRefreshSignal] = useState(0);

  return (
    <>
      <div className='mb-4 flex items-center justify-end'>
        <Button onClick={() => setCreateOpen(true)}>
          <IconPlus className='mr-2 h-4 w-4' />
          Tạo Bản Tin
        </Button>
      </div>

      <NewsListingPage refreshSignal={refreshSignal} />

      <CreateNewsDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={() => setRefreshSignal((v) => v + 1)}
      />
    </>
  );
}
