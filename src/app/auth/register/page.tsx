import RegisterViewPage from '@/features/authenticate/components/register-view';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Xác thực | Đăng ký',
  description: 'Trang đăng ký.'
};

export default function Page() {
  return <RegisterViewPage />;
}
