import PageContainer from '@/components/layout/page-container';
import AnalyticsView from '@/features/analytics/views/AnalyticsView';

export const metadata = {
  title: 'Admin: Analytics'
};

export default function Page() {
  return (
    <PageContainer scrollable={false}>
      <AnalyticsView />
    </PageContainer>
  );
}
