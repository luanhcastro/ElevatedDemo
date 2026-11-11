import 'server-only';

import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { decideRouteAccess } from './authorization-policy';
import type { AccountRole, AuthorizationContext, ProtectedRoute } from './types';

function isKnownRole(value: string): value is AccountRole {
  return (
    value === 'platform_admin' || value === 'agency_admin' || value === 'member' || value === 'none'
  );
}

export const getAuthenticatedUser = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
});

export const getAuthorizationContext = cache(async (): Promise<AuthorizationContext | null> => {
  const user = await getAuthenticatedUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc('get_my_authorization_context');
  const record = data?.[0];

  if (error || !record || !isKnownRole(record.account_role)) {
    return {
      userId: user.id,
      email: user.email ?? 'Unknown email',
      displayName: user.email ?? 'Unknown user',
      role: 'none',
      agency: null,
    };
  }

  const hasActiveAgency = record.agency_id !== null && record.agency_name !== null;
  const requiresAgency = record.account_role === 'agency_admin' || record.account_role === 'member';
  const role = requiresAgency && !hasActiveAgency ? 'none' : record.account_role;

  let agency = null;
  if (
    (role === 'agency_admin' || role === 'member') &&
    record.agency_id !== null &&
    record.agency_name !== null
  ) {
    agency = { id: record.agency_id, name: record.agency_name };
  }

  return {
    userId: user.id,
    email: user.email ?? 'Unknown email',
    displayName: record.profile_name?.trim() || user.email || 'Unknown user',
    role,
    agency,
  };
});

export async function requireAuthentication() {
  const context = await getAuthorizationContext();
  if (!context) redirect('/login');
  return context;
}

export async function requireAdministrator() {
  const context = await getAuthorizationContext();
  const decision = decideRouteAccess('/dashboard', context);
  if (decision === 'redirect-login') redirect('/login');
  if (decision !== 'allow') redirect('/access-denied');
  if (!context) redirect('/login');
  return context;
}

async function requireRoute(route: ProtectedRoute) {
  const context = await getAuthorizationContext();
  const decision = decideRouteAccess(route, context);
  if (decision === 'redirect-login') redirect('/login');
  if (decision !== 'allow') redirect('/access-denied');
  if (!context) redirect('/login');
  return context;
}

export function requirePlatformAdministrator() {
  return requireRoute('/agencies');
}

export async function requireAgencyAdministrator() {
  const context = await requireRoute('/users');
  if (context.role !== 'agency_admin' || !context.agency) redirect('/access-denied');
  return context;
}
