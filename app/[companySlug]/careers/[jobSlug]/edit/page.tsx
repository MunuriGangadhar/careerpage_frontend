'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/app/lib/api';
import { PageLoader } from '@/app/components/ui/Spinner';

const schema = z.object({
  title:            z.string().min(2, 'Job title is required'),
  department:       z.string().optional(),
  location:         z.string().min(2, 'Location is required'),
  workPolicy:       z.enum(['Remote', 'Hybrid', 'On-site']),
  employmentType:   z.enum(['Full time', 'Part time', 'Contract']),
  experienceLevel:  z.enum(['Junior', 'Mid-level', 'Senior']),
  jobType:          z.enum(['Permanent', 'Temporary', 'Internship']),
  salaryRange:      z.string().optional(),
  description:      z.string().min(10, 'Description is required'),
  responsibilities: z.string().optional(),
  requirements:     z.string().optional(),
  benefits:         z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const DEPARTMENTS = [
  'Engineering', 'Product', 'Design', 'Marketing', 'Sales',
  'Customer Success', 'Operations', 'Analytics', 'R&D',
  'IT Support', 'Finance', 'HR', 'Legal', 'Other',
];

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.45)', marginBottom: 6 }}>
      {children}
      {required && <span style={{ color: '#E8445A', marginLeft: 3 }}>*</span>}
    </label>
  );
}

function ErrMsg({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p style={{ fontSize: 12, color: '#E8445A', marginTop: 4 }}>{msg}</p>;
}

function FormCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 18,
      overflow: 'hidden',
      marginBottom: 20,
    }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.025)' }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-display)', margin: 0 }}>
          {title}
        </h3>
      </div>
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {children}
      </div>
    </div>
  );
}

