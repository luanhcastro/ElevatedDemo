begin;

create extension if not exists pgtap with schema extensions;

select extensions.plan(35);

insert into auth.users (id, aud, role, email, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'platform@example.test', now(), now()),
  ('00000000-0000-0000-0000-000000000101', 'authenticated', 'authenticated', 'admin-a@example.test', now(), now()),
  ('00000000-0000-0000-0000-000000000102', 'authenticated', 'authenticated', 'member-a@example.test', now(), now()),
  ('00000000-0000-0000-0000-000000000201', 'authenticated', 'authenticated', 'admin-b@example.test', now(), now()),
  ('00000000-0000-0000-0000-000000000202', 'authenticated', 'authenticated', 'member-b@example.test', now(), now()),
  ('00000000-0000-0000-0000-000000000301', 'authenticated', 'authenticated', 'outsider@example.test', now(), now()),
  ('00000000-0000-0000-0000-000000000302', 'authenticated', 'authenticated', 'outsider-two@example.test', now(), now());

insert into public.profiles (id, name)
values
  ('00000000-0000-0000-0000-000000000001', 'Platform Administrator'),
  ('00000000-0000-0000-0000-000000000101', 'Agency A Administrator'),
  ('00000000-0000-0000-0000-000000000102', 'Agency A Member'),
  ('00000000-0000-0000-0000-000000000201', 'Agency B Administrator'),
  ('00000000-0000-0000-0000-000000000202', 'Agency B Member'),
  ('00000000-0000-0000-0000-000000000301', 'Unassigned User'),
  ('00000000-0000-0000-0000-000000000302', 'Second Unassigned User');

insert into public.agencies (id, name, email)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Agency A', 'agency-a@example.test'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', 'Agency B', 'agency-b@example.test');

