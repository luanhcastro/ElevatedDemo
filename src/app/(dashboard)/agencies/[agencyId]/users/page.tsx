import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAgency } from '@/features/agencies/actions';
import { requirePlatformAdministrator } from '@/features/auth/authorization';
import { UsersWorkspace } from '@/features/users/components/users-workspace';

export const metadata: Metadata = { title: 'Agency users' };

export default async function AgencyUsersPage({
  params,
}: {
  params: Promise<{ agencyId: string }>;
}) {
  await requirePlatformAdministrator();
  const { agencyId } = await params;
  const agency = await getAgency(agencyId);
  if (!agency) notFound();

  return <UsersWorkspace viewedAgency={agency} />;
}
