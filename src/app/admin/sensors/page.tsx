'use client';

import { SensorsView } from '@/features/sensors';

export default function SensorsPage() {
  const handleRefresh = () => {
    // Optional: Additional refresh logic
    console.log('Sensors data refreshed');
  };

  return <SensorsView />;
}
