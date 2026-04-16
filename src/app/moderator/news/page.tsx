import PageContainer from '@/components/layout/page-container';
import NewsPageClient from '@/app/admin/news/news-page-client';

export const metadata = {
  title: 'Moderator: Tin Tức'
};

export default function ModeratorNewsPage() {
  return (
    <PageContainer
      scrollable={false}
      pageTitle='Tin Tức'
      pageDescription='Đăng và chỉnh sửa tin tức, thông báo liên quan đến ngập lụt.'
    >
      <NewsPageClient />
    </PageContainer>
  );
}
