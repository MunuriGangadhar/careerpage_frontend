import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CareerForge — Build Branded Careers Pages',
  description: 'The simplest way to create beautiful, on-brand careers pages that attract top talent.',
};

const features = [
  { icon: '◈', title: 'Brand Theming',   desc: 'Custom colours, fonts, logo and banner. Every pixel matches your identity.' },
  { icon: '⊞', title: 'Section Builder', desc: 'Drag & drop About, Values, Benefits, and custom sections in any order.' },
  { icon: '◎', title: 'Smart Filters',   desc: 'Candidates filter by location, work policy, type and level. Zero friction.' },
  { icon: '⌘', title: 'SEO Ready',       desc: 'Server-rendered HTML, JSON-LD structured data, Open Graph. Google-ready.' },
  { icon: '△', title: 'Live Preview',    desc: 'See exactly what candidates see before you publish. No surprises.' },
  { icon: '⬡', title: 'Multi-tenant',   desc: 'Every company gets their own isolated page, data and URL. Production grade.' },
];

const companies = [
  { name: 'TechCorp', slug: 'techcorp', industry: 'Technology',    size: '500–1000', color: '#6366F1' },
  { name: 'GrowFast', slug: 'growfast', industry: 'SaaS / MarTech',size: '50–200',   color: '#E94560' },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-ink noise relative overflow-hidden" style={{ fontFamily: 'var(--font-body)' }}>

      {/* Background grid */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
        backgroundSize: '80px 80px',
      }} />

      {/* Glow blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
        style={{ background: 'radial-gradient(circle, #C9A84C, transparent)' }} />
      <div className="absolute top-32 right-1/4 w-64 h-64 rounded-full opacity-10 blur-3xl"
        style={{ background: 'radial-gradient(circle, #6366F1, transparent)' }} />

      {/* Nav */}
      <nav className="relative z-10 max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--gold)' }}>
            <span style={{ fontFamily: 'var(--font-display)', color: '#0A0A0F', fontWeight: 800, fontSize: 14 }}>CF</span>
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em' }}>
            Career<span style={{ color: 'var(--gold)' }}>Forge</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/techcorp/careers" className="hidden md:block text-sm text-white/50 hover:text-white transition-colors px-4 py-2">
            See Demo
          </Link>
          <Link href="/login"
            className="text-sm font-medium px-5 py-2.5 rounded-xl transition-all hover:opacity-90"
            style={{ background: 'var(--gold)', color: '#0A0A0F', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium mb-10 animate-fade-in"
          style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)', color: 'var(--gold)' }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--gold)' }} />
          Careers page builder for modern recruiting teams
        </div>

        <h1 className="animate-fade-up stagger-1 text-6xl md:text-8xl font-extrabold leading-[0.95] tracking-tight mb-8"
          style={{ fontFamily: 'var(--font-display)' }}>
          Your careers page.<br />
          <span className="text-shimmer">Your rules.</span>
        </h1>

        <p className="animate-fade-up stagger-2 text-xl text-white/45 max-w-2xl mx-auto mb-12 leading-relaxed">
          Build stunning, branded careers pages in minutes. Full customisation,
          live preview, SEO built in — no designer or developer needed.
        </p>

        <div className="animate-fade-up stagger-3 flex flex-col sm:flex-row gap-4 justify-center mb-20">
          <Link href="/login"
            className="px-8 py-4 rounded-xl text-base font-semibold transition-all hover:scale-105 active:scale-95"
            style={{ background: 'var(--gold)', color: '#0A0A0F', fontFamily: 'var(--font-display)', fontWeight: 700, boxShadow: '0 0 40px rgba(201,168,76,0.3)' }}>
            Build your page — it&apos;s free →
          </Link>
          <Link href="/techcorp/careers"
            className="px-8 py-4 rounded-xl text-base font-semibold transition-all hover:bg-white/10 glass"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>
            See live example ↗
          </Link>
        </div>

        {/* Demo cards */}
        <div className="animate-fade-up stagger-4 grid sm:grid-cols-2 gap-4 max-w-lg mx-auto mb-6">
          {companies.map(c => (
            <Link key={c.slug} href={`/${c.slug}/careers`}
              className="group glass rounded-2xl p-5 text-left hover:border-white/20 transition-all hover:scale-[1.02]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold text-white"
                  style={{ background: c.color, fontFamily: 'var(--font-display)' }}>
                  {c.name[0]}
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ fontFamily: 'var(--font-display)' }}>{c.name}</p>
                  <p className="text-xs text-white/40">{c.industry}</p>
                </div>
              </div>
              <p className="text-xs text-white/35">{c.size} employees</p>
              <p className="text-xs mt-2 group-hover:text-white/70 transition-colors" style={{ color: c.color }}>
                View careers page →
              </p>
            </Link>
          ))}
        </div>
        <p className="text-xs text-white/25">↑ Live demo pages — click to explore</p>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-28">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            Everything you need.<br /><span className="text-white/30">Nothing you don&apos;t.</span>
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <div key={f.title}
              className={`glass rounded-2xl p-7 hover:border-white/15 transition-all hover:scale-[1.02] animate-fade-up stagger-${i + 1}`}>
              <div className="text-2xl mb-5 w-10 h-10 flex items-center justify-center rounded-xl"
                style={{ background: 'rgba(201,168,76,0.1)', color: 'var(--gold)' }}>
                {f.icon}
              </div>
              <h3 className="font-bold text-base mb-2" style={{ fontFamily: 'var(--font-display)' }}>{f.title}</h3>
              <p className="text-sm text-white/45 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <div className="rounded-3xl p-16 text-center"
          style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.15) 0%, rgba(99,102,241,0.1) 100%)', border: '1px solid rgba(201,168,76,0.2)' }}>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-5" style={{ fontFamily: 'var(--font-display)' }}>
            Ready to attract<br />better talent?
          </h2>
          <p className="text-white/50 mb-8 max-w-md mx-auto">Set up your careers page in under 5 minutes. Free forever.</p>
          <Link href="/login"
            className="inline-flex px-10 py-4 rounded-xl font-bold text-base transition-all hover:scale-105"
            style={{ background: 'var(--gold)', color: '#0A0A0F', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
            Start building →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t py-8 text-center text-sm text-white/25"
        style={{ borderColor: 'var(--border)' }}>
        <p>CareerForge · Built for the assignment · 2025</p>
      </footer>
    </main>
  );
}