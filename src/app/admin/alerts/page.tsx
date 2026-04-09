'use client';

import PageContainer from '@/components/layout/page-container';
import { AlertTemplatesView } from '@/features/alerts/views/alert-templates-view';

export default function AlertsPage() {
  return (
    <PageContainer
      scrollable={false}
      pageTitle='Alert Templates'
      pageDescription='Manage notification templates for alert delivery.'
    >
      <AlertTemplatesView />
    </PageContainer>
  );
}
