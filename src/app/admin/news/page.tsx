import PageContainer from '@/components/layout/page-container';
import NewsPageClient from './news-page-client';

export const metadata = {
  title: 'Admin: News & Updates'
};

export default function NewsPage() {
  return (
    <PageContainer
      scrollable={false}
      pageTitle='Tin tức'
      pageDescription='Đăng và chỉnh sửa tin tức, thông báo liên quan đến ngập lụt.'
    >
      <NewsPageClient />
    </PageContainer>
  );
}
