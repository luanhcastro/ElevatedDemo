'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { authenticateWithPassword } from '../auth-service';
import { loginSchema, type LoginFormValues } from '../schemas';

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function submit(values: LoginFormValues) {
    const supabase = createClient();
    const result = await authenticateWithPassword(supabase.auth, values);

    if (!result.ok) {
      form.setError('root', { message: result.message });
      return;
    }

    router.replace('/dashboard');
    router.refresh();
  }
  return (
    <form onSubmit={form.handleSubmit(submit)} className="space-y-5" noValidate>
      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(form.formState.errors.email)}
          {...form.register('email')}
        />
        {form.formState.errors.email && (
          <p className="text-sm text-red-600" role="alert">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            className="pr-11"
            aria-invalid={Boolean(form.formState.errors.password)}
            {...form.register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="absolute right-0 top-0 flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {form.formState.errors.password && (
          <p className="text-sm text-red-600" role="alert">
            {form.formState.errors.password.message}
          </p>
        )}
      </div>
      <Button className="w-full" type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {form.formState.isSubmitting ? 'Signing in...' : 'Sign in'}
      </Button>
      {form.formState.errors.root?.message && (
        <p className="text-center text-sm text-red-600" role="alert">
          {form.formState.errors.root.message}
        </p>
      )}
    </form>
  );
}
