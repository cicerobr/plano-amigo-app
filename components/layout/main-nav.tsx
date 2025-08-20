'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export function MainNav() {
  const pathname = usePathname();
  const hideHamburger = pathname === '/login' || pathname === '/signup';
  const [open, setOpen] = React.useState(false);
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const [userEmail, setUserEmail] = React.useState<string | null>(null);
  const [isAuth, setIsAuth] = React.useState<boolean>(false);

  async function loadProfile() {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      setIsAuth(!!token);
      setUserEmail(sessionData?.session?.user?.email ?? null);
      if (!token) return;
      const res = await fetch('/api/profile', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return;
      const json = await res.json();
      if (json?.success && json?.data) {
        setAvatarUrl(json.data.avatar_url || null);
      }
    } catch {
      // ignore
    }
  }

  React.useEffect(() => {
    loadProfile();
    const onUpd = () => loadProfile();
    window.addEventListener('profile-updated', onUpd as any);
    return () => window.removeEventListener('profile-updated', onUpd as any);
  }, []);

  const navItems = [
    {
      href: '/',
      label: 'Consultar',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )
    },
    {
      href: '/beneficiarios',
      label: 'Beneficiários',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      href: '/perfil',
      label: 'Meu Perfil',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    }
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200/50 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg" style={{ backgroundColor: 'var(--primary)' }}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: 'var(--primary)' }}>
                Plano Amigo
              </h1>
              <span className="text-xs text-gray-600">Quem tem amigo tem tudo</span>
            </div>
          </div>

          {/* Desktop Navigation (oculto em /login e /signup) */}
          {!hideHamburger && (
            <div className="hidden md:flex items-center space-x-3">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-primary text-white shadow-lg'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-primary/10'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              {/* User avatar + actions */}
              {isAuth ? (
                <div className="flex items-center gap-2 pl-2 ml-2 border-l border-gray-200">
                  <Link href="/perfil" className="block">
                    <img
                      src={avatarUrl || '/vercel.svg'}
                      alt={userEmail || 'avatar'}
                      className="w-8 h-8 rounded-full object-cover ring-1 ring-gray-200"
                    />
                  </Link>
                  <button
                    className="text-sm text-gray-600 hover:text-gray-900"
                    onClick={async ()=>{ await supabase.auth.signOut(); window.location.href='/login'; }}
                  >
                    Sair
                  </button>
                </div>
              ) : (
                <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">Entrar</Link>
              )}
            </div>
          )}

          {/* Mobile Hamburger (oculto em /login e /signup) */}
          {!hideHamburger && (
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Abrir menu"
              onClick={() => setOpen((v) => !v)}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {open ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu Panel (oculto em /login e /signup) */}
      {open && !hideHamburger && (
        <>
          <div className="md:hidden relative z-50 border-t border-gray-200 bg-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 py-3 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium ${
                      isActive
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              {isAuth && (
                <button
                  className="w-full mt-2 flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50"
                  onClick={async ()=>{ await supabase.auth.signOut(); window.location.href='/login'; }}
                >
                  Sair
                </button>
              )}
            </div>
          </div>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40 bg-black/30 md:hidden" onClick={() => setOpen(false)} />
        </>
      )}
    </nav>
  );
}
