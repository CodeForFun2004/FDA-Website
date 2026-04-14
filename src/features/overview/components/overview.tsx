import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CardAction
} from '@/components/ui/card';
import { AreaGraph } from './area-graph';
import { BarGraph } from './bar-graph';
import { PieGraph } from './pie-graph';
import { RecentSales } from './recent-sales';
import { IconTrendingUp, IconTrendingDown } from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';

export default function OverViewPage() {
  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-2'>
        <div className='flex items-center justify-between space-y-2'>
          <h2 className='text-2xl font-bold tracking-tight'>
            Xin chào, chào mừng trở lại
          </h2>
          <div className='hidden items-center space-x-2 md:flex'>
            <Button>Tải xuống</Button>
          </div>
        </div>
        <div className='space-y-4'>
          <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4'>
            <Card className='@container/card'>
              <CardHeader>
                <CardDescription>Tổng doanh thu</CardDescription>
                <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                  $1,250.00
                </CardTitle>
                <CardAction>
                  <Badge variant='outline'>
                    <IconTrendingUp />
                    +12.5%
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardFooter className='flex-col items-start gap-1.5 text-sm'>
                <div className='line-clamp-1 flex gap-2 font-medium'>
                  Tăng trong tháng này <IconTrendingUp className='size-4' />
                </div>
                <div className='text-muted-foreground'>
                  Lượt truy cập 6 tháng gần đây
                </div>
              </CardFooter>
            </Card>
            <Card className='@container/card'>
              <CardHeader>
                <CardDescription>Khách mới</CardDescription>
                <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                  1,234
                </CardTitle>
                <CardAction>
                  <Badge variant='outline'>
                    <IconTrendingDown />
                    -20%
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardFooter className='flex-col items-start gap-1.5 text-sm'>
                <div className='line-clamp-1 flex gap-2 font-medium'>
                  Giảm 20% kỳ này <IconTrendingDown className='size-4' />
                </div>
                <div className='text-muted-foreground'>
                  Cần chú ý kênh tiếp cận
                </div>
              </CardFooter>
            </Card>
            <Card className='@container/card'>
              <CardHeader>
                <CardDescription>Tài khoản hoạt động</CardDescription>
                <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                  45,678
                </CardTitle>
                <CardAction>
                  <Badge variant='outline'>
                    <IconTrendingUp />
                    +12.5%
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardFooter className='flex-col items-start gap-1.5 text-sm'>
                <div className='line-clamp-1 flex gap-2 font-medium'>
                  Giữ chân người dùng tốt <IconTrendingUp className='size-4' />
                </div>
                <div className='text-muted-foreground'>
                  Tương tác vượt mục tiêu
                </div>
              </CardFooter>
            </Card>
            <Card className='@container/card'>
              <CardHeader>
                <CardDescription>Tốc độ tăng trưởng</CardDescription>
                <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                  4.5%
                </CardTitle>
                <CardAction>
                  <Badge variant='outline'>
                    <IconTrendingUp />
                    +4.5%
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardFooter className='flex-col items-start gap-1.5 text-sm'>
                <div className='line-clamp-1 flex gap-2 font-medium'>
                  Hiệu suất tăng ổn định <IconTrendingUp className='size-4' />
                </div>
                <div className='text-muted-foreground'>
                  Đạt dự báo tăng trưởng
                </div>
              </CardFooter>
            </Card>
          </div>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7'>
            <div className='col-span-4'>
              <BarGraph />
            </div>
            <Card className='col-span-4 md:col-span-3'>
              <RecentSales />
            </Card>
            <div className='col-span-4'>
              <AreaGraph />
            </div>
            <div className='col-span-4 md:col-span-3'>
              <PieGraph />
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
