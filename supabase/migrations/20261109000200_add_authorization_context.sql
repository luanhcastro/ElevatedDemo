create function public.get_my_authorization_context()
returns table (
  account_role text,
  agency_id uuid,
  agency_name text,
  profile_name text
)
language sql
stable
security definer
set search_path = ''
as $$
  with caller as (
    select auth.uid() as user_id
  ),
  access_record as (
    select
      caller.user_id,
      exists (
        select 1
        from public.platform_admins
        where platform_admins.user_id = caller.user_id
      ) as is_platform_admin,
      membership.role as membership_role,
      agency.id as agency_id,
      agency.name as agency_name,
      agency.deleted_at is null as agency_is_active,
      profile.name as profile_name
    from caller
    left join public.profiles as profile
      on profile.id = caller.user_id
    left join public.agency_memberships as membership
      on membership.user_id = caller.user_id
    left join public.agencies as agency
      on agency.id = membership.agency_id
    where caller.user_id is not null
  )
  select
    case
      when is_platform_admin then 'platform_admin'
      when agency_is_active and membership_role = 'agency_admin' then 'agency_admin'
      when agency_is_active and membership_role = 'member' then 'member'
      else 'none'
    end as account_role,
    case when not is_platform_admin and agency_is_active then agency_id end as agency_id,
    case when not is_platform_admin and agency_is_active then agency_name end as agency_name,
    profile_name
  from access_record;
$$;

revoke all on function public.get_my_authorization_context() from public, anon, authenticated;
grant execute on function public.get_my_authorization_context() to authenticated;

comment on function public.get_my_authorization_context() is
  'Returns only the authenticated caller role and active agency context for server authorization.';
