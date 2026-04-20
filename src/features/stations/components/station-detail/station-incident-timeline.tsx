'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { MockIncident } from '@/features/stations/mocks/stations-mock';
import { Clock, AlertTriangle, Zap, Wrench } from 'lucide-react';

interface StationIncidentTimelineProps {
  incidents: MockIncident[];
}

function getIncidentConfig(type: MockIncident['type']) {
  switch (type) {
    case 'maintenance':
      return {
        icon: Clock,
        bg: 'bg-blue-500/10',
        iconColor: 'text-blue-600 dark:text-blue-400',
        ring: 'ring-background'
      };
    case 'alert':
      return {
        icon: AlertTriangle,
        bg: 'bg-red-500/10',
        iconColor: 'text-red-600 dark:text-red-400',
        ring: 'ring-background'
      };
    case 'power':
      return {
        icon: Zap,
        bg: 'bg-orange-500/10',
        iconColor: 'text-orange-600 dark:text-orange-400',
        ring: 'ring-background'
      };
    case 'sensor':
      return {
        icon: Wrench,
        bg: 'bg-purple-500/10',
        iconColor: 'text-purple-600 dark:text-purple-400',
        ring: 'ring-background'
      };
    default:
      return {
        icon: Clock,
        bg: 'bg-muted',
        iconColor: 'text-muted-foreground',
        ring: 'ring-background'
      };
  }
}

export function StationIncidentTimeline({
  incidents
}: StationIncidentTimelineProps) {
  return (
    <Card className='border-border bg-card overflow-hidden'>
      <CardHeader className='border-border border-b px-4 py-4'>
        <CardTitle className='text-foreground text-sm font-semibold'>
          Recent Incidents
        </CardTitle>
      </CardHeader>
      <CardContent className='p-5'>
        <div className='flow-root'>
          <ul className='-mb-8' role='list'>
            {incidents.map((incident, idx) => {
              const config = getIncidentConfig(incident.type);
              const Icon = config.icon;
              const isLast = idx === incidents.length - 1;

              return (
                <li key={incident.id}>
                  <div className='relative pb-8'>
                    {!isLast && (
                      <span
                        aria-hidden='true'
                        className='bg-border absolute top-4 left-4 -ml-px h-full w-0.5'
                      />
                    )}
                    <div className='relative flex space-x-3'>
                      <div>
                        <span
                          className={`ring-background flex h-8 w-8 items-center justify-center rounded-full ring-8 ${config.bg}`}
                        >
                          <Icon className={`h-4 w-4 ${config.iconColor}`} />
                        </span>
                      </div>
                      <div className='flex min-w-0 flex-1 justify-between space-x-4 pt-1.5'>
                        <div>
                          <p className='text-foreground text-sm font-medium'>
                            {incident.title}
                          </p>
                          <p className='text-muted-foreground text-xs'>
                            {incident.description}
                          </p>
                        </div>
                        <div className='text-muted-foreground text-right text-xs whitespace-nowrap'>
                          {incident.date}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
        <div className='border-border mt-6 border-t pt-4'>
          <Button
            variant='ghost'
            className='text-primary w-full text-center text-sm font-medium'
          >
            Xem toàn bộ lịch sử
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
