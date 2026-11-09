import type { AccountRole, AuthorizationContext, ProtectedRoute, RouteDecision } from './types';

export function isAdministrator(role: AccountRole) {
  return role === 'platform_admin' || role === 'agency_admin';
}

export function canAccessRoute(role: AccountRole, route: ProtectedRoute) {
  if (route === '/dashboard') return isAdministrator(role);
  if (route === '/agencies') return role === 'platform_admin';
  return role === 'agency_admin';
}

export function decideRouteAccess(
  route: '/login' | ProtectedRoute,
  context: AuthorizationContext | null,
): RouteDecision {
  if (route === '/login') {
    if (!context) return 'allow';
    return isAdministrator(context.role) ? 'redirect-dashboard' : 'deny';
  }

  if (!context) return 'redirect-login';
  return canAccessRoute(context.role, route) ? 'allow' : 'deny';
}
