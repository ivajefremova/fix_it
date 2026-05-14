'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import FavouriteButton from '@/components/universities/FavouriteButton'

// ─── Types ────────────────────────────────────────────────────────────────────

type CityGuide = { city: string; description: string; best_for: string }

type Country = {
  slug: string
  name: string
  tagline: string | null
  overview_free: string | null
  tuition_range_public: string | null
  tuition_range_private: string | null
  cost_of_living_range: string | null
}

type Gated = {
  why_this_country: string | null
  lifestyle: string | null
  finance: string | null
  career: string | null
  city_guide: CityGuide[] | null
  scholarship_overview: string | null
  housing_overview: string | null
}

type University = {
  slug: string
  name: string
  city: string | null
  type: string | null
  tuition_range: string | null
  tags: string[] | null
  ranking_summary: string | null
  quick_summary: string | null
}

type GatedDocs = {
  visa_process: string | null
  document_checklist: { step: string; description: string; required_docs?: string[] }[] | null
  moving_guide: string | null
  bank_account_guide: string | null
  arrival_tips: string | null
}

type GatedScholarship = {
  id: string
  name: string
  amount: string | null
  eligibility: string | null
  deadline: string | null
  scholarship_type: string | null
  university_slugs: string[]
}

type Props = {
  country: Country
  gated: Gated | null
  gatedDocs: GatedDocs | null
  gatedScholarships: GatedScholarship[]
  hasCountryPackage: boolean
  hasScholarshipPackage: boolean
  hasDocumentsPackage: boolean
  universities: University[]
  favouritedSlugs?: string[]
  isLoggedIn?: boolean
}

// ─── Small helpers ─────────────────────────────────────────────────────────────

function SectionLabel({ text }: { text: string }) {
  return <p className="text-xs uppercase tracking-widest mb-3" style={{ color: '#51e74c' }}>{text}</p>
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl px-5 py-4 flex-1 min-w-[140px]" style={{ background: '#f8f9fb', border: '1px solid #eef0f3' }}>
      <p className="text-xs mb-1" style={{ color: 'rgba(24,24,49,0.4)', fontWeight: 300 }}>{label}</p>
      <p className="text-sm text-navy" style={{ fontWeight: 400 }}>{value}</p>
    </div>
  )
}

function Pill({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-full text-xs transition-all"
      style={{
        background: active ? '#181831' : '#f0f2f5',
        color: active ? '#fff' : 'rgba(24,24,49,0.6)',
        fontWeight: active ? 400 : 300,
        border: active ? '1px solid #181831' : '1px solid #e4ebf3',
      }}
    >
      {children}
    </button>
  )
}

// ─── Teaser lock overlay ───────────────────────────────────────────────────────

const PACKAGE_LABELS: Record<string, string> = {
  country:     'Country Guide',
  scholarship: 'Scholarship Guide',
  documents:   'Documents & Relocation Guide',
}

function TeaserLock({ title, countryName, countrySlug, packageType = 'country' }: { title: string; countryName: string; countrySlug: string; packageType?: 'country' | 'scholarship' | 'documents' }) {
  const href = packageType === 'scholarship' ? '/services/scholarship' : `/services/${countrySlug}/${packageType}`
  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 20 }}>
      {/* Blurred skeleton preview */}
      <div style={{ filter: 'blur(5px)', pointerEvents: 'none', userSelect: 'none', padding: '2rem' }}>
        <div style={{ height: 14, width: '70%', background: '#e5e7eb', borderRadius: 6, marginBottom: 12 }} />
        <div style={{ height: 11, width: '95%', background: '#e5e7eb', borderRadius: 4, marginBottom: 8 }} />
        <div style={{ height: 11, width: '88%', background: '#e5e7eb', borderRadius: 4, marginBottom: 8 }} />
        <div style={{ height: 11, width: '80%', background: '#e5e7eb', borderRadius: 4, marginBottom: 24 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ background: '#f8f9fb', border: '1px solid #eef0f3', borderRadius: 14, padding: '1.25rem' }}>
              <div style={{ height: 11, width: '55%', background: '#e5e7eb', borderRadius: 4, marginBottom: 8 }} />
              <div style={{ height: 9, width: '90%', background: '#e5e7eb', borderRadius: 4, marginBottom: 6 }} />
              <div style={{ height: 9, width: '72%', background: '#e5e7eb', borderRadius: 4 }} />
            </div>
          ))}
        </div>
        <div style={{ height: 11, width: '60%', background: '#e5e7eb', borderRadius: 4, marginBottom: 8 }} />
        <div style={{ height: 11, width: '85%', background: '#e5e7eb', borderRadius: 4 }} />
      </div>

      {/* Gradient + lock UI */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.97) 45%)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        paddingBottom: '2.5rem',
      }}>
        <div className="text-center px-6">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.09)' }}
          >
            <svg className="w-4.5 h-4.5" style={{ color: '#0c4d86', width: 18, height: 18 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25-2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h3 className="text-base text-navy mb-1.5" style={{ fontWeight: 300 }}>{title}</h3>
          <p className="text-xs mb-5 max-w-xs mx-auto leading-relaxed" style={{ color: 'rgba(24,24,49,0.5)', fontWeight: 300 }}>
            Part of the {countryName} {PACKAGE_LABELS[packageType]}.
          </p>
          <Link
            href={href}
            className="inline-flex items-center justify-center px-5 py-2 rounded-xl text-xs font-normal transition hover:opacity-90"
            style={{ background: '#51e74c', color: '#181831' }}
          >
            Unlock guide
          </Link>
        </div>
      </div>
    </div>
  )
}

