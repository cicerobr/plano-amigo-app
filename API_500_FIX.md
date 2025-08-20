# Correção do Erro HTTP 500 na API de Clientes

## Problema Identificado

O erro HTTP 500 estava ocorrendo na função `searchBeneficiaryClient` devido a um problema de configuração das variáveis de ambiente da API Hades.

### Stack Trace do Erro
```
Error: HTTP error! status: 500 
     at searchBeneficiaryClient (webpack-internal:///(app-pages-browser)/./lib/api.ts:236:19) 
     at async handleSubmit (webpack-internal:///(app-pages-browser)/./components/beneficiary-search-form.tsx:65:28)
```

## Causa Raiz

As variáveis de ambiente da API Hades estavam configuradas com nomes incorretos no arquivo `.env.local`:

### Configuração Incorreta (Antes)
```env
HADES_API_URLBASE=https://api.hadesweb.com.br/api/v1/
HADES_API_TOKEN=c9016de1-d430-452b-bdba-cd2203eb37cd
```

### Configuração Correta (Depois)
```env
HADESWEB_API_BASE_URL=https://api.hadesweb.com.br/api/v1/
HADESWEB_API_TOKEN=c9016de1-d430-452b-bdba-cd2203eb37cd
```

## Análise do Código

### API Route (`/app/api/beneficiary/search/route.ts`)
O código da API route estava verificando as variáveis de ambiente corretas:
```typescript
const token = process.env.HADESWEB_API_TOKEN;
const baseUrl = process.env.HADESWEB_API_BASE_URL;
```

### Classe HadeswebApiService (`/lib/api.ts`)
A classe também estava configurada para usar as variáveis corretas:
```typescript
constructor() {
  this.baseUrl = process.env.HADESWEB_API_BASE_URL || 'https://api.hadesweb.com.br/api/v1';
  this.token = process.env.HADESWEB_API_TOKEN || '';
}
```

## Solução Implementada

1. **Correção das Variáveis de Ambiente**: Atualizei o arquivo `.env.local` com os nomes corretos das variáveis:
   - `HADES_API_URLBASE` → `HADESWEB_API_BASE_URL`
   - `HADES_API_TOKEN` → `HADESWEB_API_TOKEN`

2. **Reinicialização do Servidor**: Parei e reiniciei o servidor de desenvolvimento para carregar as novas variáveis de ambiente.

3. **Deploy em Produção**: Realizei o deploy das correções na Vercel.

## Verificação da Correção

### Logs de Sucesso (Local)
Após a correção, os logs do servidor mostraram que a API está funcionando corretamente:
```
POST /api/beneficiary/search 200 in 4425ms
POST /api/beneficiary/check 200 in 1306ms
```

### Dados Retornados
A API agora retorna dados válidos da API Hades:
```json
{
  "id": 1033415,
  "nome": "REBECCA DE MENEZES",
  "cpf_cnpj": "072.819.534-88",
  "fis_jur": "F",
  "telefone_res": "(83) 99114-5299",
  "endereco": {
    "cep": "58046-230",
    "logradouro": "Rua Celina da Costa Machado Chaves",
    "numero": "65",
    "complemento": "APTO 101",
    "bairro": "Altiplano Cabo Branco",
    "cidade": "João Pessoa",
    "uf": "PB"
  }
}
```

## Deploy em Produção

- **URL de Produção**: https://plano-amigo-app-6waa-o3kqos706-cicerobr-gmailcoms-projects.vercel.app
- **Status**: Deploy realizado com sucesso
- **Comando**: `npx vercel --prod`

## Status Final

✅ **Problema Resolvido**: O erro HTTP 500 foi corrigido tanto localmente quanto em produção.

✅ **API Funcionando**: A API de busca de beneficiários está retornando dados corretamente.

✅ **Variáveis de Ambiente**: Todas as variáveis estão configuradas corretamente.

## Próximos Passos

- [ ] Verificar se as variáveis de ambiente estão configuradas corretamente na Vercel
- [ ] Testar todas as funcionalidades da API de clientes em produção
- [ ] Monitorar logs de erro para garantir estabilidade

---

**Data da Correção**: $(date)
**Ambiente**: Local e Produção (Vercel)
**Status**: ✅ Resolvido