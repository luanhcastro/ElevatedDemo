import Link from "next/link";
import { cn } from "@/lib/utils";

export function Brand({ compact = false, dark = false }: { compact?: boolean; dark?: boolean }) {
  return <Link href="/dashboard" className={cn("inline-flex items-center gap-3 rounded-md font-semibold", dark ? "text-white" : "text-slate-950")}><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500 shadow-lg shadow-blue-500/20"><svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" aria-hidden="true"><path d="M5 15.5 12 8l7 7.5M12 8v11" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /><path d="M7.5 5h9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg></span>{!compact && <span className="text-[15px] tracking-tight">ElevatedDemo</span>}<span className="sr-only">ElevatedDemo home</span></Link>;
}
