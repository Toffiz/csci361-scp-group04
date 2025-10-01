import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { TopNav } from '@/components/top-nav';
import { SideNav } from '@/components/side-nav';
import { cookies } from 'next/headers';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();
  
  if (!user) {
    redirect('/auth');
  }

  const cookieStore = cookies();
  const locale = cookieStore.get('locale')?.value || 'ru';

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav user={user} locale={locale} />
      <div className="flex flex-1">
        <SideNav role={user.role} />
        <main className="flex-1 p-8 bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}
