import PageContainer from '@/components/layout/page-container';
import AlertSubscriptionListingPage from '@/features/user-alert-subscription/components/alert-subscription-listing';

export const metadata = {
  title: 'Admin: User Alert Subscriptions'
};

// This is a server component
export default function UserAlertSubscriptionPage() {
  return (
    <PageContainer
      scrollable={false}
      pageTitle='Đăng ký nhận cảnh báo'
      pageDescription='Xem và quản lý đăng ký nhận cảnh báo của người dùng.'
    >
      <AlertSubscriptionListingPage />
    </PageContainer>
  );
}
