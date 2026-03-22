'use client';
import useSWR from 'swr';
import { fetcher } from '@/app/lib/fetcher';
import type { Company } from '@/app/types';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export function useCompanyEdit(slug: string) {
  const { data, error, isLoading, mutate } = useSWR<{ success: boolean; data: Company }>(
    slug ? `${API}/companies/${slug}/edit` : null, fetcher
  );
  return { company: data?.data ?? null, error, isLoading, mutate };
}

export function useCompanyPublic(slug: string) {
  const { data, error, isLoading } = useSWR<{ success: boolean; data: Company }>(
    slug ? `${API}/companies/${slug}` : null, fetcher
  );
  return { company: data?.data ?? null, error, isLoading };
}