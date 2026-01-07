'use client';

import React, { useState, useMemo } from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  Polygon,
  Marker
} from '@react-google-maps/api';
import { useZones, useAlerts } from '@/lib/api';
import { Card, LoadingState } from '@/components/ui/common';
import { MapPin } from 'lucide-react';
import { Zone } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ZoneDetailCard } from '../components/ZoneDetailCard';

declare const google: any;

const containerStyle = {
  width: '100%',
  height: '100%'
};

// Da Nang Center - Adjusted to see all districts
const center = {
  lat: 16.06,
  lng: 108.17
};

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: false,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    },
    {
      featureType: 'transit',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    }
  ]
};

// Custom Styles for Risk Levels
const getZoneOptions = (riskLevel: string) => {
  let fillColor = '#10b981'; // Safe (Emerald)
  let strokeColor = '#059669';

  if (riskLevel === 'Watch') {
    fillColor = '#f97316'; // Orange
    strokeColor = '#c2410c';
  } else if (riskLevel === 'Flooded') {
    fillColor = '#ef4444'; // Red
    strokeColor = '#b91c1c';
  }

  return {
    fillColor,
    fillOpacity: 0.35,
    strokeColor,
    strokeWeight: 2,
    clickable: true
  };
};

export default function ZonesPage() {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: '' // ENTER YOUR API KEY HERE
  });

  const { data: zones } = useZones();
  const { data: alerts } = useAlerts();

  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [forecastHour, setForecastHour] = useState(1);

  // Separate zones into Polygons (Districts) and Hotspots (Points)
  const districts = useMemo(
    () => zones?.filter((z) => z.type === 'District') || [],
    [zones]
  );
  const hotspots = useMemo(
    () => zones?.filter((z) => z.type === 'Custom') || [],
    [zones]
  );

  if (!isLoaded) return <LoadingState />;

  return (
    <div className='relative h-[calc(100vh-5rem)] w-full overflow-hidden rounded-2xl border bg-slate-100 shadow-sm'>
      {/* Google Map Background */}
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={11}
        options={mapOptions}
        onClick={() => setSelectedZone(null)}
      >
        {/* Render District Polygons */}
        {districts.map((zone) => (
          <Polygon
            key={zone.id}
            paths={zone.coordinates?.map((c) => ({ lat: c[0], lng: c[1] }))}
            options={getZoneOptions(zone.riskLevel)}
            onClick={() => setSelectedZone(zone)}
          />
        ))}

        {/* Render Hotspot Markers */}
        {hotspots.map(
          (zone) =>
            zone.center && (
              <Marker
                key={zone.id}
                position={{ lat: zone.center[0], lng: zone.center[1] }}
                onClick={() => setSelectedZone(zone)}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 8,
                  fillColor:
                    zone.riskLevel === 'Flooded' ? '#ef4444' : '#f97316',
                  fillOpacity: 1,
                  strokeColor: '#ffffff',
                  strokeWeight: 2
                }}
                animation={
                  zone.riskLevel === 'Flooded'
                    ? google.maps.Animation.BOUNCE
                    : undefined
                }
              />
            )
        )}

        {/* Selected Zone Highlight Marker */}
        {selectedZone &&
          selectedZone.center &&
          selectedZone.type === 'Custom' && (
            <Marker
              position={{
                lat: selectedZone.center[0],
                lng: selectedZone.center[1]
              }}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 12,
                fillColor: '#2563eb',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 3
              }}
            />
          )}
      </GoogleMap>

      {/* --- TOP CENTER: Search Bar --- */}
      <div className='pointer-events-none absolute top-4 right-4 left-4 z-10 flex justify-center'>
        <div className='pointer-events-auto flex w-full max-w-sm items-center rounded-2xl border border-slate-100 bg-white/95 p-3 shadow-lg backdrop-blur'>
          <MapPin className='mr-3 h-5 w-5 text-blue-500' />
          <input
            className='w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400'
            placeholder='Tìm kiếm quận, huyện...'
          />
        </div>
      </div>

      {/* --- TOP RIGHT: Zone Detail Card --- */}
      {selectedZone && (
        <ZoneDetailCard
          zone={selectedZone}
          onClose={() => setSelectedZone(null)}
        />
      )}

      {/* --- BOTTOM CENTER: Forecast Slider --- */}
      <div className='pointer-events-none absolute right-4 bottom-6 left-4 z-10 flex justify-center'>
        <Card className='animate-in slide-in-from-bottom-4 pointer-events-auto w-full max-w-sm rounded-2xl border-none bg-white/95 p-4 shadow-xl backdrop-blur-md duration-500'>
          <div className='mb-3 flex items-center justify-between'>
            <h3 className='text-sm font-bold text-slate-800'>
              Thời gian dự báo
            </h3>
            <span className='text-xs font-bold text-blue-600'>
              +{forecastHour} giờ
            </span>
          </div>

          {/* Custom Range Slider UI */}
          <div className='relative flex h-6 items-center select-none'>
            {/* Track */}
            <div className='absolute h-1.5 w-full overflow-hidden rounded-full bg-slate-200'>
              <div
                className='h-full bg-blue-500 transition-all duration-300'
                style={{ width: `${(forecastHour / 3) * 100}%` }}
              ></div>
            </div>

            {/* Thumb */}
            <div
              className='absolute z-20 h-5 w-5 cursor-grab rounded-full border-2 border-blue-500 bg-white shadow-md transition-all duration-300'
              style={{ left: `calc(${(forecastHour / 3) * 100}% - 10px)` }}
            ></div>
          </div>

          {/* Labels */}
          <div className='mt-3 flex justify-between text-[10px] font-semibold tracking-wide text-slate-400 uppercase'>
            <span
              onClick={() => setForecastHour(0)}
              className={cn(
                'cursor-pointer',
                forecastHour === 0 && 'text-blue-600'
              )}
            >
              Hiện tại
            </span>
            <span
              onClick={() => setForecastHour(1)}
              className={cn(
                'cursor-pointer',
                forecastHour === 1 && 'text-blue-600'
              )}
            >
              +1 giờ
            </span>
            <span
              onClick={() => setForecastHour(2)}
              className={cn(
                'cursor-pointer',
                forecastHour === 2 && 'text-blue-600'
              )}
            >
              +2 giờ
            </span>
            <span
              onClick={() => setForecastHour(3)}
              className={cn(
                'cursor-pointer',
                forecastHour === 3 && 'text-blue-600'
              )}
            >
              +3 giờ
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}

// Named export for compatibility
export { ZonesPage as ZonesView };
