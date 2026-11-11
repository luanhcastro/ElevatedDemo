import { describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

vi.mock('server-only', () => ({}));

import { SupabaseUserRepository } from './supabase-repository';

function clients() {
  const result = {
    data: [
      {
        user_id: 'a',
        role: 'agency_admin',
        created_at: '2026-11-11',
        profiles: { name: 'Admin A' },
        agencies: { name: 'Agency A' },
      },
      {
        user_id: 'b',
        role: 'member',
        created_at: '2026-11-11',
        profiles: { name: 'Member B' },
        agencies: { name: 'Agency B' },
      },
    ],
    error: null,
  };
  const eq = vi.fn();
  const query = { eq, then: Promise.resolve(result).then.bind(Promise.resolve(result)) };
  eq.mockReturnValue(query);
  const select = vi.fn().mockReturnValue({ order: vi.fn().mockReturnValue(query) });
  const from = vi.fn().mockReturnValue({ select });
  const getUserById = vi.fn(async (id: string) => ({
    data: { user: { email: `${id}@example.test` } },
    error: null,
  }));
  // The mock implements only the Supabase methods exercised by this repository.
  const userClient = { from } as unknown as SupabaseClient<Database>;
  const adminClient = { auth: { admin: { getUserById } } } as unknown as SupabaseClient<Database>;
  return { userClient, adminClient, eq, result, getUserById };
}

describe('user directory repository', () => {
  it('lists users across agencies with their own agency names for platform reads', async () => {
    const mocks = clients();
    const users = await new SupabaseUserRepository(mocks.userClient, mocks.adminClient).list();
    expect(mocks.eq).not.toHaveBeenCalled();
    expect(users.map((user) => [user.name, user.agencyName, user.email])).toEqual([
      ['Admin A', 'Agency A', 'a@example.test'],
      ['Member B', 'Agency B', 'b@example.test'],
    ]);
  });

  it('filters tenant and agency drill-down reads by agency', async () => {
    const mocks = clients();
    await new SupabaseUserRepository(
      mocks.userClient,
      mocks.adminClient,
      'agency-a',
      'Agency A',
    ).list();
    expect(mocks.eq).toHaveBeenCalledWith('agency_id', 'agency-a');
  });

  it('fails explicitly when the database read fails', async () => {
    const mocks = clients();
    const failure = new Error('Read denied');
    Object.assign(mocks.result, { data: null, error: failure });
    await expect(
      new SupabaseUserRepository(mocks.userClient, mocks.adminClient).list(),
    ).rejects.toThrow('Read denied');
    expect(mocks.getUserById).not.toHaveBeenCalled();
  });

  it('rejects creation without a trusted agency scope', async () => {
    const mocks = clients();
    await expect(
      new SupabaseUserRepository(mocks.userClient, mocks.adminClient).create({
        name: 'Test',
        email: 'test@example.test',
        password: 'password123',
        role: 'member',
      }),
    ).rejects.toThrow('An agency is required');
  });
});
