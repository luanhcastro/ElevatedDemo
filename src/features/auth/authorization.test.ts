import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ rpc: vi.fn(), getUser: vi.fn() }));
vi.mock('server-only', () => ({}));
vi.mock('react', () => ({ cache: (callback: unknown) => callback }));
vi.mock('next/navigation', () => ({
  redirect: (path: string) => {
    throw new Error(`Redirect: ${path}`);
  },
}));
vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({ auth: { getUser: mocks.getUser }, rpc: mocks.rpc }),
}));

import { requireAdministrator, requireAgencyAdministrator } from './authorization';

beforeEach(() => {
  mocks.getUser.mockResolvedValue({
    data: { user: { id: 'admin', email: 'admin@example.test' } },
    error: null,
  });
});

describe('user directory and provisioning authorization', () => {
  it('allows platform reads while rejecting agency user provisioning', async () => {
    mocks.rpc.mockResolvedValue({
      data: [{ account_role: 'platform_admin', agency_id: null, agency_name: null }],
      error: null,
    });
    await expect(requireAdministrator()).resolves.toMatchObject({ role: 'platform_admin' });
    await expect(requireAgencyAdministrator()).rejects.toThrow('Redirect: /access-denied');
  });

  it('allows agency administrators with trusted agency context', async () => {
    mocks.rpc.mockResolvedValue({
      data: [{ account_role: 'agency_admin', agency_id: 'agency-a', agency_name: 'Agency A' }],
      error: null,
    });
    await expect(requireAgencyAdministrator()).resolves.toMatchObject({
      agency: { id: 'agency-a' },
    });
  });

  it('denies an agency administrator without a trusted agency', async () => {
    mocks.rpc.mockResolvedValue({
      data: [{ account_role: 'agency_admin', agency_id: null, agency_name: null }],
      error: null,
    });
    await expect(requireAgencyAdministrator()).rejects.toThrow('Redirect: /access-denied');
  });
});
