import PageContainer from '@/components/layout/page-container';
import { HangfireDashboardEmbed } from '@/features/analytics/components/hangfire-dashboard-embed';

export const metadata = {
  title: 'Authority: Tác vụ'
};

export default function AuthorityTasksPage() {
  return (
    <PageContainer
      scrollable={false}
      pageTitle='Tác vụ'
      pageDescription='Theo dõi job Hangfire (gom dữ liệu, lịch chạy).'
    >
      <HangfireDashboardEmbed />
    </PageContainer>
  );
}
