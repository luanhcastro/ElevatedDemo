"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createUserSchema, updateUserSchema, type CreateUserFormValues, type UpdateUserFormValues } from "../schemas";
import type { User } from "../types";

type UserFormValues = CreateUserFormValues | UpdateUserFormValues;
export function UserFormDialog({ open, onOpenChange, user, onSubmit }: { open: boolean; onOpenChange: (open: boolean) => void; user?: User; onSubmit: (values: UserFormValues) => Promise<void> }) {
  const [showPassword, setShowPassword] = useState(false); const editing = Boolean(user);
  const form = useForm<CreateUserFormValues>({ resolver: zodResolver(editing ? updateUserSchema : createUserSchema), defaultValues: { name: "", email: "", password: "" } });
  useEffect(() => { if (open) { form.reset(user ? { name: user.name, email: user.email, password: "" } : { name: "", email: "", password: "" }); setShowPassword(false); } }, [form, open, user]);
  const submit = form.handleSubmit(async (values) => { await onSubmit(editing ? { name: values.name, email: values.email } : values); onOpenChange(false); });
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent><DialogHeader><DialogTitle>{editing ? "Edit user" : "Create user"}</DialogTitle><DialogDescription>{editing ? "Update profile details. Passwords are never displayed here." : "Add a demo user. The password is validated, then immediately discarded."}</DialogDescription></DialogHeader><form onSubmit={submit} className="space-y-4"><div className="space-y-2"><Label htmlFor="user-name">Full name</Label><Input id="user-name" autoComplete="name" placeholder="Taylor Morgan" aria-invalid={Boolean(form.formState.errors.name)} {...form.register("name")} />{form.formState.errors.name && <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>}</div><div className="space-y-2"><Label htmlFor="user-email">Email address</Label><Input id="user-email" type="email" autoComplete="email" placeholder="taylor@agency.example" aria-invalid={Boolean(form.formState.errors.email)} {...form.register("email")} />{form.formState.errors.email && <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>}</div>{!editing && <div className="space-y-2"><Label htmlFor="user-password">Temporary demo password</Label><div className="relative"><Input id="user-password" type={showPassword ? "text" : "password"} autoComplete="new-password" className="pr-11" aria-invalid={Boolean(form.formState.errors.password)} {...form.register("password")} /><button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute right-0 top-0 flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground hover:text-foreground" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>{form.formState.errors.password && <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>}</div>}<p className="rounded-md bg-blue-50 px-3 py-2 text-xs leading-5 text-blue-700">Demo only: no account or credentials are created.</p><DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}{editing ? "Save changes" : "Create user"}</Button></DialogFooter></form></DialogContent></Dialog>;
}
