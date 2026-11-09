import { describe, expect, it, vi } from 'vitest';
import { authenticateWithPassword, signOutCurrentSession } from './auth-service';

describe('authenticateWithPassword', () => {
  it('returns success after valid credentials are accepted', async () => {
    const signInWithPassword = vi.fn().mockResolvedValue({ error: null });

    await expect(
      authenticateWithPassword(
        { signInWithPassword },
        { email: 'admin@example.test', password: 'valid-password' },
      ),
    ).resolves.toEqual({ ok: true });
    expect(signInWithPassword).toHaveBeenCalledOnce();
  });

  it('returns a generic error when credentials are rejected', async () => {
    const signInWithPassword = vi.fn().mockResolvedValue({
      error: { message: 'Invalid login credentials' },
    });

    await expect(
      authenticateWithPassword(
        { signInWithPassword },
        { email: 'unknown@example.test', password: 'wrong-password' },
      ),
    ).resolves.toEqual({
      ok: false,
      message: 'Unable to sign in. Check your email and password.',
    });
  });
});

describe('signOutCurrentSession', () => {
  it('signs out only the current session', async () => {
    const signOut = vi.fn().mockResolvedValue({ error: null });

    await expect(signOutCurrentSession({ signOut })).resolves.toEqual({ ok: true });
    expect(signOut).toHaveBeenCalledWith({ scope: 'local' });
  });

  it('returns an explicit error when sign-out fails', async () => {
    const signOut = vi.fn().mockResolvedValue({ error: { message: 'network unavailable' } });

    await expect(signOutCurrentSession({ signOut })).resolves.toEqual({
      ok: false,
      message: 'Unable to sign out. Please try again.',
    });
  });
});
