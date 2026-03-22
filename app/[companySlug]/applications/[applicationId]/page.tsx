'use client';

import { PageLoader } from '@/app/components/ui/Spinner';
import api from '@/app/lib/api';
import { daysAgo } from '@/app/lib/utils';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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
  noticePeriod:      string;
  expectedSalary:    string;
  linkedinUrl:       string;
  portfolioUrl:      string;
  resumeUrl:         string;
  coverLetter:       string;
  status:            ApplicationStatus;
  recruiterNotes:    string;
  createdAt:         string;
}

const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; color: string; bg: string }
> = {
  new:         { label: 'New',         color: '#6366F1', bg: 'rgba(99,102,241,0.12)' },
  reviewing:   { label: 'Reviewing',   color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  shortlisted: { label: 'Shortlisted', color: '#2ECC94', bg: 'rgba(46,204,148,0.12)' },
  interviewed: { label: 'Interviewed', color: '#C9A84C', bg: 'rgba(201,168,76,0.12)' },
  offered:     { label: 'Offered',     color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
  rejected:    { label: 'Rejected',    color: '#E8445A', bg: 'rgba(232,68,90,0.12)'  },
};

// ── Helper sub-components ─────────────────────────────────────────────────────

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <h3
        className="text-sm font-semibold mb-4 pb-3"
        style={{
          color: 'rgba(255,255,255,0.5)',
          fontFamily: 'var(--font-display)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>{label}</p>
      <p className="text-sm font-medium text-white">{value}</p>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ApplicationDetailPage() {
  const params        = useParams();
  const router        = useRouter();
  const slug          = params.companySlug as string;
  const applicationId = params.applicationId as string;

  const [app,     setApp]     = useState<Application | null>(null);
  const [notes,   setNotes]   = useState('');
  const [status,  setStatus]  = useState<ApplicationStatus>('new');
  const [saving,  setSaving]  = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }

    api.get(`/applications/${slug}/${applicationId}`)
      .then(r => {
        setApp(r.data.data);
        setNotes(r.data.data.recruiterNotes || '');
        setStatus(r.data.data.status);
      })
      .catch(() => router.push(`/${slug}/applications`));
  }, [slug, applicationId, router]);

  const save = async () => {
    setSaving(true);
    try {
      const r = await api.patch(
        `/applications/${slug}/${applicationId}/status`,
        { status, recruiterNotes: notes }
      );
      setApp(r.data.data);
      setSaveMsg('Saved ✓');
      setTimeout(() => setSaveMsg(''), 2500);
    } catch {
      setSaveMsg('Save failed');
      setTimeout(() => setSaveMsg(''), 2500);
    } finally {
      setSaving(false);
    }
  };

  if (!app) return <PageLoader />;

  const cfg = STATUS_CONFIG[status];

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
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
            style={{
              background: 'var(--gold)',
              color: '#0A0A0F',
              fontFamily: 'var(--font-display)',
            }}
          >
            CF
          </div>
        </Link>

        <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>

        <Link
          href={`/${slug}/applications`}
          className="text-sm"
          style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-display)' }}
        >
          Applications
        </Link>

        <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>

        <span
          className="text-sm truncate"
          style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--font-display)' }}
        >
          {app.fullName}
        </span>

        <div className="flex-1" />

        {saveMsg && (
          <span
            className="text-xs font-medium"
            style={{
              color: saveMsg.includes('✓') ? 'var(--jade)' : 'var(--crimson)',
            }}
          >
            {saveMsg}
          </span>
        )}

        <button
          onClick={save}
          disabled={saving}
          className="px-4 py-2 rounded-lg text-xs font-bold transition-all hover:opacity-90 disabled:opacity-50"
          style={{
            background: 'var(--gold)',
            color: '#0A0A0F',
            fontFamily: 'var(--font-display)',
          }}
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </header>

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">

        {/* Back link */}
        <Link
          href={`/${slug}/applications`}
          className="inline-flex items-center gap-2 text-sm mb-8 transition-colors hover:opacity-70"
          style={{ color: 'rgba(255,255,255,0.4)' }}
        >
          ← Back to all applications
        </Link>

        <div className="grid lg:grid-cols-[1fr_320px] gap-6">

          {/* ── Left: Candidate info ── */}
          <div className="space-y-5">

            {/* Header card */}
            <div
              className="rounded-2xl p-6"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
                  style={{ background: cfg.color, fontFamily: 'var(--font-display)' }}
                >
                  {app.fullName.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1">
                  <h1
                    className="text-2xl font-extrabold text-white mb-1"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {app.fullName}
                  </h1>
                  <p className="text-sm mb-3" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    {app.email}
                    {app.phone && ` · ${app.phone}`}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span
                      className="text-xs px-3 py-1 rounded-full font-semibold"
                      style={{ background: cfg.bg, color: cfg.color }}
                    >
                      {cfg.label}
                    </span>
                    <span
                      className="text-xs px-3 py-1 rounded-full"
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        color: 'rgba(255,255,255,0.45)',
                      }}
                    >
                      Applied for: {app.jobTitle}
                    </span>
                    <span
                      className="text-xs px-3 py-1 rounded-full"
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        color: 'rgba(255,255,255,0.45)',
                      }}
                    >
                      {daysAgo(app.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Professional background */}
            <InfoCard title="Professional Background">
              <div className="grid grid-cols-2 gap-4">
                <InfoItem label="Current Role"        value={app.currentRole} />
                <InfoItem label="Current Company"     value={app.currentCompany} />
                <InfoItem label="Years of Experience" value={app.yearsOfExperience} />
                <InfoItem label="Notice Period"       value={app.noticePeriod} />
                <InfoItem label="Expected Salary"     value={app.expectedSalary} />
                <InfoItem label="Location"            value={app.location} />
              </div>
            </InfoCard>

            {/* Links & Documents */}
            <InfoCard title="Links & Documents">
              <div className="flex flex-wrap gap-3">
                {app.resumeUrl ? (
                  <a
                    href={app.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
                    style={{
                      background: 'rgba(201,168,76,0.12)',
                      color: 'var(--gold)',
                      border: '1px solid rgba(201,168,76,0.2)',
                    }}
                  >
                    📄 View Resume ↗
                  </a>
                ) : (
                  <span className="text-sm" style={{ color: 'rgba(255,255,255,0.25)' }}>
                    No resume provided
                  </span>
                )}
                {app.linkedinUrl && (
                  <a
                    href={app.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
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
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
                    style={{
                      background: 'rgba(46,204,148,0.1)',
                      color: '#2ECC94',
                      border: '1px solid rgba(46,204,148,0.2)',
                    }}
                  >
                    Portfolio ↗
                  </a>
                )}
              </div>
            </InfoCard>

            {/* Cover letter */}
            {app.coverLetter && (
              <InfoCard title="Cover Letter">
                <p
                  className="text-sm leading-relaxed whitespace-pre-line"
                  style={{ color: 'rgba(255,255,255,0.6)' }}
                >
                  {app.coverLetter}
                </p>
              </InfoCard>
            )}
          </div>

          {/* ── Right: Recruiter panel ── */}
          <div className="space-y-5">

            {/* Status selector */}
            <div
              className="rounded-2xl p-5"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <h3
                className="text-sm font-semibold mb-4"
                style={{
                  color: 'rgba(255,255,255,0.5)',
                  fontFamily: 'var(--font-display)',
                }}
              >
                Application Status
              </h3>
              <div className="space-y-2">
                {(Object.keys(STATUS_CONFIG) as ApplicationStatus[]).map(s => {
                  const c          = STATUS_CONFIG[s];
                  const isSelected = status === s;
                  return (
                    <button
                      key={s}
                      onClick={() => setStatus(s)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left"
                      style={{
                        background: isSelected ? c.bg : 'transparent',
                        border: `1px solid ${isSelected ? `${c.color}40` : 'rgba(255,255,255,0.06)'}`,
                        color: isSelected ? c.color : 'rgba(255,255,255,0.4)',
                      }}
                    >
                      <span className="text-base">{isSelected ? '●' : '○'}</span>
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recruiter notes */}
            <div
              className="rounded-2xl p-5"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <h3
                className="text-sm font-semibold mb-3"
                style={{
                  color: 'rgba(255,255,255,0.5)',
                  fontFamily: 'var(--font-display)',
                }}
              >
                Recruiter Notes
              </h3>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={6}
                placeholder="Add private notes about this candidate…"
                className="input-base resize-none w-full"
                style={{ fontSize: 13 }}
              />
              <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.2)' }}>
                Only visible to you. Not shared with the candidate.
              </p>
            </div>

            {/* Save */}
            <button
              onClick={save}
              disabled={saving}
              className="w-full py-3.5 rounded-xl font-bold text-sm transition-all hover:opacity-90 disabled:opacity-50"
              style={{
                background: 'var(--gold)',
                color: '#0A0A0F',
                fontFamily: 'var(--font-display)',
              }}
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>

            {/* Quick actions */}
            <div
              className="rounded-2xl p-5"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <h3
                className="text-sm font-semibold mb-3"
                style={{
                  color: 'rgba(255,255,255,0.5)',
                  fontFamily: 'var(--font-display)',
                }}
              >
                Quick Actions
              </h3>
              <div className="space-y-2">
                <a
                  href={`mailto:${app.email}?subject=Re: Your application for ${app.jobTitle}`}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all hover:bg-white/8"
                  style={{
                    color: 'rgba(255,255,255,0.5)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  Email candidate ↗
                </a>

                <Link
                  href={`/${slug}/careers/${app.jobSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all hover:bg-white/8"
                  style={{
                    color: 'rgba(255,255,255,0.5)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                    <polyline points="15,3 21,3 21,9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                  View job posting ↗
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
