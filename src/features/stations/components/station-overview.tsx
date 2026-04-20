import { stationsApi } from '../api/station.api';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Activity, Wrench } from 'lucide-react';

export async function StationOverview() {
  let onlineCount = 0;
  let offlineCount = 0;
  let maintenanceCount = 0;

  try {
    const [online, offline, allStations] = await Promise.all([
      stationsApi.getOnlineStations().catch(() => ({ total: 0, items: [] })),
      stationsApi.getOfflineStations().catch(() => ({ total: 0, items: [] })),
      stationsApi
        .getStations({ page: 1, perPage: 1 })
        .catch(() => ({ totalCount: 0 }))
    ]);
    onlineCount = (online as any).total || 0;
    offlineCount = (offline as any).total || 0;

    const totalCount = (allStations as any).totalCount || 0;
    maintenanceCount = Math.max(0, totalCount - onlineCount - offlineCount);
  } catch (error) {
    console.warn('⚠️ Status APIs unavailable for overview', error);
  }

  // If all counts are 0, hide the dashboard to avoid showing empty stuff on error
  if (onlineCount === 0 && offlineCount === 0 && maintenanceCount === 0) {
    return null;
  }

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
        <Card className='border-border bg-card'>
          <CardContent className='flex items-center gap-4 p-6'>
            <div className='flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10'>
              <Activity className='h-6 w-6 text-green-600 dark:text-green-400' />
            </div>
            <div>
              <div className='text-3xl font-bold'>{onlineCount}</div>
              <p className='text-muted-foreground text-sm'>Đang trực tuyến</p>
            </div>
          </CardContent>
        </Card>

        <Card className='border-border bg-card'>
          <CardContent className='flex items-center gap-4 p-6'>
            <div className='flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10'>
              <AlertTriangle className='h-6 w-6 text-red-600 dark:text-red-400' />
            </div>
            <div>
              <div className='text-3xl font-bold'>{offlineCount}</div>
              <p className='text-muted-foreground text-sm'>Ngoại tuyến</p>
            </div>
          </CardContent>
        </Card>

        <Card className='border-border bg-card'>
          <CardContent className='flex items-center gap-4 p-6'>
            <div className='flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/10'>
              <Wrench className='h-6 w-6 text-yellow-600 dark:text-yellow-400' />
            </div>
            <div>
              <div className='text-3xl font-bold'>{maintenanceCount}</div>
              <p className='text-muted-foreground text-sm'>Đang bảo trì</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
