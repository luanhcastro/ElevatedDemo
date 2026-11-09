import { HelpCircle, Sparkles } from 'lucide-react';
import { Brand } from '@/components/shared/brand';
import type { AccountRole } from '@/features/auth/types';
import { Navigation } from './navigation';

export function Sidebar({ role }: { role: AccountRole }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-sidebar lg:flex">
      <div className="flex h-20 items-center px-6">
        <Brand dark />
      </div>
      <div className="flex-1 px-4 pt-4">
        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          Workspace
        </p>
        <Navigation role={role} />
      </div>
      <div className="p-4">
        <div className="mb-3 rounded-xl border border-white/10 bg-white/[0.04] p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-white">
            <Sparkles className="h-4 w-4 text-blue-400" />
            Authenticated workspace
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-400">
            Management data remains mocked until Issue #4.
          </p>
        </div>
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-white/10 hover:text-white">
          <HelpCircle className="h-[18px] w-[18px]" />
          Help & support
        </button>
      </div>
    </aside>
  );
}
