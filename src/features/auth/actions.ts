'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { signOutCurrentSession } from './auth-service';

export async function logout() {
  const supabase = await createClient();
  await signOutCurrentSession(supabase.auth);
  redirect('/login');
}
