'use client';

import { useState, useCallback, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  DndContext, closestCenter,
  PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, useSortable,
  verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAuth } from '@/app/hooks/useAuth';
import { useCompanyEdit } from '@/app/hooks/useCompany';
import { useRecruiterJobs } from '@/app/hooks/useJobs';
import api from '@/app/lib/api';
import { PageLoader, Spinner } from '@/app/components/ui/Spinner';
import { daysAgo } from '@/app/lib/utils';
import type { Company, ContentSection } from '@/app/types';

const FONTS         = ['DM Sans','Syne','Georgia','Playfair Display','Roboto Mono','Nunito','Merriweather'];
const RADII         = ['none','sm','md','lg','full'];
const SECTION_TYPES = ['about','life','values','benefits','team','custom'];

// ─── Sub-components ───────────────────────────────────────────────────────────

function F({ label, value, onChange, type = 'text', placeholder = '' }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</label>
      <input type={type} value={value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)} className="input-base" />
    </div>
  );
}

function ColorF({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</label>
      <div className="flex gap-2 items-center">
        <input type="color" value={value || '#000000'} onChange={(e) => onChange(e.target.value)}
          style={{ width: 40, height: 40, borderRadius: 10, cursor: 'pointer', border: 'none', padding: 2, background: 'transparent' }} />
        <input type="text" value={value || ''} maxLength={7} onChange={(e) => onChange(e.target.value)}
          className="input-base flex-1 font-mono" style={{ fontSize: 12 }} />
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl overflow-hidden mb-5"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="px-5 py-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.025)' }}>
        <h3 className="text-sm font-semibold"
          style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-display)' }}>
          {title}
        </h3>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

// ─── Sortable Section ─────────────────────────────────────────────────────────

