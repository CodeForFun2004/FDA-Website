'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/authenticate/store/auth-store';
import { getPortalPathFromRoles } from '@/helpers/auth-session';

export default function RootSessionResolver() {
  const router = useRouter();
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);
  const [hydrated, setHydrated] = useState(() =>
    useAuthStore.persist.hasHydrated()
  );

  useEffect(() => {
    setHydrated(useAuthStore.persist.hasHydrated());
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!hydrated || status === 'loading' || status === 'idle') {
      return;
    }

    if (status === 'authenticated' && user) {
      router.replace(getPortalPathFromRoles(user.roles));
      return;
    }

    router.replace('/auth/login');
  }, [hydrated, router, status, user]);

  return (
    <div className='flex min-h-screen items-center justify-center'>
      <div className='text-center'>
        <div className='inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]' />
        <p className='text-muted-foreground mt-4'>
          Đang khôi phục phiên đăng nhập...
        </p>
      </div>
    </div>
  );
}
