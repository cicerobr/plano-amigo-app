# Plano Amigo - Sistema de Consulta de Beneficiários

Sistema web para consulta de informações gerais e financeiras sobre planos funerários contratados, integrado com a API Hadesweb.

## 🚀 Funcionalidades

- **Consulta de Beneficiários**: Busca por CPF ou CNPJ via API Hadesweb
- **Salvar Beneficiários**: Salva beneficiários consultados no banco Supabase
- **Listagem de Beneficiários**: Visualiza beneficiários salvos no sistema
- **Validação Automática**: Validação e formatação automática de CPF/CNPJ
- **Interface Responsiva**: Design moderno e responsivo com Tailwind CSS
- **Tratamento de Erros**: Sistema robusto de tratamento de erros e feedback
- **Notificações**: Sistema de toast para feedback do usuário
- **Loading States**: Indicadores visuais de carregamento
- **Integração Supabase**: Conexão com banco de dados PostgreSQL

## 🛠️ Tecnologias Utilizadas

- **Next.js 15** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **React Hook Form** - Gerenciamento de formulários
- **React Hot Toast** - Notificações
- **Radix UI** - Componentes acessíveis
- **Supabase** - Banco de dados PostgreSQL e autenticação

## ⚙️ Configuração

### 1. Configurar Variáveis de Ambiente

**IMPORTANTE**: Você precisa obter um token válido da API Hadesweb antes de usar o sistema.

Edite o arquivo `.env.local` na pasta `my-app/`:

```env
# Hadesweb API Configuration
HADESWEB_API_TOKEN=SEU_TOKEN_REAL_AQUI
HADESWEB_API_BASE_URL=https://api.hadesweb.com.br/api/v1
```

⚠️ **Substitua `SEU_TOKEN_REAL_AQUI` pelo token fornecido pela Hadesweb**

### 2. Instalar Dependências

```bash
npm install
```

### 3. Executar o Projeto

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## 📁 Estrutura do Projeto

```
my-app/
├── app/
│   ├── api/beneficiary/search/route.ts  # API route para busca
│   ├── globals.css                      # Estilos globais
│   ├── layout.tsx                       # Layout principal
│   └── page.tsx                         # Página principal
├── components/
│   ├── ui/                              # Componentes base
│   ├── beneficiary-search-form.tsx      # Formulário de busca
│   ├── beneficiary-data-display.tsx     # Exibição de dados
│   └── error-boundary.tsx               # Tratamento de erros
├── lib/
│   ├── api.ts                           # Serviços da API
│   ├── validation.ts                    # Validações CPF/CNPJ
│   └── utils.ts                         # Utilitários
└── .env.local                           # Variáveis de ambiente
```

## 🔧 API Integration

O sistema integra com a API Hadesweb através do endpoint:
```
GET https://api.hadesweb.com.br/api/v1/plano_funerario/clientes?cpf_cnpj={documento}&fis_jur={tipo}
```

### Parâmetros:
- `cpf_cnpj`: CPF ou CNPJ formatado (com pontos e traços)
- `fis_jur`: Tipo de pessoa ('F' para física, 'J' para jurídica)

### Headers:
- `Authorization: Bearer {token}`
- `Content-Type: application/json`

## 🎨 Funcionalidades Implementadas

### Validação e Formatação
- ✅ Máscara automática para CPF/CNPJ
- ✅ Validação de dígitos verificadores
- ✅ Detecção automática do tipo de pessoa
- ✅ Feedback visual de erros

### Interface do Usuário
- ✅ Design responsivo e moderno
- ✅ Gradientes e animações suaves
- ✅ Estados de loading e erro
- ✅ Notificações toast
- ✅ Componentes acessíveis

### Tratamento de Dados
- ✅ Exibição estruturada dos dados do beneficiário
- ✅ Formatação de valores monetários
- ✅ Formatação de datas
- ✅ Status coloridos por categoria

## 🚀 Deploy

Para fazer deploy do projeto:

```bash
npm run build
npm start
```

## 🔧 Troubleshooting

### Erro 401 - Não Autorizado
```
HTTP error! status: 401
```
**Causa**: Token da API inválido ou não configurado
**Solução**:
1. Verifique se o token está correto no arquivo `.env.local`
2. Certifique-se de que não está usando o valor placeholder
3. Reinicie o servidor após alterar o `.env.local`

### Erro 404 - Não Encontrado
```
HTTP error! status: 404
```
**Causa**: Beneficiário não encontrado ou URL da API incorreta
**Solução**:
1. Verifique se o CPF/CNPJ está correto
2. Confirme se a URL base da API está correta

### Token Não Configurado
```
Token da API Hadesweb não configurado
```
**Causa**: Arquivo `.env.local` não existe ou token não foi definido
**Solução**:
1. Crie o arquivo `.env.local` na pasta `my-app/`
2. Adicione o token válido da Hadesweb
3. Reinicie o servidor

## 📝 Notas Importantes

1. **Token da API**: Certifique-se de configurar o token correto da API Hadesweb no arquivo `.env.local`
2. **CORS**: A API é chamada através de uma rota Next.js para evitar problemas de CORS
3. **Validação**: O sistema mantém a formatação original (com pontos e traços) conforme especificado no PRD
4. **Responsividade**: A interface é totalmente responsiva e funciona em dispositivos móveis
5. **Reinicialização**: Sempre reinicie o servidor após alterar variáveis de ambiente

## 🤝 Contribuição

Para contribuir com o projeto:

1. Faça um fork do repositório
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Faça push para a branch
5. Abra um Pull Request
