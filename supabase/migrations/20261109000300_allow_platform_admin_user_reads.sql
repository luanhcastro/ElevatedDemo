create policy "platform admins can view profiles"
on public.profiles
for select
to authenticated
using ((select private.is_platform_admin()));

create policy "platform admins can view memberships"
on public.agency_memberships
for select
to authenticated
using ((select private.is_platform_admin()));

comment on policy "platform admins can view profiles" on public.profiles is
  'Allows the platform agency directory to drill into tenant users without granting mutations.';
comment on policy "platform admins can view memberships" on public.agency_memberships is
  'Allows platform-wide user counts and read-only agency user views.';
