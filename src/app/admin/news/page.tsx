import PageContainer from '@/components/layout/page-container';
import NewsPageClient from './news-page-client';

export const metadata = {
  title: 'Admin: News & Updates'
};

export default function NewsPage() {
  return (
    <PageContainer
      scrollable={false}
      pageTitle='News & Updates'
      pageDescription='Manage news articles and updates related to flood events, safety tips, and community announcements.'
    >
      <NewsPageClient />
    </PageContainer>
  );
}
