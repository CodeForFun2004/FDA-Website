'use client';

import PageContainer from '@/components/layout/page-container';
import { AlertTemplatesView } from '@/features/alerts/views/alert-templates-view';

export default function AlertsPage() {
  return (
    <PageContainer
      scrollable={false}
      pageTitle='Alert Templates'
      pageDescription='Manage your notification templates for various alert channels.'
    >
      <AlertTemplatesView />
    </PageContainer>
  );
}
