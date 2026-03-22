'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/app/lib/api';

export interface AuthUser    { id: string; name: string; email: string; }
export interface AuthCompany { id: string; slug: string; name: string; }

export function useAuth(redirect = true) {
  const [user,    setUser]    = useState<AuthUser | null>(null);
  const [company, setCompany] = useState<AuthCompany | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      if (redirect) router.push('/login');
      setLoading(false);
      return;
    }
    api.get('/auth/me')
      .then(r => { setUser(r.data.user); setCompany(r.data.company); })
      .catch(() => { localStorage.clear(); if (redirect) router.push('/login'); })
      .finally(() => setLoading(false));
  }, [redirect, router]);

  const logout = async () => {
    await api.post('/auth/logout').catch(() => {});
    localStorage.clear();
    router.push('/login');
  };

  return { user, company, loading, logout };
}