import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import type { UserRepository } from './repository';
import type { CreateUserInput, UpdateUserInput, User } from './types';

export class SupabaseUserRepository implements UserRepository {
  constructor(
    private readonly userClient: SupabaseClient<Database>,
    private readonly adminClient: SupabaseClient<Database>,
    private readonly agencyId?: string,
    private readonly agencyName?: string,
  ) {}

  async list(): Promise<User[]> {
    const query = this.userClient
      .from('agency_memberships')
      .select('user_id, role, created_at, profiles(name), agencies(name)')
      .order('created_at', { ascending: false });
    if (this.agencyId) query.eq('agency_id', this.agencyId);
    const { data, error } = await query;
    if (error) throw error;

    return Promise.all(
      data.map(async (membership) => {
        const { data: authData, error: authError } = await this.adminClient.auth.admin.getUserById(
          membership.user_id,
        );
        if (authError || !authData.user) throw authError ?? new Error('Auth user not found.');
        return {
          id: membership.user_id,
          name: membership.profiles.name,
          email: authData.user.email ?? 'Unknown email',
          agencyName: membership.agencies.name,
          role: membership.role === 'agency_admin' ? 'agency_admin' : 'member',
          status: 'active',
          createdAt: membership.created_at,
        };
      }),
    );
  }

  async create(input: CreateUserInput): Promise<User> {
    if (!this.agencyId || !this.agencyName) {
      throw new Error('An agency is required to create users.');
    }
    const { data: authData, error: authError } = await this.adminClient.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
    });
    if (authError || !authData.user) throw authError ?? new Error('Auth user creation failed.');

    const userId = authData.user.id;
    const { error: profileError } = await this.adminClient
      .from('profiles')
      .insert({ id: userId, name: input.name });
    const { error: membershipError } = profileError
      ? { error: null }
      : await this.adminClient.from('agency_memberships').insert({
          agency_id: this.agencyId,
          user_id: userId,
          role: input.role,
        });

    if (profileError || membershipError) {
      const { error: cleanupError } = await this.adminClient.auth.admin.deleteUser(userId);
      if (cleanupError) {
        throw new Error('User provisioning failed and automatic Auth cleanup also failed.');
      }
      throw profileError ?? membershipError ?? new Error('User provisioning failed.');
    }

    return {
      id: userId,
      name: input.name,
      email: input.email,
      agencyName: this.agencyName,
      role: input.role,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
  }

  update(id: string, input: UpdateUserInput): Promise<User> {
    void id;
    void input;
    return Promise.reject(new Error('User editing is outside Issue #4.'));
  }

  deactivate(id: string): Promise<User> {
    void id;
    return Promise.reject(new Error('User deactivation is outside Issue #4.'));
  }
}