// ─── University card ───────────────────────────────────────────────────────────

function UniCard({ uni, isFavourited, isLoggedIn }: { uni: University; isFavourited: boolean; isLoggedIn: boolean }) {
  return (
    <div className="relative group rounded-2xl" style={{ background: 'white', border: '1px solid #eef0f3', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      <Link
        href={`/universities/${uni.slug}`}
        className="block rounded-2xl p-6 transition-all hover:shadow-md"
      >
      <div className="flex items-start justify-between gap-4 mb-3">
        <h3 className="text-base text-navy leading-snug" style={{ fontWeight: 300 }}>{uni.name}</h3>
        <svg className="w-4 h-4 flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#0c4d86' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        {uni.city && (
          <span className="text-xs" style={{ color: 'rgba(24,24,49,0.45)', fontWeight: 300 }}>{uni.city}</span>
        )}
        {uni.city && uni.type && <span style={{ color: '#e4ebf3' }}>·</span>}
        {uni.type && (
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{
              background: uni.type === 'Public' ? 'rgba(12,77,134,0.08)' : 'rgba(81,231,76,0.1)',
              color: uni.type === 'Public' ? '#0c4d86' : '#181831',
              fontWeight: 300,
            }}
          >
            {uni.type}
          </span>
        )}
        {uni.tuition_range && (
          <>
            <span style={{ color: '#e4ebf3' }}>·</span>
            <span className="text-xs" style={{ color: 'rgba(24,24,49,0.45)', fontWeight: 300 }}>{uni.tuition_range}</span>
          </>
        )}
      </div>

      {uni.ranking_summary && (
        <p className="text-xs mb-3" style={{ color: 'rgba(24,24,49,0.5)', fontWeight: 300 }}>{uni.ranking_summary}</p>
      )}

      {uni.tags && uni.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {uni.tags.slice(0, 4).map(tag => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: '#f0f2f5', color: 'rgba(24,24,49,0.55)', fontWeight: 300 }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      </Link>
      <div style={{ position: 'absolute', top: 12, right: 12 }}>
        <FavouriteButton slug={uni.slug} initialFavourited={isFavourited} isLoggedIn={isLoggedIn} size="sm" />
      </div>
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

const TABS = ['Overview', 'Universities', 'Finance', 'Career', 'Lifestyle'] as const
type Tab = typeof TABS[number]

const FIELD_TAGS: Record<string, string[]> = {
  Business:    ['business', 'economics', 'finance', 'management'],
  Engineering: ['engineering'],
  Medicine:    ['medicine'],
  Law:         ['law'],
  Sciences:    ['sciences'],
  Humanities:  ['humanities', 'political science'],
}

export default function CountryPageClient({ country, gated, gatedDocs, gatedScholarships, hasCountryPackage, hasScholarshipPackage, hasDocumentsPackage, universities, favouritedSlugs = [], isLoggedIn = false }: Props) {
  const favSet = useMemo(() => new Set(favouritedSlugs), [favouritedSlugs])
  const [activeTab, setActiveTab] = useState<Tab>('Overview')

  // University filters
  const [typeFilter, setTypeFilter]   = useState<'All' | 'Public' | 'Private'>('All')
  const [cityFilter, setCityFilter]   = useState<string>('All')
  const [levelFilter, setLevelFilter] = useState<'All' | 'Bachelor' | 'Master' | 'Doctorate'>('All')
  const [fieldFilter, setFieldFilter] = useState<string>('All')

  const cities = useMemo(() => {
    const set = new Set(universities.map(u => u.city).filter(Boolean) as string[])
    return ['All', ...Array.from(set).sort()]
  }, [universities])

  const filtered = useMemo(() => universities.filter(u => {
    if (typeFilter !== 'All' && u.type !== typeFilter) return false
    if (cityFilter !== 'All' && u.city !== cityFilter) return false
    if (levelFilter === 'Bachelor' && !u.tags?.includes('bachelor')) return false
    if (levelFilter === 'Master' && !u.tags?.includes('master')) return false
    if (levelFilter === 'Doctorate' && !u.tags?.includes('doctorate')) return false
    if (fieldFilter !== 'All') {
      const matchTags = FIELD_TAGS[fieldFilter] ?? []
      if (!u.tags?.some(t => matchTags.includes(t.toLowerCase()))) return false
    }
    return true
  }), [universities, typeFilter, cityFilter, levelFilter, fieldFilter])

  return (
    <main style={{ background: '#f0f2f5', minHeight: '100vh' }}>

      {/* ─── HERO ────────────────────────────────────────────────────────────── */}
      <div className="bg-white">
        <div className="max-w-[90%] mx-auto pt-10 pb-8">
          <Link
            href="/countries"
            className="inline-flex items-center gap-1.5 text-xs mb-8 transition-opacity hover:opacity-70"
            style={{ color: 'rgba(24,24,49,0.4)', fontWeight: 300 }}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            All countries
          </Link>

          <h1
            className="mb-2"
            style={{ color: '#181831', fontWeight: 200, fontSize: 'clamp(36px, 5vw, 64px)', lineHeight: 1.1, letterSpacing: '-0.02em' }}
          >
            {country.name}
          </h1>
          {country.tagline && (
            <p className="text-base max-w-xl" style={{ color: 'rgba(24,24,49,0.5)', fontWeight: 300 }}>
              {country.tagline}
            </p>
          )}
        </div>

        {/* Quick stats */}
        {(country.tuition_range_public || country.tuition_range_private || country.cost_of_living_range) && (
          <div className="max-w-[90%] mx-auto pb-8 flex flex-wrap gap-3">
            {country.tuition_range_public && <StatCard label="Public tuition / year" value={country.tuition_range_public} />}
            {country.tuition_range_private && <StatCard label="Private tuition / year" value={country.tuition_range_private} />}
            {country.cost_of_living_range && <StatCard label="Living costs / month" value={country.cost_of_living_range} />}
          </div>
        )}
      </div>

      {/* ─── STICKY TABS ─────────────────────────────────────────────────────── */}
      <div
        className="bg-white sticky z-40"
        style={{ top: 64, borderBottom: '1px solid #e4ebf3' }}
      >
        <div className="max-w-[90%] mx-auto flex items-center gap-1 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-4 py-4 text-sm whitespace-nowrap transition-all relative flex-shrink-0"
              style={{
                color: activeTab === tab ? '#181831' : 'rgba(24,24,49,0.4)',
                fontWeight: activeTab === tab ? 400 : 300,
                borderBottom: activeTab === tab ? '2px solid #181831' : '2px solid transparent',
                marginBottom: -1,
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ─── TAB CONTENT ─────────────────────────────────────────────────────── */}
      <div className="max-w-[90%] mx-auto py-10 sm:py-14">

        {/* OVERVIEW ─────────────────────────────────────────────────────────── */}
        {activeTab === 'Overview' && (
          <div className="space-y-8">
            {/* FREE */}
            {country.overview_free && (
              <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-sm">
                <SectionLabel text="Overview" />
                <p className="text-sm sm:text-base leading-relaxed max-w-3xl" style={{ color: 'rgba(24,24,49,0.65)', fontWeight: 300 }}>
                  {country.overview_free}
                </p>
              </div>
            )}
            {/* GATED */}
            {hasCountryPackage && gated?.why_this_country ? (
              <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-sm">
                <SectionLabel text="Why this country" />
                <h2 className="text-xl sm:text-2xl text-navy mb-4" style={{ fontWeight: 300 }}>
                  Why study in {country.name}?
                </h2>
                <p className="text-sm leading-relaxed max-w-3xl" style={{ color: 'rgba(24,24,49,0.65)', fontWeight: 300 }}>
                  {gated.why_this_country}
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <TeaserLock title={`Why study in ${country.name}?`} countryName={country.name} countrySlug={country.slug} />
              </div>
            )}
          </div>
        )}

        {/* LIFESTYLE ────────────────────────────────────────────────────────── */}
        {activeTab === 'Lifestyle' && (
          <div className="space-y-8">
            {/* FREE */}
            <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-sm">
              <SectionLabel text="Student life" />
              <h2 className="text-xl sm:text-2xl text-navy mb-3" style={{ fontWeight: 300 }}>
                Living in {country.name}
              </h2>
              <p className="text-sm leading-relaxed max-w-3xl" style={{ color: 'rgba(24,24,49,0.55)', fontWeight: 300 }}>
                {country.tagline ?? `Discover what life as a student in ${country.name} is really like.`}
              </p>
            </div>
            {/* GATED — Country Guide */}
            {hasCountryPackage && gated ? (
              <>
                {gated.lifestyle && (
                  <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-sm">
                    <SectionLabel text="Lifestyle" />
                    <p className="text-sm leading-relaxed max-w-3xl" style={{ color: 'rgba(24,24,49,0.65)', fontWeight: 300 }}>
                      {gated.lifestyle}
                    </p>
                  </div>
                )}
                {gated.housing_overview && (
                  <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-sm">
                    <SectionLabel text="Housing" />
                    <p className="text-sm leading-relaxed max-w-3xl" style={{ color: 'rgba(24,24,49,0.65)', fontWeight: 300 }}>
                      {gated.housing_overview}
                    </p>
                  </div>
                )}
                {gated.city_guide && gated.city_guide.length > 0 && (
                  <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-sm">
                    <SectionLabel text="City guide" />
                    <h2 className="text-xl sm:text-2xl text-navy mb-6" style={{ fontWeight: 300 }}>
                      Where to study in {country.name}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {gated.city_guide.map((c, i) => (
                        <div key={i} className="rounded-xl p-5" style={{ border: '1px solid #eef0f3', background: '#fafafa' }}>
                          <h3 className="text-base text-navy mb-1.5" style={{ fontWeight: 300 }}>{c.city}</h3>
                          {c.best_for && (
                            <span className="text-xs px-2 py-0.5 rounded-full inline-block mb-3" style={{ background: 'rgba(81,231,76,0.1)', color: '#181831', fontWeight: 300 }}>
                              Best for: {c.best_for}
                            </span>
                          )}
                          {c.description && (
                            <p className="text-sm leading-relaxed" style={{ color: 'rgba(24,24,49,0.55)', fontWeight: 300 }}>{c.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <TeaserLock title="Lifestyle, Housing & City Guide" countryName={country.name} countrySlug={country.slug} />
              </div>
            )}

            {/* GATED — Documents Guide */}
            {hasDocumentsPackage && gatedDocs ? (
              <div className="space-y-6">
                {gatedDocs.visa_process && (
                  <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-sm">
                    <SectionLabel text="Visa process" />
                    <p className="text-sm leading-relaxed max-w-3xl" style={{ color: 'rgba(24,24,49,0.65)', fontWeight: 300 }}>{gatedDocs.visa_process}</p>
                  </div>
                )}
                {gatedDocs.moving_guide && (
                  <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-sm">
                    <SectionLabel text="Moving guide" />
                    <p className="text-sm leading-relaxed max-w-3xl" style={{ color: 'rgba(24,24,49,0.65)', fontWeight: 300 }}>{gatedDocs.moving_guide}</p>
                  </div>
                )}
                {gatedDocs.bank_account_guide && (
                  <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-sm">
                    <SectionLabel text="Bank account setup" />
                    <p className="text-sm leading-relaxed max-w-3xl" style={{ color: 'rgba(24,24,49,0.65)', fontWeight: 300 }}>{gatedDocs.bank_account_guide}</p>
                  </div>
                )}
                {gatedDocs.arrival_tips && (
                  <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-sm">
                    <SectionLabel text="Arrival tips" />
                    <p className="text-sm leading-relaxed max-w-3xl" style={{ color: 'rgba(24,24,49,0.65)', fontWeight: 300 }}>{gatedDocs.arrival_tips}</p>
                  </div>
                )}
              </div>
            ) : !hasDocumentsPackage ? (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <TeaserLock title="Visa, Relocation & Arrival Guide" countryName={country.name} countrySlug={country.slug} packageType="documents" />
              </div>
            ) : null}
          </div>
        )}

        {/* FINANCE ──────────────────────────────────────────────────────────── */}
        {activeTab === 'Finance' && (
          <div className="space-y-8">
            {/* FREE — cost breakdown always visible */}
            {(country.tuition_range_public || country.tuition_range_private || country.cost_of_living_range) && (
              <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-sm">
                <SectionLabel text="Cost breakdown" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                  {country.tuition_range_public && (
                    <div className="rounded-xl p-5" style={{ border: '1px solid #eef0f3', background: '#fafafa' }}>
                      <p className="text-xs mb-2" style={{ color: 'rgba(24,24,49,0.4)', fontWeight: 300 }}>Public university</p>
                      <p className="text-base text-navy" style={{ fontWeight: 400 }}>{country.tuition_range_public}</p>
                      <p className="text-xs mt-1" style={{ color: 'rgba(24,24,49,0.4)', fontWeight: 300 }}>per year</p>
                    </div>
                  )}
                  {country.tuition_range_private && (
                    <div className="rounded-xl p-5" style={{ border: '1px solid #eef0f3', background: '#fafafa' }}>
                      <p className="text-xs mb-2" style={{ color: 'rgba(24,24,49,0.4)', fontWeight: 300 }}>Private university</p>
                      <p className="text-base text-navy" style={{ fontWeight: 400 }}>{country.tuition_range_private}</p>
                      <p className="text-xs mt-1" style={{ color: 'rgba(24,24,49,0.4)', fontWeight: 300 }}>per year</p>
                    </div>
                  )}
                  {country.cost_of_living_range && (
                    <div className="rounded-xl p-5" style={{ border: '1px solid #eef0f3', background: '#fafafa' }}>
                      <p className="text-xs mb-2" style={{ color: 'rgba(24,24,49,0.4)', fontWeight: 300 }}>Living costs</p>
                      <p className="text-base text-navy" style={{ fontWeight: 400 }}>{country.cost_of_living_range}</p>
                      <p className="text-xs mt-1" style={{ color: 'rgba(24,24,49,0.4)', fontWeight: 300 }}>per month</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            {/* GATED — Country Guide */}
            {hasCountryPackage && gated ? (
              <>
                {gated.finance && (
                  <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-sm">
                    <SectionLabel text="Finances" />
                    <p className="text-sm leading-relaxed max-w-3xl" style={{ color: 'rgba(24,24,49,0.65)', fontWeight: 300 }}>
                      {gated.finance}
                    </p>
                  </div>
                )}
                {gated.scholarship_overview && (
                  <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-sm">
                    <SectionLabel text="Scholarship overview" />
                    <p className="text-sm leading-relaxed max-w-3xl" style={{ color: 'rgba(24,24,49,0.65)', fontWeight: 300 }}>
                      {gated.scholarship_overview}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <TeaserLock title="Finance & Scholarship Overview" countryName={country.name} countrySlug={country.slug} />
              </div>
            )}

            {/* GATED — Scholarship Guide */}
            {hasScholarshipPackage && gatedScholarships.length > 0 ? (
              <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-sm">
                <SectionLabel text="Available scholarships" />
                <h2 className="text-xl sm:text-2xl text-navy mb-6" style={{ fontWeight: 300 }}>
                  Scholarships in {country.name}
                </h2>
                <div className="space-y-4">
                  {gatedScholarships.map(s => (
                    <div key={s.id} className="rounded-xl p-5 flex items-start justify-between gap-4" style={{ border: '1px solid #eef0f3', background: '#fafafa' }}>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-navy mb-1" style={{ fontWeight: 300 }}>{s.name}</p>
                        {s.eligibility && (
                          <p className="text-xs leading-relaxed mb-2" style={{ color: 'rgba(24,24,49,0.5)', fontWeight: 300 }}>{s.eligibility}</p>
                        )}
                        <div className="flex flex-wrap gap-2">
                          {s.amount && (
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(12,77,134,0.07)', color: '#0c4d86', fontWeight: 300 }}>{s.amount}</span>
                          )}
                          {s.deadline && (
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#f0f2f5', color: 'rgba(24,24,49,0.5)', fontWeight: 300 }}>Deadline: {s.deadline}</span>
                          )}
                        </div>
                      </div>
                      <Link href={`/services/scholarship/${s.id}`} className="text-xs flex-shrink-0 hover:opacity-70 transition" style={{ color: '#0c4d86', fontWeight: 300 }}>
                        View guide →
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            ) : !hasScholarshipPackage ? (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <TeaserLock title="Scholarship Guides" countryName={country.name} countrySlug={country.slug} packageType="scholarship" />
              </div>
            ) : null}
          </div>
        )}

        {/* CAREER ───────────────────────────────────────────────────────────── */}
        {activeTab === 'Career' && (
          <div className="space-y-8">
            {/* FREE */}
            <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-sm">
              <SectionLabel text="Career prospects" />
              <h2 className="text-xl sm:text-2xl text-navy mb-3" style={{ fontWeight: 300 }}>
                Working after studying in {country.name}
              </h2>
              <p className="text-sm leading-relaxed max-w-3xl" style={{ color: 'rgba(24,24,49,0.55)', fontWeight: 300 }}>
                Understand the job market, industries, and graduate opportunities available to international students after completing a degree in {country.name}.
              </p>
            </div>
            {/* GATED */}
            {hasCountryPackage && gated?.career ? (
              <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-sm">
                <SectionLabel text="In depth" />
                <p className="text-sm leading-relaxed max-w-3xl" style={{ color: 'rgba(24,24,49,0.65)', fontWeight: 300 }}>
                  {gated.career}
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <TeaserLock title="Career Prospects" countryName={country.name} countrySlug={country.slug} />
              </div>
            )}
          </div>
        )}

        {/* UNIVERSITIES ─────────────────────────────────────────────────────── */}
        {activeTab === 'Universities' && (
          <div>
            {/* Filters */}
            <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
              <p className="text-xs uppercase tracking-widest mb-4" style={{ color: 'rgba(24,24,49,0.35)', fontWeight: 300 }}>Filter universities</p>
              <div className="flex flex-col gap-4">

                {/* Type */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs w-20 flex-shrink-0" style={{ color: 'rgba(24,24,49,0.4)', fontWeight: 300 }}>Type</span>
                  <div className="flex flex-wrap gap-2">
                    {(['All', 'Public', 'Private'] as const).map(v => (
                      <Pill key={v} active={typeFilter === v} onClick={() => setTypeFilter(v)}>{v}</Pill>
                    ))}
                  </div>
                </div>

                {/* Has English programs */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs w-20 flex-shrink-0" style={{ color: 'rgba(24,24,49,0.4)', fontWeight: 300 }}>English</span>
                  <div className="flex flex-wrap gap-2">
                    {(['All', 'Bachelor', 'Master', 'Doctorate'] as const).map(v => (
                      <Pill key={v} active={levelFilter === v} onClick={() => setLevelFilter(v)}>{v}</Pill>
                    ))}
                  </div>
                </div>

                {/* Field */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs w-20 flex-shrink-0" style={{ color: 'rgba(24,24,49,0.4)', fontWeight: 300 }}>Field</span>
                  <div className="flex flex-wrap gap-2">
                    <Pill active={fieldFilter === 'All'} onClick={() => setFieldFilter('All')}>All</Pill>
                    {Object.keys(FIELD_TAGS).map(f => (
                      <Pill key={f} active={fieldFilter === f} onClick={() => setFieldFilter(f)}>{f}</Pill>
                    ))}
                  </div>
                </div>

                {/* City */}
                {cities.length > 2 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs w-20 flex-shrink-0" style={{ color: 'rgba(24,24,49,0.4)', fontWeight: 300 }}>City</span>
                    <div className="flex flex-wrap gap-2">
                      {cities.map(c => (
                        <Pill key={c} active={cityFilter === c} onClick={() => setCityFilter(c)}>{c}</Pill>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Results */}
            {filtered.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
                <p className="text-sm" style={{ color: 'rgba(24,24,49,0.4)', fontWeight: 300 }}>No universities match these filters.</p>
              </div>
            ) : (
              <div>
                <p className="text-xs mb-4" style={{ color: 'rgba(24,24,49,0.35)', fontWeight: 300 }}>
                  {filtered.length} {filtered.length === 1 ? 'university' : 'universities'}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filtered.map(uni => <UniCard key={uni.slug} uni={uni} isFavourited={favSet.has(uni.slug)} isLoggedIn={isLoggedIn} />)}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  )
}
