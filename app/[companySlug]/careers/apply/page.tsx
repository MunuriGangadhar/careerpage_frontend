'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/app/lib/api';

const schema = z.object({
  fullName:          z.string().min(2, 'Full name is required'),
  email:             z.string().email('Valid email is required'),
  phone:             z.string().optional(),
  location:          z.string().optional(),
  currentRole:       z.string().optional(),
  currentCompany:    z.string().optional(),
  yearsOfExperience: z.string().optional(),
  noticePeriod:      z.string().optional(),
  expectedSalary:    z.string().optional(),
  linkedinUrl:       z.string().url('Must be a valid URL').optional().or(z.literal('')),
  portfolioUrl:      z.string().url('Must be a valid URL').optional().or(z.literal('')),
  resumeUrl:         z.string().url('Must be a valid URL').optional().or(z.literal('')),
  coverLetter:       z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const EXPERIENCE_OPTIONS = [
  'Less than 1 year',
  '1–2 years',
  '3–5 years',
  '5–8 years',
  '8–12 years',
  '12+ years',
];

const NOTICE_OPTIONS = [
  'Immediately',
  '2 weeks',
  '1 month',
  '2 months',
  '3 months',
  'More than 3 months',
];

// ── Helper sub-components ─────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      border: '1.5px solid rgba(0,0,0,0.07)',
      padding: 24,
      marginBottom: 20,
    }}>
      <h2 style={{
        fontSize: 15,
        fontWeight: 700,
        color: '#0A0A0F',
        marginBottom: 20,
        fontFamily: 'Syne, sans-serif',
        paddingBottom: 14,
        borderBottom: '1px solid rgba(0,0,0,0.07)',
      }}>
        {title}
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {children}
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{
        fontSize: 12,
        fontWeight: 600,
        color: 'rgba(0,0,0,0.55)',
        display: 'flex',
        gap: 4,
      }}>
        {label}
        {required && <span style={{ color: '#E8445A' }}>*</span>}
      </label>
      {children}
      {error && (
        <p style={{ fontSize: 12, color: '#E8445A', margin: 0 }}>{error}</p>
      )}
      {hint && !error && (
        <p style={{ fontSize: 12, color: 'rgba(0,0,0,0.38)', margin: 0 }}>{hint}</p>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ApplyPage() {
  const params      = useParams();
  const companySlug = params.companySlug as string;
  const jobSlug     = params.jobSlug as string;

  const [submitted,   setSubmitted]   = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      setServerError('');
      await api.post(`/applications/${companySlug}/${jobSlug}`, data);
      setSubmitted(true);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setServerError(
        err.response?.data?.message || 'Something went wrong. Please try again.'
      );
    }
  };

  // ── Success screen ────────────────────────────────────────────────────────

  if (submitted) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#FAFAF8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'DM Sans, sans-serif',
        padding: 24,
      }}>
        <div style={{ maxWidth: 480, textAlign: 'center' }}>
          {/* Green check circle */}
          <div style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'rgba(46,204,148,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            border: '2px solid rgba(46,204,148,0.3)',
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
              stroke="#2ECC94" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <h1 style={{
            fontSize: 28,
            fontWeight: 800,
            color: '#0A0A0F',
            marginBottom: 12,
            fontFamily: 'Syne, sans-serif',
          }}>
            Application Submitted!
          </h1>

          <p style={{
            color: 'rgba(0,0,0,0.5)',
            fontSize: 15,
            lineHeight: 1.7,
            marginBottom: 32,
          }}>
            Thank you for applying. The hiring team will review your application
            and get back to you soon.
          </p>

          <div style={{
            display: 'flex',
            gap: 12,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}>
            <Link
              href={`/${companySlug}/careers`}
              style={{
                padding: '12px 24px',
                borderRadius: 12,
                background: '#0A0A0F',
                color: '#fff',
                fontFamily: 'Syne, sans-serif',
                fontWeight: 700,
                fontSize: 14,
                textDecoration: 'none',
              }}
            >
              ← Back to all jobs
            </Link>
            <button
              onClick={() => window.close()}
              style={{
                padding: '12px 24px',
                borderRadius: 12,
                background: 'transparent',
                color: '#0A0A0F',
                fontFamily: 'Syne, sans-serif',
                fontWeight: 600,
                fontSize: 14,
                border: '1.5px solid rgba(0,0,0,0.12)',
                cursor: 'pointer',
              }}
            >
              Close tab
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Application form ──────────────────────────────────────────────────────

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FAFAF8',
      fontFamily: 'DM Sans, sans-serif',
    }}>

      {/* Header bar */}
      <div style={{ background: '#0F172A', padding: '16px 24px' }}>
        <div style={{
          maxWidth: 680,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Link
            href={`/${companySlug}/careers/${jobSlug}`}
            style={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: 14,
              textDecoration: 'none',
            }}
          >
            ← Back to job
          </Link>
          <span style={{
            color: 'rgba(255,255,255,0.4)',
            fontSize: 13,
            fontFamily: 'Syne, sans-serif',
          }}>
            CareerForge
          </span>
        </div>
      </div>

      {/* Form body */}
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Page title */}
        <div style={{ marginBottom: 40 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 12px',
            borderRadius: 999,
            background: 'rgba(99,102,241,0.1)',
            border: '1px solid rgba(99,102,241,0.2)',
            marginBottom: 16,
          }}>
            <span style={{ fontSize: 12, color: '#6366F1', fontWeight: 600 }}>
              Applying for a position
            </span>
          </div>
          <h1 style={{
            fontSize: 32,
            fontWeight: 800,
            color: '#0A0A0F',
            fontFamily: 'Syne, sans-serif',
            marginBottom: 8,
            lineHeight: 1.2,
          }}>
            Your Application
          </h1>
          <p style={{ color: 'rgba(0,0,0,0.45)', fontSize: 14 }}>
            Fill in the details below. Fields marked{' '}
            <span style={{ color: '#E8445A' }}>*</span> are required.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>

          {/* Server error */}
          {serverError && (
            <div style={{
              marginBottom: 24,
              padding: 16,
              borderRadius: 12,
              background: 'rgba(232,68,90,0.08)',
              border: '1px solid rgba(232,68,90,0.2)',
              color: '#E8445A',
              fontSize: 14,
            }}>
              {serverError}
            </div>
          )}

          {/* ── Personal Information ── */}
          <Section title="Personal Information">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Full Name" required error={errors.fullName?.message}>
                <input
                  {...register('fullName')}
                  placeholder="Rahul Sharma"
                  className="form-input"
                />
              </Field>
              <Field label="Email Address" required error={errors.email?.message}>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="rahul@example.com"
                  className="form-input"
                />
              </Field>
              <Field label="Phone Number" error={errors.phone?.message}>
                <input
                  {...register('phone')}
                  placeholder="+91 98765 43210"
                  className="form-input"
                />
              </Field>
              <Field label="Current Location" error={errors.location?.message}>
                <input
                  {...register('location')}
                  placeholder="Hyderabad, India"
                  className="form-input"
                />
              </Field>
            </div>
          </Section>

          {/* ── Professional Background ── */}
          <Section title="Professional Background">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Current Role" error={errors.currentRole?.message}>
                <input
                  {...register('currentRole')}
                  placeholder="Senior Software Engineer"
                  className="form-input"
                />
              </Field>
              <Field label="Current Company" error={errors.currentCompany?.message}>
                <input
                  {...register('currentCompany')}
                  placeholder="Infosys"
                  className="form-input"
                />
              </Field>
              <Field
                label="Years of Experience"
                error={errors.yearsOfExperience?.message}
              >
                <select {...register('yearsOfExperience')} className="form-input">
                  <option value="">Select experience</option>
                  {EXPERIENCE_OPTIONS.map(o => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </Field>
              <Field label="Notice Period" error={errors.noticePeriod?.message}>
                <select {...register('noticePeriod')} className="form-input">
                  <option value="">Select notice period</option>
                  {NOTICE_OPTIONS.map(o => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </Field>
              <Field label="Expected Salary" error={errors.expectedSalary?.message}>
                <input
                  {...register('expectedSalary')}
                  placeholder="e.g. ₹25 LPA or $80K"
                  className="form-input"
                />
              </Field>
            </div>
          </Section>

          {/* ── Links & Portfolio ── */}
          <Section title="Links & Portfolio">
            <Field label="LinkedIn Profile URL" error={errors.linkedinUrl?.message}>
              <input
                {...register('linkedinUrl')}
                type="url"
                placeholder="https://linkedin.com/in/yourname"
                className="form-input"
              />
            </Field>
            <Field
              label="Portfolio / Website URL"
              error={errors.portfolioUrl?.message}
            >
              <input
                {...register('portfolioUrl')}
                type="url"
                placeholder="https://yourportfolio.com"
                className="form-input"
              />
            </Field>
            <Field
              label="Resume URL"
              error={errors.resumeUrl?.message}
              hint="Upload your resume to Google Drive or Dropbox and paste the shareable link here"
            >
              <input
                {...register('resumeUrl')}
                type="url"
                placeholder="https://drive.google.com/file/d/..."
                className="form-input"
              />
            </Field>
          </Section>

          {/* ── Cover Letter ── */}
          <Section title="Cover Letter">
            <Field
              label="Why do you want to join?"
              error={errors.coverLetter?.message}
              hint="Tell us what excites you about this role and why you'd be a great fit (optional but recommended)"
            >
              <textarea
                {...register('coverLetter')}
                rows={6}
                placeholder="I'm excited about this opportunity because..."
                className="form-input"
                style={{ resize: 'vertical' }}
              />
            </Field>
          </Section>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: 14,
              border: 'none',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              background: isSubmitting ? 'rgba(0,0,0,0.1)' : '#0F172A',
              color: '#fff',
              fontFamily: 'Syne, sans-serif',
              fontWeight: 700,
              fontSize: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'all 0.2s',
              opacity: isSubmitting ? 0.7 : 1,
            }}
          >
            {isSubmitting ? (
              <>
                <span style={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff',
                  display: 'inline-block',
                  animation: 'spin 0.8s linear infinite',
                }} />
                Submitting…
              </>
            ) : (
              'Submit Application →'
            )}
          </button>

          <p style={{
            textAlign: 'center',
            marginTop: 16,
            fontSize: 12,
            color: 'rgba(0,0,0,0.35)',
          }}>
            By submitting, you agree that your information will be shared with
            the hiring team.
          </p>
        </form>
      </div>

      {/* Inline styles for form inputs and animation */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');

        .form-input {
          width: 100%;
          padding: 11px 14px;
          border: 1.5px solid #E5E3DC;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: #0A0A0F;
          background: #fff;
          transition: border-color 0.2s, box-shadow 0.2s;
          outline: none;
          box-sizing: border-box;
        }
        .form-input:focus {
          border-color: #0F172A;
          box-shadow: 0 0 0 3px rgba(10,10,15,0.08);
        }
        .form-input::placeholder {
          color: #aaa;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}