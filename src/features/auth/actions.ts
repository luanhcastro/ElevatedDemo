'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { signOutCurrentSession } from './auth-service';

export async function logout() {
  const supabase = await createClient();
  const result = await signOutCurrentSession(supabase.auth);
  if (result.ok) revalidatePath('/', 'layout');
  return result;
}

export async function logoutAndRedirect(): Promise<void> {
  const result = await logout();
  redirect(result.ok ? '/login' : '/access-denied?signOutError=1');
}
