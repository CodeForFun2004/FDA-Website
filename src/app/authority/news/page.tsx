import PageContainer from '@/components/layout/page-container';
import NewsPageClient from '@/app/admin/news/news-page-client';

export const metadata = {
  title: 'Authority: Tin tức'
};

export default function AuthorityNewsPage() {
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