export default function EditJobPage() {
  const params  = useParams();
  const router  = useRouter();
  const slug    = params.companySlug as string;
  const jobSlug = params.jobSlug as string;

  const [loading,     setLoading]     = useState(true);
  const [isActive,    setIsActive]    = useState(true);
  const [saveMsg,     setSaveMsg]     = useState('');
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }

    // Use the public job endpoint to load job data
    api.get(`/jobs/${slug}/${jobSlug}`)
      .then(r => {
        const j = r.data.data;
        setIsActive(j.isActive);
        reset({
          title:            j.title,
          department:       j.department    || '',
          location:         j.location,
          workPolicy:       j.workPolicy,
          employmentType:   j.employmentType,
          experienceLevel:  j.experienceLevel,
          jobType:          j.jobType,
          salaryRange:      j.salaryRange   || '',
          description:      j.description   || '',
          responsibilities: Array.isArray(j.responsibilities) ? j.responsibilities.join('\n') : '',
          requirements:     Array.isArray(j.requirements)     ? j.requirements.join('\n')     : '',
          benefits:         Array.isArray(j.benefits)         ? j.benefits.join('\n')         : '',
        });
      })
      .catch(() => router.push(`/${slug}/edit`))
      .finally(() => setLoading(false));
  }, [slug, jobSlug, router, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      setServerError('');
      const payload = {
        ...data,
        isActive,
        responsibilities: data.responsibilities
          ? data.responsibilities.split('\n').map(s => s.trim()).filter(Boolean)
          : [],
        requirements: data.requirements
          ? data.requirements.split('\n').map(s => s.trim()).filter(Boolean)
          : [],
        benefits: data.benefits
          ? data.benefits.split('\n').map(s => s.trim()).filter(Boolean)
          : [],
      };
      await api.put(`/jobs/${slug}/${jobSlug}`, payload);
      setSaveMsg('Saved ✓');
      setTimeout(() => setSaveMsg(''), 2500);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setServerError(err.response?.data?.message || 'Failed to save. Please try again.');
    }
  };

  const removeJob = async () => {
    if (!confirm('Remove this job? Candidates will no longer see it on the careers page.')) return;
    try {
      await api.delete(`/jobs/${slug}/${jobSlug}`);
      router.push(`/${slug}/edit`);
    } catch {
      alert('Could not remove job. Please try again.');
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="min-h-screen bg-ink" style={{ fontFamily: 'var(--font-body)' }}>

      {/* Top bar */}
      <header className="sticky top-0 z-50 flex items-center gap-3 px-5 py-3"
        style={{ background: 'rgba(10,10,15,0.96)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <Link href="/">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
            style={{ background: 'var(--gold)', color: '#0A0A0F', fontFamily: 'var(--font-display)' }}>
            CF
          </div>
        </Link>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
        <Link href={`/${slug}/edit`} className="text-sm"
          style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-display)' }}>
          Editor
        </Link>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
        <span className="text-sm truncate"
          style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-display)' }}>
          Edit Job
        </span>
        <div className="flex-1" />

        {saveMsg && (
          <span className="text-xs font-medium"
            style={{ color: saveMsg.includes('✓') ? 'var(--jade)' : 'var(--crimson)' }}>
            {saveMsg}
          </span>
        )}

        {/* Remove job button */}
        <button onClick={removeJob}
          className="text-xs px-3 py-1.5 rounded-lg transition-colors"
          style={{ color: 'var(--crimson)', border: '1px solid rgba(232,68,90,0.2)', background: 'rgba(232,68,90,0.08)' }}>
          Remove Job
        </button>

        <Link href={`/${slug}/edit`}
          className="text-xs px-3 py-1.5 rounded-lg glass transition-colors"
          style={{ color: 'rgba(255,255,255,0.4)' }}>
          ← Back
        </Link>
      </header>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px 80px' }}>

        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)', marginBottom: 6 }}>
            Edit Job
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>
            Changes are reflected on the careers page immediately after saving.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>

          {serverError && (
            <div style={{ marginBottom: 20, padding: 14, borderRadius: 12, background: 'rgba(232,68,90,0.1)', border: '1px solid rgba(232,68,90,0.2)', color: '#E8445A', fontSize: 14 }}>
              {serverError}
            </div>
          )}

          {/* ── Visibility toggle ── */}
          <FormCard title="Visibility">
            <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
              <input type="checkbox" checked={isActive}
                onChange={e => setIsActive(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: 'var(--jade)' }} />
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', margin: 0 }}>
                  Job is active
                </p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: '2px 0 0' }}>
                  Uncheck to hide from candidates without deleting. Check to make it visible again.
                </p>
              </div>
            </label>
          </FormCard>

          {/* ── Basic Information ── */}
          <FormCard title="Basic Information">
            <div>
              <Label required>Job Title</Label>
              <input {...register('title')} className="input-base" />
              <ErrMsg msg={errors.title?.message} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <Label>Department</Label>
                <select {...register('department')} className="input-base">
                  <option value="">Select department</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <Label required>Location</Label>
                <input {...register('location')} className="input-base" />
                <ErrMsg msg={errors.location?.message} />
              </div>
            </div>
            <div>
              <Label>Salary Range</Label>
              <input {...register('salaryRange')} className="input-base"
                placeholder="e.g. ₹15–25 LPA" />
            </div>
          </FormCard>

          {/* ── Job Type ── */}
          <FormCard title="Job Type">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <Label required>Work Policy</Label>
                <select {...register('workPolicy')} className="input-base">
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="On-site">On-site</option>
                </select>
              </div>
              <div>
                <Label required>Employment Type</Label>
                <select {...register('employmentType')} className="input-base">
                  <option value="Full time">Full time</option>
                  <option value="Part time">Part time</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>
              <div>
                <Label required>Experience Level</Label>
                <select {...register('experienceLevel')} className="input-base">
                  <option value="Junior">Junior</option>
                  <option value="Mid-level">Mid-level</option>
                  <option value="Senior">Senior</option>
                </select>
              </div>
              <div>
                <Label required>Job Type</Label>
                <select {...register('jobType')} className="input-base">
                  <option value="Permanent">Permanent</option>
                  <option value="Temporary">Temporary</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
            </div>
          </FormCard>

          {/* ── Description ── */}
          <FormCard title="Job Description">
            <div>
              <Label required>About This Role</Label>
              <textarea {...register('description')} rows={5}
                className="input-base w-full" style={{ resize: 'vertical' }} />
              <ErrMsg msg={errors.description?.message} />
            </div>
          </FormCard>

          {/* ── Responsibilities, Requirements, Benefits ── */}
          <FormCard title="Responsibilities, Requirements & Benefits">
            <div>
              <Label>Responsibilities</Label>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', marginBottom: 6 }}>One item per line</p>
              <textarea {...register('responsibilities')} rows={5}
                className="input-base w-full" style={{ resize: 'vertical' }} />
            </div>
            <div>
              <Label>Requirements</Label>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', marginBottom: 6 }}>One item per line</p>
              <textarea {...register('requirements')} rows={5}
                className="input-base w-full" style={{ resize: 'vertical' }} />
            </div>
            <div>
              <Label>Benefits</Label>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', marginBottom: 6 }}>One item per line</p>
              <textarea {...register('benefits')} rows={4}
                className="input-base w-full" style={{ resize: 'vertical' }} />
            </div>
          </FormCard>

          {/* ── Submit ── */}
          <button type="submit" disabled={isSubmitting}
            style={{
              width: '100%',
              padding: 16,
              borderRadius: 14,
              border: 'none',
              background: isSubmitting ? 'rgba(201,168,76,0.5)' : 'var(--gold)',
              color: '#0A0A0F',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 15,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}>
            {isSubmitting ? (
              <>
                <span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#0A0A0F', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                Saving…
              </>
            ) : 'Save Changes →'}
          </button>
        </form>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
