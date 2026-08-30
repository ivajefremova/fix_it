'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import FavouriteButton from './FavouriteButton'

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
  hero_image_url: string | null
  qs_rank: number | null
  shanghai_rank: number | null
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

// ─── University card ───────────────────────────────────────────────────────────

function UniversityCard({ u, rankLabel, isFavourited, isLoggedIn }: { u: University; rankLabel?: string; isFavourited: boolean; isLoggedIn: boolean }) {
  return (
    <div className="relative group">
      <Link href={`/universities/${u.slug}`} className="block h-full">
        <div
          className="bg-white rounded-2xl overflow-hidden flex flex-col transition-all duration-300 group-hover:shadow-md"
          style={{
            boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)',
            height: '300px',
          }}
        >
          {/* Image */}
          <div className="flex-shrink-0 overflow-hidden relative" style={{ height: '180px', background: '#e8ecf1' }}>
            {u.hero_image_url ? (
              <img
                src={u.hero_image_url}
                alt={u.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, #dde3ec 0%, #c8d2de 100%)' }} />
            )}
            {rankLabel && (
              <div
                className="absolute bottom-3 left-3"
                style={{
                  background: 'rgba(24,24,49,0.72)', backdropFilter: 'blur(6px)',
                  borderRadius: 8, padding: '4px 10px',
                  fontSize: 11, fontWeight: 400, color: '#fff', fontFamily: 'inherit',
                }}
              >
                {rankLabel}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col flex-1 px-5 py-4">
            <h2 className="leading-snug mb-1" style={{ fontSize: 15, fontWeight: 400, color: '#181831' }}>
              {u.name}
            </h2>
            <p style={{ fontSize: 13, color: 'rgba(24,24,49,0.72)', fontWeight: 400 }}>
              {[u.city, u.country].filter(Boolean).join(', ')}
            </p>
            <div className="mt-auto flex items-center gap-1 transition-all duration-200 group-hover:gap-2" style={{ fontSize: 13, color: '#0c4d86', fontWeight: 400 }}>
              View university
              <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </div>
          </div>
        </div>
      </Link>
      <div style={{ position: 'absolute', top: 10, right: 10 }}>
        <FavouriteButton slug={u.slug} initialFavourited={isFavourited} isLoggedIn={isLoggedIn} size="sm" />
      </div>
    </div>
  )
}

type Props = {
  universities: University[]
  initialField?: string
  initialCountry?: string
  initialLevel?: string
  initialType?: string
  initialScholarship?: boolean
  favouritedSlugs?: string[]
  isLoggedIn?: boolean
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function UniversityList({
  universities,
  initialField,
  initialCountry,
  initialLevel,
  initialType,
  initialScholarship,
  favouritedSlugs = [],
  isLoggedIn = false,
}: Props) {
  const favSet = useMemo(() => new Set(favouritedSlugs), [favouritedSlugs])
  const [search, setSearch]                     = useState('')
  const [typeFilter, setTypeFilter]             = useState(initialType ?? 'all')
  const [fieldFilter, setFieldFilter]           = useState(initialField ?? 'All')
  const [levelFilter, setLevelFilter]           = useState(initialLevel ? initialLevel.charAt(0).toUpperCase() + initialLevel.slice(1) : 'All')
  const [countryFilter, setCountryFilter]       = useState(initialCountry ?? 'all')
  const [scholarshipFilter, setScholarship]     = useState(initialScholarship ?? false)
  const [sortBy, setSortBy]                     = useState<'default' | 'qs' | 'shanghai' | 'field'>('default')
  const [showAll, setShowAll]                   = useState(false)
  const [page, setPage]                         = useState(0)
  const PER_PAGE = 9

  useEffect(() => { setPage(0) }, [search, typeFilter, fieldFilter, levelFilter, countryFilter, scholarshipFilter, showAll])

  // Group by country for the Country dropdown options
  const byCountry = useMemo(() => {
    const map = new Map<string, { name: string; slug: string }>()
    for (const u of universities) {
      if (!map.has(u.country_slug)) map.set(u.country_slug, { name: u.country, slug: u.country_slug })
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [universities])

  const isFiltered = search !== '' || typeFilter !== 'all' || fieldFilter !== 'All' || scholarshipFilter || countryFilter !== 'all' || levelFilter !== 'All'

  const filtered = useMemo(() => {
    if (!isFiltered && !showAll) return []
    const results = universities.filter(u => {
      if (search) {
        const words = search.toLowerCase().split(/\s+/).filter(Boolean)
        const haystack = [u.name, u.city, u.country, u.quick_summary, u.ranking_summary, ...(u.tags ?? [])]
          .filter(Boolean).join(' ').toLowerCase()
        if (!words.every(w => haystack.includes(w))) return false
      }
      if (countryFilter !== 'all' && u.country_slug !== countryFilter) return false
      if (typeFilter !== 'all' && u.type !== typeFilter) return false
      if (fieldFilter !== 'All') {
        const matchTags = FIELD_TAGS[fieldFilter] ?? []
        if (!u.tags?.some(t => matchTags.includes(t.toLowerCase()))) return false
      }
      if (levelFilter !== 'All' && !u.tags?.map(t => t.toLowerCase()).includes(levelFilter.toLowerCase())) return false
      if (scholarshipFilter && !u.has_scholarship) return false
      return true
    })
    if (sortBy === 'qs') {
      results.sort((a, b) => (a.qs_rank ?? Infinity) - (b.qs_rank ?? Infinity))
    } else if (sortBy === 'shanghai') {
      results.sort((a, b) => (a.shanghai_rank ?? Infinity) - (b.shanghai_rank ?? Infinity))
    } else if (sortBy === 'field' && fieldFilter !== 'All') {
      const key = FIELD_RANKING_KEY[fieldFilter]
      results.sort((a, b) => (a.subject_rankings[key] ?? Infinity) - (b.subject_rankings[key] ?? Infinity))
    }
    return results
  }, [universities, search, typeFilter, fieldFilter, levelFilter, countryFilter, scholarshipFilter, isFiltered, showAll, sortBy])

  return (
    <div>
      {/* ─── FILTER BAR ─────────────────────────────────────────────────────── */}
      <div
        className="bg-white rounded-2xl p-6 sm:p-8 mb-6"
        style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #eef0f3', borderTop: '3px solid #51e74c' }}
      >
        <div className="flex flex-wrap gap-3 items-end">

          {/* Search */}
          <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
            <label className="text-xs uppercase tracking-widest" style={{ color: 'rgba(24,24,49,0.65)', fontWeight: 400 }}>Search</label>
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'rgba(24,24,49,0.82)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                placeholder="Name, city, field..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 focus:outline-none transition"
                style={{
                  fontSize: '15px', fontWeight: 400, fontFamily: 'inherit',
                  border: '1px solid #eef0f3', borderRadius: '12px',
                  padding: '12px 16px', paddingLeft: '40px',
                  background: search ? '#fff' : '#fff',
                  color: '#181831',
                }}
              />
            </div>
          </div>

          {/* Country */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-widest" style={{ color: 'rgba(24,24,49,0.65)', fontWeight: 400 }}>Country</label>
            <select
              value={countryFilter}
              onChange={e => setCountryFilter(e.target.value)}
              style={{
                fontSize: '15px', fontWeight: 400, fontFamily: 'inherit',
                border: `1px solid ${countryFilter !== 'all' ? '#181831' : '#eef0f3'}`,
                backgroundColor: countryFilter !== 'all' ? '#181831' : '#fff',
                color: countryFilter !== 'all' ? '#fff' : 'rgba(24,24,49,0.82)',
                borderRadius: '12px', padding: '12px 34px 12px 16px',
                outline: 'none', cursor: 'pointer', appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='${countryFilter !== 'all' ? 'white' : '%23999'}' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center',
                minWidth: '150px', transition: 'border-color 0.15s, background 0.15s',
              }}
            >
              <option value="all">All countries</option>
              {byCountry.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </select>
          </div>

          {/* Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-widest" style={{ color: 'rgba(24,24,49,0.65)', fontWeight: 400 }}>Field of study</label>
            <select
              value={fieldFilter}
              onChange={e => setFieldFilter(e.target.value)}
              style={{
                fontSize: '15px', fontWeight: 400, fontFamily: 'inherit',
                border: `1px solid ${fieldFilter !== 'All' ? '#181831' : '#eef0f3'}`,
                backgroundColor: fieldFilter !== 'All' ? '#181831' : '#fff',
                color: fieldFilter !== 'All' ? '#fff' : 'rgba(24,24,49,0.82)',
                borderRadius: '12px', padding: '12px 34px 12px 16px',
                outline: 'none', cursor: 'pointer', appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='${fieldFilter !== 'All' ? 'white' : '%23999'}' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center',
                minWidth: '150px', transition: 'border-color 0.15s, background 0.15s',
              }}
            >
              <option value="All">All fields</option>
              {Object.keys(FIELD_TAGS).map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          {/* Level */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-widest" style={{ color: 'rgba(24,24,49,0.65)', fontWeight: 400 }}>Level</label>
            <select
              value={levelFilter}
              onChange={e => setLevelFilter(e.target.value)}
              style={{
                fontSize: '15px', fontWeight: 400, fontFamily: 'inherit',
                border: `1px solid ${levelFilter !== 'All' ? '#181831' : '#eef0f3'}`,
                backgroundColor: levelFilter !== 'All' ? '#181831' : '#fff',
                color: levelFilter !== 'All' ? '#fff' : 'rgba(24,24,49,0.82)',
                borderRadius: '12px', padding: '12px 34px 12px 16px',
                outline: 'none', cursor: 'pointer', appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='${levelFilter !== 'All' ? 'white' : '%23999'}' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center',
                minWidth: '140px', transition: 'border-color 0.15s, background 0.15s',
              }}
            >
              <option value="All">All levels</option>
              <option value="Bachelor">Bachelor</option>
              <option value="Master">Master</option>
              <option value="Doctorate">Doctorate</option>
            </select>
          </div>

          {/* Type */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-widest" style={{ color: 'rgba(24,24,49,0.65)', fontWeight: 400 }}>Type</label>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              style={{
                fontSize: '15px', fontWeight: 400, fontFamily: 'inherit',
                border: `1px solid ${typeFilter !== 'all' ? '#181831' : '#eef0f3'}`,
                backgroundColor: typeFilter !== 'all' ? '#181831' : '#fff',
                color: typeFilter !== 'all' ? '#fff' : 'rgba(24,24,49,0.82)',
                borderRadius: '12px', padding: '12px 34px 12px 16px',
                outline: 'none', cursor: 'pointer', appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='${typeFilter !== 'all' ? 'white' : '%23999'}' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center',
                minWidth: '130px', transition: 'border-color 0.15s, background 0.15s',
              }}
            >
              <option value="all">All types</option>
              <option value="Public">Public</option>
              <option value="Private">Private</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-widest" style={{ color: 'rgba(24,24,49,0.65)', fontWeight: 400 }}>Sort by</label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as typeof sortBy)}
              style={{
                fontSize: '15px', fontWeight: 400, fontFamily: 'inherit',
                border: `1px solid ${sortBy !== 'default' ? '#181831' : '#eef0f3'}`,
                backgroundColor: sortBy !== 'default' ? '#181831' : '#fff',
                color: sortBy !== 'default' ? '#fff' : 'rgba(24,24,49,0.82)',
                borderRadius: '12px', padding: '12px 34px 12px 16px',
                outline: 'none', cursor: 'pointer', appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='${sortBy !== 'default' ? 'white' : '%23999'}' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center',
                minWidth: '170px', transition: 'border-color 0.15s, background 0.15s',
              }}
            >
              <option value="default">Default order</option>
              <option value="qs">QS World Ranking</option>
              <option value="shanghai">Shanghai Ranking</option>
              {fieldFilter !== 'All' && (
                <option value="field">QS {fieldFilter} Ranking</option>
              )}
            </select>
          </div>

          {/* Scholarship */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-widest" style={{ color: 'rgba(24,24,49,0.65)', fontWeight: 400 }}>Funding</label>
            <button
              onClick={() => setScholarship(p => !p)}
              className="flex items-center gap-1.5 transition-all duration-200"
              style={{
                fontSize: '15px', fontWeight: scholarshipFilter ? 400 : 300, fontFamily: 'inherit',
                padding: '12px 16px', borderRadius: '12px',
                background: scholarshipFilter ? '#51e74c' : '#fff',
                color: scholarshipFilter ? '#181831' : 'rgba(24,24,49,0.82)',
                border: `1px solid ${scholarshipFilter ? '#51e74c' : '#eef0f3'}`,
                cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675" />
              </svg>
              Has scholarship
            </button>
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
              View universities
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </div>

        </div>
      </div>

      {/* ─── FILTERED RESULTS ───────────────────────────────────────────────── */}
      {(isFiltered || showAll) && (() => {
        const totalPages = Math.ceil(filtered.length / PER_PAGE)
        const pageItems = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE)
        return (
          <>
            <p className="text-sm mb-5" style={{ color: 'rgba(24,24,49,0.7)', fontWeight: 400 }}>
              {filtered.length} {filtered.length === 1 ? 'university' : 'universities'} found
            </p>
            {filtered.length === 0 ? (
              <div className="bg-white rounded-2xl p-16 text-center" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <p className="text-sm" style={{ color: 'rgba(24,24,49,0.7)', fontWeight: 400 }}>No universities match your search.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pageItems.map(u => {
                    let rankLabel: string | undefined
                    if (sortBy === 'qs' && u.qs_rank) rankLabel = `#${u.qs_rank} QS`
                    else if (sortBy === 'shanghai' && u.shanghai_rank) rankLabel = `#${u.shanghai_rank} Shanghai`
                    else if (sortBy === 'field' && fieldFilter !== 'All') {
                      const key = FIELD_RANKING_KEY[fieldFilter]
                      const r = u.subject_rankings[key]
                      if (r) rankLabel = `#${r} QS ${fieldFilter}`
                    }
                    return <UniversityCard key={u.slug} u={u} rankLabel={rankLabel} isFavourited={favSet.has(u.slug)} isLoggedIn={isLoggedIn} />
                  })}
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
  )
}
