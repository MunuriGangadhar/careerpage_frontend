import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: '404 — Page Not Found' };

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 text-center"
      style={{ background: 'var(--ink)', fontFamily: 'var(--font-body)' }}>
      <div className="fixed top-1/4 left-1/3 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #C9A84C, transparent)' }} />
      <div className="relative z-10 max-w-md">
        <p className="text-8xl font-extrabold mb-4 text-shimmer" style={{ fontFamily: 'var(--font-display)' }}>404</p>
        <h1 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: 'var(--font-display)' }}>Page not found</h1>
        <p className="text-white/40 text-sm mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or may have been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: 'var(--gold)', color: '#0A0A0F', fontFamily: 'var(--font-display)' }}>
            ← Back Home
          </Link>
          <Link href="/login" className="px-6 py-3 rounded-xl text-sm font-semibold glass transition-all"
            style={{ fontFamily: 'var(--font-display)', color: 'rgba(255,255,255,0.6)' }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}