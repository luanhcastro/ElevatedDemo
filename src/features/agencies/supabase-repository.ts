import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import type { AgencyRepository } from './repository';
import type { Agency, CreateAgencyInput, UpdateAgencyInput } from './types';

function toAgency(row: Database['public']['Tables']['agencies']['Row']): Agency {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    status: row.deleted_at ? 'inactive' : 'active',
    createdAt: row.created_at,
  };
}

export class SupabaseAgencyRepository implements AgencyRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async list() {
    const { data, error } = await this.client
      .from('agencies')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data.map(toAgency);
  }

  async create(input: CreateAgencyInput) {
    const { data, error } = await this.client
      .from('agencies')
      .insert({ name: input.name, email: input.email })
      .select()
      .single();
    if (error) throw error;
    return toAgency(data);
  }

  update(id: string, input: UpdateAgencyInput): Promise<Agency> {
    void id;
    void input;
    return Promise.reject(new Error('Agency editing is outside Issue #4.'));
  }

  deactivate(id: string): Promise<Agency> {
    void id;
    return Promise.reject(new Error('Agency deactivation is outside Issue #4.'));
  }
}
