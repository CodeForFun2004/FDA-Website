// src/app/authority/page.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/common';
import { Skeleton } from '@/components/ui/skeleton';
import {
  IconMapPin,
  IconAlertTriangle,
  IconChartLine,
  IconUsers,
  IconBuildingCommunity,
  IconShieldCheck
} from '@tabler/icons-react';
import { useAuthStore } from '@/features/authenticate/store/auth-store';
import {
  ADMINISTRATIVE_AREA_MAP_LEVEL,
  getAdministrativeAreasApi
} from '@/features/admin/api/admin.api';

export default function AuthorityDashboard() {
  const user = useAuthStore((state) => state.user);

  const areasQuery = useQuery({
    queryKey: ['authority-administrative-areas', ADMINISTRATIVE_AREA_MAP_LEVEL],
    queryFn: () =>
      getAdministrativeAreasApi({
        pageNumber: 1,
        pageSize: 500,
        level: ADMINISTRATIVE_AREA_MAP_LEVEL
      }),
    staleTime: 60_000,
    retry: 1
  });

  const areaRows = areasQuery.data?.administrativeAreas ?? [];
  const areaTotal = areasQuery.data?.totalCount ?? areaRows.length;

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>
          Government Information Portal
        </h1>
        <p className='text-muted-foreground mt-1'>
          FDA flood monitoring and management system - Area{' '}
          {user?.fullName || 'Authority'}
        </p>
      </div>

      {/* Welcome Card */}
      <Card className='border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 dark:border-blue-900/50 dark:from-blue-950/30 dark:to-indigo-950/30'>
        <CardHeader>
          <div className='flex items-center gap-3'>
            <div className='rounded-lg bg-blue-100 p-2 dark:bg-blue-900/50'>
              <IconShieldCheck className='h-6 w-6 text-blue-600 dark:text-blue-400' />
            </div>
            <div>
              <CardTitle className='text-blue-900 dark:text-blue-100'>
                Welcome, {user?.fullName || 'Officer'}!
              </CardTitle>
              <CardDescription className='text-blue-700 dark:text-blue-300'>
                Role: Government staff
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className='text-sm text-blue-800 dark:text-blue-200'>
            You can access monitoring and flood reporting features in your
            managed area.
          </p>
        </CardContent>
      </Card>

      {/* Statistics Grid */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Managed areas</CardTitle>
            <IconBuildingCommunity className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            {areasQuery.isLoading ? (
              <Skeleton className='h-8 w-14' />
            ) : areasQuery.isError ? (
              <div className='text-muted-foreground text-2xl font-bold'>—</div>
            ) : (
              <div className='text-2xl font-bold'>{areaTotal}</div>
            )}
            <p className='text-muted-foreground text-xs'>
              Wards/communes monitored
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Monitoring stations
            </CardTitle>
            <IconMapPin className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>24</div>
            <p className='text-muted-foreground text-xs'>Active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Flood alerts</CardTitle>
            <IconAlertTriangle className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-orange-600'>3</div>
            <p className='text-muted-foreground text-xs'>
              Flood points under alert
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Citizen followers
            </CardTitle>
            <IconUsers className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>2,345</div>
            <p className='text-muted-foreground text-xs'>+12% this month</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Khu hành chính</CardTitle>
          <CardDescription>
            Đồng bộ từ hệ thống (administrative areas).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {areasQuery.isLoading ? (
            <div className='space-y-2'>
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className='h-4 w-full' />
              ))}
            </div>
          ) : areasQuery.isError ? (
            <p className='text-muted-foreground text-sm'>
              Không tải được danh sách khu hành chính.
            </p>
          ) : areaRows.length === 0 ? (
            <p className='text-muted-foreground text-sm'>Chưa có dữ liệu.</p>
          ) : (
            <ul className='max-h-56 space-y-1.5 overflow-y-auto text-sm'>
              {areaRows.map((a) => (
                <li
                  key={a.id}
                  className='text-foreground border-border/60 flex justify-between gap-2 border-b py-1.5 last:border-0'
                >
                  <span className='min-w-0 truncate font-medium'>{a.name}</span>
                  <span className='text-muted-foreground shrink-0 text-xs uppercase'>
                    {a.level}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {!areasQuery.isLoading &&
            !areasQuery.isError &&
            areaTotal > areaRows.length && (
              <p className='text-muted-foreground mt-2 text-xs'>
                Đang hiển thị {areaRows.length} / {areaTotal} bản ghi.
              </p>
            )}
        </CardContent>
      </Card>

      {/* Info Cards */}
      <div className='grid gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Key functions</CardTitle>
            <CardDescription>Features for government staff</CardDescription>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='flex items-start gap-3 rounded-lg border p-3'>
              <IconMapPin className='text-primary mt-0.5 h-5 w-5' />
              <div>
                <p className='text-sm font-medium'>Monitor stations</p>
                <p className='text-muted-foreground text-xs'>
                  Track flood conditions in real time
                </p>
              </div>
            </div>
            <div className='flex items-start gap-3 rounded-lg border p-3'>
              <IconAlertTriangle className='text-primary mt-0.5 h-5 w-5' />
              <div>
                <p className='text-sm font-medium'>Manage alerts</p>
                <p className='text-muted-foreground text-xs'>
                  View and respond to flood alerts
                </p>
              </div>
            </div>
            <div className='flex items-start gap-3 rounded-lg border p-3'>
              <IconChartLine className='text-primary mt-0.5 h-5 w-5' />
              <div>
                <p className='text-sm font-medium'>Analytics reports</p>
                <p className='text-muted-foreground text-xs'>
                  Create and view periodic flood reports
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='border-amber-200 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/20'>
          <CardHeader>
            <CardTitle className='text-amber-900 dark:text-amber-100'>
              In development
            </CardTitle>
            <CardDescription className='text-amber-700 dark:text-amber-300'>
              Upcoming features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-amber-800 dark:text-amber-200'>
              We are building additional features for government staff:
            </p>
            <ul className='mt-3 space-y-2 text-sm text-amber-800 dark:text-amber-200'>
              <li className='flex items-start gap-2'>
                <span className='text-amber-600 dark:text-amber-400'>•</span>
                <span>Area-specific dashboards</span>
              </li>
              <li className='flex items-start gap-2'>
                <span className='text-amber-600 dark:text-amber-400'>•</span>
                <span>Flood trend analysis tools</span>
              </li>
              <li className='flex items-start gap-2'>
                <span className='text-amber-600 dark:text-amber-400'>•</span>
                <span>Automatic SMS/Email notifications</span>
              </li>
              <li className='flex items-start gap-2'>
                <span className='text-amber-600 dark:text-amber-400'>•</span>
                <span>Area user management</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Footer Note */}
      <Card>
        <CardContent className='pt-6'>
          <p className='text-muted-foreground text-center text-sm'>
            💡 <strong>Note:</strong> The system is still being finalized. If
            you need support, please contact the technical team.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
