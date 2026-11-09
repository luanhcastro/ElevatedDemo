import type { Metadata } from 'next';
import { AgenciesWorkspace } from '@/features/agencies/components/agencies-workspace';

export const metadata: Metadata = { title: 'Agencies' };
export default function AgenciesPage() {
  return <AgenciesWorkspace />;
}
