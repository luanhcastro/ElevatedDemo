import type { Metadata } from 'next';
import { requireAdministrator } from '@/features/auth/authorization';
import { DashboardOverview } from '@/features/dashboard/components/dashboard-overview';
import { getDashboardData } from '@/features/dashboard/data';

export const metadata: Metadata = { title: 'Dashboard' };
export default async function DashboardPage() {
  const account = await requireAdministrator();
  const data = await getDashboardData(account);
  return <DashboardOverview account={account} data={data} />;
}
