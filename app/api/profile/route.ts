import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

type PatchBody = {
  first_name?: string;
  last_name?: string;
  state?: string;
  avatar_url?: string;
  email?: string;
};

function getUserClient(auth: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: auth } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function GET(req: Request) {
  try {
    const auth = req.headers.get('authorization') || req.headers.get('Authorization');
    if (!auth?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 });
    }

    const supabaseUser = getUserClient(auth);

    const { data: userRes } = await supabaseUser.auth.getUser();
    const userId = userRes.user?.id;
    if (!userId) return NextResponse.json({ success: false, error: 'Usuário inválido' }, { status: 401 });

    const { data, error } = await supabaseUser
      .from('usuarios')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Erro ao obter perfil' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const auth = req.headers.get('authorization') || req.headers.get('Authorization');
    if (!auth?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 });
    }

    const body = (await req.json()) as PatchBody;
    const supabaseUser = getUserClient(auth);

    const { data: userRes } = await supabaseUser.auth.getUser();
    const userId = userRes.user?.id;
    if (!userId) return NextResponse.json({ success: false, error: 'Usuário inválido' }, { status: 401 });

    // Atualiza e-mail no Auth se solicitado
    if (body.email && body.email !== userRes.user?.email) {
      const { error: emailErr } = await supabaseUser.auth.updateUser({ email: body.email });
      if (emailErr) {
        return NextResponse.json({ success: false, error: emailErr.message || 'Erro ao atualizar e-mail' }, { status: 400 });
      }
    }

    // Atualiza perfil na tabela usuarios (upsert garante que exista)
    const payload: any = { id: userId };
    if (typeof body.first_name !== 'undefined') payload.first_name = body.first_name;
    if (typeof body.last_name !== 'undefined') payload.last_name = body.last_name;
    if (typeof body.state !== 'undefined') payload.state = body.state;
    if (typeof body.avatar_url !== 'undefined') payload.avatar_url = body.avatar_url;

    const { data, error } = await supabaseUser
      .from('usuarios')
      .upsert(payload, { onConflict: 'id' })
      .select('*')
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Erro ao atualizar perfil' }, { status: 500 });
  }
}

