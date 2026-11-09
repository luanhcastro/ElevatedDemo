import type { Metadata } from 'next';
import { ShieldCheck } from 'lucide-react';
import { redirect } from 'next/navigation';
import { Brand } from '@/components/shared/brand';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { decideRouteAccess } from '@/features/auth/authorization-policy';
import { getAuthorizationContext } from '@/features/auth/authorization';
import { LoginForm } from '@/features/auth/components/login-form';

export const metadata: Metadata = { title: 'Sign in' };
export default async function LoginPage() {
  const context = await getAuthorizationContext();
  const decision = decideRouteAccess('/login', context);
  if (decision === 'redirect-dashboard') redirect('/dashboard');
  if (decision === 'deny') redirect('/access-denied');

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-12">
      <div className="absolute inset-y-0 left-0 hidden w-[42%] bg-sidebar lg:block">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(circle at 25% 25%, #3b82f6 0, transparent 32%), radial-gradient(circle at 70% 75%, #1e3a8a 0, transparent 28%)',
          }}
        />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Brand dark />
          <div className="max-w-md">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-blue-400">
              Agency operations, elevated
            </p>
            <h1 className="mt-5 text-balance text-4xl font-semibold leading-tight text-white">
              A calmer way to manage your organization portfolio.
            </h1>
            <p className="mt-5 text-base leading-7 text-slate-400">
              Securely manage organizations and tenant-scoped users from one focused workspace.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="h-4 w-4" />
            Secure access · administrators only
          </div>
        </div>
      </div>
      <div className="relative w-full max-w-md lg:ml-[42%]">
        <div className="mb-8 flex justify-center lg:hidden">
          <Brand />
        </div>
        <Card className="border-slate-200/80 shadow-xl shadow-slate-900/5">
          <CardHeader className="space-y-2 p-7 pb-5">
            <CardTitle className="text-2xl">Welcome to ElevatedDemo</CardTitle>
            <CardDescription>
              Sign in with the email and password issued by your platform administrator.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-7 pt-0">
            <div className="mb-5 rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs leading-5 text-blue-800">
              Access is limited to platform and agency administrators. Public registration is not
              available.
            </div>
            <LoginForm />
          </CardContent>
        </Card>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Authentication and tenant isolation powered by Supabase
        </p>
      </div>
    </main>
  );
}
