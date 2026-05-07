'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'

type Country = {
  slug: string
  name: string
  tagline: string | null
}

type Props = {
  countries: Country[]
  active: number
  onActiveChange: (index: number) => void
}

export default function CountryCarousel({ countries, active, onActiveChange }: Props) {
  const [fading, setFading] = useState(false)

  const go = useCallback((index: number) => {
    if (fading || index === active) return
    setFading(true)
    setTimeout(() => { onActiveChange(index); setFading(false) }, 220)
  }, [fading, active, onActiveChange])

  const prev = () => go((active - 1 + countries.length) % countries.length)
  const next = () => go((active + 1) % countries.length)

  const c = countries[active]
  if (!c) return null

  return (
    <section className="bg-white" style={{ borderBottom: '1px solid #e4ebf3' }}>
      <div className="max-w-[90%] mx-auto py-16 sm:py-24">
        <div>

          {/* text */}
          <div
            style={{
              opacity: fading ? 0 : 1,
              transform: fading ? 'translateY(10px)' : 'translateY(0)',
              transition: 'opacity 0.22s ease, transform 0.22s ease',
            }}
          >
            <p className="text-xs uppercase tracking-widest mb-6" style={{ color: 'rgba(24,24,49,0.3)', fontWeight: 300 }}>
              {active + 1} / {countries.length}
            </p>
            <h2
              className="text-navy mb-4 leading-none"
              style={{ fontWeight: 200, fontSize: 'clamp(42px, 7vw, 84px)', letterSpacing: '-0.02em' }}
            >
              {c.name}
            </h2>
            {c.tagline && (
              <p className="mb-10 max-w-sm leading-relaxed" style={{ color: 'rgba(24,24,49,0.5)', fontWeight: 300, fontSize: '1rem' }}>
                {c.tagline}
              </p>
            )}
            <Link
              href={`/countries/${c.slug}`}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm transition-all hover:opacity-90"
              style={{ background: '#51e74c', color: '#181831', fontWeight: 400 }}
            >
              View {c.name} guide
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>


        </div>

        {/* Controls — below content */}
        <div className="flex items-center gap-5 mt-12">
          <button
            onClick={prev}
            aria-label="Previous"
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-gray-100 active:scale-95"
            style={{ border: '1px solid #e4ebf3' }}
          >
            <svg className="w-4 h-4 text-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <button
            onClick={next}
            aria-label="Next"
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-gray-100 active:scale-95"
            style={{ border: '1px solid #e4ebf3' }}
          >
            <svg className="w-4 h-4 text-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>

          {/* Dots */}
          <div className="flex items-center gap-2 ml-2">
            {countries.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                aria-label={`Go to ${countries[i].name}`}
                className="rounded-full transition-all duration-300"
                style={{
                  height: '5px',
                  width: i === active ? '24px' : '5px',
                  background: i === active ? '#51e74c' : '#d1d9e0',
                }}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
