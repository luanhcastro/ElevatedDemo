import { ArrowUpRight, Building2, UsersRound } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import type { AuthorizationContext } from '@/features/auth/types';
import type { DashboardData } from '../data';

export function DashboardOverview({
  account,
  data,
}: {
  account: AuthorizationContext;
  data: DashboardData;
}) {
  const stats = [
    {
      label: account.role === 'platform_admin' ? 'Active agencies' : 'Your agency',
      value: data.agencyCount,
      note:
        account.role === 'platform_admin'
          ? 'Organizations currently able to operate'
          : (account.agency?.name ?? 'No active agency'),
      icon: Building2,
      href: account.role === 'platform_admin' ? '/agencies' : undefined,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Total users',
      value: data.userCount,
      note:
        account.role === 'platform_admin'
          ? 'Users assigned across all agencies'
          : 'Users assigned to your agency',
      icon: UsersRound,
      href: '/users',
      color: 'bg-violet-50 text-violet-600',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section>
        <div className="mb-5">
          <h2 className="text-2xl font-semibold tracking-tight">
            Welcome back, {account.displayName}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Current data from your authorized workspace.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {stats.map((stat) => (
            <Card key={stat.label} className="group">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <span className={`rounded-xl p-3 ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </span>
                  {stat.href && (
                    <Link
                      href={stat.href}
                      className="rounded-md p-1 text-muted-foreground opacity-60 transition group-hover:opacity-100"
                      aria-label={`View ${stat.label}`}
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
                <p className="mt-5 text-3xl font-semibold tracking-tight">
                  {stat.value ?? 'Unavailable'}
                </p>
                <p className="mt-1 text-sm font-medium">{stat.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {stat.value === null ? 'Database metric could not be loaded' : stat.note}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
