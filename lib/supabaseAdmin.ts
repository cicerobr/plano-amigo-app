'use server';
import 'server-only';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!serviceRoleKey) {
  // Intencionalmente não joga erro aqui para não quebrar build; APIs falharão claramente se faltar a env
  // eslint-disable-next-line no-console
  console.warn('SUPABASE_SERVICE_ROLE_KEY ausente. Rotas server-side que dependem de admin podem falhar.');
}

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

