'use client';

import React from 'react';
import { PaymentsOverview } from './payments-overview';
import { PaymentsTable } from './payments-table';

export default function BillingPaymentListing() {
  return (
    <div className='space-y-6'>
      <PaymentsOverview />
      <PaymentsTable />
    </div>
  );
}
