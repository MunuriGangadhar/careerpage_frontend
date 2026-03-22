'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/app/lib/api';
import { PageLoader } from '@/app/components/ui/Spinner';
import { daysAgo } from '@/app/lib/utils';

type ApplicationStatus =
  | 'new'
  | 'reviewing'
  | 'shortlisted'
  | 'interviewed'
  | 'offered'
  | 'rejected';

interface Application {
  _id:               string;
  fullName:          string;
  email:             string;
  phone:             string;
  location:          string;
  jobTitle:          string;
  jobSlug:           string;
  currentRole:       string;
  currentCompany:    string;
  yearsOfExperience: string;
  expectedSalary:    string;
  status:            ApplicationStatus;
  resumeUrl:         string;
  linkedinUrl:       string;
  portfolioUrl:      string;
  createdAt:         string;
}

interface Summary {
  total:       number;
  new:         number;
  reviewing:   number;
  shortlisted: number;
  interviewed: number;
  offered:     number;
  rejected:    number;
}

const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; color: string; bg: string; icon: string }
> = {
  new:         { label: 'New',         color: '#6366F1', bg: 'rgba(99,102,241,0.1)',  icon: '◉' },
  reviewing:   { label: 'Reviewing',   color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  icon: '◎' },
  shortlisted: { label: 'Shortlisted', color: '#2ECC94', bg: 'rgba(46,204,148,0.1)',  icon: '◈' },
  interviewed: { label: 'Interviewed', color: '#C9A84C', bg: 'rgba(201,168,76,0.1)',  icon: '◆' },
  offered:     { label: 'Offered',     color: '#10B981', bg: 'rgba(16,185,129,0.1)',  icon: '★' },
  rejected:    { label: 'Rejected',    color: '#E8445A', bg: 'rgba(232,68,90,0.1)',   icon: '×' },
};

