import { describe, expect, it } from 'vitest';
import { canAccessRoute, decideRouteAccess } from './authorization-policy';
import type { AccountRole, AuthorizationContext } from './types';

function context(role: AccountRole): AuthorizationContext {
  return {
    userId: 'user-id',
    email: 'user@example.test',
    displayName: 'Test User',
    role,
    agency:
      role === 'agency_admin' || role === 'member'
        ? { id: 'agency-id', name: 'Test Agency' }
        : null,
  };
}

describe('route authorization', () => {
  it('redirects unauthenticated protected requests to login', () => {
    expect(decideRouteAccess('/dashboard', null)).toBe('redirect-login');
    expect(decideRouteAccess('/agencies', null)).toBe('redirect-login');
    expect(decideRouteAccess('/users', null)).toBe('redirect-login');
  });

  it('allows platform administrators only on platform routes', () => {
    const platformAdmin = context('platform_admin');
    expect(decideRouteAccess('/dashboard', platformAdmin)).toBe('allow');
    expect(decideRouteAccess('/agencies', platformAdmin)).toBe('allow');
    expect(decideRouteAccess('/users', platformAdmin)).toBe('deny');
  });

  it('allows agency administrators only on their agency routes', () => {
    const agencyAdmin = context('agency_admin');
    expect(decideRouteAccess('/dashboard', agencyAdmin)).toBe('allow');
    expect(decideRouteAccess('/agencies', agencyAdmin)).toBe('deny');
    expect(decideRouteAccess('/users', agencyAdmin)).toBe('allow');
  });

  it('denies regular members all administrative routes', () => {
    const member = context('member');
    expect(decideRouteAccess('/dashboard', member)).toBe('deny');
    expect(decideRouteAccess('/agencies', member)).toBe('deny');
    expect(decideRouteAccess('/users', member)).toBe('deny');
  });

  it('denies missing or inactive authorization contexts', () => {
    const noRole = context('none');
    expect(decideRouteAccess('/dashboard', noRole)).toBe('deny');
    expect(decideRouteAccess('/users', noRole)).toBe('deny');
  });

  it('redirects authenticated administrators away from login', () => {
    expect(decideRouteAccess('/login', context('platform_admin'))).toBe('redirect-dashboard');
    expect(decideRouteAccess('/login', context('agency_admin'))).toBe('redirect-dashboard');
  });
});

describe('role-aware navigation permissions', () => {
  it('shows platform navigation without agency user management', () => {
    expect(canAccessRoute('platform_admin', '/dashboard')).toBe(true);
    expect(canAccessRoute('platform_admin', '/agencies')).toBe(true);
    expect(canAccessRoute('platform_admin', '/users')).toBe(false);
  });

  it('shows agency navigation without platform agency management', () => {
    expect(canAccessRoute('agency_admin', '/dashboard')).toBe(true);
    expect(canAccessRoute('agency_admin', '/agencies')).toBe(false);
    expect(canAccessRoute('agency_admin', '/users')).toBe(true);
  });

  it('shows no administrative navigation to regular members', () => {
    expect(canAccessRoute('member', '/dashboard')).toBe(false);
    expect(canAccessRoute('member', '/agencies')).toBe(false);
    expect(canAccessRoute('member', '/users')).toBe(false);
  });
});
