import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';

// Next.js 15+: params is a Promise and must be awaited
interface Props { params: Promise<{ companySlug: string; jobSlug: string }> }

async function getJob(companySlug: string, jobSlug: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/jobs/${companySlug}/${jobSlug}`,
      { cache: 'no-store' }
    );
    if (!res.ok) return null;
    return (await res.json()).data;
  } catch { return null; }
}

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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { companySlug, jobSlug } = await params;
  const job = await getJob(companySlug, jobSlug);
  if (!job) return { title: 'Job Not Found' };
  return {
    title: `${job.title} at ${companySlug}`,
    description: `${job.title} · ${job.location} · ${job.workPolicy} · ${job.employmentType}`,
  };
}

const policyColors: Record<string, string> = {
  Remote: '#2ECC94', Hybrid: '#6366F1', 'On-site': '#F59E0B',
};
const levelColors: Record<string, string> = {
  Senior: '#C9A84C', 'Mid-level': '#6366F1', Junior: '#2ECC94',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-base font-bold mb-4"
        style={{ fontFamily: 'Syne, sans-serif', color: '#0A0A0F' }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

export default async function JobDetailPage({ params }: Props) {
  const { companySlug, jobSlug } = await params;

  const [job, company] = await Promise.all([
    getJob(companySlug, jobSlug),
    getCompany(companySlug),
  ]);

  if (!job) notFound();

  const primary   = company?.brandTheme?.primaryColor   || '#0F172A';
  const secondary = company?.brandTheme?.secondaryColor || '#6366F1';
  const applyUrl  = `/apply/${companySlug}/${jobSlug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description,
    datePosted: job.postedAt,
    jobLocation: { '@type': 'Place', address: job.location },
    employmentType: job.employmentType.toUpperCase().replace(' ', '_'),
    hiringOrganization: {
      '@type': 'Organization',
      name: company?.name || companySlug,
      logo: company?.logoUrl,
    },
    baseSalary: job.salaryRange ? {
      '@type': 'MonetaryAmount', currency: 'USD',
      value: { '@type': 'QuantitativeValue', value: job.salaryRange, unitText: 'MONTH' },
    } : undefined,
  };

  return (
    <>
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div style={{ background: '#FAFAF8', minHeight: '100vh', fontFamily: 'DM Sans, sans-serif' }}>

        <div style={{ background: primary, padding: '16px 24px' }}>
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <Link href={`/${companySlug}/careers`}
              className="text-sm font-medium text-white/70 hover:text-white transition-colors">
              ← Back to careers
            </Link>
            {company?.name && (
              <span className="text-sm text-white/60" style={{ fontFamily: 'Syne, sans-serif' }}>
                {company.name}
              </span>
            )}
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 md:px-6 py-12">
          <div className="bg-white rounded-3xl p-8 md:p-10 mb-6"
            style={{ border: '1.5px solid rgba(0,0,0,0.06)', boxShadow: '0 8px 48px rgba(0,0,0,0.08)' }}>

            <h1 className="text-3xl font-extrabold mb-4"
              style={{ fontFamily: 'Syne, sans-serif', color: primary, lineHeight: 1.2 }}>
              {job.title}
            </h1>

            <div className="flex flex-wrap gap-2.5 mb-4">
              <span className="px-3 py-1.5 rounded-full text-xs font-semibold text-white"
                style={{ background: policyColors[job.workPolicy] || secondary }}>
                {job.workPolicy}
              </span>
              <span className="px-3 py-1.5 rounded-full text-xs font-medium"
                style={{ background: 'rgba(0,0,0,0.06)', color: 'rgba(0,0,0,0.6)' }}>
                📍 {job.location}
              </span>
              <span className="px-3 py-1.5 rounded-full text-xs font-medium"
                style={{ background: 'rgba(0,0,0,0.06)', color: 'rgba(0,0,0,0.6)' }}>
                🕐 {job.employmentType}
              </span>
              {job.department && (
                <span className="px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{ background: 'rgba(0,0,0,0.06)', color: 'rgba(0,0,0,0.6)' }}>
                  {job.department}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2 pb-6 mb-6"
              style={{ borderBottom: '1.5px solid rgba(0,0,0,0.07)' }}>
              <span className="px-3 py-1 rounded-xl text-xs font-semibold"
                style={{
                  background: `${levelColors[job.experienceLevel] || secondary}18`,
                  color: levelColors[job.experienceLevel] || secondary,
                }}>
                {job.experienceLevel}
              </span>
              <span className="px-3 py-1 rounded-xl text-xs"
                style={{ background: 'rgba(0,0,0,0.05)', color: 'rgba(0,0,0,0.5)' }}>
                {job.jobType}
              </span>
              {job.salaryRange && (
                <span className="px-3 py-1 rounded-xl text-xs font-semibold"
                  style={{ background: 'rgba(201,168,76,0.12)', color: '#A07830' }}>
                  💰 {job.salaryRange}
                </span>
              )}
            </div>

            {job.description && (
              <Section title="About this role">
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(0,0,0,0.65)' }}>
                  {job.description}
                </p>
              </Section>
            )}

            {job.responsibilities?.length > 0 && (
              <Section title="What you'll do">
                <ul className="space-y-2">
                  {job.responsibilities.map((r: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-sm"
                      style={{ color: 'rgba(0,0,0,0.65)' }}>
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: secondary }} />
                      {r}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {job.requirements?.length > 0 && (
              <Section title="What we're looking for">
                <ul className="space-y-2">
                  {job.requirements.map((r: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-sm"
                      style={{ color: 'rgba(0,0,0,0.65)' }}>
                      <span className="flex-shrink-0 mt-0.5 text-xs"
                        style={{ color: '#2ECC94' }}>✓</span>
                      {r}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {job.benefits?.length > 0 && (
              <Section title="Benefits">
                <ul className="space-y-2">
                  {job.benefits.map((b: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-sm"
                      style={{ color: 'rgba(0,0,0,0.65)' }}>
                      <span className="flex-shrink-0" style={{ color: '#C9A84C' }}>★</span>
                      {b}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            <div className="mt-8 pt-8" style={{ borderTop: '1.5px solid rgba(0,0,0,0.07)' }}>
              <Link
                href={applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-full py-4 rounded-2xl text-base font-bold text-white transition-all hover:opacity-90 hover:scale-[1.01] active:scale-[0.99]"
                style={{ background: primary, fontFamily: 'Syne, sans-serif' }}
              >
                Apply for this position →
              </Link>
              <p className="text-center text-xs mt-3" style={{ color: 'rgba(0,0,0,0.3)' }}>
                Opens in a new tab · Takes about 5 minutes
              </p>
            </div>
          </div>

          <Link href={`/${companySlug}/careers`}
            className="flex items-center gap-2 text-sm font-medium hover:opacity-70 transition-opacity"
            style={{ color: primary }}>
            ← All open positions at {company?.name || companySlug}
          </Link>
        </div>
      </div>
    </>
  );
}