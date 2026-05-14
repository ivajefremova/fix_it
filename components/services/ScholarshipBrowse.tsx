'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import WishlistButton from './WishlistButton'

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

const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  'merit-based': { bg: 'rgba(12,77,134,0.07)',   color: '#0c4d86' },
  'need-based':  { bg: 'rgba(81,231,76,0.12)',    color: '#181831' },
  'government':  { bg: 'rgba(24,24,49,0.06)',     color: 'rgba(24,24,49,0.6)' },
}

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
  const [uniSearch,  setUniSearch]  = useState('')

  const filtered = useMemo(() => {
    return scholarships.filter(s => {
      if (country !== 'all' && s.country_slug !== country) return false
      if (typeFilter !== 'all' && s.scholarship_type !== typeFilter) return false
      if (level !== 'all' && !s.levels?.includes(level)) return false
      if (uniSearch) {
        const q = uniSearch.toLowerCase()
        const uniNames = s.university_slugs.map(sl => uniBySlug[sl]?.toLowerCase() ?? '')
        if (!uniNames.some(n => n.includes(q))) return false
      }
      return true
    })
  }, [scholarships, country, typeFilter, level, uniSearch, uniBySlug])


  return (
    <main style={{ background: '#f0f2f5', minHeight: '100vh' }}>

      {/* ─── HERO ─────────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b" style={{ borderColor: '#e4ebf3' }}>
        <div className="max-w-[90%] mx-auto py-14 sm:py-20">
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: '#51e74c' }}>Scholarship guides</p>
          <h1
            className="mb-3 leading-tight"
            style={{ color: '#181831', fontWeight: 200, fontSize: 'clamp(28px, 4vw, 52px)', letterSpacing: '-0.02em' }}
          >
            Find your scholarship.
          </h1>
          <p className="text-sm max-w-md leading-relaxed" style={{ color: 'rgba(24,24,49,0.5)', fontWeight: 300 }}>
            Browse every scholarship available to Macedonian students studying in Europe. Filter by country, type and level — then get the guide written by students who actually received it.
          </p>
        </div>
      </div>

      <div className="max-w-[90%] mx-auto py-10 sm:py-14">

        {/* ─── FILTERS ──────────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-5 mb-8" style={{ border: '1px solid #eef0f3', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <div className="flex flex-wrap gap-3 items-end">

            {/* University search */}
            <div className="flex flex-col gap-1.5 flex-1 min-w-[180px]">
              <label className="text-xs uppercase tracking-widest" style={{ color: 'rgba(24,24,49,0.35)', fontWeight: 400 }}>University</label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: 'rgba(24,24,49,0.3)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by university name..."
                  value={uniSearch}
                  onChange={e => setUniSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl text-xs focus:outline-none"
                  style={{ background: '#f8f9fb', border: '1px solid #eef0f3', fontWeight: 300, fontFamily: 'inherit', color: '#181831' }}
                />
              </div>
            </div>

            {/* Country */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-widest" style={{ color: 'rgba(24,24,49,0.35)', fontWeight: 400 }}>Country</label>
              <select
                value={country}
                onChange={e => setCountry(e.target.value)}
                className="rounded-xl px-3 py-2 text-xs outline-none"
                style={{ border: '1px solid #eef0f3', background: country !== 'all' ? '#181831' : '#f0f2f5', color: country !== 'all' ? '#fff' : 'rgba(24,24,49,0.6)', fontWeight: 300, fontFamily: 'inherit' }}
              >
                <option value="all">All countries</option>
                {countries.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
            </div>

            {/* Type */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-widest" style={{ color: 'rgba(24,24,49,0.35)', fontWeight: 400 }}>Type</label>
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="rounded-xl px-3 py-2 text-xs outline-none"
                style={{ border: '1px solid #eef0f3', background: typeFilter !== 'all' ? '#181831' : '#f0f2f5', color: typeFilter !== 'all' ? '#fff' : 'rgba(24,24,49,0.6)', fontWeight: 300, fontFamily: 'inherit' }}
              >
                <option value="all">All types</option>
                <option value="merit-based">Merit-based</option>
                <option value="need-based">Need-based</option>
                <option value="government">Government grant</option>
              </select>
            </div>

            {/* Level */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-widest" style={{ color: 'rgba(24,24,49,0.35)', fontWeight: 400 }}>Level</label>
              <select
                value={level}
                onChange={e => setLevel(e.target.value)}
                className="rounded-xl px-3 py-2 text-xs outline-none"
                style={{ border: '1px solid #eef0f3', background: level !== 'all' ? '#181831' : '#f0f2f5', color: level !== 'all' ? '#fff' : 'rgba(24,24,49,0.6)', fontWeight: 300, fontFamily: 'inherit' }}
              >
                <option value="all">All levels</option>
                <option value="bachelor">Bachelor</option>
                <option value="master">Master</option>
                <option value="doctorate">Doctorate</option>
              </select>
            </div>
          </div>
        </div>

        {/* ─── COUNT ────────────────────────────────────────────────────────────── */}
        <p className="text-xs mb-6" style={{ color: 'rgba(24,24,49,0.4)', fontWeight: 300 }}>
          {filtered.length} {filtered.length === 1 ? 'scholarship' : 'scholarships'}
        </p>

        {/* ─── LIST ─────────────────────────────────────────────────────────────── */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center" style={{ border: '1px solid #eef0f3' }}>
            <p className="text-sm" style={{ color: 'rgba(24,24,49,0.4)', fontWeight: 300 }}>No scholarships match your filters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(s => {
              const colors = TYPE_COLORS[s.scholarship_type ?? 'merit-based'] ?? TYPE_COLORS['merit-based']
              const uniNames = s.university_slugs.map(sl => uniBySlug[sl]).filter(Boolean)

              return (
                <div
                  key={s.id}
                  className="bg-white rounded-2xl p-6 sm:p-8"
                  style={{ border: '1px solid #eef0f3', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-6">

                    {/* Left — info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span
                          className="text-xs px-2.5 py-1 rounded-full"
                          style={{ background: colors.bg, color: colors.color, fontWeight: 300 }}
                        >
                          {TYPE_LABELS[s.scholarship_type ?? 'merit-based'] ?? s.scholarship_type}
                        </span>
                        <span className="text-xs" style={{ color: 'rgba(24,24,49,0.35)', fontWeight: 300 }}>{s.country}</span>
                      </div>

                      <h3 className="text-base text-navy mb-1.5 leading-snug" style={{ fontWeight: 300 }}>{s.name}</h3>

                      {s.description && (
                        <p className="text-xs leading-relaxed mb-4" style={{ color: 'rgba(24,24,49,0.55)', fontWeight: 300 }}>{s.description}</p>
                      )}

                      <div className="flex flex-wrap gap-3 text-xs mb-4">
                        {s.amount && (
                          <span style={{ color: '#0c4d86', fontWeight: 300 }}>{s.amount}</span>
                        )}
                        {s.deadline && (
                          <span style={{ color: 'rgba(24,24,49,0.4)', fontWeight: 300 }}>Deadline: {s.deadline}</span>
                        )}
                      </div>

                      {/* Covered universities */}
                      {uniNames.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {uniNames.map(name => (
                            <span key={name} className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(81,231,76,0.1)', color: '#181831', fontWeight: 300 }}>
                              {name}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Levels */}
                      {s.levels && s.levels.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {s.levels.map(l => (
                            <span key={l} className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#f0f2f5', color: 'rgba(24,24,49,0.5)', fontWeight: 300 }}>
                              {l.charAt(0).toUpperCase() + l.slice(1)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Right — CTA */}
                    <div className="flex flex-col items-start sm:items-end gap-2 sm:min-w-[160px]">
                      <p className="text-xl" style={{ fontWeight: 200, color: '#181831', letterSpacing: '-0.02em' }}>€5.99</p>
                      <p className="text-xs mb-2" style={{ color: 'rgba(24,24,49,0.35)', fontWeight: 300 }}>one-time</p>
                      <Link
                        href={`/services/scholarship/${s.id}`}
                        className="px-5 py-2 rounded-xl text-xs transition hover:opacity-90 inline-flex items-center gap-1.5"
                        style={{ background: '#51e74c', color: '#181831', fontWeight: 400 }}
                      >
                        View guide
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </Link>
                      <WishlistButton
                        packageType="scholarship"
                        countrySlug={s.id}
                        country={s.country}
                        initialSaved={wishlistedSet.has(s.id)}
                        isLoggedIn={isLoggedIn}
                      />
                    </div>

                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
