'use client';
import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checking, setChecking] = React.useState(true);

  const isPublic = pathname === '/login' || pathname === '/signup' || pathname?.startsWith('/api');

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      if (isPublic) {
        if (mounted) setChecking(false);
        return;
      }
      const { data } = await supabase.auth.getSession();
      const authed = !!data.session?.access_token;
      if (!authed) {
        router.replace('/login');
        return;
      }
      if (mounted) setChecking(false);
    })();
    return () => {
      mounted = false;
    };
  }, [pathname]);

  if (checking && !isPublic) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center text-gray-600">
          Verificando acesso...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default AuthGuard;

