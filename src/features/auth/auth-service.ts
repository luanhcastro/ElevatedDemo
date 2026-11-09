import type { LoginFormValues } from './schemas';

type AuthError = { message?: string };

export interface PasswordAuthClient {
  signInWithPassword(credentials: LoginFormValues): Promise<{ error: AuthError | null }>;
}

export interface SignOutClient {
  signOut(options: { scope: 'local' }): Promise<{ error: AuthError | null }>;
}

export type AuthOperationResult = { ok: true } | { ok: false; message: string };

export async function authenticateWithPassword(
  client: PasswordAuthClient,
  credentials: LoginFormValues,
): Promise<AuthOperationResult> {
  const { error } = await client.signInWithPassword(credentials);

  if (error) {
    return { ok: false, message: 'Unable to sign in. Check your email and password.' };
  }

  return { ok: true };
}

export async function signOutCurrentSession(client: SignOutClient): Promise<AuthOperationResult> {
  const { error } = await client.signOut({ scope: 'local' });

  if (error) {
    return { ok: false, message: 'Unable to sign out. Please try again.' };
  }

  return { ok: true };
}
