'use server';

import { requirePlatformAdministrator } from '@/features/auth/authorization';
import { createClient } from '@/lib/supabase/server';
import { agencySchema } from './schemas';
import { SupabaseAgencyRepository } from './supabase-repository';
import type { Agency } from './types';
import { z } from 'zod';

type AgencyResult = { ok: true; agency: Agency } | { ok: false; message: string };

export async function listAgencies(): Promise<Agency[]> {
  await requirePlatformAdministrator();
  return new SupabaseAgencyRepository(await createClient()).list();
}

export async function getAgency(agencyId: string): Promise<Agency | null> {
  await requirePlatformAdministrator();
  const id = z.string().uuid().safeParse(agencyId);
  if (!id.success) return null;

  const agencies = await new SupabaseAgencyRepository(await createClient()).list();
  return agencies.find((agency) => agency.id === id.data) ?? null;
}

export async function createAgency(input: unknown): Promise<AgencyResult> {
  await requirePlatformAdministrator();
  const parsed = agencySchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: 'Enter a valid agency name and email.' };

  try {
    const agency = await new SupabaseAgencyRepository(await createClient()).create(parsed.data);
    return { ok: true, agency };
  } catch {
    return { ok: false, message: 'Unable to create the agency. Please try again.' };
  }
}
