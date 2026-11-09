'use client';

import { Plus, Search, UserRound } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { EmptyState, ErrorState, LoadingState } from '@/components/shared/page-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
import { createAgencyUser, listAgencyUsers } from '../actions';
import type { CreateUserFormValues } from '../schemas';
import type { User } from '../types';
import { UserFormDialog } from './user-form-dialog';

export function UsersWorkspace() {
  const [users, setUsers] = useState<User[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [query, setQuery] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const { toast } = useToast();
  const load = useCallback(async () => {
    setState('loading');
    try {
      setUsers(await listAgencyUsers());
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
      users.filter((user) =>
        `${user.name} ${user.email} ${user.agencyName}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [query, users],
  );
  async function create(values: CreateUserFormValues) {
    const result = await createAgencyUser(values);
    if (!result.ok) {
      toast({ title: 'User not created', description: result.message });
      return;
    }
    const { user } = result;
    setUsers((current) => [user, ...current]);
    toast({
      title: 'User created',
      description: `${user.name} can now sign in to ${user.agencyName}.`,
    });
  }
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">People directory</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage users in your agency workspace.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Create user
        </Button>
      </div>
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search users..."
              className="pl-9"
              aria-label="Search users"
            />
          </div>
          <p className="text-sm text-muted-foreground">{users.length} total users</p>
        </div>
        {state === 'loading' ? (
          <LoadingState />
        ) : state === 'error' ? (
          <ErrorState onRetry={load} />
        ) : visible.length === 0 ? (
          <EmptyState
            title={query ? 'No matching users' : 'No users yet'}
            description={
              query
                ? 'Try a different name, email, or agency.'
                : 'Create the first user in this workspace.'
            }
            action={
              !query ? (
                <Button onClick={() => setCreateOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Create user
                </Button>
              ) : undefined
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead className="hidden md:table-cell">Agency</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-50 text-violet-600">
                        <UserRound className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground md:hidden">
                          {user.agencyName}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {user.agencyName}
                  </TableCell>
                  <TableCell className="capitalize text-muted-foreground">
                    {user.role.replace('_', ' ')}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                      {user.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
      <UserFormDialog open={createOpen} onOpenChange={setCreateOpen} onSubmit={create} />
    </div>
  );
}
