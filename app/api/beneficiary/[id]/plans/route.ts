import { NextRequest, NextResponse } from 'next/server';
import { hadeswebApi } from '@/lib/api';
import { createClient } from '@supabase/supabase-js';

// GET /api/beneficiary/[id]/plans
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID do beneficiário é obrigatório' },
        { status: 400 }
      );
    }

    // Exige token do usuário para respeitar RLS ao ler 'clientes'
    const auth = request.headers.get('authorization') || request.headers.get('Authorization');
    if (!auth?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 });
    }

    // Client do usuário com header Authorization
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabaseUser = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: auth } },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Buscar o hadesweb_id do cliente salvo (RLS)
    const { data, error } = await supabaseUser
      .from('clientes')
      .select('hadesweb_id')
      .eq('id', Number(id))
      .single();

    if (error) {
      console.error('Erro ao buscar hadesweb_id:', error);
      return NextResponse.json(
        { success: false, error: 'Erro ao buscar cliente no banco' },
        { status: 500 }
      );
    }

    if (!data?.hadesweb_id) {
      return NextResponse.json(
        { success: false, error: 'Cliente não possui hadesweb_id salvo' },
        { status: 404 }
      );
    }

    // Chamar a API Hadesweb: GET /plano_funerario/clientes/{idCliente}/vendas
    const result = await hadeswebApi.getClientPlansByClienteId(Number(data.hadesweb_id));

    return NextResponse.json(result, { status: result.success ? 200 : 502 });
  } catch (error) {
    console.error('API route error (plans):', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

