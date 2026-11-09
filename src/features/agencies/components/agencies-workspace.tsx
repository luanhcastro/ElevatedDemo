'use client';

import { Building2, MoreHorizontal, Pencil, Plus, Search, UserX } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { EmptyState, ErrorState, LoadingState } from '@/components/shared/page-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/components/ui/toast';
import { createMockAgencyRepository } from '@/lib/mock/repositories';
import type { AgencyFormValues } from '../schemas';
import type { Agency } from '../types';
import { AgencyFormDialog } from './agency-form-dialog';

const repository = createMockAgencyRepository();

export function AgenciesWorkspace() {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [query, setQuery] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Agency>();
  const [deactivating, setDeactivating] = useState<Agency>();
  const { toast } = useToast();
  const load = useCallback(async () => {
    setState('loading');
    try {
      setAgencies(await repository.list());
      setState('ready');
    } catch {
      setState('error');
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  const visible = useMemo(
    () =>
      agencies.filter((agency) =>
        `${agency.name} ${agency.email}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [agencies, query],
  );
  async function create(values: AgencyFormValues) {
    const agency = await repository.create(values);
    setAgencies((current) => [agency, ...current]);
    toast({
      title: 'Agency created',
      description: `${agency.name} was added to the demo workspace.`,
    });
  }
  async function update(values: AgencyFormValues) {
    if (!editing) return;
    const agency = await repository.update(editing.id, values);
    setAgencies((current) => current.map((item) => (item.id === agency.id ? agency : item)));
    toast({ title: 'Agency updated', description: `${agency.name} is up to date.` });
    setEditing(undefined);
  }
  async function deactivate() {
    if (!deactivating) return;
    const agency = await repository.deactivate(deactivating.id);
    setAgencies((current) => current.map((item) => (item.id === agency.id ? agency : item)));
    toast({ title: 'Agency deactivated', description: `${agency.name} is now inactive.` });
    setDeactivating(undefined);
  }
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Agency directory</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Create and maintain organizations in the demo platform.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Create agency
        </Button>
      </div>
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search agencies..."
              className="pl-9"
              aria-label="Search agencies"
            />
          </div>
          <p className="text-sm text-muted-foreground">{agencies.length} total agencies</p>
        </div>
        {state === 'loading' ? (
          <LoadingState />
        ) : state === 'error' ? (
          <ErrorState onRetry={load} />
        ) : visible.length === 0 ? (
          <EmptyState
            title={query ? 'No matching agencies' : 'No agencies yet'}
            description={
              query
                ? 'Try a different name or email address.'
                : 'Create the first organization in this workspace.'
            }
            action={
              !query ? (
                <Button onClick={() => setCreateOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Create agency
                </Button>
              ) : undefined
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-16">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((agency) => (
                <TableRow key={agency.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <Building2 className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="font-medium">{agency.name}</p>
                        <p className="text-xs text-muted-foreground">{agency.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={agency.status === 'active' ? 'default' : 'secondary'}>
                      {agency.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Intl.DateTimeFormat('en', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    }).format(new Date(agency.createdAt))}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Actions for ${agency.name}`}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => setEditing(agency)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit agency
                        </DropdownMenuItem>
                        {agency.status === 'active' && (
                          <DropdownMenuItem
                            className="text-red-600"
                            onSelect={() => setDeactivating(agency)}
                          >
                            <UserX className="mr-2 h-4 w-4" />
                            Deactivate
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
      <AgencyFormDialog open={createOpen} onOpenChange={setCreateOpen} onSubmit={create} />
      <AgencyFormDialog
        open={Boolean(editing)}
        onOpenChange={(open) => {
          if (!open) setEditing(undefined);
        }}
        agency={editing}
        onSubmit={update}
      />
      <ConfirmDialog
        open={Boolean(deactivating)}
        onOpenChange={(open) => {
          if (!open) setDeactivating(undefined);
        }}
        title={`Deactivate ${deactivating?.name ?? 'agency'}?`}
        description="The agency will remain visible but will be marked inactive. This demo does not enforce access restrictions."
        onConfirm={deactivate}
      />
    </div>
  );
}
