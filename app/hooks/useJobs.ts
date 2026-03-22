'use client';
import useSWR from 'swr';
import { fetcher } from '@/app/lib/fetcher';
import type { Job, JobsResponse } from '@/app/types';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface JobFilters {
  search?: string; location?: string; workPolicy?: string;
  employmentType?: string; experienceLevel?: string; jobType?: string;
  department?: string; page?: number; limit?: number;
}

export function useJobs(companySlug: string, filters: JobFilters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, String(v)); });
  const { data, error, isLoading } = useSWR<JobsResponse>(
    companySlug ? `${API}/jobs/${companySlug}?${params.toString()}` : null,
    fetcher, { keepPreviousData: true }
  );
  return { jobs: data?.data ?? [], pagination: data?.pagination, filterOptions: data?.filterOptions, isLoading, error };
}

export function useRecruiterJobs(companySlug: string) {
  const { data, error, isLoading, mutate } = useSWR<{ success: boolean; data: Job[] }>(
    companySlug ? `${API}/jobs/${companySlug}/admin/all` : null, fetcher
  );
  return { jobs: data?.data ?? [], error, isLoading, mutate };
}