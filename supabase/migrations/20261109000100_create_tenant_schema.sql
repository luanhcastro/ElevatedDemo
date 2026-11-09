create schema if not exists private;

revoke all on schema private from public;

create table public.agencies (
  id uuid primary key default gen_random_uuid(),
  name text not null constraint agencies_name_not_blank check (btrim(name) <> ''),
  email text not null constraint agencies_email_not_blank check (btrim(email) <> ''),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null constraint profiles_name_not_blank check (btrim(name) <> ''),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.agency_memberships (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies (id) on delete restrict,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null constraint agency_memberships_role_valid
    check (role in ('agency_admin', 'member')),
  created_at timestamptz not null default now(),
  constraint agency_memberships_user_id_unique unique (user_id)
);

create table public.platform_admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

create index agency_memberships_agency_id_idx
  on public.agency_memberships (agency_id);

create index agencies_active_idx
  on public.agencies (id)
  where deleted_at is null;

create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create function private.prevent_membership_identity_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.agency_id is distinct from old.agency_id
    or new.user_id is distinct from old.user_id then
    raise exception 'Membership agency_id and user_id are immutable'
      using errcode = '22000';
  end if;

  return new;
end;
$$;

create function private.prevent_primary_key_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.id is distinct from old.id then
    raise exception 'Primary key id is immutable'
      using errcode = '22000';
  end if;

  return new;
end;
$$;

create trigger agencies_set_updated_at
before update on public.agencies
for each row execute function private.set_updated_at();

create trigger agencies_prevent_primary_key_change
before update on public.agencies
for each row execute function private.prevent_primary_key_change();

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();

create trigger profiles_prevent_primary_key_change
before update on public.profiles
for each row execute function private.prevent_primary_key_change();

create trigger agency_memberships_prevent_identity_change
before update on public.agency_memberships
for each row execute function private.prevent_membership_identity_change();

create function private.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.platform_admins
    where user_id = (select auth.uid())
  );
$$;

create function private.is_active_agency_member(target_agency_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.agency_memberships as membership
    inner join public.agencies as agency
      on agency.id = membership.agency_id
    where membership.user_id = (select auth.uid())
      and membership.agency_id = target_agency_id
      and agency.deleted_at is null
  );
$$;

create function private.is_agency_admin(target_agency_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.agency_memberships as membership
    inner join public.agencies as agency
      on agency.id = membership.agency_id
    where membership.user_id = (select auth.uid())
      and membership.agency_id = target_agency_id
      and membership.role = 'agency_admin'
      and agency.deleted_at is null
  );
$$;

create function private.can_administer_user(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.agency_memberships as administrator
    inner join public.agency_memberships as target
      on target.agency_id = administrator.agency_id
    inner join public.agencies as agency
      on agency.id = administrator.agency_id
    where administrator.user_id = (select auth.uid())
      and administrator.role = 'agency_admin'
      and target.user_id = target_user_id
      and agency.deleted_at is null
  );
$$;

revoke all on function private.set_updated_at() from public, anon, authenticated;
revoke all on function private.prevent_membership_identity_change() from public, anon, authenticated;
revoke all on function private.prevent_primary_key_change() from public, anon, authenticated;
revoke all on function private.is_platform_admin() from public, anon, authenticated;
revoke all on function private.is_active_agency_member(uuid) from public, anon, authenticated;
revoke all on function private.is_agency_admin(uuid) from public, anon, authenticated;
revoke all on function private.can_administer_user(uuid) from public, anon, authenticated;

grant usage on schema private to authenticated;
grant execute on function private.is_platform_admin() to authenticated;
grant execute on function private.is_active_agency_member(uuid) to authenticated;
grant execute on function private.is_agency_admin(uuid) to authenticated;
grant execute on function private.can_administer_user(uuid) to authenticated;

alter table public.agencies enable row level security;
alter table public.profiles enable row level security;
alter table public.agency_memberships enable row level security;
alter table public.platform_admins enable row level security;

revoke all on table public.agencies from anon, authenticated;
revoke all on table public.profiles from anon, authenticated;
revoke all on table public.agency_memberships from anon, authenticated;
revoke all on table public.platform_admins from anon, authenticated;

grant select, insert, update on table public.agencies to authenticated;
grant select, insert, update on table public.profiles to authenticated;
grant select, insert, update, delete on table public.agency_memberships to authenticated;

create policy "platform admins and active members can view agencies"
on public.agencies
for select
to authenticated
using (
  (select private.is_platform_admin())
  or (select private.is_active_agency_member(id))
);

create policy "platform admins can create agencies"
on public.agencies
for insert
to authenticated
with check ((select private.is_platform_admin()));

create policy "platform admins can update agencies"
on public.agencies
for update
to authenticated
using ((select private.is_platform_admin()))
with check ((select private.is_platform_admin()));

create policy "users can view permitted profiles"
on public.profiles
for select
to authenticated
using (
  id = (select auth.uid())
  or (select private.can_administer_user(id))
);

create policy "users can create their own profile"
on public.profiles
for insert
to authenticated
with check (id = (select auth.uid()));

create policy "users can update permitted profiles"
on public.profiles
for update
to authenticated
using (
  id = (select auth.uid())
  or (select private.can_administer_user(id))
)
with check (
  id = (select auth.uid())
  or (select private.can_administer_user(id))
);

create policy "users can view permitted memberships"
on public.agency_memberships
for select
to authenticated
using (
  (
    user_id = (select auth.uid())
    and (select private.is_active_agency_member(agency_id))
  )
  or (select private.is_agency_admin(agency_id))
);

create policy "agency admins can create memberships"
on public.agency_memberships
for insert
to authenticated
with check (
  user_id <> (select auth.uid())
  and (select private.is_agency_admin(agency_id))
);

create policy "agency admins can update memberships"
on public.agency_memberships
for update
to authenticated
using (
  user_id <> (select auth.uid())
  and (select private.is_agency_admin(agency_id))
)
with check (
  user_id <> (select auth.uid())
  and (select private.is_agency_admin(agency_id))
);

create policy "agency admins can delete memberships"
on public.agency_memberships
for delete
to authenticated
using (
  user_id <> (select auth.uid())
  and (select private.is_agency_admin(agency_id))
);

comment on table public.agencies is
  'Tenant organizations. Deletion is a platform-admin soft delete via deleted_at.';
comment on table public.profiles is
  'Application profile data keyed to Supabase Auth users. Passwords are never stored here.';
comment on table public.agency_memberships is
  'One agency membership per user for the MVP. Tenant and user identity columns are immutable.';
comment on table public.platform_admins is
  'Trusted platform administrators. No anon or authenticated write policy is provided.';
