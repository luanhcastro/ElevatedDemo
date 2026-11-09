import type { Metadata } from 'next';
import { AgenciesWorkspace } from '@/features/agencies/components/agencies-workspace';
import { requirePlatformAdministrator } from '@/features/auth/authorization';

export const metadata: Metadata = { title: 'Agencies' };
export default async function AgenciesPage() {
  await requirePlatformAdministrator();
  return <AgenciesWorkspace />;
}
