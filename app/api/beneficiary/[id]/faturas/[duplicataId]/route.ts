import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { hadeswebApi } from '@/lib/api';

// GET /api/beneficiary/[id]/faturas/[duplicataId]?planId=123
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; duplicataId: string }> }
) {
  try {
    const { id, duplicataId } = await params;
    const { searchParams } = new URL(request.url);
    const planId = searchParams.get('planId');

    if (!id || !duplicataId) return NextResponse.json({ success: false, error: 'IDs obrigatórios não informados' }, { status: 400 });

    const auth = request.headers.get('authorization') || request.headers.get('Authorization');
    if (!auth?.startsWith('Bearer ')) return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
    const supabaseUser = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: auth } },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Buscar hadesweb_id do cliente
    const { data, error } = await supabaseUser
      .from('clientes')
      .select('hadesweb_id')
      .eq('id', Number(id))
      .single();

    if (error) {
      console.error('Erro ao buscar hadesweb_id:', error);
      return NextResponse.json({ success: false, error: 'Erro ao buscar cliente no banco' }, { status: 500 });
    }
    if (!data?.hadesweb_id) return NextResponse.json({ success: false, error: 'Cliente não possui hadesweb_id salvo' }, { status: 404 });
    if (!planId) return NextResponse.json({ success: false, error: 'planId é obrigatório para detalhes da duplicata' }, { status: 400 });

    // Chama Hadesweb
    const result = await hadeswebApi.getDuplicataDetalhe(Number(data.hadesweb_id), Number(planId), Number(duplicataId));
    return NextResponse.json(result, { status: result.success ? 200 : 502 });
  } catch (error) {
    console.error('API route error (fatura detalhe):', error);
    return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 });
  }
}

