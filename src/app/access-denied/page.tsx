import { ShieldX } from 'lucide-react';
import { redirect } from 'next/navigation';
import { Brand } from '@/components/shared/brand';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { logout } from '@/features/auth/actions';
import { getAuthorizationContext } from '@/features/auth/authorization';

export default async function AccessDeniedPage() {
  const account = await getAuthorizationContext();
  if (!account) redirect('/login');

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Brand />
        </div>
        <Card>
          <CardHeader className="items-center text-center">
            <span className="mb-3 rounded-full bg-red-50 p-3 text-red-600">
              <ShieldX className="h-6 w-6" />
            </span>
            <CardTitle>Administrative access required</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 text-center">
            <p className="text-sm leading-6 text-muted-foreground">
              Your account is authenticated, but it does not have an active administrator role for
              this area. Contact a platform administrator if you believe this is incorrect.
            </p>
            <p className="rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-600">
              Signed in as {account.email}
            </p>
            <form action={logout}>
              <Button type="submit" variant="outline" className="w-full">
                Sign out
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
