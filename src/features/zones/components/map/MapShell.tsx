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
  const { prefs, setPrefsPartial, syncState, isAuthenticated, saveManual } =
    useMapPreferences();
  const [isLayerPanelOpen, setIsLayerPanelOpen] = React.useState(false);

  return (
    <div className='relative h-[calc(100vh-64px)] w-full'>
      <MapView prefs={prefs} />

      {/* Panel bên phải */}
      {/* Panel bên phải (Collapsible) */}
      <div className='absolute top-3 right-3 z-50 flex flex-col items-end gap-2'>
        <button
          onClick={() => setIsLayerPanelOpen(!isLayerPanelOpen)}
          className='flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md transition-transform hover:scale-105 active:scale-95'
          title='Map Layers'
        >
          {/* Simple Layers Icon */}
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='20'
            height='20'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <polygon points='12 2 2 7 12 12 22 7 12 2'></polygon>
            <polyline points='2 17 12 22 22 17'></polyline>
            <polyline points='2 12 12 17 22 12'></polyline>
          </svg>
        </button>

        {isLayerPanelOpen && (
          <div className='animate-in fade-in slide-in-from-top-2 w-[320px] max-w-[calc(100vw-24px)]'>
            <LayerPanel
              prefs={prefs}
              setPrefsPartial={setPrefsPartial}
              syncState={syncState}
              isAuthenticated={isAuthenticated}
              saveManual={saveManual}
            />
          </div>
        )}
      </div>

      {/* Legend góc trái dưới */}
      <div className='absolute bottom-3 left-3 z-50'>
        <LegendFlood visible={prefs.overlays.flood} />
      </div>
    </div>
  );
}
