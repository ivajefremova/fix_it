'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import WishlistButton from './WishlistButton'
import HeroSheets from '@/components/ui/HeroSheets'
import ScholarshipTabs from '@/components/universities/ScholarshipTabs'

type Scholarship = {
  id: string
  country_slug: string
  country: string
  name: string
  description: string | null
  amount: string | null
  eligibility: string | null
  deadline: string | null
  university_slugs: string[]
  scholarship_type: string | null
  levels: string[] | null
}

type University = { slug: string; name: string }
type Purchase = { package_type: string; country_slug: string }

type Props = {
  scholarships: Scholarship[]
  universities: University[]
  purchases: Purchase[]
  isLoggedIn: boolean
  wishlistedIds?: string[]
}

const TYPE_LABELS: Record<string, string> = {
  'merit-based': 'Merit-based',
  'need-based':  'Need-based',
  'government':  'Government grant',
}

const CHEVRON = (color: string) =>
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='${encodeURIComponent(color)}' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`

// ─── Compact card (same dimensions as UniversityCard) ─────────────────────────

function ScholarshipCard({
  s,
  isSaved,
  isLoggedIn,
}: {
  s: Scholarship
  isSaved: boolean
  isLoggedIn: boolean
}) {
  return (
    <div className="relative group">
      <Link href={`/services/scholarship/${s.id}`} className="block h-full">
        <div
          className="bg-white rounded-2xl overflow-hidden flex flex-col transition-all duration-300 group-hover:shadow-md"
          style={{
            boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)',
            height: '300px',
          }}
        >
          {/* Top area */}
          <div
            className="flex-shrink-0 flex flex-col justify-end"
            style={{ height: '180px', background: '#ffffff', padding: '20px 20px 16px' }}
          >
            <p
              className="text-xs uppercase tracking-widest mb-2"
              style={{ color: 'rgba(24,24,49,0.5)', fontWeight: 400, fontFamily: 'inherit' }}
            >
              {TYPE_LABELS[s.scholarship_type ?? 'merit-based'] ?? s.scholarship_type}
            </p>
            <h2
              style={{
                fontSize: 15, fontWeight: 400, color: '#181831', lineHeight: 1.4,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                fontFamily: 'inherit',
              }}
            >
              {s.name}
            </h2>
          </div>

          {/* Bottom — minimal info */}
          <div className="flex flex-col flex-1 px-5 py-4">
            <p style={{ fontSize: 13, color: 'rgba(24,24,49,0.72)', fontWeight: 400, fontFamily: 'inherit' }}>
              {s.country}
            </p>
            <div
              className="mt-auto flex items-center gap-1 transition-all duration-200 group-hover:gap-2"
              style={{ fontSize: 13, color: '#0c4d86', fontWeight: 400 }}
            >
              View guide
              <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </div>
          </div>
        </div>
      </Link>

      {/* Wishlist button */}
      <div style={{ position: 'absolute', top: 10, right: 10 }}>
        <WishlistButton
          packageType="scholarship"
          countrySlug={s.id}
          country={s.country}
          initialSaved={isSaved}
          isLoggedIn={isLoggedIn}
        />
      </div>
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function ScholarshipBrowse({ scholarships, universities, isLoggedIn = false, wishlistedIds = [] }: Props) {
  const wishlistedSet = useMemo(() => new Set(wishlistedIds), [wishlistedIds])

  const uniBySlug = useMemo(() => {
    const m: Record<string, string> = {}
    for (const u of universities) m[u.slug] = u.name
    return m
  }, [universities])

  const countries = useMemo(() => {
    const seen = new Map<string, string>()
    for (const s of scholarships) seen.set(s.country_slug, s.country)
    return Array.from(seen.entries())
      .map(([slug, name]) => ({ slug, name }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [scholarships])

  const [country,    setCountry]    = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [level,      setLevel]      = useState('all')
  const [search,     setSearch]     = useState('')
  const [showAll,    setShowAll]    = useState(false)
  const [page,       setPage]       = useState(0)
  const PER_PAGE = 9

  useEffect(() => { setPage(0) }, [search, country, typeFilter, level, showAll])

  const isFiltered = search !== '' || country !== 'all' || typeFilter !== 'all' || level !== 'all'

  const filtered = useMemo(() => {
    if (!isFiltered && !showAll) return []
    return scholarships.filter(s => {
      if (country !== 'all' && s.country_slug !== country) return false
      if (typeFilter !== 'all' && s.scholarship_type !== typeFilter) return false
      if (level !== 'all' && !s.levels?.map(l => l.toLowerCase()).includes(level.toLowerCase())) return false
      if (search) {
        const words = search.toLowerCase().split(/\s+/).filter(Boolean)
        const uniNames = s.university_slugs.map(sl => uniBySlug[sl] ?? '').join(' ')
        const haystack = [s.name, s.description, s.country, s.eligibility, s.amount, uniNames]
          .filter(Boolean).join(' ').toLowerCase()
        if (!words.every(w => haystack.includes(w))) return false
      }
      return true
    })
  }, [scholarships, country, typeFilter, level, search, uniBySlug, isFiltered, showAll])

  const selectStyle = (active: boolean) => ({
    fontSize: '15px', fontWeight: 400, fontFamily: 'inherit',
    border: `1px solid ${active ? '#181831' : '#eef0f3'}`,
    backgroundColor: active ? '#181831' : '#fff',
    color: active ? '#fff' : 'rgba(24,24,49,0.82)',
    borderRadius: '12px', padding: '12px 34px 12px 16px',
    outline: 'none', cursor: 'pointer', appearance: 'none' as const,
    backgroundImage: CHEVRON(active ? 'white' : '#999'),
    backgroundRepeat: 'no-repeat' as const,
    backgroundPosition: 'right 12px center' as const,
    minWidth: '150px', transition: 'border-color 0.15s, background 0.15s',
  })

  return (
    <main style={{ background: '#f8f9fb', minHeight: '100vh' }}>

      {/* ─── HERO ───────────────────────────────────────────────────────────── */}
      <section
        className="bg-white border-b"
        style={{ borderColor: '#e4ebf3', minHeight: '560px', position: 'relative' }}
      >
        <div className="max-w-[90%] mx-auto flex items-center" style={{ minHeight: '560px' }}>
          <div className="flex-1 py-20 z-10 relative">
            <p className="text-xs uppercase tracking-widest mb-4 hero-text-in" style={{ color: '#51e74c' }}>Scholarship guides</p>
            <h1
              className="leading-tight mb-4 hero-text-in-2"
              style={{ color: '#181831', fontWeight: 400, fontSize: 'clamp(26px, 4vw, 46px)' }}
            >
              Find your scholarship.
            </h1>
            <p className="text-sm max-w-sm leading-relaxed hero-text-in-3" style={{ color: 'rgba(24,24,49,0.75)', fontWeight: 400 }}>
              Browse every scholarship available to Macedonian students studying in Europe. Filter by country, type and level — then get the guide written by students who actually received it.
            </p>
          </div>
          <HeroSheets />
        </div>
      </section>

      <div className="max-w-[90%] mx-auto py-10 sm:py-14">

        {/* ─── FILTERS ────────────────────────────────────────────────────────── */}
        <div
          className="bg-white rounded-2xl p-6 sm:p-8 mb-6"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #eef0f3', borderTop: '3px solid #51e74c' }}
        >
          <div className="flex flex-wrap gap-3 items-end">

            {/* Search */}
            <div className="flex flex-col gap-1.5 flex-1 min-w-[220px]">
              <label className="text-xs uppercase tracking-widest" style={{ color: 'rgba(24,24,49,0.65)', fontWeight: 400 }}>Search</label>
              <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'rgba(24,24,49,0.82)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                  type="text"
                  placeholder="Scholarship name, university, eligibility..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full focus:outline-none transition"
                  style={{
                    fontSize: '15px', fontWeight: 400, fontFamily: 'inherit',
                    border: '1px solid #eef0f3', borderRadius: '12px',
                    padding: '12px 16px', paddingLeft: '44px',
                    background: '#fff', color: '#181831',
                  }}
                />
              </div>
            </div>

            {/* Country */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-widest" style={{ color: 'rgba(24,24,49,0.65)', fontWeight: 400 }}>Country</label>
              <select
                value={country}
                onChange={e => setCountry(e.target.value)}
                style={selectStyle(country !== 'all')}
              >
                <option value="all">All countries</option>
                {countries.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
            </div>

            {/* Type */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-widest" style={{ color: 'rgba(24,24,49,0.65)', fontWeight: 400 }}>Type</label>
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                style={selectStyle(typeFilter !== 'all')}
              >
                <option value="all">All types</option>
                <option value="merit-based">Merit-based</option>
                <option value="need-based">Need-based</option>
                <option value="government">Government grant</option>
              </select>
            </div>

            {/* Level */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-widest" style={{ color: 'rgba(24,24,49,0.65)', fontWeight: 400 }}>Level</label>
              <select
                value={level}
                onChange={e => setLevel(e.target.value)}
                style={selectStyle(level !== 'all')}
              >
                <option value="all">All levels</option>
                <option value="bachelor">Bachelor</option>
                <option value="master">Master</option>
                <option value="doctorate">Doctorate</option>
              </select>
            </div>

            {/* View button */}
            <div className="flex flex-col gap-1.5 justify-end">
              <label className="text-xs uppercase tracking-widest invisible" style={{ fontWeight: 400 }}>View</label>
              <button
                onClick={() => setShowAll(true)}
                className="inline-flex items-center gap-2 hover:opacity-90 transition-opacity"
                style={{
                  background: '#51e74c', color: '#181831', fontWeight: 500,
                  fontSize: '15px', padding: '12px 20px', borderRadius: '12px',
                  whiteSpace: 'nowrap', cursor: 'pointer', border: 'none',
                }}
              >
                View scholarships
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </div>

          </div>
        </div>

        {/* ─── RESULTS ────────────────────────────────────────────────────────── */}
        {(isFiltered || showAll) && (() => {
          const totalPages = Math.ceil(filtered.length / PER_PAGE)
          const pageItems = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE)
          return (
            <>
              <p className="text-sm mb-5" style={{ color: 'rgba(24,24,49,0.7)', fontWeight: 400 }}>
                {filtered.length} {filtered.length === 1 ? 'scholarship' : 'scholarships'} found
              </p>
              {filtered.length === 0 ? (
                <div className="bg-white rounded-2xl p-16 text-center" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <p className="text-sm" style={{ color: 'rgba(24,24,49,0.7)', fontWeight: 400 }}>No scholarships match your filters.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pageItems.map(s => (
                      <ScholarshipCard
                        key={s.id}
                        s={s}
                        isSaved={wishlistedSet.has(s.id)}
                        isLoggedIn={isLoggedIn}
                      />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-3 mt-8">
                      <button
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0}
                        style={{
                          width: 38, height: 38, borderRadius: '50%', border: '1px solid #eef0f3',
                          background: page === 0 ? '#f8f9fb' : '#181831', color: page === 0 ? 'rgba(24,24,49,0.3)' : '#fff',
                          cursor: page === 0 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.2s',
                        }}
                      >
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                      </button>
                      <span style={{ fontSize: 13, color: 'rgba(24,24,49,0.7)', fontWeight: 400 }}>
                        {page + 1} of {totalPages}
                      </span>
                      <button
                        onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={page === totalPages - 1}
                        style={{
                          width: 38, height: 38, borderRadius: '50%', border: '1px solid #eef0f3',
                          background: page === totalPages - 1 ? '#f8f9fb' : '#181831', color: page === totalPages - 1 ? 'rgba(24,24,49,0.3)' : '#fff',
                          cursor: page === totalPages - 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.2s',
                        }}
                      >
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )
        })()}

      </div>

      {/* ─── SCHOLARSHIP GUIDE SECTION ─────────────────────────────────────── */}
      <section className="bg-white" style={{ borderTop: '1px solid #e4ebf3', minHeight: '100vh' }}>
        <div className="px-[4%] h-full" style={{ paddingTop: '10rem', paddingBottom: '7rem' }}>
          <ScholarshipTabs universities={universities} scholarships={scholarships} />
        </div>
      </section>

    </main>
  )
}
