import type { Metadata } from 'next';
import { requireAgencyAdministrator } from '@/features/auth/authorization';
import { UsersWorkspace } from '@/features/users/components/users-workspace';

export const metadata: Metadata = { title: 'Users' };
export default async function UsersPage() {
  await requireAgencyAdministrator();
  return <UsersWorkspace />;
}
