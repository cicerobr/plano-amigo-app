'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  state: string | null;
  avatar_url: string | null;
  email?: string | null;
};

export default function PerfilPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData?.session?.access_token;
        if (!accessToken) {
          toast.error('Faça login para acessar seu perfil');
          window.location.href = '/login';
          return;
        }
        const res = await fetch('/api/profile', { headers: { Authorization: `Bearer ${accessToken}` } });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error || 'Falha ao carregar perfil');
        setProfile({ ...json.data, email: sessionData.session?.user?.email ?? null });
      } catch (e) {
        console.error(e);
        toast.error('Erro ao carregar perfil');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    try {
      setSaving(true);
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      if (!accessToken) throw new Error('Não autenticado');

      let avatar_url = profile.avatar_url || null;
      if (avatarFile) {
        try {
          // Upload avatar para bucket 'avatars' no caminho `${uid}/avatar.ext`
          const uid = sessionData.session!.user!.id;
          const ext = avatarFile.name.split('.').pop() || 'png';
          const path = `${uid}/avatar.${ext}`;
          const { error: upErr } = await supabase.storage.from('avatars').upload(path, avatarFile, { upsert: true });
          if (upErr) throw upErr;
          const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path);
          avatar_url = pub.publicUrl;
        } catch (e) {
          console.error('Erro no upload do avatar:', e);
          toast.error('Não foi possível enviar o avatar agora. Salvando demais dados...');
        }
      }

      const body: any = {
        first_name: profile.first_name ?? '',
        last_name: profile.last_name ?? '',
        state: profile.state ?? '',
        avatar_url,
        email: profile.email ?? undefined,
      };

      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Falha ao salvar perfil');
      setProfile({ ...json.data, email: body.email ?? profile.email });
      // Notifica outros componentes (ex.: MainNav) para recarregar avatar/nome
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('profile-updated'));
      }
      toast.success('Perfil atualizado com sucesso');
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : 'Erro ao salvar perfil');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="max-w-2xl mx-auto p-6">Carregando...</div>;
  if (!profile) return <div className="max-w-2xl mx-auto p-6">Perfil não encontrado</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold mb-6">Meu Perfil</h1>
        <form onSubmit={onSave} className="space-y-6">
          <div className="flex items-center gap-4">
            <img src={profile.avatar_url || '/vercel.svg'} alt="avatar" className="w-20 h-20 rounded-full object-cover ring-2 ring-gray-100" />
            <input type="file" accept="image/*" onChange={(e)=>setAvatarFile(e.target.files?.[0] ?? null)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Nome</label>
              <input className="w-full border rounded-md p-2" value={profile.first_name ?? ''} onChange={(e)=>setProfile(p=>p?{...p, first_name: e.target.value}:p)} />
            </div>
            <div>
              <label className="block text-sm mb-1">Sobrenome</label>
              <input className="w-full border rounded-md p-2" value={profile.last_name ?? ''} onChange={(e)=>setProfile(p=>p?{...p, last_name: e.target.value}:p)} />
            </div>
            <div>
              <label className="block text-sm mb-1">Estado (UF)</label>
              <input className="w-full border rounded-md p-2" value={profile.state ?? ''} onChange={(e)=>setProfile(p=>p?{...p, state: e.target.value}:p)} />
            </div>
            <div>
              <label className="block text-sm mb-1">E-mail</label>
              <input type="email" className="w-full border rounded-md p-2" value={profile.email ?? ''} onChange={(e)=>setProfile(p=>p?{...p, email: e.target.value}:p)} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
            <Button type="button" variant="secondary" onClick={()=>window.location.reload()}>Cancelar</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

