'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import Link from 'next/link'

type Scholarship = {
  id: string
  country_slug: string
  country: string
  name: string
  amount: string | null
  deadline: string | null
  university_slugs: string[]
}

type Props = {
  universities: { slug: string; name: string }[]
  scholarships: Scholarship[]
}

const SCHOLARSHIP_ITEMS = [
  'Step-by-step application guide for each scholarship',
  'Exact deadlines and when to submit',
  'Documents to prepare and how to submit them',
  'How to open a bank account to receive the funds',
  'When and how much money you receive',
  'Eligibility criteria explained clearly',
]

function getSubtitle(s: Scholarship, uniBySlug: Record<string, string>): string | null {
  const slugs = s.university_slugs ?? []
  if (slugs.length === 0) return null
  const names = slugs.map(sl => uniBySlug[sl]).filter(Boolean)
  if (names.length === 0) return null
  if (names.length <= 2) return names.join(', ')
  return `${s.country} — multiple universities`
}

export default function ScholarshipTabs({ universities, scholarships }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [showGuide, setShowGuide] = useState(false)
  const [showCountries, setShowCountries] = useState(false)

  const uniBySlug = useMemo(
    () => Object.fromEntries(universities.map(u => [u.slug, u.name])),
    [universities]
  )

  const countries = useMemo(() => {
    const map = new Map<string, string>()
    for (const s of scholarships) map.set(s.country_slug, s.country)
    return Array.from(map.entries())
      .map(([slug, name]) => ({ slug, name }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [scholarships])

  const visible = useMemo(
    () => scholarships.filter(s => selected.has(s.country_slug)),
    [scholarships, selected]
  )

  const toggle = (slug: string) =>
    setSelected(prev => {
      const next = new Set(prev)
      next.has(slug) ? next.delete(slug) : next.add(slug)
      return next
    })

  return (
    <div>
      <style>{`
        @keyframes schol-reveal {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .schol-reveal { animation: schol-reveal 0.4s cubic-bezier(0.16,1,0.3,1) both; }
        @keyframes schol-btn-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(81,231,76,0.55); }
          55%       { box-shadow: 0 0 0 10px rgba(81,231,76,0); }
        }
        .schol-btn-pulse { animation: schol-btn-pulse 1.8s ease-in-out infinite; }
        @keyframes schol-q-in {
          from { opacity: 0; transform: translateY(22px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .schol-q-in { animation: schol-q-in 0.7s cubic-bezier(0.16,1,0.3,1) both; }
        @keyframes schol-arrow-bounce {
          0%, 100% { transform: translateY(0); opacity: 0.45; }
          50%       { transform: translateY(5px); opacity: 0.75; }
        }
        .schol-arrow-bounce { animation: schol-arrow-bounce 1.1s ease-in-out infinite; }
      `}</style>

      {/* ── Trigger question ───────────────────────────────────────────── */}
      <div
        style={{
          maxWidth: '560px',
          marginBottom: showGuide ? 14 : 32,
          transform: showGuide ? 'translateY(-18px)' : 'translateY(0)',
          transition: 'margin-bottom 0.5s cubic-bezier(0.16,1,0.3,1), transform 0.5s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        <h3
          className="schol-q-in"
          style={{
            fontSize: 'clamp(22px, 2.5vw, 34px)', fontWeight: 500, color: '#181831', lineHeight: 1.3,
            marginBottom: showGuide ? 10 : 20,
            transition: 'margin-bottom 0.5s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          Do you want a full explanation of how to acquire a scholarship in any of the universities you picked?
        </h3>

        <button
          onClick={() => setShowGuide(v => !v)}
          className={`inline-flex items-center gap-2 px-7 py-3 rounded-xl hover:opacity-90${showGuide ? '' : ' schol-btn-pulse'}`}
          style={{
            background: showGuide ? '#181831' : '#51e74c',
            color: showGuide ? '#ffffff' : '#181831',
            fontWeight: 500, cursor: 'pointer', fontSize: 15,
            transition: 'background 0.25s, color 0.25s, box-shadow 0.25s',
          }}
        >
          {showGuide ? 'Hide guide' : 'Click here!'}
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d={showGuide ? 'M5 15l7-7 7 7' : 'M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3'} />
          </svg>
        </button>
      </div>

      {/* ── Scholarship guide card ─────────────────────────────────────── */}
      {showGuide && (
        <div
          className="schol-reveal"
          style={{
            borderRadius: 24, overflow: 'hidden',
            border: '1px solid #eef0f3',
            boxShadow: '0 2px 12px rgba(24,24,49,0.06)',
          }}
        >
          {/* Bullet list */}
          <div style={{ background: '#ffffff', padding: '24px 28px 0' }}>
            <ul>
              {SCHOLARSHIP_ITEMS.map(item => (
                <li
                  key={item}
                  className="flex items-baseline justify-between gap-6"
                  style={{ borderBottom: '1px solid #f0f2f5', padding: '12px 0' }}
                >
                  <span style={{ fontSize: 17, color: '#181831', fontWeight: 600, fontFamily: 'inherit' }}>{item}</span>
                  <span style={{ color: '#51e74c', flexShrink: 0 }}>—</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pick a country button */}
          <div style={{ background: '#ffffff', padding: '20px 28px' }}>
            <button
              onClick={() => setShowCountries(v => !v)}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl transition-all hover:opacity-90"
              style={{
                background: showCountries ? '#181831' : '#51e74c',
                color: showCountries ? '#ffffff' : '#181831',
                fontWeight: 500, cursor: 'pointer', fontSize: 15,
              }}
            >
              {showCountries ? 'Hide countries' : 'Pick a country'}
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={showCountries ? 'M5 15l7-7 7 7' : 'M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3'} />
              </svg>
            </button>
          </div>

          {/* Country checkboxes + cards */}
          {showCountries && (
            <div className="schol-reveal">
              <div style={{ background: '#ffffff', padding: '0 28px 16px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {countries.map(({ slug, name }) => {
                    const isActive = selected.has(slug)
                    return (
                      <button
                        key={slug}
                        onClick={() => toggle(slug)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 10,
                          padding: '10px 16px', borderRadius: 12, cursor: 'pointer',
                          border: 'none', background: isActive ? 'rgba(12,77,134,0.06)' : 'transparent',
                          transition: 'background 0.2s',
                        }}
                      >
                        <span style={{
                          width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                          border: `2px solid ${isActive ? '#0c4d86' : 'rgba(24,24,49,0.2)'}`,
                          background: isActive ? '#0c4d86' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.2s',
                        }}>
                          {isActive && (
                            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                              <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </span>
                        <span style={{ fontSize: 15, fontWeight: 400, color: '#181831', whiteSpace: 'nowrap', fontFamily: 'inherit' }}>{name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {visible.length > 0 && (
                <ScholarshipCardStrip key={Array.from(selected).join(',')} scholarships={visible} uniBySlug={uniBySlug} />
              )}
            </div>
          )}

        </div>
      )}
    </div>
  )
}

function ScholarshipCardStrip({
  scholarships,
  uniBySlug,
}: {
  scholarships: Scholarship[]
  uniBySlug: Record<string, string>
}) {
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
    <div style={{ borderTop: '1px solid #f0f2f5', paddingBottom: 28 }}>
      <style>{`
        @keyframes schol-cards-in {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .schol-cards { animation: schol-cards-in 0.38s ease both; }
        .schol-scroll::-webkit-scrollbar { display: none; }
      `}</style>

      <div className="schol-cards">
        <div
          ref={scrollRef}
          onScroll={updateSlider}
          className="schol-scroll"
          style={{
            display: 'flex', gap: 12,
            overflowX: 'auto',
            paddingLeft: 28, paddingRight: 28,
            paddingTop: 20, paddingBottom: 4,
            scrollbarWidth: 'none',
          }}
        >
          {scholarships.map(s => {
            const subtitle = getSubtitle(s, uniBySlug)
            return (
              <Link
                key={s.id}
                href={`/services/scholarship/${s.id}`}
                style={{
                  flexShrink: 0, display: 'flex', flexDirection: 'column',
                  width: 220, height: 320, borderRadius: 14,
                  background: '#0c4d86',
                  boxShadow: '0 4px 16px rgba(12,77,134,0.18)',
                  overflow: 'hidden', textDecoration: 'none',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.transform = 'translateY(-4px)'
                  el.style.boxShadow = '0 12px 32px rgba(12,77,134,0.28)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.transform = 'translateY(0)'
                  el.style.boxShadow = '0 4px 16px rgba(12,77,134,0.18)'
                }}
              >
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '24px 18px 20px' }}>
                  <p style={{ fontSize: 14, fontWeight: 500, color: '#ffffff', lineHeight: 1.4, marginBottom: subtitle ? 8 : 0, fontFamily: 'inherit' }}>
                    {s.name}
                  </p>
                  {subtitle && (
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 400, lineHeight: 1.4, fontFamily: 'inherit' }}>
                      {subtitle}
                    </p>
                  )}
                </div>
                <div style={{
                  borderTop: '1px solid rgba(255,255,255,0.15)', padding: '10px 18px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <span style={{ fontSize: 11, fontWeight: 400, color: 'rgba(255,255,255,0.8)' }}>View guide</span>
                  <svg style={{ width: 10, height: 10, color: 'rgba(255,255,255,0.8)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              </Link>
            )
          })}
        </div>

        <div style={{ margin: '12px 28px 0', height: 3, borderRadius: 4, background: '#f0f2f5', position: 'relative' }}>
          <div style={{
            position: 'absolute', top: 0, height: '100%', borderRadius: 4,
            background: '#0c4d86',
            width: `${thumbWidth}%`,
            left: `${thumbLeft}%`,
            transition: 'left 0.08s linear',
          }} />
        </div>
      </div>
    </div>
  )
}
