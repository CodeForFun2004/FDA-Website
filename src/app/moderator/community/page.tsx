import PageContainer from '@/components/layout/page-container';
import ModeratorCommunityPage from '@/features/community-reports/components/moderator-community-page';

export const metadata = {
  title: 'Moderator: Phản ánh cộng đồng'
};

export default function Page() {
  return (
    <PageContainer
      scrollable
      pageTitle='Phản ánh cộng đồng'
      pageDescription='Xem bài phản ánh ngập từ người dân, lọc theo tiêu chí và ẩn bài không phù hợp.'
    >
      <ModeratorCommunityPage />
    </PageContainer>
  );
}
