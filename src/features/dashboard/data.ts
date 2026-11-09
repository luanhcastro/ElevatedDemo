import 'server-only';

import type { AuthorizationContext } from '@/features/auth/types';
import { createClient } from '@/lib/supabase/server';

export type DashboardData = {
  agencyCount: number | null;
  userCount: number | null;
};

export async function getDashboardData(context: AuthorizationContext): Promise<DashboardData> {
  const supabase = await createClient();
  const agencyQuery = supabase
    .from('agencies')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null);
  const userQuery = supabase.from('agency_memberships').select('*', { count: 'exact', head: true });

  if (context.role === 'agency_admin' && context.agency) {
    userQuery.eq('agency_id', context.agency.id);
  }

  const [agencies, users] = await Promise.all([agencyQuery, userQuery]);
  return {
    agencyCount: agencies.error ? null : agencies.count,
    userCount: users.error ? null : users.count,
  };
}
