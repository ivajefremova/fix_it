'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const countries = [
  { slug: 'spain',          name: 'Spain',           img: '/images/countries/spain.png' },
  { slug: 'austria',        name: 'Austria',         img: '/images/countries/austria.png' },
  { slug: 'slovenia',       name: 'Slovenia',        img: '/images/countries/slovenia.png' },
  { slug: 'hungary',        name: 'Hungary',         img: '/images/countries/hungary.png' },
  { slug: 'netherlands',    name: 'Netherlands',     img: '/images/countries/netherlands.png' },
  { slug: 'united-kingdom', name: 'United Kingdom',  img: '/images/countries/uk.png' },
  { slug: 'germany',        name: 'Germany',         img: '/images/countries/germany.png' },
  { slug: 'italy',          name: 'Italy',           img: '/images/countries/italy.png' },
  { slug: 'france',         name: 'France',          img: '/images/countries/france.png' },
  { slug: 'greece',         name: 'Greece',          img: '/images/countries/greece.png' },
]

const items = [...countries, ...countries]

export default function CountryMarquee() {
  const [paused, setPaused] = useState(false)

  return (
    <div>
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
                padding: '20px 24px',
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
              <Image
                src={c.img}
                alt={c.name}
                width={48}
                height={48}
                style={{ objectFit: 'contain', width: '48px', height: '48px' }}
              />
              <p style={{ fontSize: '0.75rem', color: '#181831', fontWeight: 400, margin: 0, textAlign: 'center' }}>{c.name}</p>
            </Link>
          ))}
        </div>
      </div>
      <p className="text-center text-xs mt-4" style={{ color: 'rgba(24,24,49,0.35)', fontWeight: 300, letterSpacing: '0.04em' }}>
        Click on a country to explore
      </p>
    </div>
  )
}
