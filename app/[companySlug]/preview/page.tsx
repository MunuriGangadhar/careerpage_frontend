'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/app/lib/api';
// import api from '@/lib/api';
import CareersPage from '@/app/components/careers/CareersPage';
// import CareersPage from '@/components/careers/CareersPage';
import { PageLoader } from '@/app/components/ui/Spinner';
// import { PageLoader } from '@/components/ui/Spinner';
import type  { Company} from '@/app/types';
// import type { Company } from '@/types';

export default function PreviewPage() {
  const params  = useParams();
  const router  = useRouter();
  const slug    = params.companySlug as string;
  const [company, setCompany] = useState<Company | null>(null);
  const [error, setError]     = useState('');

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) { router.push('/login'); return; }
    api.get(`/companies/${slug}/preview`)
      .then(r => setCompany(r.data.data))
      .catch(() => setError('Unable to load preview. Make sure you are the page owner.'));
  }, [slug, router]);

  if (error) return (
    <div className="min-h-screen bg-ink flex items-center justify-center text-center px-6">
      <div>
        <p className="text-5xl mb-4">⚠️</p>
        <p className="text-white/60 mb-6">{error}</p>
        <Link href={`/${slug}/edit`} className="px-6 py-3 rounded-xl text-sm font-semibold"
          style={{ background: 'var(--gold)', color: '#0A0A0F', fontFamily: 'var(--font-display)' }}>
          ← Back to Editor
        </Link>
      </div>
    </div>
  );

  if (!company) return <PageLoader />;

  return (
    <div>
      <div className="sticky top-0 z-50 flex items-center gap-4 px-6 py-2.5"
        style={{ background: 'var(--gold)', fontFamily: 'var(--font-display)' }}>
        <span className="text-lg">👁</span>
        <span className="font-bold text-sm" style={{ color: '#0A0A0F' }}>Preview Mode</span>
        <span className="text-xs hidden sm:block" style={{ color: 'rgba(10,10,15,0.6)' }}>
          Candidates will see your page exactly like this
        </span>
        <div className="flex-1" />
        <Link href={`/${slug}/edit`} className="text-sm font-semibold hover:opacity-70 transition-opacity"
          style={{ color: '#0A0A0F' }}>
          ← Back to Editor
        </Link>
        {!company.isPublished && (
          <span className="text-xs font-medium px-3 py-1 rounded-full" style={{ background: 'rgba(10,10,15,0.12)', color: '#0A0A0F' }}>
            Not published
          </span>
        )}
      </div>
      <CareersPage company={company} companySlug={slug} />
    </div>
  );
}