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
    </aside>
  );
}
