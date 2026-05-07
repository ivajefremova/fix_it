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
}

function UniversityCard({ u }: { u: University }) {
  return (
    <Link href={`/universities/${u.slug}`} className="block group">
      <div
        className="bg-white rounded-2xl p-6 h-full flex flex-col transition-all duration-300 group-hover:shadow-md"
        style={{
          boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)',
        }}
      >
        {/* Top row — location + type badge */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <p className="text-xs" style={{ color: 'rgba(24,24,49,0.4)', fontWeight: 300 }}>
            {[u.city, u.country].filter(Boolean).join(' · ')}
          </p>
          {u.type && (
            <span
              className="text-xs px-2.5 py-1 rounded-full flex-shrink-0"
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

        {/* Name */}
        <h2 className="text-base text-navy mb-1.5 leading-snug" style={{ fontWeight: 300 }}>
          {u.name}
        </h2>

        {/* Tagline */}
        {u.quick_summary && (
          <p className="text-xs mb-4" style={{ color: '#0c4d86', fontWeight: 300 }}>
            {u.quick_summary}
          </p>
        )}

        {/* Tags */}
        {u.tags && u.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {u.tags.slice(0, 4).map(tag => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: '#f0f2f5', color: 'rgba(24,24,49,0.5)', fontWeight: 300 }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Bottom — tuition + arrow */}
        <div className="mt-auto pt-4 flex items-center justify-between" style={{ borderTop: '1px solid #f0f2f5' }}>
          {u.tuition_range ? (
            <p className="text-xs text-navy" style={{ fontWeight: 400 }}>{u.tuition_range}</p>
          ) : (
            <span />
          )}
          <span
            className="flex items-center gap-1 text-xs transition-all duration-200 group-hover:gap-2"
            style={{ color: '#0c4d86', fontWeight: 300 }}
          >
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

export default function UniversityList({ universities }: { universities: University[] }) {
  const [search, setSearch] = useState('')
  const [countryFilter, setCountryFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  // Derive unique countries from data
  const countries = useMemo(() => {
    const seen = new Map<string, string>()
    universities.forEach(u => seen.set(u.country_slug, u.country))
    return Array.from(seen.entries()).map(([slug, name]) => ({ slug, name }))
  }, [universities])

  const filtered = useMemo(() => {
    return universities.filter(u => {
      const matchSearch = search === '' ||
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.city?.toLowerCase().includes(search.toLowerCase()) ||
        u.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
      const matchCountry = countryFilter === 'all' || u.country_slug === countryFilter
      const matchType = typeFilter === 'all' || u.type === typeFilter
      return matchSearch && matchCountry && matchType
    })
  }, [universities, search, countryFilter, typeFilter])

  const pillBase = 'text-xs px-3.5 py-1.5 rounded-full transition-all duration-200 cursor-pointer'
  const pillActive = 'text-white'
  const pillInactive = 'text-navy hover:bg-white'

  return (
    <div>
      {/* ─── FILTERS ──────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 mb-6" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>

        {/* Search */}
        <div className="relative mb-4">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: 'rgba(24,24,49,0.3)' }}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, city or field..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-navy placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue transition"
            style={{ background: '#f8f9fb', border: '1px solid #eef0f3', fontWeight: 300 }}
          />
        </div>

        {/* Country pills */}
        {countries.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-3">
            <button
              onClick={() => setCountryFilter('all')}
              className={pillBase}
              style={{
                background: countryFilter === 'all' ? '#181831' : '#f0f2f5',
                ...(countryFilter === 'all' ? {} : {}),
              }}
            >
              <span className={countryFilter === 'all' ? pillActive : pillInactive}>All countries</span>
            </button>
            {countries.map(c => (
              <button
                key={c.slug}
                onClick={() => setCountryFilter(c.slug)}
                className={pillBase}
                style={{ background: countryFilter === c.slug ? '#181831' : '#f0f2f5' }}
              >
                <span className={countryFilter === c.slug ? pillActive : pillInactive}>{c.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Type pills */}
        <div className="flex gap-2">
          {['all', 'Public', 'Private'].map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={pillBase}
              style={{ background: typeFilter === t ? '#0c4d86' : '#f0f2f5' }}
            >
              <span className={typeFilter === t ? pillActive : pillInactive}>
                {t === 'all' ? 'All types' : t}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ─── RESULTS COUNT ────────────────────────────────────────────────── */}
      <p className="text-xs mb-5" style={{ color: 'rgba(24,24,49,0.4)', fontWeight: 300 }}>
        {filtered.length} {filtered.length === 1 ? 'university' : 'universities'}
      </p>

      {/* ─── GRID ─────────────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <p className="text-sm" style={{ color: 'rgba(24,24,49,0.4)', fontWeight: 300 }}>
            No universities match your search.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(u => (
            <UniversityCard key={u.slug} u={u} />
          ))}
        </div>
      )}
    </div>
  )
}
