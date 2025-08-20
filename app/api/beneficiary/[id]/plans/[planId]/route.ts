import { NextRequest, NextResponse } from 'next/server';
import { hadeswebApi } from '@/lib/api';
import { createClient } from '@supabase/supabase-js';

// GET /api/beneficiary/[id]/plans/[planId]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; planId: string }> }
) {
  try {
    const { id, planId } = await params;

    if (!id || !planId) {
      return NextResponse.json(
        { success: false, error: 'IDs obrigatórios não informados' },
        { status: 400 }
      );
    }

    // Exige token e usa client do usuário (RLS)
    const auth = request.headers.get('authorization') || request.headers.get('Authorization');
    if (!auth?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 });
    }
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabaseUser = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: auth } },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Buscar o hadesweb_id do cliente salvo
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

    // Chamar a API Hadesweb para listar e filtrar pelo id da venda
    const result = await hadeswebApi.getClientPlansByClienteId(Number(data.hadesweb_id));

    if (!result.success) {
      return NextResponse.json(result, { status: 502 });
    }

    const found = (result.data || []).find((p: any) => String(p.id) === String(planId));

    if (!found) {
      return NextResponse.json(
        { success: false, error: 'Plano não encontrado para este cliente' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: found }, { status: 200 });
  } catch (error) {
    console.error('API route error (plan details):', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

