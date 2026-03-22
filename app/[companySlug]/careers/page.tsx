import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CareersPage from '@/app/components/careers/CareersPage';

// Next.js 15+: params is a Promise and must be awaited
interface Props { params: Promise<{ companySlug: string }> }

async function getCompany(slug: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/companies/${slug}/theme`,
      { cache: 'no-store' }
    );
    if (!res.ok) return null;
    return (await res.json()).data;
  } catch { return null; }
}

async function getCompanyFull(slug: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/companies/${slug}`,
      { cache: 'no-store' }
    );
    if (!res.ok) return null;
    return (await res.json()).data;
  } catch { return null; }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { companySlug } = await params;
  const company = await getCompany(companySlug);
  if (!company) return { title: 'Not Found' };
  return {
    title: `Careers at ${company.name}`,
    description: `Join ${company.name}. Browse open roles and apply today.`,
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_APP_URL}/${companySlug}/careers`,
    },
  };
}

export default async function Page({ params }: Props) {
  const { companySlug } = await params;

  const theme = await getCompany(companySlug);
  if (!theme) notFound();

  const company = await getCompanyFull(companySlug);

  if (!company) {
    return (
      <div style={{ minHeight: '100vh', background: '#FAFAF8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Sans, sans-serif', padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🔒</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0A0A0F', fontFamily: 'Syne, sans-serif', marginBottom: 12 }}>
            This careers page isn&apos;t live yet
          </h1>
          <p style={{ color: 'rgba(0,0,0,0.45)', fontSize: 15, lineHeight: 1.6, marginBottom: 32 }}>
            The recruiter hasn&apos;t published this page yet.
            If you received a direct job link, you can still apply using that link.
          </p>
          <a href="/" style={{ display: 'inline-block', padding: '12px 28px', borderRadius: 12, background: '#0A0A0F', color: '#fff', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
            ← Back to CareerForge
          </a>
        </div>
      </div>
    );
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: company.name,
    description: company.description,
    url: company.website,
    logo: company.logoUrl,
    sameAs: Object.values(company.socialLinks || {}).filter(Boolean),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <CareersPage company={company} companySlug={companySlug} />
    </>
  );
}