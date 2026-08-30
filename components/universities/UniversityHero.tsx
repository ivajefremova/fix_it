'use client'

import HeroSheets from '@/components/ui/HeroSheets'

export default function UniversityHero() {
  return (
    <section
      className="bg-white border-b"
      style={{ borderColor: '#e4ebf3', minHeight: '560px', position: 'relative' }}
    >
      <div className="max-w-[90%] mx-auto flex items-center" style={{ minHeight: '560px' }}>

        {/* Text */}
        <div className="flex-1 py-24 z-10 relative">
          <p className="text-xs uppercase tracking-widest mb-4 hero-text-in" style={{ color: '#51e74c' }}>Universities</p>
          <h1
            className="leading-tight mb-4 hero-text-in-2"
            style={{ color: '#181831', fontWeight: 400, fontSize: 'clamp(28px, 4vw, 52px)', whiteSpace: 'nowrap' }}
          >
            Find your university
          </h1>
          <p className="text-sm leading-relaxed max-w-sm hero-text-in-3" style={{ color: 'rgba(24,24,49,0.75)', fontWeight: 400 }}>
            Every guide is written by Macedonian alumni who studied there. Real admission info, real costs, real insight.
          </p>
        </div>

        <HeroSheets />

      </div>
    </section>
  )
}
