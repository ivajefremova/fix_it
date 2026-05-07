'use client'

import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import CountryCarousel from './CountryCarousel'

const EuropeMap = dynamic(() => import('./EuropeMap'), { ssr: false })

type Country = {
  slug: string
  name: string
  tagline: string | null
}

export default function CountriesInteractive({ countries }: { countries: Country[] }) {
  const [active, setActive] = useState(0)

  const go = useCallback((index: number) => {
    setActive(index)
  }, [])

  return (
    <>
      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section className="py-14 sm:py-20 border-b border-gray-100">
        <div className="max-w-[90%] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs uppercase tracking-widest mb-3" style={{ color: '#51e74c' }}>Destinations</p>
              <h1
                className="mb-3 leading-tight"
                style={{ color: '#181831', fontWeight: 300, fontSize: 'clamp(28px, 4vw, 48px)' }}
              >
                Study in Europe.
              </h1>
              <p className="text-sm max-w-md leading-relaxed" style={{ color: 'rgba(24,24,49,0.5)', fontWeight: 300 }}>
                8 countries. Alumni-verified guides. Everything you need — from application to arrival — in one place.
              </p>
            </div>

            <div className="hidden lg:block">
              <EuropeMap countries={countries} active={active} onSelect={go} />
            </div>
          </div>
        </div>
      </section>

      {/* ─── CAROUSEL ─────────────────────────────────────────────────────── */}
      {countries.length > 0 && (
        <CountryCarousel
          countries={countries}
          active={active}
          onActiveChange={go}
        />
      )}
    </>
  )
}