export default function ApplicationsPage() {
  const params = useParams();
  const router = useRouter();
  const slug   = params.companySlug as string;

  const [applications, setApplications] = useState<Application[]>([]);
  const [summary,      setSummary]      = useState<Summary | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | ''>('');
  const [jobFilter,    setJobFilter]    = useState('');
  const [jobs,         setJobs]         = useState<{ slug: string; title: string }[]>([]);
  const [pagination,   setPagination]   = useState({ total: 0, page: 1, totalPages: 1 });
  const [updatingId,   setUpdatingId]   = useState<string | null>(null);

  const fetchApplications = async (page = 1) => {
    setLoading(true);
    try {
      const qp = new URLSearchParams();
      if (search)       qp.set('search',  search);
      if (statusFilter) qp.set('status',  statusFilter);
      if (jobFilter)    qp.set('jobSlug', jobFilter);
      qp.set('page',  String(page));
      qp.set('limit', '15');

      const res = await api.get(`/applications/${slug}?${qp.toString()}`);
      setApplications(res.data.data);
      setSummary(res.data.summary);
      setPagination(res.data.pagination);
    } catch {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await api.get(`/jobs/${slug}/admin/all`);
      const unique = Array.from(
        new Map(
          res.data.data.map((j: { slug: string; title: string }) => [j.slug, j])
        ).values()
      ) as { slug: string; title: string }[];
      setJobs(unique);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    fetchJobs();
    fetchApplications(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  useEffect(() => {
    fetchApplications(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter, jobFilter]);

  const updateStatus = async (appId: string, newStatus: ApplicationStatus) => {
    setUpdatingId(appId);
    try {
      await api.patch(`/applications/${slug}/${appId}/status`, { status: newStatus });
      const old = applications.find(a => a._id === appId)?.status;
      setApplications(prev =>
        prev.map(a => a._id === appId ? { ...a, status: newStatus } : a)
      );
      if (summary && old && old !== newStatus) {
        setSummary(prev => prev ? {
          ...prev,
          [old]:       Math.max(0, (prev[old as keyof Summary] as number) - 1),
          [newStatus]: (prev[newStatus as keyof Summary] as number) + 1,
        } : null);
      }
    } catch { /* ignore */ }
    finally { setUpdatingId(null); }
  };

  if (loading && !applications.length) return <PageLoader />;

  return (
    <div className="min-h-screen bg-ink" style={{ fontFamily: 'var(--font-body)' }}>

      {/* Top bar */}
      <header
        className="sticky top-0 z-50 flex items-center gap-3 px-5 py-3"
        style={{
          background: 'rgba(10,10,15,0.96)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
            style={{ background: 'var(--gold)', color: '#0A0A0F', fontFamily: 'var(--font-display)' }}
          >
            CF
          </div>
        </Link>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
        <span
          className="text-sm"
          style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--font-display)' }}
        >
          Applications
        </span>
        <div className="flex-1" />
        <Link
          href={`/${slug}/edit`}
          className="text-xs px-3 py-1.5 rounded-lg glass transition-colors"
          style={{ color: 'rgba(255,255,255,0.45)' }}
        >
          ← Editor
        </Link>
        <Link
          href={`/${slug}/careers`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs px-3 py-1.5 rounded-lg glass transition-colors"
          style={{ color: 'rgba(255,255,255,0.45)' }}
        >
          Careers page ↗
        </Link>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">

        {/* Page title */}
        <div className="mb-8">
          <h1
            className="text-3xl font-extrabold text-white mb-1"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Applications
          </h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Review and manage candidates who applied to your open positions
          </p>
        </div>

        {/* Status summary cards */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
            {(Object.keys(STATUS_CONFIG) as ApplicationStatus[]).map(s => {
              const cfg    = STATUS_CONFIG[s];
              const count  = summary[s as keyof Summary] as number;
              const active = statusFilter === s;
              return (
                <button
                  key={s}
                  onClick={() => setStatusFilter(active ? '' : s)}
                  className="rounded-2xl p-4 text-left transition-all hover:scale-[1.03]"
                  style={{
                    background: active ? cfg.bg : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${active ? `${cfg.color}40` : 'rgba(255,255,255,0.08)'}`,
                  }}
                >
                  <p
                    className="text-2xl font-extrabold mb-1"
                    style={{ color: active ? cfg.color : '#fff', fontFamily: 'var(--font-display)' }}
                  >
                    {count}
                  </p>
                  <p
                    className="text-xs font-medium"
                    style={{ color: active ? cfg.color : 'rgba(255,255,255,0.4)' }}
                  >
                    {cfg.label}
                  </p>
                </button>
              );
            })}
          </div>
        )}

        {/* Filters row */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            {/* <svg
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'rgba(255,255,255,0.25)' }}
              width="14" height="14" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg> */}
            <input
              type="text"
              placeholder="Search name, email, job…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-base pl-9 w-full"
              style={{ fontSize: 13 }}
            />
          </div>

          <select
            value={jobFilter}
            onChange={e => setJobFilter(e.target.value)}
            className="input-base"
            style={{ fontSize: 13, minWidth: 180 }}
          >
            <option value="">All positions</option>
            {jobs.map(j => (
              <option key={j.slug} value={j.slug}>{j.title}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as ApplicationStatus | '')}
            className="input-base"
            style={{ fontSize: 13, minWidth: 140 }}
          >
            <option value="">All statuses</option>
            {(Object.keys(STATUS_CONFIG) as ApplicationStatus[]).map(s => (
              <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
            ))}
          </select>

          {(search || statusFilter || jobFilter) && (
            <button
              onClick={() => { setSearch(''); setStatusFilter(''); setJobFilter(''); }}
              className="px-4 py-2 rounded-xl text-xs transition-colors glass"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              Clear all ×
            </button>
          )}
        </div>

        {/* Result count */}
        <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.35)' }}>
          {loading
            ? 'Loading…'
            : `${pagination.total} application${pagination.total !== 1 ? 's' : ''} found`}
        </p>

        {/* Application list */}
        {applications.length === 0 && !loading ? (
          <div
            className="text-center py-24 rounded-2xl"
            style={{ border: '1px dashed rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.25)' }}
          >
            <p className="text-4xl mb-3">📭</p>
            <p className="text-sm font-medium mb-1" style={{ fontFamily: 'var(--font-display)' }}>
              No applications yet
            </p>
            <p className="text-xs">
              {search || statusFilter
                ? 'Try adjusting your filters'
                : 'Applications will appear here once candidates apply'}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {applications.map(app => {
              const cfg = STATUS_CONFIG[app.status];
              return (
                <div
                  key={app._id}
                  className="rounded-2xl p-5 transition-all hover:border-white/15"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <div className="flex items-start gap-4 flex-wrap">

                    {/* Avatar */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                      style={{ background: cfg.color, fontFamily: 'var(--font-display)' }}
                    >
                      {app.fullName.charAt(0).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap mb-1">
                        <h3
                          className="font-bold text-white text-sm"
                          style={{ fontFamily: 'var(--font-display)' }}
                        >
                          {app.fullName}
                        </h3>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: cfg.bg, color: cfg.color }}
                        >
                          {cfg.icon} {cfg.label}
                        </span>
                      </div>

                      <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        {app.email}
                        {app.phone    && ` · ${app.phone}`}
                        {app.location && ` · ${app.location}`}
                      </p>

                      <div className="flex flex-wrap gap-3 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        <span>
                          💼 Applied for:{' '}
                          <span className="text-white/60 font-medium">{app.jobTitle}</span>
                        </span>
                        {app.currentRole && (
                          <span>
                            🧑‍💻 {app.currentRole}
                            {app.currentCompany && ` @ ${app.currentCompany}`}
                          </span>
                        )}
                        {app.yearsOfExperience && <span>📅 {app.yearsOfExperience} exp</span>}
                        {app.expectedSalary    && <span>💰 {app.expectedSalary}</span>}
                        <span>🕐 {daysAgo(app.createdAt)}</span>
                      </div>

                      {/* Links — FIXED: proper <a> tags restored */}
                      <div className="flex flex-wrap gap-3 mt-2.5">
                        {app.resumeUrl && (
                          <a
                            href={app.resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs px-2.5 py-1 rounded-lg transition-colors hover:opacity-80"
                            style={{
                              background: 'rgba(201,168,76,0.12)',
                              color: 'var(--gold)',
                              border: '1px solid rgba(201,168,76,0.2)',
                            }}
                          >
                            📄 Resume ↗
                          </a>
                        )}
                        {app.linkedinUrl && (
                          <a
                            href={app.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs px-2.5 py-1 rounded-lg transition-colors hover:opacity-80"
                            style={{
                              background: 'rgba(99,102,241,0.1)',
                              color: '#6366F1',
                              border: '1px solid rgba(99,102,241,0.2)',
                            }}
                          >
                            LinkedIn ↗
                          </a>
                        )}
                        {app.portfolioUrl && (
                          <a
                            href={app.portfolioUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs px-2.5 py-1 rounded-lg transition-colors hover:opacity-80"
                            style={{
                              background: 'rgba(46,204,148,0.1)',
                              color: '#2ECC94',
                              border: '1px solid rgba(46,204,148,0.2)',
                            }}
                          >
                            Portfolio ↗
                          </a>
                        )}
                        <Link
                          href={`/${slug}/applications/${app._id}`}
                          className="text-xs px-2.5 py-1 rounded-lg transition-colors hover:opacity-80"
                          style={{
                            background: 'rgba(255,255,255,0.06)',
                            color: 'rgba(255,255,255,0.5)',
                            border: '1px solid rgba(255,255,255,0.1)',
                          }}
                        >
                          Full details →
                        </Link>
                      </div>
                    </div>

                    {/* Inline status changer */}
                    <div className="flex-shrink-0">
                      <select
                        value={app.status}
                        disabled={updatingId === app._id}
                        onChange={e => updateStatus(app._id, e.target.value as ApplicationStatus)}
                        className="input-base text-xs py-2"
                        style={{ minWidth: 130, fontSize: 12 }}
                      >
                        {(Object.keys(STATUS_CONFIG) as ApplicationStatus[]).map(s => (
                          <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={() => fetchApplications(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-4 py-2 rounded-xl text-sm glass transition-colors disabled:opacity-40"
              style={{ color: 'rgba(255,255,255,0.6)' }}
            >
              ← Previous
            </button>
            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => fetchApplications(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="px-4 py-2 rounded-xl text-sm glass transition-colors disabled:opacity-40"
              style={{ color: 'rgba(255,255,255,0.6)' }}
            >
              Next →
            </button>
          </div>
        )}

      </div>
    </div>
  );
}