// features/plan-subscriptions/mocks/plan-subscription.mock.ts

import type { PricingPlan } from '../types/plan-subscription.type';

export const MOCK_PLANS: PricingPlan[] = [
  {
    id: 'plan-001',
    code: 'FREE',
    name: 'Free Plan',
    description:
      'Basic access for residents. Monitor flood alerts in your area.',
    priceMonth: 0,
    priceYear: 0,
    tier: 1,
    isActive: true,
    sortOrder: 1,
    features: [
      {
        id: 'f-001',
        featureKey: 'max_stations',
        featureName: 'Max Stations',
        featureValue: '1',
        description: 'Monitor up to 1 station'
      },
      {
        id: 'f-002',
        featureKey: 'alert_channels',
        featureName: 'Alert Channels',
        featureValue: 'In-App',
        description: 'In-app notifications only'
      },
      {
        id: 'f-003',
        featureKey: 'history_days',
        featureName: 'History Access',
        featureValue: '7 days',
        description: 'Access to last 7 days of data'
      }
    ]
  },
  {
    id: 'plan-002',
    code: 'BASIC',
    name: 'Basic Plan',
    description:
      'Enhanced monitoring with SMS alerts and multi-station tracking.',
    priceMonth: 49000,
    priceYear: 490000,
    tier: 2,
    isActive: true,
    sortOrder: 2,
    features: [
      {
        id: 'f-004',
        featureKey: 'max_stations',
        featureName: 'Max Stations',
        featureValue: '5',
        description: 'Monitor up to 5 stations'
      },
      {
        id: 'f-005',
        featureKey: 'alert_channels',
        featureName: 'Alert Channels',
        featureValue: 'In-App, SMS',
        description: 'In-app and SMS notifications'
      },
      {
        id: 'f-006',
        featureKey: 'history_days',
        featureName: 'History Access',
        featureValue: '30 days',
        description: 'Access to last 30 days of data'
      },
      {
        id: 'f-007',
        featureKey: 'export',
        featureName: 'Data Export',
        featureValue: 'CSV',
        description: 'Export data as CSV'
      }
    ]
  },
  {
    id: 'plan-003',
    code: 'PREMIUM',
    name: 'Premium Plan',
    description:
      'Full-featured flood monitoring with priority alerts and analytics.',
    priceMonth: 149000,
    priceYear: 1490000,
    tier: 3,
    isActive: true,
    sortOrder: 3,
    features: [
      {
        id: 'f-008',
        featureKey: 'max_stations',
        featureName: 'Max Stations',
        featureValue: 'Unlimited',
        description: 'Monitor all stations'
      },
      {
        id: 'f-009',
        featureKey: 'alert_channels',
        featureName: 'Alert Channels',
        featureValue: 'In-App, SMS, Email',
        description: 'All notification channels'
      },
      {
        id: 'f-010',
        featureKey: 'history_days',
        featureName: 'History Access',
        featureValue: '365 days',
        description: 'Full year data history'
      },
      {
        id: 'f-011',
        featureKey: 'export',
        featureName: 'Data Export',
        featureValue: 'CSV, Excel, PDF',
        description: 'Export data in all formats'
      },
      {
        id: 'f-012',
        featureKey: 'analytics',
        featureName: 'Analytics',
        featureValue: 'Advanced',
        description: 'AI-powered flood prediction analytics'
      }
    ]
  },
  {
    id: 'plan-004',
    code: 'ENTERPRISE',
    name: 'Enterprise Plan',
    description:
      'Dedicated solution for organizations and government agencies.',
    priceMonth: 499000,
    priceYear: 4990000,
    tier: 4,
    isActive: false,
    sortOrder: 4,
    features: [
      {
        id: 'f-013',
        featureKey: 'max_stations',
        featureName: 'Max Stations',
        featureValue: 'Unlimited',
        description: 'Unlimited stations'
      },
      {
        id: 'f-014',
        featureKey: 'dedicated_support',
        featureName: 'Support',
        featureValue: '24/7 Dedicated',
        description: 'Round-the-clock dedicated support'
      },
      {
        id: 'f-015',
        featureKey: 'api_access',
        featureName: 'API Access',
        featureValue: 'Full',
        description: 'Full REST API access'
      }
    ]
  }
];
