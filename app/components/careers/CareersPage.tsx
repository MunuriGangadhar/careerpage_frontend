'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useJobs, type JobFilters } from '@/app/hooks/useJobs';
import { daysAgo, workPolicyColor, levelColor, borderRadiusCss } from '@/app/lib/utils';
import type { Company } from '@/app/types';

interface Props {
  company:     Company;
  companySlug: string;
}

const WORK_POLICIES    = ['Remote', 'Hybrid', 'On-site'];
const EMPLOYMENT_TYPES = ['Full time', 'Part time', 'Contract'];
const EXP_LEVELS       = ['Junior', 'Mid-level', 'Senior'];

function FilterSelect({
  label, value, onChange, options,
}: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={`Filter by ${label}`}
        className="input-light appearance-none pr-8 cursor-pointer w-full"
        style={{ fontSize: 13 }}
      >
        <option value="">{label}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: 'rgba(0,0,0,0.4)' }}
        width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="m6 9 6 6 6-6"/>
      </svg>
    </div>
  );
}

export default function CareersPage({ company, companySlug }: Props) {
  const [filters, setFilters] = useState<JobFilters>({ page: 1, limit: 20 });
  const [search, setSearch]   = useState('');

  const { jobs, pagination, filterOptions, isLoading } = useJobs(companySlug, {
    ...filters,
    search: search || undefined,
  });

  const t         = company.brandTheme;
  const primary   = t?.primaryColor    || '#0F172A';
  const secondary = t?.secondaryColor  || '#6366F1';
  const bg        = t?.backgroundColor || '#FAFAF8';
  const radius    = borderRadiusCss(t?.borderRadius || 'md');
  const ff        = t?.fontFamily      || 'DM Sans';

  const setFilter = useCallback((key: keyof JobFilters, val: string) => {
    setFilters((prev) => ({ ...prev, [key]: val || undefined, page: 1 }));
  }, []);

  const clearAll = () => { setFilters({ page: 1, limit: 20 }); setSearch(''); };

  const sections = [...(company.contentSections || [])]
    .filter((s) => s.visible)
    .sort((a, b) => a.order - b.order);

  const activeCount = [
    filters.location, filters.workPolicy, filters.employmentType,
    filters.experienceLevel, filters.jobType, search,
  ].filter(Boolean).length;

  return (
    <div style={{ background: bg, color: primary, fontFamily: ff, minHeight: '100vh' }}>

      {/* ── Banner ── */}
      <div className="relative overflow-hidden" style={{ height: 280, background: primary }}>
        {company.bannerUrl && (
          <Image src={company.bannerUrl} alt="" fill className="object-cover" style={{ opacity: 0.45 }} />
        )}
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.55) 100%)' }} />
        <div className="absolute bottom-0 left-0 right-0 px-6 md:px-10 pb-7">
          <div className="max-w-6xl mx-auto flex items-end gap-4">
            {company.logoUrl ? (
              <div className="relative flex-shrink-0 rounded-2xl overflow-hidden bg-white"
                style={{ width: 60, height: 60, border: '3px solid rgba(255,255,255,0.18)', boxShadow: '0 16px 64px rgba(0,0,0,0.5)' }}>
                <Image src={company.logoUrl} alt={company.name} fill className="object-contain" />
              </div>
            ) : (
              <div className="flex-shrink-0 rounded-2xl flex items-center justify-center text-xl font-bold text-white"
                style={{ width: 60, height: 60, background: secondary, fontFamily: 'Syne, sans-serif', border: '3px solid rgba(255,255,255,0.18)' }}>
                {company.name[0]}
              </div>
            )}
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white"
                style={{ fontFamily: 'Syne, sans-serif', textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                {company.name}
              </h1>
              {company.tagline && (
                <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.65)' }}>{company.tagline}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Meta bar ── */}
      <div className="px-6 md:px-10"
        style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
        <div className="max-w-6xl mx-auto py-3 flex flex-wrap gap-x-5 gap-y-1 text-xs"
          style={{ color: 'rgba(0,0,0,0.4)' }}>
          {company.industry     && <span>🏢 {company.industry}</span>}
          {company.headquarters && <span>📍 {company.headquarters}</span>}
          {company.size         && <span>👥 {company.size}</span>}
          {company.founded      && <span>📅 Est. {company.founded}</span>}
          {company.website      && (
            <a href={company.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
              🌐 Website ↗
            </a>
          )}
          {Object.entries(company.socialLinks || {}).filter(([, v]) => v).map(([k, v]) => (
            <a key={k} href={v as string} target="_blank" rel="noopener noreferrer" className="capitalize hover:underline">
              {k} ↗
            </a>
          ))}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-12">
        <div className="grid lg:grid-cols-[300px_1fr] gap-12">

          {/* Left: Company story */}
          <aside className="space-y-8">
            {sections.map((s) => (
              <div key={s.id}>
                <h2 className="text-sm font-bold mb-2.5"
                  style={{ fontFamily: 'Syne, sans-serif', color: primary }}>
                  {s.title}
                </h2>
                <p className="text-sm leading-relaxed whitespace-pre-line"
                  style={{ color: 'rgba(0,0,0,0.55)' }}>
                  {s.content}
                </p>
              </div>
            ))}

            {company.cultureVideoUrl && (
              <div>
                <h2 className="text-sm font-bold mb-2.5"
                  style={{ fontFamily: 'Syne, sans-serif', color: primary }}>
                  Culture Video
                </h2>
                <div className="aspect-video overflow-hidden"
                  style={{ borderRadius: radius, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
                  <iframe
                    src={company.cultureVideoUrl}
                    className="w-full h-full"
                    allowFullScreen
                    title="Culture Video"
                  />
                </div>
              </div>
            )}
          </aside>

          {/* Right: Jobs */}
          <div>
            {/* Header row */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-extrabold"
                style={{ fontFamily: 'Syne, sans-serif', color: primary }}>
                Open Positions
                {pagination && (
                  <span className="ml-2 text-base font-normal"
                    style={{ color: 'rgba(0,0,0,0.28)' }}>
                    ({pagination.total})
                  </span>
                )}
              </h2>
              {activeCount > 0 && (
                <button onClick={clearAll}
                  className="text-xs font-medium px-3 py-1.5 rounded-full transition-colors"
                  style={{ background: 'rgba(0,0,0,0.06)', color: 'rgba(0,0,0,0.45)' }}>
                  Clear {activeCount} filter{activeCount > 1 ? 's' : ''} ×
                </button>
              )}
            </div>

            {/* Search */}
            <div className="relative mb-3">
              {/* <svg className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'rgba(0,0,0,0.3)' }}
                width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg> */}
              <input
                type="text"
                placeholder="Search by job title…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setFilters((p) => ({ ...p, page: 1 })); }}
                className="input-light pl-11"
                aria-label="Search jobs"
              />
            </div>

            {/* Filter dropdowns */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-4">
              <FilterSelect label="Location"    value={filters.location || ''}        onChange={(v) => setFilter('location', v)}        options={filterOptions?.locations || []} />
              <FilterSelect label="Work Policy" value={filters.workPolicy || ''}      onChange={(v) => setFilter('workPolicy', v)}      options={WORK_POLICIES} />
              <FilterSelect label="Type"        value={filters.employmentType || ''}  onChange={(v) => setFilter('employmentType', v)}  options={EMPLOYMENT_TYPES} />
              <FilterSelect label="Level"       value={filters.experienceLevel || ''} onChange={(v) => setFilter('experienceLevel', v)} options={EXP_LEVELS} />
            </div>

            {/* Active filter pills */}
            {activeCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {([
                  ['location',       filters.location],
                  ['workPolicy',     filters.workPolicy],
                  ['employmentType', filters.employmentType],
                  ['experienceLevel',filters.experienceLevel],
                ] as [keyof JobFilters, string | undefined][]).filter(([, v]) => v).map(([k, v]) => (
                  <span key={k}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium text-white"
                    style={{ background: secondary }}>
                    {v}
                    <button onClick={() => setFilter(k, '')} className="opacity-70 hover:opacity-100 ml-0.5">×</button>
                  </span>
                ))}
                {search && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium text-white"
                    style={{ background: secondary }}>
                    &ldquo;{search}&rdquo;
                    <button onClick={() => setSearch('')} className="opacity-70 hover:opacity-100 ml-0.5">×</button>
                  </span>
                )}
              </div>
            )}

            {/* Job list */}
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-28 animate-pulse"
                    style={{ background: 'rgba(0,0,0,0.05)', borderRadius: radius }} />
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-20" style={{ color: 'rgba(0,0,0,0.3)' }}>
                <div className="text-5xl mb-4">🔍</div>
                <p className="font-bold text-base mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>
                  No jobs match your search
                </p>
                <p className="text-sm">Try adjusting your filters or clear them all</p>
              </div>
            ) : (
              <div className="space-y-2.5" role="list" aria-label="Job listings">
                {jobs.map((job) => (
                  <Link key={job._id} href={`/${companySlug}/careers/${job.slug}`}
                    role="listitem" aria-label={`${job.title} — ${job.location}`}
                    className="group block p-5 transition-all hover:-translate-y-0.5"
                    style={{
                      background: '#fff',
                      borderRadius: radius,
                      border: '1.5px solid rgba(0,0,0,0.07)',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                    }}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base mb-1.5 group-hover:opacity-60 transition-opacity truncate"
                          style={{ fontFamily: 'Syne, sans-serif', color: primary }}>
                          {job.title}
                        </h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs"
                          style={{ color: 'rgba(0,0,0,0.42)' }}>
                          <span>📍 {job.location}</span>
                          <span>🕐 {job.employmentType}</span>
                          {job.department && <span>· {job.department}</span>}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold text-white"
                          style={{ background: workPolicyColor(job.workPolicy) }}>
                          {job.workPolicy}
                        </span>
                        <span className="text-xs" style={{ color: 'rgba(0,0,0,0.3)' }}>
                          {daysAgo(job.postedAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3"
                      style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="px-2 py-0.5 rounded-lg text-xs font-semibold"
                          style={{ background: `${levelColor(job.experienceLevel)}18`, color: levelColor(job.experienceLevel) }}>
                          {job.experienceLevel}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg text-xs"
                          style={{ background: 'rgba(0,0,0,0.05)', color: 'rgba(0,0,0,0.45)' }}>
                          {job.jobType}
                        </span>
                      </div>
                      {job.salaryRange && (
                        <span className="text-xs font-medium" style={{ color: 'rgba(0,0,0,0.45)' }}>
                          💰 {job.salaryRange}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8">
                <button
                  onClick={() => setFilters((p) => ({ ...p, page: Math.max(1, (p.page || 1) - 1) }))}
                  disabled={(filters.page || 1) <= 1}
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-40"
                  style={{ border: '1.5px solid rgba(0,0,0,0.12)', color: primary }}>
                  ← Previous
                </button>
                <span className="text-sm" style={{ color: 'rgba(0,0,0,0.38)' }}>
                  Page {filters.page || 1} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setFilters((p) => ({ ...p, page: Math.min(pagination.totalPages, (p.page || 1) + 1) }))}
                  disabled={(filters.page || 1) >= pagination.totalPages}
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-40"
                  style={{ border: '1.5px solid rgba(0,0,0,0.12)', color: primary }}>
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-6 text-xs"
        style={{ borderTop: '1px solid rgba(0,0,0,0.06)', color: 'rgba(0,0,0,0.22)' }}>
        Powered by <span className="font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>CareerForge</span>
      </div>
    </div>
  );
}