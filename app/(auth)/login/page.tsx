'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/app/lib/api';

const loginSchema = z.object({
  email:    z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
const registerSchema = z.object({
  name:        z.string().min(2, 'Name must be at least 2 characters'),
  email:       z.string().email('Please enter a valid email'),
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  password:    z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginForm    = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> { label: string; error?: string; }
const Field = React.forwardRef<HTMLInputElement, FieldProps>(({ label, error, ...props }, ref) => (
  <div>
    <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</label>
    <input ref={ref} {...props} className="input-base" />
    {error && <p className="mt-1.5 text-xs" style={{ color: '#E8445A' }}>{error}</p>}
  </div>
));
Field.displayName = 'Field';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState('');
  const router = useRouter();
  const lf = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });
  const rf = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const onLogin = async (data: LoginForm) => {
    try {
      setError('');
      const res = await api.post('/auth/login', data);
      localStorage.setItem('token',   res.data.token);
      localStorage.setItem('company', JSON.stringify(res.data.company));
      localStorage.setItem('user',    JSON.stringify(res.data.user));
      router.push(`/${res.data.company.slug}/edit`);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  const onRegister = async (data: RegisterForm) => {
    try {
      setError('');
      const res = await api.post('/auth/register', data);
      localStorage.setItem('token',   res.data.token);
      localStorage.setItem('company', JSON.stringify(res.data.company));
      localStorage.setItem('user',    JSON.stringify(res.data.user));
      router.push(`/${res.data.company.slug}/edit`);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-ink noise relative flex items-center justify-center px-4">
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #C9A84C, transparent)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #6366F1, transparent)' }} />

      <div className="relative z-10 w-full max-w-md animate-fade-up">
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-10">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--gold)' }}>
            <span style={{ fontFamily: 'var(--font-display)', color: '#0A0A0F', fontWeight: 800, fontSize: 13 }}>CF</span>
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, letterSpacing: '-0.02em' }}>
            Career<span style={{ color: 'var(--gold)' }}>Forge</span>
          </span>
        </Link>

        <div className="glass rounded-2xl p-1 flex gap-1 mb-6">
          {(['login', 'register'] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setError(''); }}
              className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all"
              style={{ fontFamily: 'var(--font-display)', background: mode === m ? 'var(--gold)' : 'transparent', color: mode === m ? '#0A0A0F' : 'rgba(255,255,255,0.4)' }}>
              {m === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        <div className="glass rounded-2xl p-8">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl text-sm"
              style={{ background: 'rgba(232,68,90,0.1)', border: '1px solid rgba(232,68,90,0.2)', color: '#E8445A' }}>
              {error}
            </div>
          )}
          {mode === 'login' ? (
            <form onSubmit={lf.handleSubmit(onLogin)} className="space-y-4">
              <Field label="Email address" type="email" placeholder="you@company.com" {...lf.register('email')} error={lf.formState.errors.email?.message} />
              <Field label="Password" type="password" placeholder="••••••••" {...lf.register('password')} error={lf.formState.errors.password?.message} />
              <button type="submit" disabled={lf.formState.isSubmitting}
                className="w-full py-3.5 rounded-xl font-bold text-sm mt-2 transition-all hover:scale-[1.02] disabled:opacity-50"
                style={{ background: 'var(--gold)', color: '#0A0A0F', fontFamily: 'var(--font-display)' }}>
                {lf.formState.isSubmitting ? 'Signing in…' : 'Sign In →'}
              </button>
            </form>
          ) : (
            <form onSubmit={rf.handleSubmit(onRegister)} className="space-y-4">
              <Field label="Your name" placeholder="Alex Johnson" {...rf.register('name')} error={rf.formState.errors.name?.message} />
              <Field label="Work email" type="email" placeholder="you@company.com" {...rf.register('email')} error={rf.formState.errors.email?.message} />
              <Field label="Company name" placeholder="Acme Inc" {...rf.register('companyName')} error={rf.formState.errors.companyName?.message} />
              <Field label="Password" type="password" placeholder="Min. 8 characters" {...rf.register('password')} error={rf.formState.errors.password?.message} />
              <button type="submit" disabled={rf.formState.isSubmitting}
                className="w-full py-3.5 rounded-xl font-bold text-sm mt-2 transition-all hover:scale-[1.02] disabled:opacity-50"
                style={{ background: 'var(--gold)', color: '#0A0A0F', fontFamily: 'var(--font-display)' }}>
                {rf.formState.isSubmitting ? 'Creating account…' : 'Create Account →'}
              </button>
            </form>
          )}
        </div>

        <div className="mt-5 glass rounded-xl p-4">
          <p className="text-xs text-center mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>Demo credentials</p>
          <div className="space-y-1 text-center">
            <p className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.45)' }}>recruiter@techcorp.com / password123</p>
            <p className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.45)' }}>recruiter@growfast.com / password123</p>
          </div>
        </div>
      </div>
    </div>
  );
}