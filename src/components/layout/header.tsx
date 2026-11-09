'use client';

import { ChevronDown, LogOut, Menu, Settings, UserRound } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Brand } from '@/components/shared/brand';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { logout } from '@/features/auth/actions';
import type { AccountRole } from '@/features/auth/types';
import { Navigation } from './navigation';

const titles: Record<string, { title: string; description: string }> = {
  '/dashboard': { title: 'Dashboard', description: 'A clear view of your organization portfolio.' },
  '/agencies': { title: 'Agencies', description: 'Manage organizations across the platform.' },
  '/users': { title: 'Users', description: 'Manage people and their workspace access.' },
};

const roleLabels: Record<AccountRole, string> = {
  platform_admin: 'Platform administrator',
  agency_admin: 'Agency administrator',
  member: 'Member',
  none: 'No administrative role',
};

function getInitials(name: string) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
  return initials || 'U';
}

export function Header({
  displayName,
  email,
  role,
}: {
  displayName: string;
  email: string;
  role: AccountRole;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const page = titles[pathname] ?? titles['/dashboard'];
  return (
    <>
      <header className="sticky top-0 z-30 border-b bg-white/90 backdrop-blur">
        <div className="flex h-20 items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-semibold tracking-tight sm:text-xl">
              {page.title}
            </h1>
            <p className="hidden text-sm text-muted-foreground sm:block">{page.description}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-11 gap-3 px-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                  {getInitials(displayName)}
                </span>
                <span className="hidden text-left md:block">
                  <span className="block max-w-40 truncate text-sm font-medium leading-4">
                    {displayName}
                  </span>
                  <span className="block text-xs font-normal text-muted-foreground">
                    {roleLabels[role]}
                  </span>
                </span>
                <ChevronDown className="hidden h-4 w-4 text-muted-foreground md:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <span className="block">{displayName}</span>
                <span className="block max-w-52 truncate text-xs font-normal text-muted-foreground">
                  {email}
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <UserRound className="mr-2 h-4 w-4" />
                Profile placeholder
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings placeholder
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <form action={logout}>
                <DropdownMenuItem asChild>
                  <button type="submit" className="w-full text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </button>
                </DropdownMenuItem>
              </form>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
        <DialogContent className="left-0 top-0 h-dvh w-[85%] max-w-xs translate-x-0 translate-y-0 rounded-none border-0 bg-sidebar p-0 text-white">
          <DialogTitle className="sr-only">Navigation</DialogTitle>
          <div className="flex h-20 items-center border-b border-white/10 px-6">
            <Brand dark />
          </div>
          <div className="p-4">
            <Navigation role={role} onNavigate={() => setMobileOpen(false)} />
          </div>
          <p className="absolute bottom-6 px-7 text-xs leading-5 text-slate-400">
            Signed in as {roleLabels[role].toLowerCase()}
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
