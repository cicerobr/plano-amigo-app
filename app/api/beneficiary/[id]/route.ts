import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js'; // user client for RLS


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

    console.log('Fetching beneficiary details for ID:', id);

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

    // Get beneficiary details from the database (respect RLS)
    const { data, error } = await supabaseUser
      .from('clientes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching beneficiary details:', error);

      if (error.code === 'PGRST116') { // No rows found
        return NextResponse.json(
          { success: false, error: 'Beneficiário não encontrado' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { success: false, error: 'Erro ao buscar detalhes do beneficiário' },
        { status: 500 }
      );
    }

    console.log('Beneficiary details found:', data);

    // Ensure data is properly formatted
    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Beneficiário não encontrado' },
        { status: 404 }
      );
    }

    // Parse endereco if it's a JSON string
    if (data.endereco && typeof data.endereco === 'string') {
      try {
        data.endereco = JSON.parse(data.endereco);
      } catch (error) {
        console.error('Error parsing endereco JSON:', error);
        data.endereco = null;
      }
    }

    return NextResponse.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Tenta remover registros dependentes primeiro, se necessário (opcional)
    // Ex.: await supabaseAdmin.from('vendas_plano').delete().eq('ce_cliente', id);

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

    const { error } = await supabaseUser
      .from('clientes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting beneficiary:', error);
      const msg = error.code === '23503'
        ? 'Não é possível excluir: existem registros relacionados.'
        : 'Erro ao excluir beneficiário.';
      return NextResponse.json({ success: false, error: msg }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Beneficiário excluído com sucesso.' });
  } catch (error) {
    console.error('API route error (DELETE):', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
