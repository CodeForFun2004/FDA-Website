import LoginViewPage from '@/features/authenticate/components/login-view';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Xác thực | Đăng nhập',
  description: 'Trang đăng nhập.'
};

export default function Page() {
  return <LoginViewPage />;
}
