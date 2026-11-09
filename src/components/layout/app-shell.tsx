import { Header } from './header';
import { Sidebar } from './sidebar';
import type { AuthorizationContext } from '@/features/auth/types';

export function AppShell({
  children,
  account,
}: {
  children: React.ReactNode;
  account: AuthorizationContext;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar role={account.role} />
      <div className="lg:pl-64">
        <Header displayName={account.displayName} email={account.email} role={account.role} />
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
