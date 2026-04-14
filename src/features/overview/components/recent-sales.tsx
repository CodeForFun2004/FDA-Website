import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription
} from '@/components/ui/card';

const salesData = [
  {
    name: 'Nguyễn Thị Mai',
    email: 'mai.nguyen@email.com',
    avatar: 'https://api.slingacademy.com/public/sample-users/1.png',
    fallback: 'NM',
    amount: '+1.999 USD'
  },
  {
    name: 'Trần Văn Hùng',
    email: 'hung.tran@email.com',
    avatar: 'https://api.slingacademy.com/public/sample-users/2.png',
    fallback: 'TH',
    amount: '+39 USD'
  },
  {
    name: 'Lê Thu Hà',
    email: 'ha.le@email.com',
    avatar: 'https://api.slingacademy.com/public/sample-users/3.png',
    fallback: 'LH',
    amount: '+299 USD'
  },
  {
    name: 'Phạm Minh Khoa',
    email: 'khoa.pham@email.com',
    avatar: 'https://api.slingacademy.com/public/sample-users/4.png',
    fallback: 'PK',
    amount: '+99 USD'
  },
  {
    name: 'Đỗ Lan Anh',
    email: 'anh.do@email.com',
    avatar: 'https://api.slingacademy.com/public/sample-users/5.png',
    fallback: 'ĐA',
    amount: '+39 USD'
  }
];

export function RecentSales() {
  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle>Giao dịch gần đây</CardTitle>
        <CardDescription>265 đơn trong tháng này.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-8'>
          {salesData.map((sale, index) => (
            <div key={index} className='flex items-center'>
              <Avatar className='h-9 w-9'>
                <AvatarImage src={sale.avatar} alt='' />
                <AvatarFallback>{sale.fallback}</AvatarFallback>
              </Avatar>
              <div className='ml-4 space-y-1'>
                <p className='text-sm leading-none font-medium'>{sale.name}</p>
                <p className='text-muted-foreground text-sm'>{sale.email}</p>
              </div>
              <div className='ml-auto font-medium'>{sale.amount}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
