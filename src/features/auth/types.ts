export type AccountRole = 'platform_admin' | 'agency_admin' | 'member' | 'none';

export type AgencyContext = {
  id: string;
  name: string;
};

export type AuthorizationContext = {
  userId: string;
  email: string;
  displayName: string;
  role: AccountRole;
  agency: AgencyContext | null;
};

export type ProtectedRoute = '/dashboard' | '/agencies' | '/users';
export type RouteDecision = 'allow' | 'redirect-dashboard' | 'redirect-login' | 'deny';
