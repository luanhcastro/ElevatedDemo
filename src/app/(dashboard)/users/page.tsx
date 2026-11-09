import type { Metadata } from 'next';
import { UsersWorkspace } from '@/features/users/components/users-workspace';

export const metadata: Metadata = { title: 'Users' };
export default function UsersPage() {
  return <UsersWorkspace />;
}
