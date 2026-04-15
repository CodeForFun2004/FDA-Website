// import { auth } from '@clerk/nextjs/server';
// import { redirect } from 'next/navigation';

// export default async function Page() {
//   const { userId } = await auth();

//   if (!userId) {
//     return redirect('/auth/sign-in');
//   } else {
//     // redirect('/dashboard/overview');
//      redirect('/admin');
//   }
// }

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function Page() {
  const cookieStore = await cookies();
  const session = cookieStore.get('fda_session')?.value;

  if (!session) redirect('/auth/login');

  // Best-effort redirect by role (if available via cookie).
  // NOTE: App Router server components cannot read localStorage.
  const rolesCookie = cookieStore.get('fda_user_roles')?.value;
  if (rolesCookie) {
    try {
      const roles = JSON.parse(rolesCookie) as string[] | string;
      const list = Array.isArray(roles) ? roles : [roles];
      if (list.includes('MODERATOR')) redirect('/moderator');
      if (list.includes('ADMIN') || list.includes('SUPERADMIN'))
        redirect('/admin');
    } catch {
      // ignore invalid cookie
    }
  }

  // Fallback to admin portal (existing behavior)
  redirect('/admin');
}
