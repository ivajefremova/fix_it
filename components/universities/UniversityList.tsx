'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

type University = {
  slug: string
  name: string
  country: string
  country_slug: string
  city: string | null
  type: string | null
  quick_summary: string | null
  tuition_range: string | null
  tags: string[] | null
  ranking_summary: string | null
  subject_rankings: Record<string, number>
  has_scholarship: boolean
}

const FIELD_TAGS: Record<string, string[]> = {
  Business:    ['business', 'economics', 'finance', 'management'],
  Engineering: ['engineering'],
  Medicine:    ['medicine'],
  Law:         ['law'],
  Sciences:    ['sciences'],
  Humanities:  ['humanities', 'political science'],
}

const FIELD_RANKING_KEY: Record<string, string> = {
  Business:    'business',
  Engineering: 'engineering',
  Medicine:    'medicine',
  Law:         'law',
  Sciences:    'sciences',
  Humanities:  'humanities',
}

// ─── Full card — used in filtered grid view ────────────────────────────────────

function UniversityCard({ u, rankingLabel }: { u: University; rankingLabel?: string }) {
  return (
    <Link href={`/universities/${u.slug}`} className="block group">
      <div
        className="bg-white rounded-2xl p-6 h-full flex flex-col transition-all duration-300 group-hover:shadow-md"
        style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)' }}
      >
        <div className="flex items-center justify-between gap-2 mb-4">
          <p className="text-xs" style={{ color: 'rgba(24,24,49,0.4)', fontWeight: 300 }}>
            {[u.city, u.country].filter(Boolean).join(' · ')}
          </p>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {rankingLabel && (
              <span
                className="text-xs px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(12,77,134,0.07)', color: '#0c4d86', fontWeight: 300 }}
              >
                {rankingLabel}
              </span>
            )}
            {u.type && (
              <span
                className="text-xs px-2.5 py-1 rounded-full"
                style={{
                  background: u.type === 'Public' ? 'rgba(12,77,134,0.07)' : 'rgba(81,231,76,0.1)',
                  color: u.type === 'Public' ? '#0c4d86' : '#181831',
                  fontWeight: 300,
                }}
              >
                {u.type}
              </span>
            )}
          </div>
        </div>
        <h2 className="text-base text-navy mb-1.5 leading-snug" style={{ fontWeight: 300 }}>{u.name}</h2>
        {u.quick_summary && (
          <p className="text-xs mb-4" style={{ color: '#0c4d86', fontWeight: 300 }}>{u.quick_summary}</p>
        )}
        {u.tags && u.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {u.tags.filter(t => !['english','bachelor','master','doctorate'].includes(t)).slice(0, 4).map(tag => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#f0f2f5', color: 'rgba(24,24,49,0.5)', fontWeight: 300 }}>
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="mt-auto pt-4 flex items-center justify-between" style={{ borderTop: '1px solid #f0f2f5' }}>
          {u.tuition_range
            ? <p className="text-xs text-navy" style={{ fontWeight: 400 }}>{u.tuition_range}</p>
            : <span />
          }
          <span className="flex items-center gap-1 text-xs transition-all duration-200 group-hover:gap-2" style={{ color: '#0c4d86', fontWeight: 300 }}>
            View guide
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  )
}

// ─── Compact row — used in tabbed country view ─────────────────────────────────

function UniversityRow({ u }: { u: University }) {
  return (
    <Link href={`/universities/${u.slug}`} className="block group">
      <div
        className="flex items-center gap-4 px-5 py-4 rounded-xl transition-all hover:bg-gray-50"
        style={{ borderBottom: '1px solid #f4f5f7' }}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <h3 className="text-sm text-navy" style={{ fontWeight: 300 }}>{u.name}</h3>
            {u.type && (
              <span
                className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                style={{
                  background: u.type === 'Public' ? 'rgba(12,77,134,0.08)' : 'rgba(81,231,76,0.1)',
                  color: u.type === 'Public' ? '#0c4d86' : '#181831',
                  fontWeight: 300,
                }}
              >
                {u.type}
              </span>
            )}
            {u.has_scholarship && (
              <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: 'rgba(81,231,76,0.12)', color: '#181831', fontWeight: 300 }}>
                Scholarship
              </span>
            )}
          </div>
          <p className="text-xs" style={{ color: 'rgba(24,24,49,0.4)', fontWeight: 300 }}>
            {[u.city, u.quick_summary].filter(Boolean).join(' · ')}
          </p>
        </div>
        <svg className="w-3.5 h-3.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#0c4d86' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </div>
    </Link>
  )
}

