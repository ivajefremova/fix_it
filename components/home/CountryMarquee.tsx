'use client'

import { useState } from 'react'
import Link from 'next/link'

const countries = [
  { slug: 'spain',          name: 'Spain' },
  { slug: 'austria',        name: 'Austria' },
  { slug: 'slovenia',       name: 'Slovenia' },
  { slug: 'hungary',        name: 'Hungary' },
  { slug: 'netherlands',    name: 'Netherlands' },
  { slug: 'united-kingdom', name: 'United Kingdom' },
  { slug: 'germany',        name: 'Germany' },
  { slug: 'italy',          name: 'Italy' },
]

const items = [...countries, ...countries]

export default function CountryMarquee() {
  const [paused, setPaused] = useState(false)

  return (
    <div style={{ overflow: 'hidden', position: 'relative' }}>
      {/* fade edges */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '96px', zIndex: 10, pointerEvents: 'none', background: 'linear-gradient(to right, white, transparent)' }} />
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '96px', zIndex: 10, pointerEvents: 'none', background: 'linear-gradient(to left, white, transparent)' }} />

      <div
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        style={{
          display: 'flex',
          width: 'max-content',
          animation: 'marquee 28s linear infinite',
          animationPlayState: paused ? 'paused' : 'running',
        }}
      >
        {items.map((c, i) => (
          <Link
            key={i}
            href={`/countries/${c.slug}`}
            style={{
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              margin: '0 10px',
              padding: '28px 24px',
              width: '140px',
              height: '130px',
              borderRadius: '16px',
              border: '1px solid #eef0f3',
              background: 'white',
              boxShadow: '-2px -2px 4px rgba(0,0,0,0.04), 2px 2px 6px rgba(0,0,0,0.04)',
              textDecoration: 'none',
              transition: 'transform 0.25s ease, box-shadow 0.25s ease',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement
              el.style.transform = 'translateY(-4px)'
              el.style.boxShadow = '0 12px 32px rgba(12,77,134,0.12)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement
              el.style.transform = 'translateY(0)'
              el.style.boxShadow = '-2px -2px 4px rgba(0,0,0,0.04), 2px 2px 6px rgba(0,0,0,0.04)'
            }}
          >
            <div
              style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: '#f0f2f6', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '0.65rem', color: 'rgba(24,24,49,0.4)',
                fontWeight: 400, letterSpacing: '0.03em',
              }}
            >
              {c.name.substring(0, 2).toUpperCase()}
            </div>
            <p style={{ fontSize: '0.875rem', color: '#181831', fontWeight: 400, margin: 0 }}>{c.name}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
