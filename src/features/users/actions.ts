'use server';

import { requireAgencyAdministrator } from '@/features/auth/authorization';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { createUserSchema } from './schemas';
import { SupabaseUserRepository } from './supabase-repository';
import type { User } from './types';

type UserResult = { ok: true; user: User } | { ok: false; message: string };

async function getAuthorizedRepository() {
  const context = await requireAgencyAdministrator();
  if (!context.agency) throw new Error('An active agency membership is required.');
  return new SupabaseUserRepository(
    await createClient(),
    createAdminClient(),
    context.agency.id,
    context.agency.name,
  );
}

export async function listAgencyUsers(): Promise<User[]> {
  return (await getAuthorizedRepository()).list();
}

export async function createAgencyUser(input: unknown): Promise<UserResult> {
  const repository = await getAuthorizedRepository();
  const parsed = createUserSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: 'Enter valid user details and a role.' };

  try {
    return { ok: true, user: await repository.create(parsed.data) };
  } catch {
    return { ok: false, message: 'Unable to create the user. Please try again.' };
  }
}
