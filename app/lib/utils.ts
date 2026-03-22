import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export function daysAgo(dateStr: string): string {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Today';
  if (diff === 1) return '1 day ago';
  return `${diff} days ago`;
}

export function borderRadiusCss(val: string): string {
  return ({ none: '0px', sm: '6px', md: '10px', lg: '14px', full: '9999px' })[val] ?? '10px';
}

export function workPolicyColor(policy: string): string {
  return ({ Remote: '#2ECC94', Hybrid: '#6366F1', 'On-site': '#F59E0B' })[policy] ?? '#6b7280';
}

export function levelColor(level: string): string {
  return ({ Senior: '#C9A84C', 'Mid-level': '#6366F1', Junior: '#2ECC94' })[level] ?? '#6b7280';
}