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
import {
  getPortalPathFromRoles,
  SESSION_COOKIE_NAME,
  USER_PORTAL_COOKIE_NAME,
  USER_ROLES_COOKIE_NAME
} from '@/helpers/auth-session';
import RootSessionResolver from './root-session-resolver';

export default async function Page() {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!session) redirect('/auth/login');

  const portalCookie = cookieStore.get(USER_PORTAL_COOKIE_NAME)?.value;
  if (portalCookie === 'moderator') redirect('/moderator');
  if (portalCookie === 'admin') redirect('/admin');

  // Best-effort redirect by role when the cookie exists.
  // If it is missing/invalid, let the hydrated client auth store resolve instead.
  const rolesCookie = cookieStore.get(USER_ROLES_COOKIE_NAME)?.value;
  if (rolesCookie) {
    try {
      const roles = JSON.parse(rolesCookie) as string[] | string;
      redirect(getPortalPathFromRoles(roles));
    } catch {
      // ignore invalid cookie
    }
  }

  return <RootSessionResolver />;
}
