'use client';

import React from 'react';
import { planSubscriptionApi } from '../api/plan-subscription.api';
import { MOCK_PLANS } from '../mocks/plan-subscription.mock';
import { PlanTable } from './plan-table';
import { PlanOverview } from './plan-overview';
import type { PricingPlan } from '../types/plan-subscription.type';
import { getAccessToken } from '@/libs/auth-utils';
import { devLog, devWarn } from '@/libs/env';

function logPlanShape(plans: any[]) {
  if (!Array.isArray(plans) || plans.length === 0) {
    devLog('[PlanListingPage] plans is empty or not array');
    return;
  }

  const first = plans[0];
  devLog('[PlanListingPage] first plan shape check:', {
    id: typeof first?.id,
    code: typeof first?.code,
    name: typeof first?.name,
    description: typeof first?.description,
    priceMonth: typeof first?.priceMonth,
    priceYear: typeof first?.priceYear,
    tier: typeof first?.tier,
    isActive: typeof first?.isActive,
    sortOrder: typeof first?.sortOrder,
    featuresIsArray: Array.isArray(first?.features),
    firstFeatureShape: first?.features?.[0]
      ? {
          id: typeof first.features[0]?.id,
          featureKey: typeof first.features[0]?.featureKey,
          featureName: typeof first.features[0]?.featureName,
          featureValue: typeof first.features[0]?.featureValue,
          description: typeof first.features[0]?.description
        }
      : null
  });
}

export default function PlanListingPage() {
  const [plans, setPlans] = React.useState<PricingPlan[]>(MOCK_PLANS);
  const [dataSource, setDataSource] = React.useState<'API' | 'MOCK'>('MOCK');

  React.useEffect(() => {
    let isMounted = true;

    const loadPlans = async () => {
      let resolvedPlans: PricingPlan[] = MOCK_PLANS;
      let resolvedSource: 'API' | 'MOCK' = 'MOCK';

      try {
        devLog('[PlanListingPage] calling getPlans...');

        const token = await getAccessToken();
        if (!token) {
          throw new Error('Missing access token');
        }

        const data = await planSubscriptionApi.getPlans(token);

        devLog('[PlanListingPage] envelope check:', {
          hasSuccessField: data && 'success' in data,
          success: data?.success,
          hasDataField: data && 'data' in data,
          isDataArray: Array.isArray(data?.data),
          dataLength: Array.isArray(data?.data) ? data.data.length : null,
          message: data?.message,
          statusCode: data?.statusCode
        });

        if (data?.success && Array.isArray(data?.data)) {
          devLog('[PlanListingPage] using REAL API data');
          logPlanShape(data.data);
          resolvedPlans = data.data;
          resolvedSource = 'API';
        } else {
          devWarn(
            '[PlanListingPage] API response shape mismatch -> fallback to MOCK_PLANS'
          );
          devWarn('[PlanListingPage] mismatch detail:', {
            success: data?.success,
            isDataArray: Array.isArray(data?.data),
            actualDataType: typeof data?.data,
            actualDataValue: data?.data
          });
          resolvedPlans = MOCK_PLANS;
          resolvedSource = 'MOCK';
        }
      } catch (error: any) {
        devWarn('[PlanListingPage] API call failed -> fallback to MOCK_PLANS', {
          name: error?.name,
          message: error?.message,
          status: error?.status
        });
        resolvedPlans = MOCK_PLANS;
        resolvedSource = 'MOCK';
      } finally {
        if (isMounted) {
          setPlans(resolvedPlans);
          setDataSource(resolvedSource);
          devLog(
            '[PlanListingPage] final rendered data source:',
            resolvedSource
          );
          devLog(
            '[PlanListingPage] final total plans:',
            Array.isArray(resolvedPlans) ? resolvedPlans.length : 0
          );
        }
      }
    };

    loadPlans();
    return () => {
      isMounted = false;
    };
  }, []);

  const sortedPlans = React.useMemo(
    () => [...plans].sort((a, b) => a.sortOrder - b.sortOrder),
    [plans]
  );

  return (
    <div className='space-y-6'>
      <PlanOverview plans={sortedPlans} />
      <PlanTable data={sortedPlans} totalItems={sortedPlans.length} />
    </div>
  );
}
