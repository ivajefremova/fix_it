'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

interface Country { slug: string; name: string }
type GuideType = 'country' | 'documents' | null

const COUNTRY_ITEMS = [
  'Application deadlines for all major universities',
  'Guide to scholarships & funding',
  'Visa & entry requirements',
  'Accommodation & housing',
  'Cost of living breakdown',
  'City-by-city student guide',
  'Health & insurance',
  'Moving essentials',
]

const DOCS_ITEMS = [
  'Visa application — step by step',
  'Legal documents needed to live there',
  'Health insurance & coverage',
  'Bank account setup',
  'Arrival checklist',
  'Moving guide',
]

export default function CountryGuidesSection({ countries }: { countries: Country[] }) {
  const [active, setActive] = useState<GuideType>(null)
  const toggle = (type: GuideType) => setActive(prev => (prev === type ? null : type))

  return (
    <section className="bg-white" style={{ borderTop: '1px solid #e4ebf3' }}>
      <div className="max-w-[90%] mx-auto py-16 sm:py-20">

        {/* ── Two-column offerings ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 mb-10">
          <div>
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: '#51e74c' }}>Full country guide</p>
            <h3 className="mb-6" style={{ fontSize: 'clamp(17px, 2vw, 24px)', fontWeight: 300, color: '#181831' }}>
              Everything you need to apply and settle.
            </h3>
            <ul className="flex flex-col">
              {COUNTRY_ITEMS.map(item => (
                <li key={item} className="flex items-baseline justify-between gap-6"
                  style={{ borderBottom: '1px solid #f0f2f5', padding: '9px 0' }}>
                  <span style={{ fontSize: 13, color: 'rgba(24,24,49,0.65)', fontWeight: 300 }}>{item}</span>
                  <span style={{ color: '#51e74c', flexShrink: 0 }}>—</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: '#51e74c' }}>Relocation guide</p>
            <h3 className="mb-6" style={{ fontSize: 'clamp(17px, 2vw, 24px)', fontWeight: 300, color: '#181831' }}>
              From visa to arrival, covered in full.
            </h3>
            <ul className="flex flex-col">
              {DOCS_ITEMS.map(item => (
                <li key={item} className="flex items-baseline justify-between gap-6"
                  style={{ borderBottom: '1px solid #f0f2f5', padding: '9px 0' }}>
                  <span style={{ fontSize: 13, color: 'rgba(24,24,49,0.65)', fontWeight: 300 }}>{item}</span>
                  <span style={{ color: '#51e74c', flexShrink: 0 }}>—</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Explanation + checkboxes — centred ──────────────────────── */}
        <p className="mb-5 text-center" style={{ fontSize: 12, color: 'rgba(24,24,49,0.4)', fontWeight: 300 }}>
          Check a box to browse guides by country.
        </p>

        <div className="flex flex-row gap-4 justify-center">
          {(['country', 'documents'] as const).map(type => {
            const isActive = active === type
            return (
              <button
                key={type}
                onClick={() => toggle(type)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  padding: '11px 18px', borderRadius: 12, cursor: 'pointer',
                  transition: 'border-color 0.2s',
                  border: `1.5px solid ${isActive ? '#51e74c' : '#eef0f3'}`,
                  background: 'white',
                }}
              >
                <span style={{
                  width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                  border: `1.5px solid ${isActive ? '#51e74c' : 'rgba(24,24,49,0.18)'}`,
                  background: isActive ? '#51e74c' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                }}>
                  {isActive && (
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <span style={{ fontSize: 13, fontWeight: 300, color: '#181831' }}>
                  {type === 'country' ? 'View Country Guides' : 'View Relocation Guides'}
                </span>
              </button>
            )
          })}
        </div>

      </div>

      {/* ── Card strip — fade-in on mount, custom slider below ────────── */}
      {active && (
        <CardStrip key={active} countries={countries} guideType={active} />
      )}
    </section>
  )
}

function CardStrip({ countries, guideType }: { countries: Country[]; guideType: 'country' | 'documents' }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [thumbLeft, setThumbLeft] = useState(0)
  const [thumbWidth, setThumbWidth] = useState(30)

  const updateSlider = () => {
    const el = scrollRef.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    const pct = max > 0 ? el.scrollLeft / max : 0
    const tw = (el.clientWidth / el.scrollWidth) * 100
    setThumbWidth(tw)
    setThumbLeft(pct * (100 - tw))
  }

  useEffect(() => {
    updateSlider()
    window.addEventListener('resize', updateSlider)
    return () => window.removeEventListener('resize', updateSlider)
  }, [])

  return (
    <div style={{ borderTop: '1px solid #f0f2f5', paddingBottom: 48 }}>
      <style>{`
        @keyframes guide-cards-in {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .guide-cards { animation: guide-cards-in 0.38s ease both; }
        .guide-scroll::-webkit-scrollbar { display: none; }
      `}</style>

      <div className="guide-cards">
        {/* Scrollable row */}
        <div
          ref={scrollRef}
          onScroll={updateSlider}
          className="guide-scroll"
          style={{
            display: 'flex', gap: 12,
            overflowX: 'auto',
            paddingLeft: '5%', paddingRight: '5%',
            paddingTop: 32, paddingBottom: 4,
            scrollbarWidth: 'none',
          }}
        >
          {countries.map(c => (
            <Link
              key={c.slug}
              href={`/services/${c.slug}/${guideType}`}
              style={{
                flexShrink: 0, display: 'flex', flexDirection: 'column',
                width: 152, borderRadius: 18,
                border: '1px solid #eef0f3', background: 'white',
                boxShadow: '0 2px 8px rgba(24,24,49,0.06)',
                overflow: 'hidden', textDecoration: 'none',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = 'translateY(-3px)'
                el.style.boxShadow = '0 8px 24px rgba(12,77,134,0.11)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = 'translateY(0)'
                el.style.boxShadow = '0 2px 8px rgba(24,24,49,0.06)'
              }}
            >
              <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', padding: '20px 16px 12px' }}>
                <p style={{ fontSize: 14, fontWeight: 300, color: '#181831', lineHeight: 1.3 }}>{c.name}</p>
              </div>
              <div style={{
                background: '#51e74c', padding: '9px 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: 10, fontWeight: 400, color: '#181831' }}>
                  {guideType === 'country' ? 'View full guide' : 'View relocation guide'}
                </span>
                <svg style={{ width: 10, height: 10, color: '#181831' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {/* Custom slider */}
        <div style={{ margin: '14px 5% 0', height: 3, borderRadius: 4, background: '#f0f2f5', position: 'relative' }}>
          <div style={{
            position: 'absolute', top: 0, height: '100%', borderRadius: 4,
            background: '#51e74c',
            width: `${thumbWidth}%`,
            left: `${thumbLeft}%`,
            transition: 'left 0.08s linear',
          }} />
        </div>
      </div>
    </div>
  )
}
