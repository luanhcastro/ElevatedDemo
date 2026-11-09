import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", {
  variants: { variant: { default: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20", secondary: "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/10" } },
  defaultVariants: { variant: "default" },
});
export function Badge({ className, variant, ...props }: HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) { return <div className={cn(badgeVariants({ variant }), className)} {...props} />; }
