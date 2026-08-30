'use client'

import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import CountryCarousel from './CountryCarousel'
import HeroSheets from '@/components/ui/HeroSheets'

const EuropeMap = dynamic(() => import('./EuropeMap'), { ssr: false })

type Country = {
  slug: string
  name: string
  tagline: string | null
  hero_image_url: string | null
}

export default function CountriesInteractive({ countries }: { countries: Country[] }) {
  const [active, setActive] = useState(0)

  const go = useCallback((index: number) => {
    setActive(index)
  }, [])

return (
    <>
      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section
        className="bg-white border-b"
        style={{ borderColor: '#e4ebf3', minHeight: '560px', position: 'relative' }}
      >
        <div className="max-w-[90%] mx-auto flex items-center" style={{ minHeight: '560px' }}>

          {/* Text */}
          <div className="flex-1 py-24 z-10 relative">
            <p className="text-xs uppercase tracking-widest mb-4 hero-text-in" style={{ color: '#51e74c' }}>Destinations</p>
            <h1
              className="leading-tight mb-4 hero-text-in-2"
              style={{ color: '#181831', fontWeight: 400, fontSize: 'clamp(28px, 4vw, 52px)' }}
            >
              Study in Europe.
            </h1>
            <p className="text-sm leading-relaxed max-w-sm hero-text-in-3" style={{ color: 'rgba(24,24,49,0.75)', fontWeight: 400 }}>
              8 countries. Alumni-verified guides. Everything you need — from application to arrival — in one place.
            </p>
          </div>

          <HeroSheets />

        </div>
      </section>

      {/* ─── MAP + CAROUSEL ───────────────────────────────────────────────── */}
      <section className="bg-white border-b" style={{ borderColor: '#e4ebf3' }}>
        <div className="py-4 px-[5%]">
          <EuropeMap countries={countries} active={active} onSelect={go} />
        </div>

        {countries.length > 0 && (
          <CountryCarousel
            countries={countries}
            active={active}
            onActiveChange={go}
          />
        )}
      </section>
    </>
  )
}
