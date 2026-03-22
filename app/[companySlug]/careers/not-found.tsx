import Link from 'next/link';
export default function CareersNotFound() {
  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Sans, sans-serif', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🔍</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12, fontFamily: 'Syne, sans-serif', color: '#0A0A0F' }}>
          Careers page not found
        </h1>
        <p style={{ color: 'rgba(0,0,0,0.45)', fontSize: 15, lineHeight: 1.6, marginBottom: 32 }}>
          This company&apos;s careers page doesn&apos;t exist or hasn&apos;t been published.
        </p>
        <Link href="/" style={{ display: 'inline-block', padding: '12px 28px', borderRadius: 12, background: '#0A0A0F', color: '#fff', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
          ← Back to CareerForge
        </Link>
      </div>
    </div>
  );
}