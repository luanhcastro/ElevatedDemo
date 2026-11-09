begin;

create extension if not exists pgtap with schema extensions;

select extensions.plan(6);

insert into auth.users (id, aud, role, email, created_at, updated_at)
values
  ('30000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'platform-context@example.test', now(), now()),
  ('30000000-0000-0000-0000-000000000101', 'authenticated', 'authenticated', 'agency-context@example.test', now(), now()),
  ('30000000-0000-0000-0000-000000000102', 'authenticated', 'authenticated', 'member-context@example.test', now(), now()),
  ('30000000-0000-0000-0000-000000000201', 'authenticated', 'authenticated', 'inactive-context@example.test', now(), now()),
  ('30000000-0000-0000-0000-000000000301', 'authenticated', 'authenticated', 'unassigned-context@example.test', now(), now());

insert into public.profiles (id, name)
values
  ('30000000-0000-0000-0000-000000000001', 'Platform Context'),
  ('30000000-0000-0000-0000-000000000101', 'Agency Context'),
  ('30000000-0000-0000-0000-000000000102', 'Member Context'),
  ('30000000-0000-0000-0000-000000000201', 'Inactive Context'),
  ('30000000-0000-0000-0000-000000000301', 'Unassigned Context');

insert into public.agencies (id, name, email, deleted_at)
values
  ('30000000-aaaa-0000-0000-000000000001', 'Active Context Agency', 'active-context@example.test', null),
  ('30000000-bbbb-0000-0000-000000000002', 'Inactive Context Agency', 'inactive-context@example.test', now());

insert into public.agency_memberships (agency_id, user_id, role)
values
  ('30000000-aaaa-0000-0000-000000000001', '30000000-0000-0000-0000-000000000101', 'agency_admin'),
  ('30000000-aaaa-0000-0000-000000000001', '30000000-0000-0000-0000-000000000102', 'member'),
  ('30000000-bbbb-0000-0000-000000000002', '30000000-0000-0000-0000-000000000201', 'agency_admin');

insert into public.platform_admins (user_id)
values ('30000000-0000-0000-0000-000000000001');

set local role authenticated;
set local request.jwt.claim.sub = '30000000-0000-0000-0000-000000000001';

select extensions.results_eq(
  'select account_role from public.get_my_authorization_context()',
  array['platform_admin'::text],
  'platform administrators resolve from the trusted platform_admins table'
);

set local request.jwt.claim.sub = '30000000-0000-0000-0000-000000000101';

select extensions.results_eq(
  'select account_role from public.get_my_authorization_context()',
  array['agency_admin'::text],
  'active agency administrators resolve with agency access'
);

set local request.jwt.claim.sub = '30000000-0000-0000-0000-000000000102';

select extensions.results_eq(
  'select account_role from public.get_my_authorization_context()',
  array['member'::text],
  'regular members resolve without administrative access'
);

set local request.jwt.claim.sub = '30000000-0000-0000-0000-000000000201';

select extensions.results_eq(
  'select account_role from public.get_my_authorization_context()',
  array['none'::text],
  'memberships in soft-deleted agencies resolve with no access'
);

set local request.jwt.claim.sub = '30000000-0000-0000-0000-000000000301';

select extensions.results_eq(
  'select account_role from public.get_my_authorization_context()',
  array['none'::text],
  'missing memberships resolve with no access'
);

reset role;
set local role anon;

select extensions.throws_ok(
  'select * from public.get_my_authorization_context()',
  '42501',
  null,
  'anonymous callers cannot execute the authorization context function'
);

reset role;

select extensions.finish();

rollback;
