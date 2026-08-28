'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

type University = {
  slug: string
  name: string
  country_slug: string
  country: string
}

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
}

type Props = {
  universities: University[]
  scholarships: Scholarship[]
}

export default function ScholarshipTabs({ universities, scholarships }: Props) {
  const uniBySlug = useMemo(() => {
    const map: Record<string, string> = {}
    for (const u of universities) map[u.slug] = u.name
    return map
  }, [universities])

  const byCountry = useMemo(() => {
    const map = new Map<string, { name: string; slug: string; scholarships: Scholarship[] }>()
    for (const s of scholarships) {
      if (!map.has(s.country_slug)) map.set(s.country_slug, { name: s.country, slug: s.country_slug, scholarships: [] })
      map.get(s.country_slug)!.scholarships.push(s)
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [scholarships])

  const [activeIdx, setActiveIdx] = useState(0)
  const active = byCountry[activeIdx]

  if (!active) return null

  return (
    <div>
      {/* Country tabs */}
      <div
        className="flex gap-1 overflow-x-auto pb-px mb-8"
        style={{ scrollbarWidth: 'none', borderBottom: '1px solid #eef0f3' }}
      >
        {byCountry.map((c, i) => (
          <button
            key={c.slug}
            onClick={() => setActiveIdx(i)}
            className="flex-shrink-0 px-4 py-2.5 text-sm transition-all duration-200 relative"
            style={{
              color: i === activeIdx ? '#181831' : 'rgba(24,24,49,0.4)',
              fontWeight: i === activeIdx ? 400 : 300,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {c.name}
            <span
              className="absolute bottom-0 left-0 right-0 rounded-full transition-all duration-300"
              style={{
                height: '2px',
                background: '#51e74c',
                opacity: i === activeIdx ? 1 : 0,
                transform: i === activeIdx ? 'scaleX(1)' : 'scaleX(0)',
              }}
            />
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

        {/* Left — pitch */}
        <div>
          <h3
            className="mb-3 leading-snug"
            style={{ color: '#181831', fontWeight: 300, fontSize: 'clamp(20px, 2.5vw, 30px)' }}
          >
            Scholarship opportunities in {active.name}
          </h3>
          <p className="text-sm leading-relaxed mb-8" style={{ color: 'rgba(24,24,49,0.55)', fontWeight: 300 }}>
            View all available scholarships in {active.name}, assistance, deadlines and advice coming from international students who have gotten the scholarship.
          </p>

          <p className="text-xs mb-8" style={{ color: '#0c4d86', fontWeight: 300 }}>
            One-time purchase · Covers all 8 countries · €5.99
          </p>

          <Link
            href="/services/scholarship"
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-normal transition-all hover:opacity-90"
            style={{ background: '#51e74c', color: '#181831' }}
          >
            Get Scholarship Guide
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>

        {/* Right — scholarship cards */}
        <div className="relative">
          <div
            className="space-y-3 overflow-y-auto pr-1"
            style={{ maxHeight: '420px', scrollbarWidth: 'thin', scrollbarColor: '#e4ebf3 transparent' }}
          >
            {active.scholarships.map((s) => {
              const coveredNames = s.university_slugs.map(sl => uniBySlug[sl]).filter(Boolean)
              return (
                <div
                  key={s.id}
                  className="rounded-xl p-4"
                  style={{ background: '#f8f9fb', border: '1px solid #eef0f3' }}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="text-sm text-navy leading-snug" style={{ fontWeight: 300 }}>{s.name}</p>
                    <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: 'rgba(24,24,49,0.25)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  </div>

                  {s.amount && (
                    <p className="text-xs mb-2" style={{ color: '#0c4d86', fontWeight: 300 }}>{s.amount}</p>
                  )}

                  <div className="flex flex-col gap-1">
                    {coveredNames.map(name => (
                      <div key={name} style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                        <span style={{ color: '#51e74c', flexShrink: 0 }}>•</span>
                        <span style={{ fontSize: 12, color: 'rgba(24,24,49,0.55)', fontWeight: 300 }}>{name}</span>
                      </div>
                    ))}
                    {s.deadline && (
                      <span style={{ fontSize: 12, color: 'rgba(24,24,49,0.45)', fontWeight: 300 }}>Deadline: {s.deadline}</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {active.scholarships.length > 3 && (
            <div
              className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none"
              style={{ background: 'linear-gradient(to bottom, transparent, #f8f9fb)' }}
            />
          )}
        </div>

      </div>
    </div>
  )
}
