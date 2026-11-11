import type { Metadata } from 'next';
import { requireAdministrator } from '@/features/auth/authorization';
import { UsersWorkspace } from '@/features/users/components/users-workspace';

export const metadata: Metadata = { title: 'Users' };
export default async function UsersPage() {
  const context = await requireAdministrator();
  return <UsersWorkspace readOnly={context.role === 'platform_admin'} />;
}
