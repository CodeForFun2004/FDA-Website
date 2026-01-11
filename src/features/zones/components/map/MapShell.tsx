'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as React from 'react';
import MapView from './MapView';
import LayerPanel from './LayerPanel';
import LegendFlood from './LegendFlood';
import { useMapPreferences } from '../../hooks/useMapPreferences';

const queryClient = new QueryClient();

export default function MapShell() {
  return (
    <QueryClientProvider client={queryClient}>
      <Inner />
    </QueryClientProvider>
  );
}

function Inner() {
  const { prefs, setPrefsPartial, syncState, isAuthenticated } =
    useMapPreferences();

  return (
    <div className='relative h-[calc(100vh-64px)] w-full'>
      <MapView prefs={prefs} />

      {/* Panel bên phải */}
      <div className='absolute top-3 right-3 z-50 w-[320px] max-w-[calc(100vw-24px)]'>
        <LayerPanel
          prefs={prefs}
          setPrefsPartial={setPrefsPartial}
          syncState={syncState}
          isAuthenticated={isAuthenticated}
        />
      </div>

      {/* Legend góc trái dưới */}
      <div className='absolute bottom-3 left-3 z-50'>
        <LegendFlood visible={prefs.overlays.flood} />
      </div>
    </div>
  );
}
