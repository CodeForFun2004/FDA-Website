'use client';

import PageContainer from '@/components/layout/page-container';
import { AlertTemplatesView } from '@/features/alerts/views/alert-templates-view';
import { AlertHistoryView } from '@/features/alerts/views/alert-history-view';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IconBellRinging, IconTemplate } from '@tabler/icons-react';

export default function AlertsPage() {
  return (
    <PageContainer
      scrollable={false}
      pageTitle='Alerts Center'
      pageDescription='Monitor alert history and manage notification templates.'
    >
      <Tabs defaultValue='history' className='space-y-6'>
        <TabsList className='bg-muted/50 grid w-full max-w-md grid-cols-2 rounded-2xl p-1'>
          <TabsTrigger
            value='history'
            className='gap-2 rounded-xl transition-all data-[state=active]:shadow-md'
          >
            <IconBellRinging className='h-4 w-4' />
            Alert History
          </TabsTrigger>
          <TabsTrigger
            value='templates'
            className='gap-2 rounded-xl transition-all data-[state=active]:shadow-md'
          >
            <IconTemplate className='h-4 w-4' />
            Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value='history'>
          <div className='bg-card overflow-hidden rounded-2xl border shadow-sm'>
            <AlertHistoryView />
          </div>
        </TabsContent>

        <TabsContent value='templates'>
          <AlertTemplatesView />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
