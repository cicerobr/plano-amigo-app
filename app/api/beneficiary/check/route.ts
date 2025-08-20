import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { hadesweb_id } = await request.json();

    if (!hadesweb_id) {
      return NextResponse.json(
        { success: false, error: 'ID do Hadesweb é obrigatório' },
        { status: 400 }
      );
    }

    // Check if beneficiary already exists
    const { data: existingClient, error } = await supabaseAdmin
      .from('clientes')
      .select('id, nome, cpf_cnpj, created_at')
      .eq('hadesweb_id', hadesweb_id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error checking existing client:', error);
      return NextResponse.json(
        { success: false, error: 'Erro ao verificar cliente existente' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      exists: !!existingClient,
      client: existingClient || null
    });

  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
