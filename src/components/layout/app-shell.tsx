import { Header } from "./header";
import { Sidebar } from "./sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-slate-50"><Sidebar /><div className="lg:pl-64"><Header /><main className="p-4 sm:p-6 lg:p-8">{children}</main></div></div>;
}
