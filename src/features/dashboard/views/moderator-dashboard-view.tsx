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

export function ModeratorDashboardView() {
  const user = useAuthStore((state) => state.user);

  const areasQuery = useQuery({
    queryKey: ['moderator-administrative-areas', ADMINISTRATIVE_AREA_MAP_LEVEL],
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
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>
          Cổng Thông Tin Điều Phối
        </h1>
        <p className='text-muted-foreground mt-1'>
          Hệ thống giám sát và quản lý ngập lụt FDA - Khu vực{' '}
          {user?.fullName || 'Điều phối viên'}
        </p>
      </div>

      <Card className='border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 dark:border-blue-900/50 dark:from-blue-950/30 dark:to-indigo-950/30'>
        <CardHeader>
          <div className='flex items-center gap-3'>
            <div className='rounded-lg bg-blue-100 p-2 dark:bg-blue-900/50'>
              <IconShieldCheck className='h-6 w-6 text-blue-600 dark:text-blue-400' />
            </div>
            <div>
              <CardTitle className='text-blue-900 dark:text-blue-100'>
                Xin chào, {user?.fullName || 'Cán bộ'}!
              </CardTitle>
              <CardDescription className='text-blue-700 dark:text-blue-300'>
                Vai trò: Điều phối viên
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className='text-sm text-blue-800 dark:text-blue-200'>
            Bạn có thể theo dõi và lập báo cáo ngập trong khu vực phụ trách.
          </p>
        </CardContent>
      </Card>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Khu vực quản lý
            </CardTitle>
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
              Phường/xã đang theo dõi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Trạm Quan Trắc
            </CardTitle>
            <IconMapPin className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>24</div>
            <p className='text-muted-foreground text-xs'>Đang hoạt động</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Cảnh báo ngập</CardTitle>
            <IconAlertTriangle className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-orange-600'>3</div>
            <p className='text-muted-foreground text-xs'>
              Điểm ngập đang cảnh báo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Người theo dõi
            </CardTitle>
            <IconUsers className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>2,345</div>
            <p className='text-muted-foreground text-xs'>+12% trong tháng</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Khu hành chính</CardTitle>
          <CardDescription>
            Đồng bộ từ hệ thống (các khu hành chính).
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

      <div className='grid gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Các chức năng chính</CardTitle>
            <CardDescription>
              Các tính năng dành cho cán bộ chính phủ
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='flex items-start gap-3 rounded-lg border p-3'>
              <IconMapPin className='text-primary mt-0.5 h-5 w-5' />
              <div>
                <p className='text-sm font-medium'>Giám sát trạm</p>
                <p className='text-muted-foreground text-xs'>
                  Theo dõi tình trạng ngập theo thời gian thực
                </p>
              </div>
            </div>
            <div className='flex items-start gap-3 rounded-lg border p-3'>
              <IconAlertTriangle className='text-primary mt-0.5 h-5 w-5' />
              <div>
                <p className='text-sm font-medium'>Quản lý cảnh báo</p>
                <p className='text-muted-foreground text-xs'>
                  Xem và phản hồi các cảnh báo ngập
                </p>
              </div>
            </div>
            <div className='flex items-start gap-3 rounded-lg border p-3'>
              <IconChartLine className='text-primary mt-0.5 h-5 w-5' />
              <div>
                <p className='text-sm font-medium'>Báo cáo phân tích</p>
                <p className='text-muted-foreground text-xs'>
                  Tạo và xem báo cáo ngập định kỳ
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='border-amber-200 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/20'>
          <CardHeader>
            <CardTitle className='text-amber-900 dark:text-amber-100'>
              Đang phát triển
            </CardTitle>
            <CardDescription className='text-amber-700 dark:text-amber-300'>
              Các tính năng sắp ra mắt
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-amber-800 dark:text-amber-200'>
              Chúng tôi đang xây dựng thêm các tính năng dành cho cán bộ chính
              phủ:
            </p>
            <ul className='mt-3 space-y-2 text-sm text-amber-800 dark:text-amber-200'>
              <li className='flex items-start gap-2'>
                <span className='text-amber-600 dark:text-amber-400'>•</span>
                <span>Dashboard theo khu vực</span>
              </li>
              <li className='flex items-start gap-2'>
                <span className='text-amber-600 dark:text-amber-400'>•</span>
                <span>Công cụ phân tích xu hướng ngập</span>
              </li>
              <li className='flex items-start gap-2'>
                <span className='text-amber-600 dark:text-amber-400'>•</span>
                <span>Thông báo SMS/Email tự động</span>
              </li>
              <li className='flex items-start gap-2'>
                <span className='text-amber-600 dark:text-amber-400'>•</span>
                <span>Quản lý người dùng theo khu vực</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
