#!/bin/bash

# Script de deploy para Vercel
# Este script automatiza o processo de deploy

echo "🚀 Iniciando deploy na Vercel..."

# Verificar se a CLI da Vercel está instalada
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI não encontrada. Instalando..."
    npm install -g vercel
fi

# Fazer build local para verificar se está tudo OK
echo "🔨 Fazendo build local..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build falhou. Corrija os erros antes de fazer deploy."
    exit 1
fi

echo "✅ Build local bem-sucedido!"

# Deploy na Vercel
echo "📦 Fazendo deploy na Vercel..."
vercel --prod

echo "🎉 Deploy concluído!"
echo "📋 Lembre-se de configurar as variáveis de ambiente na Vercel:"
echo "   - SUPABASE_URL"
echo "   - SUPABASE_ANON_KEY"
echo "   - SUPABASE_SERVICE_ROLE_KEY"
echo "   - HADES_API_URLBASE"
echo "   - HADES_API_TOKEN"
echo "   - NEXT_PUBLIC_SUPABASE_URL"
echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"