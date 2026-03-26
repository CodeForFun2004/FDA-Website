'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Station } from '@/features/stations/types/station.type';
import { MapPin } from 'lucide-react';

interface StationLocationSectionProps {
  station: Station;
}

export function StationLocationSection({
  station
}: StationLocationSectionProps) {
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${station.longitude - 0.01}%2C${station.latitude - 0.01}%2C${station.longitude + 0.01}%2C${station.latitude + 0.01}&layer=mapnik&marker=${station.latitude}%2C${station.longitude}`;

  return (
    <Card className='border-border bg-card overflow-hidden'>
      <CardHeader className='border-border flex flex-row items-center justify-between border-b px-4 py-3'>
        <CardTitle className='text-foreground text-sm font-semibold'>
          Station Location
        </CardTitle>
        <span className='text-muted-foreground text-xs'>
          {station.latitude.toFixed(4)}° N, {station.longitude.toFixed(4)}° E
        </span>
      </CardHeader>
      <CardContent className='p-0'>
        <div className='bg-muted relative h-64 w-full'>
          <iframe
            title='Station map'
            src={mapSrc}
            className='h-full w-full border-0'
            loading='lazy'
          />
          <div className='bg-card border-border absolute bottom-4 left-4 flex items-center gap-1.5 rounded-lg border px-3 py-2 shadow-lg'>
            <MapPin className='text-primary h-3.5 w-3.5' />
            <span className='text-foreground text-xs font-medium'>
              {station.roadName || station.locationDesc || 'Unknown location'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
