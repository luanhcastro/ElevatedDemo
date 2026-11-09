import { AppShell } from '@/components/layout/app-shell';
import { requireAdministrator } from '@/features/auth/authorization';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const account = await requireAdministrator();
  return <AppShell account={account}>{children}</AppShell>;
}
