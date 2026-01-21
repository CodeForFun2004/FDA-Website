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
      pageTitle='User Alert Subscriptions'
      pageDescription='View user alert subscriptions with detailed information (Client side table functionalities.)'
    >
      <AlertSubscriptionListingPage />
    </PageContainer>
  );
}
