import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { hadeswebApi } from '@/lib/api';

// GET /api/beneficiary/[id]/faturas?planId=123
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const planId = searchParams.get('planId');

    if (!id) return NextResponse.json({ success: false, error: 'ID do beneficiário é obrigatório' }, { status: 400 });
    if (!planId) return NextResponse.json({ success: false, error: 'planId é obrigatório para consultar faturas deste beneficiário' }, { status: 400 });

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

    // Chama Hadesweb
    const result = await hadeswebApi.getDuplicatasReceber(Number(data.hadesweb_id), planId ? Number(planId) : undefined);
    return NextResponse.json(result, { status: result.success ? 200 : 502 });
  } catch (error) {
    console.error('API route error (faturas):', error);
    return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 });
  }
}