type Props = {
  universities: University[]
  initialField?: string
  initialCountry?: string
  initialLevel?: string
  initialType?: string
  initialScholarship?: boolean
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function UniversityList({
  universities,
  initialField,
  initialCountry,
  initialLevel,
  initialType,
  initialScholarship,
}: Props) {
  const [search, setSearch]                     = useState('')
  const [typeFilter, setTypeFilter]             = useState(initialType ?? 'all')
  const [fieldFilter, setFieldFilter]           = useState(initialField ?? 'All')
  const [levelFilter, setLevelFilter]           = useState(initialLevel ? initialLevel.charAt(0).toUpperCase() + initialLevel.slice(1) : 'All')
  const [countryFilter, setCountryFilter]       = useState(initialCountry ?? 'all')
  const [scholarshipFilter, setScholarship]     = useState(initialScholarship ?? false)
  const [activeCountryIdx, setActiveCountryIdx] = useState(0)

  // Group by country for tabbed view
  const byCountry = useMemo(() => {
    const map = new Map<string, { name: string; slug: string; unis: University[] }>()
    for (const u of universities) {
      if (!map.has(u.country_slug)) map.set(u.country_slug, { name: u.country, slug: u.country_slug, unis: [] })
      map.get(u.country_slug)!.unis.push(u)
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [universities])

  const isFiltered = search !== '' || typeFilter !== 'all' || fieldFilter !== 'All' || scholarshipFilter || countryFilter !== 'all' || levelFilter !== 'All'

  const filtered = useMemo(() => {
    if (!isFiltered) return []
    const results = universities.filter(u => {
      const q = search.toLowerCase()
      if (q && !u.name.toLowerCase().includes(q) && !u.city?.toLowerCase().includes(q) && !u.tags?.some(t => t.includes(q))) return false
      if (countryFilter !== 'all' && u.country_slug !== countryFilter) return false
      if (typeFilter !== 'all' && u.type !== typeFilter) return false
      if (fieldFilter !== 'All') {
        const matchTags = FIELD_TAGS[fieldFilter] ?? []
        if (!u.tags?.some(t => matchTags.includes(t.toLowerCase()))) return false
      }
      if (levelFilter !== 'All' && !u.tags?.includes(levelFilter.toLowerCase())) return false
      if (scholarshipFilter && !u.has_scholarship) return false
      return true
    })
    if (fieldFilter !== 'All') {
      const key = FIELD_RANKING_KEY[fieldFilter]
      results.sort((a, b) => {
        const ra = a.subject_rankings[key] ?? Infinity
        const rb = b.subject_rankings[key] ?? Infinity
        return ra - rb
      })
    }
    return results
  }, [universities, search, typeFilter, fieldFilter, levelFilter, countryFilter, scholarshipFilter, isFiltered])

  const activeCountry = byCountry[Math.min(activeCountryIdx, byCountry.length - 1)]

  return (
    <div>
      {/* ─── FILTER BAR ─────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 mb-6" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>

        {/* Search */}
        <div className="relative mb-4">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'rgba(24,24,49,0.3)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, city or field..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-navy placeholder-gray-300 focus:outline-none transition"
            style={{ background: '#f8f9fb', border: '1px solid #eef0f3', fontWeight: 300 }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Country dropdown */}
          <select
            value={countryFilter}
            onChange={e => setCountryFilter(e.target.value)}
            className="rounded-xl px-3 py-2 text-xs outline-none transition"
            style={{
              border: '1px solid #eef0f3',
              background: countryFilter !== 'all' ? '#181831' : '#f0f2f5',
              color: countryFilter !== 'all' ? '#fff' : 'rgba(24,24,49,0.6)',
              fontWeight: 300,
              fontFamily: 'inherit',
            }}
          >
            <option value="all">All countries</option>
            {byCountry.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>

          {/* Field dropdown */}
          <select
            value={fieldFilter}
            onChange={e => setFieldFilter(e.target.value)}
            className="rounded-xl px-3 py-2 text-xs outline-none transition"
            style={{
              border: '1px solid #eef0f3',
              background: fieldFilter !== 'All' ? '#181831' : '#f0f2f5',
              color: fieldFilter !== 'All' ? '#fff' : 'rgba(24,24,49,0.6)',
              fontWeight: 300,
              fontFamily: 'inherit',
            }}
          >
            <option value="All">All fields</option>
            {Object.keys(FIELD_TAGS).map(f => <option key={f} value={f}>{f}</option>)}
          </select>

          {/* Level pills */}
          <div className="flex gap-2">
            {(['All', 'Bachelor', 'Master', 'Doctorate'] as const).map(l => (
              <button
                key={l}
                onClick={() => setLevelFilter(l)}
                className="text-xs px-3.5 py-1.5 rounded-full transition-all"
                style={{
                  background: levelFilter === l ? '#181831' : '#f0f2f5',
                  color: levelFilter === l ? '#fff' : 'rgba(24,24,49,0.6)',
                  fontWeight: levelFilter === l ? 400 : 300,
                }}
              >
                {l === 'All' ? 'All levels' : l}
              </button>
            ))}
          </div>

          {/* Type pills */}
          <div className="flex gap-2">
            {(['all', 'Public', 'Private'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className="text-xs px-3.5 py-1.5 rounded-full transition-all"
                style={{
                  background: typeFilter === t ? '#181831' : '#f0f2f5',
                  color: typeFilter === t ? '#fff' : 'rgba(24,24,49,0.6)',
                  fontWeight: typeFilter === t ? 400 : 300,
                }}
              >
                {t === 'all' ? 'All types' : t}
              </button>
            ))}
          </div>

          {/* Scholarship toggle */}
          <button
            onClick={() => setScholarship(p => !p)}
            className="text-xs px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5"
            style={{
              background: scholarshipFilter ? '#51e74c' : '#f0f2f5',
              color: scholarshipFilter ? '#181831' : 'rgba(24,24,49,0.6)',
              fontWeight: scholarshipFilter ? 400 : 300,
            }}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675" />
            </svg>
            Has scholarship
          </button>
        </div>
      </div>

      {/* ─── FILTERED GRID ──────────────────────────────────────────────────── */}
      {isFiltered && (
        <>
          <p className="text-xs mb-5" style={{ color: 'rgba(24,24,49,0.4)', fontWeight: 300 }}>
            {filtered.length} {filtered.length === 1 ? 'university' : 'universities'}
          </p>
          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl p-16 text-center" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <p className="text-sm" style={{ color: 'rgba(24,24,49,0.4)', fontWeight: 300 }}>No universities match your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(u => {
                const key = fieldFilter !== 'All' ? FIELD_RANKING_KEY[fieldFilter] : null
                const rank = key ? u.subject_rankings[key] : undefined
                const rankingLabel = rank ? `#${rank} QS ${fieldFilter}` : undefined
                return <UniversityCard key={u.slug} u={u} rankingLabel={rankingLabel} />
              })}
            </div>
          )}
        </>
      )}

      {/* ─── COUNTRY TABS + VERTICAL LIST (no filters) ──────────────────────── */}
      {!isFiltered && activeCountry && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ border: '1px solid #eef0f3' }}>
          {/* Country tabs */}
          <div
            className="flex gap-0 overflow-x-auto"
            style={{ scrollbarWidth: 'none', borderBottom: '1px solid #eef0f3' }}
          >
            {byCountry.map((c, i) => (
              <button
                key={c.slug}
                onClick={() => setActiveCountryIdx(i)}
                className="flex-shrink-0 px-5 py-3.5 text-sm transition-all relative"
                style={{
                  color: i === activeCountryIdx ? '#181831' : 'rgba(24,24,49,0.4)',
                  fontWeight: i === activeCountryIdx ? 400 : 300,
                  background: i === activeCountryIdx ? 'white' : '#fafafa',
                  borderRight: '1px solid #eef0f3',
                }}
              >
                {c.name}
                <span
                  className="absolute bottom-0 left-0 right-0 transition-all duration-200"
                  style={{ height: '2px', background: '#51e74c', opacity: i === activeCountryIdx ? 1 : 0 }}
                />
              </button>
            ))}
          </div>

          {/* Scrollable university list */}
          <div className="relative">
            <p className="px-5 pt-4 pb-2 text-xs" style={{ color: 'rgba(24,24,49,0.35)', fontWeight: 300 }}>
              {activeCountry.unis.length} {activeCountry.unis.length === 1 ? 'university' : 'universities'}
            </p>
            <div
              className="overflow-y-auto"
              style={{ maxHeight: '440px', scrollbarWidth: 'thin', scrollbarColor: '#e4ebf3 transparent' }}
            >
              {activeCountry.unis.map(u => <UniversityRow key={u.slug} u={u} />)}
            </div>
            {activeCountry.unis.length > 5 && (
              <div
                className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none"
                style={{ background: 'linear-gradient(to bottom, transparent, white)' }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
