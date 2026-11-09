'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { agencySchema, type AgencyFormValues } from '../schemas';
import type { Agency } from '../types';

export function AgencyFormDialog({
  open,
  onOpenChange,
  agency,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agency?: Agency;
  onSubmit: (values: AgencyFormValues) => Promise<void>;
}) {
  const form = useForm<AgencyFormValues>({
    resolver: zodResolver(agencySchema),
    defaultValues: { name: '', email: '' },
  });
  useEffect(() => {
    if (open)
      form.reset(agency ? { name: agency.name, email: agency.email } : { name: '', email: '' });
  }, [agency, form, open]);
  const submit = form.handleSubmit(async (values) => {
    await onSubmit(values);
    onOpenChange(false);
  });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{agency ? 'Edit agency' : 'Create agency'}</DialogTitle>
          <DialogDescription>
            {agency
              ? 'Update the organization’s contact details.'
              : 'Add a new organization to this demo workspace.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="agency-name">Agency name</Label>
            <Input
              id="agency-name"
              placeholder="Acme Studio"
              autoComplete="organization"
              aria-invalid={Boolean(form.formState.errors.name)}
              {...form.register('name')}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="agency-email">Contact email</Label>
            <Input
              id="agency-email"
              type="email"
              placeholder="team@acme.example"
              autoComplete="email"
              aria-invalid={Boolean(form.formState.errors.email)}
              {...form.register('email')}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
            )}
          </div>
          <p className="rounded-md bg-blue-50 px-3 py-2 text-xs leading-5 text-blue-700">
            Demo only: changes are held in memory and are not sent to a server.
          </p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {agency ? 'Save changes' : 'Create agency'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
