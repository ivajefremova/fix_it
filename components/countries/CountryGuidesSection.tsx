'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

interface Country { slug: string; name: string; hero_image_url?: string | null }
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
  const [showGuides, setShowGuides] = useState(false)
  const [headingVisible, setHeadingVisible] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const toggle = (type: GuideType) => setActive(prev => (prev === type ? null : type))

  useEffect(() => {
    const el = headingRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setHeadingVisible(true); obs.disconnect() } },
      { threshold: 0.25 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <section className="bg-white" style={{ borderTop: '1px solid #e4ebf3', minHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
      <div className="px-[4%] pt-40 sm:pt-56 flex-1" style={{ paddingBottom: showGuides ? 24 : 80 }}>

        <style>{`
          @keyframes guides-reveal {
            from { opacity: 0; transform: translateY(20px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .guides-reveal { animation: guides-reveal 0.4s cubic-bezier(0.16,1,0.3,1) both; }
          @keyframes btn-pulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(81,231,76,0.55); }
            55%       { box-shadow: 0 0 0 10px rgba(81,231,76,0); }
          }
          .btn-pulse { animation: btn-pulse 1.8s ease-in-out infinite; }
          @keyframes q-in {
            from { opacity: 0; transform: translateY(22px) scale(0.97); }
            to   { opacity: 1; transform: translateY(0) scale(1); }
          }
          .q-in { animation: q-in 0.7s cubic-bezier(0.16,1,0.3,1) both; }
        `}</style>

        {/* ── Heading ──────────────────────────────────────────────────── */}
        <div
          style={{
            maxWidth: '560px',
            marginLeft: 'auto',
            textAlign: 'right' as const,
            marginBottom: showGuides ? 14 : 40,
            transform: showGuides ? 'translateY(-18px)' : 'translateY(0)',
            transition: 'margin-bottom 0.5s cubic-bezier(0.16,1,0.3,1), transform 0.5s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          <h2
            ref={headingRef}
            className={headingVisible ? 'q-in' : ''}
            style={{
              fontSize: 'clamp(28px, 3vw, 44px)', fontWeight: 500, color: '#181831', lineHeight: 1.25,
              marginBottom: showGuides ? 10 : 20,
              opacity: headingVisible ? undefined : 0,
              transition: 'margin-bottom 0.5s cubic-bezier(0.16,1,0.3,1)',
            }}
          >
            Need customised help from students who&apos;ve done it?
          </h2>

          <button
            onClick={() => setShowGuides(v => !v)}
            className={`inline-flex items-center gap-2 px-7 py-3 rounded-xl hover:opacity-90${showGuides ? '' : ' btn-pulse'}`}
            style={{
              background: '#51e74c', color: '#181831', fontWeight: 500, cursor: 'pointer', fontSize: 15,
              transition: 'background 0.25s, color 0.25s, box-shadow 0.25s',
            }}
          >
            {showGuides ? 'Hide guides' : 'Click here!'}
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d={showGuides ? 'M5 15l7-7 7 7' : 'M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3'} />
            </svg>
          </button>
        </div>

        {/* ── Two cards ────────────────────────────────────────────────── */}
        {showGuides && (
        <div className="guides-reveal grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">

          {/* Country guide card */}
          <div
            style={{
              borderRadius: 24, overflow: 'hidden',
              border: '1px solid #eef0f3',
              boxShadow: '0 2px 12px rgba(24,24,49,0.06)',
              display: 'flex', flexDirection: 'column',
            }}
          >
            <div style={{ background: '#ffffff', padding: '24px 28px 0', flex: 1 }}>
              <ul>
                {COUNTRY_ITEMS.map(item => (
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
            <div style={{ background: '#ffffff', padding: '20px 28px 24px' }}>
              <button
                onClick={() => toggle('country')}
                className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl transition-all hover:opacity-90"
                style={{
                  background: active === 'country' ? '#181831' : '#51e74c',
                  color: active === 'country' ? '#ffffff' : '#181831',
                  fontWeight: 400, cursor: 'pointer', fontSize: 13,
                }}
              >
                {active === 'country' ? 'Hide countries' : 'Pick a country'}
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={active === 'country' ? 'M5 15l7-7 7 7' : 'M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3'} />
                </svg>
              </button>
            </div>
          </div>

          {/* Relocation guide card */}
          <div
            style={{
              borderRadius: 24, overflow: 'hidden',
              border: '1px solid #eef0f3',
              boxShadow: '0 2px 12px rgba(24,24,49,0.06)',
              display: 'flex', flexDirection: 'column',
            }}
          >
            <div style={{ background: '#ffffff', padding: '24px 28px 0', flex: 1 }}>
              <ul>
                {DOCS_ITEMS.map(item => (
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
            <div style={{ background: '#ffffff', padding: '20px 28px 24px' }}>
              <button
                onClick={() => toggle('documents')}
                className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl transition-all hover:opacity-90"
                style={{
                  background: active === 'documents' ? '#181831' : '#51e74c',
                  color: active === 'documents' ? '#ffffff' : '#181831',
                  fontWeight: 500, cursor: 'pointer', fontSize: 15,
                }}
              >
                {active === 'documents' ? 'Hide countries' : 'Pick a country'}
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={active === 'documents' ? 'M5 15l7-7 7 7' : 'M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3'} />
                </svg>
              </button>
            </div>
          </div>

        </div>
        )}
      </div>

      {/* ── Card strip ───────────────────────────────────────────────────── */}
      {showGuides && active && (
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
    <div style={{ paddingBottom: 56 }}>
      <style>{`
        @keyframes guide-cards-in {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .guide-cards { animation: guide-cards-in 0.38s ease both; }
        .guide-scroll::-webkit-scrollbar { display: none; }
      `}</style>

      <div className="guide-cards">
        <div
          ref={scrollRef}
          onScroll={updateSlider}
          className="guide-scroll"
          style={{
            display: 'flex', gap: 12,
            overflowX: 'auto',
            paddingLeft: '5%', paddingRight: '5%',
            paddingTop: 12, paddingBottom: 4,
            scrollbarWidth: 'none',
          }}
        >
          {countries.map(c => (
            <Link
              key={c.slug}
              href={`/services/${c.slug}/${guideType}`}
              style={{
                flexShrink: 0, display: 'flex', flexDirection: 'column',
                width: 220, height: 320, borderRadius: 18,
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
              <div style={{ padding: '20px 22px 0' }}>
                <p style={{ fontSize: 10, fontWeight: 500, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                  {guideType === 'country' ? 'Country Guide' : 'Relocation Guide'}
                </p>
              </div>
              {/* Country image — inverted to white */}
              <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                {c.hero_image_url && (
                  <img
                    src={c.hero_image_url}
                    alt=""
                    aria-hidden="true"
                    style={{
                      width: '100%', height: '100%',
                      objectFit: 'cover', objectPosition: 'center',
                      filter: 'brightness(0) invert(1)',
                      opacity: 0.12,
                    }}
                  />
                )}
              </div>
              <div style={{ padding: '0 22px 16px' }}>
                <p style={{ fontSize: 17, fontWeight: 500, color: '#ffffff', lineHeight: 1.3 }}>{c.name}</p>
              </div>
              <div style={{
                borderTop: '1px solid rgba(255,255,255,0.15)', padding: '12px 22px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: 11, fontWeight: 400, color: 'rgba(255,255,255,0.8)' }}>View</span>
                <svg style={{ width: 11, height: 11, color: 'rgba(255,255,255,0.8)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        <div style={{ margin: '14px 5% 0', height: 3, borderRadius: 4, background: '#f0f2f5', position: 'relative' }}>
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
