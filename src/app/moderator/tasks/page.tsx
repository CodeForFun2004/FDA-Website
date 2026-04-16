import PageContainer from '@/components/layout/page-container';
import { HangfireDashboardEmbed } from '@/features/analytics/components/hangfire-dashboard-embed';

export const metadata = {
  title: 'Moderator: Tác Vụ'
};

export default function ModeratorTasksPage() {
  return (
    <PageContainer
      scrollable={false}
      pageTitle='Tác Vụ'
      pageDescription='Theo dõi job Hangfire (gom dữ liệu, lịch chạy).'
    >
      <HangfireDashboardEmbed />
    </PageContainer>
  );
}
