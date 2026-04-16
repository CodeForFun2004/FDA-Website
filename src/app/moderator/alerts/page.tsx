'use client';

import PageContainer from '@/components/layout/page-container';
import { AlertTemplatesView } from '@/features/alerts/views/alert-templates-view';

export default function ModeratorAlertsPage() {
  return (
    <PageContainer
      scrollable={false}
      pageTitle='Mẫu Cảnh Báo'
      pageDescription='Soạn và quản lý nội dung gửi cảnh báo tới người dùng.'
    >
      <AlertTemplatesView />
    </PageContainer>
  );
}
