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
  redirect('/admin');
}
