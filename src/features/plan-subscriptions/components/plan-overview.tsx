'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import type { PricingPlan } from '@/features/plan-subscriptions/types/plan-subscription.type';

interface PlanOverviewProps {
  plans: PricingPlan[];
}

export function PlanOverview({ plans }: PlanOverviewProps) {
  const totalPlans = plans.length;
  const activePlans = plans.filter((p) => p.isActive).length;
  const inactivePlans = plans.filter((p) => !p.isActive).length;
  const totalFeatures = plans.reduce((acc, p) => acc + p.features.length, 0);

  const stats = [
    {
      label: 'Total Plans',
      value: totalPlans,
      icon: CreditCard,
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-600 dark:text-blue-400',
      trend: null
    },
    {
      label: 'Active Plans',
      value: activePlans,
      icon: CheckCircle2,
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      trend: null
    },
    {
      label: 'Inactive Plans',
      value: inactivePlans,
      icon: XCircle,
      iconBg: 'bg-slate-500/10',
      iconColor: 'text-slate-500 dark:text-slate-400',
      trend: null
    },
    {
      label: 'Total Features',
      value: totalFeatures,
      icon: Sparkles,
      iconBg: 'bg-violet-500/10',
      iconColor: 'text-violet-600 dark:text-violet-400',
      trend: null
    }
  ];

  return (
    <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.label}
            className='group relative overflow-hidden border transition-shadow hover:shadow-md'
          >
            {/* Subtle gradient background */}
            <div className='to-primary/[0.02] pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent via-transparent' />

            <CardContent className='flex items-center gap-4 p-5'>
              <div
                className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${stat.iconBg} transition-transform group-hover:scale-110`}
              >
                <Icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
              <div className='min-w-0 flex-1'>
                <p className='text-muted-foreground text-xs font-medium'>
                  {stat.label}
                </p>
                <p className='text-foreground mt-0.5 text-2xl font-bold tabular-nums'>
                  {stat.value}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
