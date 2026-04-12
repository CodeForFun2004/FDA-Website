import PageContainer from '@/components/layout/page-container';
import { HangfireDashboardEmbed } from '@/features/analytics/components/hangfire-dashboard-embed';

export const metadata = {
  title: 'Admin: Background jobs (Hangfire)'
};

export default function HangfireAnalyticsPage() {
  return (
    <PageContainer scrollable={false} pageTitle='Background jobs'>
      <HangfireDashboardEmbed />
    </PageContainer>
  );
}
