import { createClient } from '@supabase/supabase-js'

// Supabase configuration (envs devem estar definidas em .env.local)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // Mensagem de ajuda no dev; evita erro opaco "supabaseKey is required"
  // eslint-disable-next-line no-console
  console.error('[Supabase] Variáveis de ambiente faltando: NEXT_PUBLIC_SUPABASE_URL e/ou NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

declare global {
  // eslint-disable-next-line no-var, no-unused-vars
  var __supabase__: ReturnType<typeof createClient> | undefined
}

// Singleton para evitar múltiplas instâncias em dev/HMR
export const supabase = (globalThis as any).__supabase__ ?? createClient(
  supabaseUrl as string,
  supabaseAnonKey as string,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      // storageKey custom evita colisão com outras instâncias
      storageKey: 'pa-auth'
    }
  }
)
if (process.env.NODE_ENV !== 'production') (globalThis as any).__supabase__ = supabase

// Funções utilitárias (opcionais)
export async function getAccessToken() {
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token || null
}
