'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/app/lib/api';

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

export default function NewJobPage() {
  const params = useParams();
  const router = useRouter();
  const slug   = params.companySlug as string;

  const [authChecked, setAuthChecked] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    setAuthChecked(true);
  }, [router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      workPolicy:      'Remote',
      employmentType:  'Full time',
      experienceLevel: 'Mid-level',
      jobType:         'Permanent',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setServerError('');
      const payload = {
        ...data,
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
      await api.post(`/jobs/${slug}`, payload);
      router.push(`/${slug}/edit`);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setServerError(err.response?.data?.message || 'Failed to create job. Please try again.');
    }
  };

  if (!authChecked) return null;

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
        <span className="text-sm" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-display)' }}>
          New Job
        </span>
        <div className="flex-1" />
        <Link href={`/${slug}/edit`}
          className="text-xs px-3 py-1.5 rounded-lg glass transition-colors"
          style={{ color: 'rgba(255,255,255,0.4)' }}>
          ← Cancel
        </Link>
      </header>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Page heading */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)', marginBottom: 6 }}>
            Post a New Job
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>
            Fill in the details below. The job appears live on your careers page immediately after saving.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>

          {/* Server error */}
          {serverError && (
            <div style={{ marginBottom: 20, padding: 14, borderRadius: 12, background: 'rgba(232,68,90,0.1)', border: '1px solid rgba(232,68,90,0.2)', color: '#E8445A', fontSize: 14 }}>
              {serverError}
            </div>
          )}

          {/* ── Basic Information ── */}
          <FormCard title="Basic Information">
            <div>
              <Label required>Job Title</Label>
              <input {...register('title')} className="input-base"
                placeholder="e.g. Senior Frontend Engineer" />
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
                <input {...register('location')} className="input-base"
                  placeholder="e.g. Hyderabad, India" />
                <ErrMsg msg={errors.location?.message} />
              </div>
            </div>
            <div>
              <Label>Salary Range</Label>
              <input {...register('salaryRange')} className="input-base"
                placeholder="e.g. ₹15–25 LPA or USD 80K–120K / year" />
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
                className="input-base w-full" style={{ resize: 'vertical' }}
                placeholder="Describe the role, the team, and what success looks like in 90 days…" />
              <ErrMsg msg={errors.description?.message} />
            </div>
          </FormCard>

          {/* ── Responsibilities, Requirements, Benefits ── */}
          <FormCard title="Responsibilities, Requirements & Benefits">
            <div>
              <Label>Responsibilities</Label>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', marginBottom: 6 }}>
                One item per line — each line becomes a bullet point on the job page
              </p>
              <textarea {...register('responsibilities')} rows={5}
                className="input-base w-full" style={{ resize: 'vertical' }}
                placeholder={`Lead architecture decisions for your product area\nCollaborate with product and design to ship features\nMentor junior engineers and conduct code reviews`} />
            </div>
            <div>
              <Label>Requirements</Label>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', marginBottom: 6 }}>
                One item per line
              </p>
              <textarea {...register('requirements')} rows={5}
                className="input-base w-full" style={{ resize: 'vertical' }}
                placeholder={`5+ years experience with React and TypeScript\nStrong understanding of distributed systems\nExcellent written and spoken English`} />
            </div>
            <div>
              <Label>Benefits</Label>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', marginBottom: 6 }}>
                One item per line
              </p>
              <textarea {...register('benefits')} rows={4}
                className="input-base w-full" style={{ resize: 'vertical' }}
                placeholder={`Competitive salary + equity\n₹50,000 learning & development budget\nHealth insurance for you and family\n25 days paid leave`} />
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
                Posting job…
              </>
            ) : '+ Post Job →'}
          </button>
        </form>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}