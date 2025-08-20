import { createClient } from '@supabase/supabase-js'

// Supabase configuration (envs devem estar definidas em .env.local)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://oyiaxcpunckvybvsctbn.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95aWF4Y3B1bmNrdnlidnNjdGJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MTA2MzMsImV4cCI6MjA2OTI4NjYzM30.NWOCD9PKee1L2qTUkvHrxliXb8VM7JKcNE4TE_TWHWw'
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95aWF4Y3B1bmNrdnlidnNjdGJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzcxMDYzMywiZXhwIjoyMDY5Mjg2NjMzfQ.1LaTBOe7JpYCWXSQq62J4XBf6KEoosWFoXbAVT4wuaw'

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Configuração do Supabase incompleta. Verifique as variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.')
}

declare global {
  // eslint-disable-next-line no-var, no-unused-vars
  var __supabase__: ReturnType<typeof createClient> | undefined
}

// Singleton para evitar múltiplas instâncias em dev/HMR
export const supabase = (globalThis as any).__supabase__ ?? createClient(
  supabaseUrl,
  supabaseAnonKey,
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

// Cliente admin para operações server-side
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceRoleKey || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Funções utilitárias (opcionais)
export async function getAccessToken() {
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token || null
}
