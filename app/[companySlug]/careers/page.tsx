import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CareersPage from '@/app/components/careers/CareersPage';

interface Props { params: { companySlug: string } }

async function getCompany(slug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/companies/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return (await res.json()).data;
  } catch { return null; }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const company = await getCompany(params.companySlug);
  if (!company) return { title: 'Not Found' };
  return {
    title: `Careers at ${company.name}`,
    description: company.tagline || `Join ${company.name}. Browse open roles and apply today.`,
    openGraph: {
      title: `Careers at ${company.name}`,
      description: company.tagline || `Join ${company.name}`,
      images: company.bannerUrl ? [{ url: company.bannerUrl }] : [],
    },
    twitter: { card: 'summary_large_image', title: `Careers at ${company.name}` },
    alternates: { canonical: `${process.env.NEXT_PUBLIC_APP_URL}/${params.companySlug}/careers` },
  };
}

export default async function Page({ params }: Props) {
  const company = await getCompany(params.companySlug);
  if (!company) notFound();

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
      <CareersPage company={company} companySlug={params.companySlug} />
    </>
  );
}