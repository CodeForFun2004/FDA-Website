// src/app/authority/page.tsx
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/common';
import {
  IconMapPin,
  IconAlertTriangle,
  IconDeviceAnalytics,
  IconUsers,
  IconBuildingCommunity,
  IconShieldCheck
} from '@tabler/icons-react';
import { useAuthStore } from '@/features/authenticate/store/auth-store';

export default function AuthorityDashboard() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>
          Cổng Thông Tin Chính Quyền
        </h1>
        <p className='text-muted-foreground mt-1'>
          Hệ thống giám sát và quản lý ngập lụt FDA - Khu vực{' '}
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
                Xin chào, {user?.fullName || 'Cán bộ'}!
              </CardTitle>
              <CardDescription className='text-blue-700 dark:text-blue-300'>
                Vai trò: Cán bộ chính quyền
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className='text-sm text-blue-800 dark:text-blue-200'>
            Bạn có quyền truy cập vào các chức năng giám sát và báo cáo ngập lụt
            trong khu vực quản lý.
          </p>
        </CardContent>
      </Card>

      {/* Statistics Grid */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Khu vực quản lý
            </CardTitle>
            <IconBuildingCommunity className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>12</div>
            <p className='text-muted-foreground text-xs'>
              Phường/Xã đang giám sát
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Trạm giám sát</CardTitle>
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
              Dữ liệu cảm biến
            </CardTitle>
            <IconDeviceAnalytics className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>98.5%</div>
            <p className='text-muted-foreground text-xs'>Tỷ lệ hoạt động</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Người dân theo dõi
            </CardTitle>
            <IconUsers className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>2,345</div>
            <p className='text-muted-foreground text-xs'>+12% trong tháng</p>
          </CardContent>
        </Card>
      </div>

      {/* Info Cards */}
      <div className='grid gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Chức năng chính</CardTitle>
            <CardDescription>
              Các tính năng dành cho cán bộ chính quyền
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='flex items-start gap-3 rounded-lg border p-3'>
              <IconMapPin className='text-primary mt-0.5 h-5 w-5' />
              <div>
                <p className='text-sm font-medium'>Giám sát trạm đo</p>
                <p className='text-muted-foreground text-xs'>
                  Theo dõi tình trạng ngập lụt theo thời gian thực
                </p>
              </div>
            </div>
            <div className='flex items-start gap-3 rounded-lg border p-3'>
              <IconAlertTriangle className='text-primary mt-0.5 h-5 w-5' />
              <div>
                <p className='text-sm font-medium'>Quản lý cảnh báo</p>
                <p className='text-muted-foreground text-xs'>
                  Xem và phản hồi các cảnh báo ngập lụt
                </p>
              </div>
            </div>
            <div className='flex items-start gap-3 rounded-lg border p-3'>
              <IconDeviceAnalytics className='text-primary mt-0.5 h-5 w-5' />
              <div>
                <p className='text-sm font-medium'>Báo cáo thống kê</p>
                <p className='text-muted-foreground text-xs'>
                  Tạo và xem báo cáo ngập lụt định kỳ
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
              Chúng tôi đang phát triển thêm các tính năng dành riêng cho cán bộ
              chính quyền:
            </p>
            <ul className='mt-3 space-y-2 text-sm text-amber-800 dark:text-amber-200'>
              <li className='flex items-start gap-2'>
                <span className='text-amber-600 dark:text-amber-400'>•</span>
                <span>Dashboard tùy chỉnh theo khu vực</span>
              </li>
              <li className='flex items-start gap-2'>
                <span className='text-amber-600 dark:text-amber-400'>•</span>
                <span>Công cụ phân tích xu hướng ngập</span>
              </li>
              <li className='flex items-start gap-2'>
                <span className='text-amber-600 dark:text-amber-400'>•</span>
                <span>Thông báo tự động qua SMS/Email</span>
              </li>
              <li className='flex items-start gap-2'>
                <span className='text-amber-600 dark:text-amber-400'>•</span>
                <span>Quản lý người dùng khu vực</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Footer Note */}
      <Card>
        <CardContent className='pt-6'>
          <p className='text-muted-foreground text-center text-sm'>
            💡 <strong>Lưu ý:</strong> Hệ thống đang trong giai đoạn hoàn thiện.
            Nếu bạn cần hỗ trợ, vui lòng liên hệ bộ phận kỹ thuật.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