insert into public.agency_memberships (id, agency_id, user_id, role)
values
  ('10000000-0000-0000-0000-000000000101', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '00000000-0000-0000-0000-000000000101', 'agency_admin'),
  ('10000000-0000-0000-0000-000000000102', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '00000000-0000-0000-0000-000000000102', 'member'),
  ('20000000-0000-0000-0000-000000000201', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', '00000000-0000-0000-0000-000000000201', 'agency_admin'),
  ('20000000-0000-0000-0000-000000000202', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', '00000000-0000-0000-0000-000000000202', 'member');

insert into public.platform_admins (user_id)
values ('00000000-0000-0000-0000-000000000001');

set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000001';

select extensions.is(
  (select count(*) from public.agencies),
  2::bigint,
  'platform administrators can view every agency'
);

select extensions.is(
  (select count(*) from public.profiles),
  7::bigint,
  'platform administrators can view profiles across agencies'
);

select extensions.is(
  (select count(*) from public.agency_memberships),
  4::bigint,
  'platform administrators can view memberships across agencies'
);

select extensions.results_eq(
  $$
    insert into public.agencies (id, name, email)
    values ('cccccccc-cccc-cccc-cccc-ccccccccccc3', 'Agency C', 'agency-c@example.test')
    returning id
  $$,
  array['cccccccc-cccc-cccc-cccc-ccccccccccc3'::uuid],
  'platform administrators can create agencies'
);

select extensions.results_eq(
  $$
    update public.agencies
    set name = 'Agency B Updated'
    where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2'
    returning id
  $$,
  array['bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2'::uuid],
  'platform administrators can update agencies'
);

select extensions.throws_ok(
  $$
    delete from public.agencies
    where id = 'cccccccc-cccc-cccc-cccc-ccccccccccc3'
  $$,
  '42501',
  null,
  'platform administrators must soft-delete agencies instead of physically deleting them'
);

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000101';

select extensions.is(
  (select count(*) from public.agencies where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'),
  1::bigint,
  'Agency A administrator can view Agency A'
);

select extensions.is(
  (select count(*) from public.agencies where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2'),
  0::bigint,
  'Agency A administrator cannot view Agency B'
);

select extensions.is(
  (select count(*) from public.profiles),
  2::bigint,
  'Agency A administrator can view only Agency A profiles'
);

select extensions.is(
  (select count(*) from public.agency_memberships),
  2::bigint,
  'Agency A administrator can view only Agency A memberships'
);

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000201';

select extensions.is(
  (select count(*) from public.agencies where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2'),
  1::bigint,
  'Agency B administrator can view Agency B'
);

select extensions.is(
  (select count(*) from public.agencies where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'),
  0::bigint,
  'Agency B administrator cannot view Agency A'
);

select extensions.is(
  (select count(*) from public.profiles),
  2::bigint,
  'Agency B administrator can view only Agency B profiles'
);

select extensions.is(
  (select count(*) from public.agency_memberships),
  2::bigint,
  'Agency B administrator can view only Agency B memberships'
);

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000101';

select extensions.is_empty(
  $$
    update public.agencies
    set name = 'Compromised Agency B'
    where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2'
    returning id
  $$,
  'Agency A administrator cannot update Agency B'
);

select extensions.is_empty(
  $$
    update public.profiles
    set name = 'Compromised Agency B Member'
    where id = '00000000-0000-0000-0000-000000000202'
    returning id
  $$,
  'Agency A administrator cannot update Agency B profiles'
);

select extensions.is_empty(
  $$
    delete from public.agency_memberships
    where user_id = '00000000-0000-0000-0000-000000000202'
    returning id
  $$,
  'Agency A administrator cannot delete Agency B memberships'
);

select extensions.throws_ok(
  $$
    insert into public.agency_memberships (agency_id, user_id, role)
    values (
      'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2',
      '00000000-0000-0000-0000-000000000301',
      'member'
    )
  $$,
  '42501',
  null,
  'Agency A administrator cannot insert Agency B memberships'
);

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000102';

select extensions.is_empty(
  $$
    update public.agency_memberships
    set role = 'agency_admin'
    where user_id = '00000000-0000-0000-0000-000000000102'
    returning id
  $$,
  'regular members cannot promote themselves'
);

select extensions.throws_ok(
  $$
    insert into public.agency_memberships (agency_id, user_id, role)
    values (
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
      '00000000-0000-0000-0000-000000000301',
      'member'
    )
  $$,
  '42501',
  null,
  'regular members cannot create memberships'
);

select extensions.is_empty(
  $$
    delete from public.agency_memberships
    where user_id = '00000000-0000-0000-0000-000000000101'
    returning id
  $$,
  'regular members cannot delete memberships'
);

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000101';

select extensions.is_empty(
  $$
    update public.agency_memberships
    set role = 'member'
    where user_id = '00000000-0000-0000-0000-000000000101'
    returning id
  $$,
  'agency administrators cannot change their own role'
);

select extensions.throws_ok(
  $$
    update public.agency_memberships
    set agency_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2'
    where user_id = '00000000-0000-0000-0000-000000000102'
  $$,
  '22000',
  null,
  'membership tenant and user identity columns are immutable'
);

select extensions.results_eq(
  $$
    update public.agency_memberships
    set role = 'agency_admin'
    where user_id = '00000000-0000-0000-0000-000000000102'
    returning user_id
  $$,
  array['00000000-0000-0000-0000-000000000102'::uuid],
  'agency administrators can assign roles to other users in their tenant'
);

select extensions.results_eq(
  $$
    insert into public.agency_memberships (agency_id, user_id, role)
    values (
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
      '00000000-0000-0000-0000-000000000301',
      'member'
    )
    returning user_id
  $$,
  array['00000000-0000-0000-0000-000000000301'::uuid],
  'agency administrators can add an unassigned user to their tenant'
);

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000102';

select extensions.throws_ok(
  $$
    insert into public.platform_admins (user_id)
    values ('00000000-0000-0000-0000-000000000102')
  $$,
  '42501',
  null,
  'authenticated users cannot create platform administrators'
);

reset role;
set local role anon;

select extensions.throws_ok(
  'select * from public.agencies',
  '42501',
  null,
  'anonymous users cannot read agencies'
);

select extensions.throws_ok(
  'select * from public.profiles',
  '42501',
  null,
  'anonymous users cannot read profiles'
);

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000001';

select extensions.results_eq(
  $$
    update public.agencies
    set deleted_at = now()
    where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'
    returning id
  $$,
  array['aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'::uuid],
  'platform administrators can deactivate agencies through soft deletion'
);

reset role;

set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000101';

select extensions.is(
  (select count(*) from public.agencies),
  0::bigint,
  'users in a deactivated agency cannot read their agency'
);

select extensions.is(
  (select count(*) from public.agency_memberships),
  0::bigint,
  'users in a deactivated agency cannot read tenant memberships'
);

select extensions.is(
  (
    select count(*)
    from public.profiles
    where id = '00000000-0000-0000-0000-000000000102'
  ),
  0::bigint,
  'administrators in a deactivated agency cannot read other tenant profiles'
);

select extensions.throws_ok(
  $$
    insert into public.agency_memberships (agency_id, user_id, role)
    values (
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
      '00000000-0000-0000-0000-000000000302',
      'member'
    )
  $$,
  '42501',
  null,
  'administrators in a deactivated agency cannot create memberships'
);

select extensions.is(
  (select count(*) from public.profiles where id = (select auth.uid())),
  1::bigint,
  'users retain access to their own identity profile after agency deactivation'
);

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000001';

select extensions.is(
  (
    select count(*)
    from public.agencies
    where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'
      and deleted_at is not null
  ),
  1::bigint,
  'platform administrators can view deactivated agencies'
);

reset role;

select extensions.finish();

rollback;
