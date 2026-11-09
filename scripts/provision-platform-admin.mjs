import { createClient } from '@supabase/supabase-js';

const requiredVariables = [
  'SUPABASE_URL',
  'SUPABASE_SECRET_KEY',
  'INITIAL_PLATFORM_ADMIN_EMAIL',
  'INITIAL_PLATFORM_ADMIN_PASSWORD',
  'INITIAL_PLATFORM_ADMIN_NAME',
];

const missingVariables = requiredVariables.filter((name) => !process.env[name]);
if (missingVariables.length > 0) {
  console.error(`Missing required environment variables: ${missingVariables.join(', ')}`);
  process.exit(1);
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

const email = process.env.INITIAL_PLATFORM_ADMIN_EMAIL;
const password = process.env.INITIAL_PLATFORM_ADMIN_PASSWORD;
const name = process.env.INITIAL_PLATFORM_ADMIN_NAME;

const { data, error: createError } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { name },
});

if (createError || !data.user) {
  console.error(`Auth user creation failed (${createError?.code ?? 'unknown_error'}).`);
  process.exit(1);
}

const userId = data.user.id;
const { error: profileError } = await supabase.from('profiles').insert({ id: userId, name });
const { error: roleError } = profileError
  ? { error: null }
  : await supabase.from('platform_admins').insert({ user_id: userId });

if (profileError || roleError) {
  const { error: cleanupError } = await supabase.auth.admin.deleteUser(userId);
  console.error(
    `Database provisioning failed (${(profileError ?? roleError)?.code ?? 'unknown_error'}).`,
  );
  if (cleanupError) {
    console.error('Automatic Auth user cleanup also failed; remove the partial user manually.');
  }
  process.exit(1);
}

console.log('Initial platform administrator provisioned successfully.');
