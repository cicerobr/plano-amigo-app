# Correções Realizadas para Deploy na Vercel

## Problemas Identificados e Soluções

### 1. Conflito entre `builds` e `functions` no vercel.json

**Problema**: 
```
Error: The `functions` property cannot be used in conjunction with the `builds` property.
```

**Solução**: 
- Removida a propriedade `builds` do `vercel.json`
- Para Next.js 15, a Vercel detecta automaticamente o framework

**Antes**:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "functions": {
    "app/api/**/*.ts": {
      "runtime": "nodejs18.x"
    }
  }
}
```

**Depois**:
```json
{
  "version": 2
}
```

### 2. Referências de Secrets Inexistentes

**Problema**: 
```
Error: Environment Variable "SUPABASE_URL" references Secret "supabase-url", which does not exist.
```

**Solução**: 
- Removidas as referências de secrets do `vercel.json`
- As variáveis de ambiente devem ser configuradas diretamente no painel da Vercel

### 3. Runtime de Funções Inválido

**Problema**: 
```
Error: Function Runtimes must have a valid version, for example `now-php@1.0.0`.
```

**Solução**: 
- Removida a configuração customizada de `functions`
- Next.js 15 gerencia automaticamente o runtime das funções

### 4. Problemas de Tipagem no Next.js 15

**Problemas Corrigidos**:
- `params` agora retorna `Promise` nas rotas da API
- `headers()` agora retorna `Promise`

**Arquivos Corrigidos**:
- `app/api/beneficiary/[id]/faturas/[duplicataId]/route.ts`
- `app/api/beneficiary/[id]/faturas/route.ts`
- `app/api/beneficiary/[id]/plans/[planId]/route.ts`
- `app/api/beneficiary/[id]/plans/route.ts`
- `app/api/beneficiary/save/route.ts`

**Exemplo de Correção**:
```typescript
// Antes
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
}

// Depois
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
}
```

### 5. Configuração do Supabase Admin

**Problema**: 
- Importação de `supabaseAdmin` não encontrada

**Solução**: 
- Adicionada exportação `supabaseAdmin` em `lib/supabase.ts`
- Configurado cliente admin para operações server-side

## Configuração Final

### vercel.json (Configuração Mínima)
```json
{
  "version": 2
}
```

### Variáveis de Ambiente na Vercel
As seguintes variáveis devem ser configuradas no painel da Vercel:

```
NEXT_PUBLIC_SUPABASE_URL=https://oyiaxcpunckvybvsctbn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
HADES_API_URLBASE=https://api.hadesweb.com.br/api/v1/
HADES_API_TOKEN=c9016de1-d430-452b-bdba-cd2203eb37cd
```

## Status do Deploy

✅ **Deploy Bem-sucedido**: https://plano-amigo-app-6waa-eipg502em-cicerobr-gmailcoms-projects.vercel.app

## Comandos Úteis

```bash
# Verificar build local
npm run build

# Deploy para produção
npx vercel --prod

# Verificar status dos deployments
npx vercel ls

# Verificar logs (apenas para deployments em execução)
npx vercel logs [deployment-url]
```

## Lições Aprendidas

1. **Next.js 15 + Vercel**: Configuração mínima é preferível
2. **Variáveis de Ambiente**: Configurar diretamente no painel da Vercel
3. **Tipagem**: Next.js 15 introduziu mudanças breaking nas APIs
4. **Runtime**: Deixar a Vercel gerenciar automaticamente
5. **Build Local**: Sempre testar `npm run build` antes do deploy