function SortableSection({ section, onUpdate, onRemove }: {
  section: ContentSection;
  onUpdate: (id: string, field: string, val: string | boolean) => void;
  onRemove: (id: string) => void;
}) {
  const [open, setOpen] = useState(true);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id });

  const dragStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    marginBottom: 12,
  };

  return (
    <div ref={setNodeRef}
      style={{ ...dragStyle, borderRadius: 16, overflow: 'hidden', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="flex items-center gap-3 px-4 py-3">
        <button {...attributes} {...listeners} aria-label="Drag to reorder"
          className="hover:text-white/50 transition-colors"
          style={{ color: 'rgba(255,255,255,0.2)', cursor: 'grab', lineHeight: 1 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="9" cy="5" r="1.5"/><circle cx="15" cy="5" r="1.5"/>
            <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
            <circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="19" r="1.5"/>
          </svg>
        </button>

        <span className="flex-1 text-sm font-medium truncate"
          style={{ color: 'rgba(255,255,255,0.8)', fontFamily: 'var(--font-display)' }}>
          {section.title || 'Untitled Section'}
        </span>

        <label className="flex items-center gap-1.5 text-xs cursor-pointer select-none"
          style={{ color: 'rgba(255,255,255,0.35)' }}>
          <input type="checkbox" checked={section.visible}
            onChange={(e) => onUpdate(section.id, 'visible', e.target.checked)}
            style={{ width: 13, height: 13 }} />
          Visible
        </label>

        <button onClick={() => setOpen((o) => !o)}
          className="w-5 h-5 flex items-center justify-center hover:text-white/60 transition-colors"
          style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11 }}>
          {open ? '▴' : '▾'}
        </button>

        <button onClick={() => onRemove(section.id)} aria-label="Remove section"
          className="w-5 h-5 flex items-center justify-center hover:text-red-400 transition-colors text-sm"
          style={{ color: 'rgba(255,255,255,0.2)' }}>
          ×
        </button>
      </div>

      {open && (
        <div className="px-4 pb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Title</label>
              <input value={section.title} onChange={(e) => onUpdate(section.id, 'title', e.target.value)}
                className="input-base" style={{ fontSize: 13, padding: '8px 12px' }} />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Type</label>
              <select value={section.type} onChange={(e) => onUpdate(section.id, 'type', e.target.value)}
                className="input-base" style={{ fontSize: 13, padding: '8px 12px' }}>
                {SECTION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Content</label>
            <textarea value={section.content} onChange={(e) => onUpdate(section.id, 'content', e.target.value)}
              rows={4} className="input-base resize-none w-full" style={{ fontSize: 13, padding: '8px 12px' }} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Editor ──────────────────────────────────────────────────────────────

type Tab = 'brand' | 'content' | 'info' | 'jobs';

export default function EditorShell() {
  const params = useParams();
  const router = useRouter();
  const slug   = params.companySlug as string;

  const { loading: authLoading, logout } = useAuth(true);
  const { company: remote, isLoading, mutate } = useCompanyEdit(slug);
  const { jobs } = useRecruiterJobs(slug);

  const [company,   setCompany]   = useState<Company | null>(null);
  const [tab,       setTab]       = useState<Tab>('brand');
  const [saving,    setSaving]    = useState(false);
  const [saveMsg,   setSaveMsg]   = useState('');
  const [uploading, setUploading] = useState<'logo' | 'banner' | null>(null);

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    if (remote) setCompany(JSON.parse(JSON.stringify(remote)));
  }, [remote]);

  const save = useCallback(async () => {
    if (!company) return;
    setSaving(true);
    try {
      await api.put(`/companies/${slug}`, company);
      setSaveMsg('Saved ✓');
      mutate();
      setTimeout(() => setSaveMsg(''), 2500);
    } catch {
      setSaveMsg('Save failed');
      setTimeout(() => setSaveMsg(''), 2500);
    } finally {
      setSaving(false);
    }
  }, [company, slug, mutate]);

  const handlePublish = async () => {
    try {
      const r = await api.patch(`/companies/${slug}/publish`);
      setCompany((prev) => prev ? { ...prev, isPublished: r.data.data.isPublished } : null);
      mutate();
    } catch { /* ignore */ }
  };

  const handleUpload = async (type: 'logo' | 'banner', file: File) => {
    setUploading(type);
    const fd = new FormData();
    fd.append('image', file);
    try {
      const r = await api.post('/upload/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const field = type === 'logo' ? 'logoUrl' : 'bannerUrl';
      setCompany((prev) => prev ? { ...prev, [field]: r.data.url } : null);
    } catch {
      alert('Upload failed. Check Cloudinary credentials in .env');
    } finally {
      setUploading(null);
    }
  };

  const set       = (f: string, v: unknown)  => setCompany((p) => p ? { ...p, [f]: v } : null);
  const setTheme  = (f: string, v: string)   => setCompany((p) => p ? { ...p, brandTheme: { ...p.brandTheme, [f]: v } } : null);
  const setSocial = (k: string, v: string)   => setCompany((p) => p ? { ...p, socialLinks: { ...p.socialLinks, [k]: v } } : null);

  const updateSection = (id: string, field: string, val: string | boolean) =>
    setCompany((p) => p ? { ...p, contentSections: p.contentSections.map((s) => s.id === id ? { ...s, [field]: val } : s) } : null);

  const removeSection = (id: string) =>
    setCompany((p) => p ? { ...p, contentSections: p.contentSections.filter((s) => s.id !== id) } : null);

  const addSection = () => {
    const id    = `section-${Date.now()}`;
    const order = company?.contentSections.length ?? 0;
    setCompany((p) => p ? { ...p, contentSections: [...p.contentSections, { id, type: 'custom', title: 'New Section', content: '', visible: true, order }] } : null);
  };

  const onDragEnd = (ev: DragEndEvent) => {
    const { active, over } = ev;
    if (!over || active.id === over.id || !company) return;
    const ids = company.contentSections.map((s) => s.id);
    const reordered = arrayMove(
      company.contentSections,
      ids.indexOf(active.id as string),
      ids.indexOf(over.id as string),
    ).map((s, i) => ({ ...s, order: i }));
    setCompany({ ...company, contentSections: reordered });
  };

  if (authLoading || isLoading) return <PageLoader />;
  if (!company) return <PageLoader />;

  const sortedSections = [...company.contentSections].sort((a, b) => a.order - b.order);

  const TABS: { key: Tab; label: string; icon: string }[] = [
    { key: 'brand',   label: 'Brand',   icon: '◈' },
    { key: 'content', label: 'Content', icon: '⊞' },
    { key: 'info',    label: 'Info',    icon: 'ℹ' },
    { key: 'jobs',    label: 'Jobs',    icon: '◎' },
  ];

  return (
    <div className="min-h-screen bg-ink flex flex-col" style={{ fontFamily: 'var(--font-body)' }}>

      {/* ── Top Bar ── */}
      <header className="sticky top-0 z-50 flex items-center gap-3 px-5 py-3"
        style={{ background: 'rgba(10,10,15,0.96)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <Link href="/" className="flex items-center gap-2 mr-2 flex-shrink-0">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
            style={{ background: 'var(--gold)', color: '#0A0A0F', fontFamily: 'var(--font-display)' }}>
            CF
          </div>
        </Link>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
        <span className="text-sm truncate"
          style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--font-display)' }}>
          {company.name}
        </span>
        <div className="flex-1" />

        {saveMsg && (
          <span className="text-xs font-medium hidden sm:block"
            style={{ color: saveMsg.includes('✓') ? 'var(--jade)' : 'var(--crimson)' }}>
            {saveMsg}
          </span>
        )}

        <a href={`/${slug}/careers`} target="_blank" rel="noopener noreferrer"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors glass"
          style={{ color: 'rgba(255,255,255,0.45)' }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
            <polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
          Live
        </a>

        <Link href={`/${slug}/preview`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors glass"
          style={{ color: 'rgba(255,255,255,0.45)' }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          Preview
        </Link>

        <button onClick={handlePublish}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all"
          style={{
            fontFamily: 'var(--font-display)',
            background: company.isPublished ? 'rgba(46,204,148,0.15)' : 'rgba(255,255,255,0.07)',
            color: company.isPublished ? 'var(--jade)' : 'rgba(255,255,255,0.5)',
            border: `1px solid ${company.isPublished ? 'rgba(46,204,148,0.25)' : 'rgba(255,255,255,0.1)'}`,
          }}>
          <span>{company.isPublished ? '●' : '○'}</span>
          <span className="hidden sm:inline">{company.isPublished ? 'Live' : 'Publish'}</span>
        </button>

        <button onClick={save} disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all hover:opacity-90 disabled:opacity-50"
          style={{ background: 'var(--gold)', color: '#0A0A0F', fontFamily: 'var(--font-display)' }}>
          {saving && <Spinner size={11} />}
          {saving ? 'Saving…' : 'Save'}
        </button>

        <button onClick={logout} aria-label="Sign out"
          className="ml-1 hover:text-white/60 transition-colors"
          style={{ color: 'rgba(255,255,255,0.25)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
            <polyline points="16,17 21,12 16,7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Sidebar ── */}
        <nav className="flex-shrink-0 flex flex-col gap-1 p-2 pt-4"
          style={{ width: '3rem', background: 'rgba(255,255,255,0.02)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
          {TABS.map(({ key, label, icon }) => (
            <button key={key} onClick={() => setTab(key)} title={label}
              className="flex items-center justify-center rounded-xl transition-all"
              style={{
                width: 40, height: 40, fontFamily: 'var(--font-display)', fontSize: 16,
                background: tab === key ? 'rgba(201,168,76,0.14)' : 'transparent',
                color: tab === key ? 'var(--gold)' : 'rgba(255,255,255,0.3)',
                border: `1px solid ${tab === key ? 'rgba(201,168,76,0.22)' : 'transparent'}`,
              }}>
              {icon}
            </button>
          ))}
        </nav>

        {/* ── Main panel ── */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto">

            {/* BRAND TAB */}
            {tab === 'brand' && (
              <>
                <Card title="Logo & Banner">
                  <div className="grid grid-cols-2 gap-4">
                    {(['logo', 'banner'] as const).map((type) => {
                      const url = type === 'logo' ? company.logoUrl : company.bannerUrl;
                      return (
                        <div key={type}>
                          <p className="text-xs mb-2 capitalize" style={{ color: 'rgba(255,255,255,0.35)' }}>{type}</p>
                          {url && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={url} alt={type}
                              style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 10, marginBottom: 8, opacity: 0.8 }} />
                          )}
                          <label className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-colors"
                            style={{ border: '1px dashed rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.4)', display: 'flex' }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                              <polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/>
                            </svg>
                            {uploading === type ? 'Uploading…' : `Upload ${type}`}
                            <input type="file" accept="image/*" className="hidden" disabled={!!uploading}
                              onChange={(e) => e.target.files?.[0] && handleUpload(type, e.target.files[0])} />
                          </label>
                        </div>
                      );
                    })}
                  </div>
                  <F label="Logo URL (paste instead of upload)" value={company.logoUrl || ''} onChange={(v) => set('logoUrl', v)} placeholder="https://…" />
                  <F label="Banner URL" value={company.bannerUrl || ''} onChange={(v) => set('bannerUrl', v)} placeholder="https://…" />
                </Card>

                <Card title="Brand Colours">
                  <div className="grid grid-cols-2 gap-4">
                    <ColorF label="Primary"    value={company.brandTheme?.primaryColor    || '#0F172A'} onChange={(v) => setTheme('primaryColor', v)} />
                    <ColorF label="Secondary"  value={company.brandTheme?.secondaryColor  || '#6366F1'} onChange={(v) => setTheme('secondaryColor', v)} />
                    <ColorF label="Accent"     value={company.brandTheme?.accentColor     || '#F59E0B'} onChange={(v) => setTheme('accentColor', v)} />
                    <ColorF label="Background" value={company.brandTheme?.backgroundColor || '#FFFFFF'} onChange={(v) => setTheme('backgroundColor', v)} />
                  </div>
                </Card>

                <Card title="Typography & Shape">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Font Family</label>
                      <select value={company.brandTheme?.fontFamily || 'DM Sans'}
                        onChange={(e) => setTheme('fontFamily', e.target.value)} className="input-base">
                        {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Corner Radius</label>
                      <select value={company.brandTheme?.borderRadius || 'md'}
                        onChange={(e) => setTheme('borderRadius', e.target.value)} className="input-base">
                        {RADII.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                  </div>
                </Card>

                <Card title="Culture Video">
                  <F label="YouTube / Vimeo embed URL" value={company.cultureVideoUrl || ''}
                    onChange={(v) => set('cultureVideoUrl', v)}
                    placeholder="https://www.youtube.com/embed/dQw4w9WgXcQ" />
                </Card>
              </>
            )}

            {/* CONTENT TAB */}
            {tab === 'content' && (
              <>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                    Content Sections
                  </h2>
                  <button onClick={addSection}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-85"
                    style={{ background: 'var(--gold)', color: '#0A0A0F', fontFamily: 'var(--font-display)' }}>
                    + Add Section
                  </button>
                </div>

                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                  <SortableContext items={sortedSections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                    {sortedSections.map((s) => (
                      <SortableSection key={s.id} section={s} onUpdate={updateSection} onRemove={removeSection} />
                    ))}
                  </SortableContext>
                </DndContext>

                {company.contentSections.length === 0 && (
                  <div className="text-center py-16 rounded-2xl"
                    style={{ border: '1px dashed rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.25)' }}>
                    <p className="text-4xl mb-3">⊞</p>
                    <p className="text-sm">No sections yet. Add one to tell your story.</p>
                  </div>
                )}
              </>
            )}

            {/* INFO TAB */}
            {tab === 'info' && (
              <>
                <Card title="Company Info">
                  <F label="Company Name"  value={company.name}            onChange={(v) => set('name', v)} />
                  <F label="Tagline"       value={company.tagline || ''}   onChange={(v) => set('tagline', v)}   placeholder="Building the future of…" />
                  <div>
                    <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Description</label>
                    <textarea value={company.description || ''} onChange={(e) => set('description', e.target.value)}
                      rows={4} placeholder="Tell your story…" className="input-base resize-none w-full" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <F label="Website"      value={company.website || ''}      onChange={(v) => set('website', v)}      type="url" placeholder="https://…" />
                    <F label="Industry"     value={company.industry || ''}     onChange={(v) => set('industry', v)} />
                    <F label="Company Size" value={company.size || ''}         onChange={(v) => set('size', v)}         placeholder="50–200" />
                    <F label="Founded"      value={company.founded || ''}      onChange={(v) => set('founded', v)}      placeholder="2019" />
                    <F label="Headquarters" value={company.headquarters || ''} onChange={(v) => set('headquarters', v)} />
                  </div>
                </Card>

                <Card title="Social Links">
                  {(['linkedin','twitter','instagram','facebook'] as const).map((key) => (
                    <F key={key} label={key.charAt(0).toUpperCase() + key.slice(1)}
                      value={(company.socialLinks || {})[key] || ''}
                      onChange={(v) => setSocial(key, v)}
                      type="url" placeholder={`https://${key}.com/…`} />
                  ))}
                </Card>

                <Card title="Share Your Careers Page">
                  <div className="rounded-xl p-4"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>Public URL</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs font-mono break-all" style={{ color: 'var(--gold)' }}>
                        {typeof window !== 'undefined' ? `${window.location.origin}/${slug}/careers` : `…/${slug}/careers`}
                      </code>
                      <button
                        onClick={() => { if (typeof window !== 'undefined') navigator.clipboard.writeText(`${window.location.origin}/${slug}/careers`); }}
                        className="px-3 py-1.5 text-xs rounded-lg transition-colors"
                        style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }}>
                        Copy
                      </button>
                    </div>
                  </div>
                  <p className="text-xs"
                    style={{ color: company.isPublished ? 'var(--jade)' : 'var(--gold)' }}>
                    {company.isPublished
                      ? '● Page is live — candidates can browse it now.'
                      : '○ Page is not published yet. Click Publish in the top bar to go live.'}
                  </p>
                </Card>
              </>
            )}

            {/* JOBS TAB */}
            {tab === 'jobs' && (
              <>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                    Job Listings
                    <span className="ml-2 text-sm font-normal" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      ({jobs.length})
                    </span>
                  </h2>
                  <a href={`/${slug}/careers`} target="_blank" rel="noopener noreferrer"
                    className="text-xs px-3 py-1.5 rounded-lg glass transition-colors"
                    style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-display)' }}>
                    View on page ↗
                  </a>
                </div>

                {jobs.length === 0 ? (
                  <div className="text-center py-16 rounded-2xl"
                    style={{ border: '1px dashed rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.25)' }}>
                    <p className="text-4xl mb-3">◎</p>
                    <p className="text-sm mb-3">No jobs yet.</p>
                    <code className="text-xs block" style={{ color: 'rgba(255,255,255,0.18)' }}>
                      Run: npm run seed — in apps/api
                    </code>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {jobs.map((job) => (
                      <div key={job._id} className="flex items-center gap-4 p-4 rounded-2xl"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate"
                            style={{ fontFamily: 'var(--font-display)' }}>{job.title}</p>
                          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                            {job.location} · {job.workPolicy} · {job.employmentType}
                          </p>
                        </div>
                        <div className="flex items-center gap-2.5 flex-shrink-0">
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{
                              background: job.isActive ? 'rgba(46,204,148,0.12)' : 'rgba(255,255,255,0.05)',
                              color: job.isActive ? 'var(--jade)' : 'rgba(255,255,255,0.25)',
                            }}>
                            {job.isActive ? '● Active' : '○ Hidden'}
                          </span>
                          <span className="text-xs hidden sm:block" style={{ color: 'rgba(255,255,255,0.2)' }}>
                            {daysAgo(job.postedAt)}
                          </span>
                          <a href={`/${slug}/careers/${job.slug}`} target="_blank" rel="noopener noreferrer"
                            className="hover:text-white/60 transition-colors"
                            style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>
                            ↗
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}