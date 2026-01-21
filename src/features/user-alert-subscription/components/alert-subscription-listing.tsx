'use client';

import { useEffect, useState } from 'react';
import type { AlertSubscription } from '../types/alert-subscription.type';
import { alertSubscriptionsApi } from '../api/alert-subscription.api';

import { AlertSubscriptionTable } from './alert-subscription-tables';
import { columns } from './alert-subscription-tables/columns';

type AlertSubscriptionListingPageProps = {};

export default function AlertSubscriptionListingPage({}: AlertSubscriptionListingPageProps) {
  const [data, setData] = useState<AlertSubscription[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // For now, use hardcoded values since we don't have search params in client component
        const page = 1;
        const perPage = 10;
        const search = '';
        const apiSeverity = null;

        console.log('🔍 Making API call to alert subscriptions...');
        const response = await alertSubscriptionsApi.getAlertSubscriptions({
          page,
          perPage,
          userEmail: search,
          severity: apiSeverity
        });

        console.log('✅ API Response received:', response);

        // Extract data from API response
        const subscriptions = response.data.subscriptions;
        const pagination = response.data.pagination;

        console.log('✅ API Response processed:', {
          subscriptionsCount: subscriptions.length,
          totalCount: pagination.totalCount
        });

        setData(subscriptions);
        setTotalItems(pagination.totalCount);
      } catch (error: any) {
        console.error('❌ API Error:', {
          error,
          message: error.message,
          status: error.status,
          data: error.data
        });

        setError(error.message || 'Failed to load alert subscriptions');
        setData([]);
        setTotalItems(0);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <div className='text-muted-foreground'>
          Loading alert subscriptions...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex items-center justify-center py-8'>
        <div className='text-destructive'>Error: {error}</div>
      </div>
    );
  }

  return (
    <AlertSubscriptionTable
      data={data}
      totalItems={totalItems}
      columns={columns}
    />
  );
}
