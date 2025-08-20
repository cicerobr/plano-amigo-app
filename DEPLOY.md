# Deploy na Vercel - Plano Amigo

## Pré-requisitos

- Node.js 18+ instalado
- Conta na Vercel
- CLI da Vercel instalada (`npm install -g vercel`)

## Dependências Instaladas

Todas as dependências necessárias para deploy na Vercel já estão instaladas:

- **Next.js 15.4.5** - Framework principal
- **@supabase/supabase-js** - Cliente Supabase
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Radix UI** - Componentes de interface

## Arquivos de Configuração

### `vercel.json`
Arquivo de configuração principal da Vercel:
- Versão 2 da plataforma
- Configuração mínima para Next.js 15
- **IMPORTANTE**: Removidas as configurações `builds` e `functions` que causavam conflitos
- **IMPORTANTE**: Removidas as referências de variáveis de ambiente que devem ser configuradas no painel da Vercel

### `.vercelignore`
Arquivo para excluir arquivos desnecessários do deploy:
- node_modules
- .env.local
- .next/
- out/
- E outros arquivos de desenvolvimento

## Variáveis de Ambiente

Configure as seguintes variáveis no painel da Vercel:

### Supabase
```
SUPABASE_URL=https://oyiaxcpunckvybvsctbn.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SUPABASE_URL=https://oyiaxcpunckvybvsctbn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Hades API
```
HADES_API_URLBASE=https://api.hadesweb.com.br/api/v1/
HADES_API_TOKEN=c9016de1-d430-452b-bdba-cd2203eb37cd
```

## Deploy Manual

### 1. Build Local
```bash
npm run build
```

### 2. Deploy
```bash
vercel --prod
```

## Deploy Automatizado

Use o script fornecido:
```bash
./deploy.sh
```

O script irá:
1. Verificar se a CLI da Vercel está instalada
2. Fazer build local para validar
3. Fazer deploy na Vercel
4. Mostrar lembretes sobre variáveis de ambiente

## Configuração no Painel da Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Importe o projeto do GitHub/GitLab
3. Configure as variáveis de ambiente em **Settings > Environment Variables**
4. Configure o domínio personalizado se necessário

## Monitoramento

- **Logs**: Disponíveis no painel da Vercel
- **Analytics**: Métricas de performance automáticas
- **Errors**: Rastreamento de erros em tempo real

## Troubleshooting

### Problemas Comuns e Soluções

#### 1. Erro: "functions property cannot be used with builds property"
**Solução**: Remover a propriedade `builds` do `vercel.json` para Next.js 15

#### 2. Erro: "Environment Variable references Secret which does not exist"
**Solução**: Remover referências de secrets do `vercel.json` e configurar as variáveis diretamente no painel da Vercel

#### 3. Erro: "Function Runtimes must have a valid version"
**Solução**: Remover configurações customizadas de `functions` do `vercel.json` para Next.js 15

#### 4. Problemas de Tipagem no Next.js 15
**Solução**: Adicionar `await` para `params` e `headers()` nas rotas da API

### Comandos de Diagnóstico

#### Verificar Build Local
```bash
npm run build
```

#### Verificar Logs de Deploy
```bash
npx vercel logs [deployment-url]
```

#### Limpar Cache
```bash
npm run clean
npm install
```

#### Verificar Status dos Deployments
```bash
npx vercel ls
```

### Build Falha
- Verifique se `npm run build` funciona localmente
- Confirme que todas as dependências estão no `package.json`
- Verifique erros de TypeScript

### Erro de Runtime
- Verifique se todas as variáveis de ambiente estão configuradas
- Confirme se as APIs externas (Supabase, Hades) estão acessíveis
- Verifique os logs no painel da Vercel

### Performance
- Use o **Vercel Analytics** para monitorar performance
- Otimize imagens com `next/image`
- Configure cache adequadamente

## Comandos Úteis

```bash
# Instalar CLI da Vercel
npm install -g vercel

# Login na Vercel
vercel login

# Deploy de preview
vercel

# Deploy de produção
vercel --prod

# Ver logs
vercel logs [deployment-url]

# Listar deployments
vercel ls
```

## Estrutura de Deploy

```
my-app/
├── .vercel/          # Configurações locais da Vercel
├── .vercelignore     # Arquivos ignorados no deploy
├── vercel.json       # Configuração de deploy
├── deploy.sh         # Script automatizado
├── package.json      # Dependências
└── DEPLOY.md         # Este arquivo
```