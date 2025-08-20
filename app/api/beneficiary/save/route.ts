import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const beneficiaryData = await request.json();

    console.log('Saving beneficiary:', beneficiaryData);

    // Validate required fields
    if (!beneficiaryData.id || !beneficiaryData.cpf_cnpj) {
      return NextResponse.json(
        { success: false, error: 'ID e CPF/CNPJ são obrigatórios' },
        { status: 400 }
      );
    }

    // Require user token & create user-scoped client (RLS)
    const hdrs = await headers();
    const authHeader = hdrs.get('authorization') || hdrs.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 });
    }
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabaseUser = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: userRes } = await supabaseUser.auth.getUser();
    const userId = userRes.user?.id ?? null;

    // Helper function to validate and format dates
    const formatDate = (dateString: string | null | undefined): string | null => {
      if (!dateString || dateString === '0000-00-00' || dateString === '') {
        return null;
      }
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
          return null;
        }
        return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
      } catch {
        return null;
      }
    };

    // Prepare data for insertion (coerções e defaults)
    const toInt = (v: any) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };

    const ceLicenca = toInt(beneficiaryData.ce_licenca);
    const idNum = toInt(beneficiaryData.id);
    const numGaveta = toInt(beneficiaryData.num_gaveta_falecimento);
    const fisJur = beneficiaryData.fis_jur ?? null;

    if (!idNum || !ceLicenca || !fisJur) {
      return NextResponse.json({ success: false, error: 'Campos obrigatórios ausentes: id, ce_licenca, fis_jur.' }, { status: 400 });
    }

    const clientData = {
      id: idNum,
      hadesweb_id: idNum,
      ce_licenca: ceLicenca,
      fis_jur: String(fisJur),
      nome: beneficiaryData.nome ?? null,
      nome_social: beneficiaryData.nome_social || null,
      dt_nascimento: formatDate(beneficiaryData.dt_nascimento),
      dt_falecimento: formatDate(beneficiaryData.dt_falecimento),
      hr_falecimento: beneficiaryData.hr_falecimento || null,
      cemiterio_falecimento: beneficiaryData.cemiterio_falecimento || null,
      jazigo_falecimento: beneficiaryData.jazigo_falecimento || null,
      num_gaveta_falecimento: numGaveta,
      tipo_obito: beneficiaryData.tipo_obito || null,
      dt_exumacao: formatDate(beneficiaryData.dt_exumacao),
      sexo: beneficiaryData.sexo || null,
      estado_civil: beneficiaryData.estado_civil || null,
      naturalidade: beneficiaryData.naturalidade || null,
      natural_uf: beneficiaryData.natural_uf || null,
      nacionalidade: beneficiaryData.nacionalidade || null,
      cpf_cnpj: beneficiaryData.cpf_cnpj || null,
      rg: beneficiaryData.rg || null,
      rg_org_emissor: beneficiaryData.rg_org_emissor || null,
      rg_uf: beneficiaryData.rg_uf || null,
      rg_dt_emissao: formatDate(beneficiaryData.rg_dt_emissao),
      pai: beneficiaryData.pai || null,
      mae: beneficiaryData.mae || null,
      telefone_res: beneficiaryData.telefone_res || null,
      telefone_com: beneficiaryData.telefone_com || null,
      telefone_cel1: beneficiaryData.telefone_cel1 || null,
      telefone_cel2: beneficiaryData.telefone_cel2 || null,
      email1: beneficiaryData.email1 || null,
      email2: beneficiaryData.email2 || null,
      religiao: beneficiaryData.religiao || null,
      profissao: beneficiaryData.profissao || null,
      observacao: beneficiaryData.observacao || null,
      sn_possui_jazigo: beneficiaryData.sn_possui_jazigo || null,
      uso: beneficiaryData.uso || null,
      cemiterio_jazigo: beneficiaryData.cemiterio_jazigo || null,
      posicao_spc: beneficiaryData.posicao_spc || null,
      sn_consumidor_geral: beneficiaryData.sn_consumidor_geral || null,
      codigo: beneficiaryData.codigo || null,
      modulo: beneficiaryData.modulo || null,
      endereco: beneficiaryData.endereco || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Insert into Supabase (RLS enforced)
    const { data, error } = await supabaseUser
      .from('clientes')
      .insert([{ ...clientData, created_by_user: userId }])
      .select('*')
      .single();

    if (error) {
      console.error('Error saving beneficiary:', error);
      // Map most common DB errors
      const code = (error as any).code;
      if (code === '23505') {
        // unique_violation (provavelmente PK id já existe)
        return NextResponse.json({ success: false, error: 'Beneficiário já está salvo no sistema' }, { status: 409 });
      }
      if (code === '23502') {
        return NextResponse.json({ success: false, error: 'Dados obrigatórios ausentes (ce_licenca, fis_jur ou id).' }, { status: 400 });
      }
      return NextResponse.json(
        { success: false, error: (error as any).message || 'Erro ao salvar beneficiário no banco de dados' },
        { status: 500 }
      );
    }

    console.log('Beneficiary saved successfully:', data);

    return NextResponse.json({
      success: true,
      message: 'Beneficiário salvo com sucesso!',
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
