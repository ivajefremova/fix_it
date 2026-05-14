'use client'

import { useState } from 'react'
import Link from 'next/link'

type Country = {
  slug: string
  name: string
}

const included = [
  'Why this country — honest breakdown from alumni',
  'Full admission guide for EU and non-EU students',
  'All English-taught programmes with direct application links',
  'Scholarship landscape — named grants with amounts and eligibility',
  'Student accommodation options and housing guide',
  'City guide — where to study and why',
  'Career prospects and post-study opportunities',
]

export default function CountryPackageTabs({ countries }: { countries: Country[] }) {
  const [active, setActive] = useState(0)
  const c = countries[active]

  return (
    <div>
      {/* Tab list — scrollable on mobile */}
      <div
        className="flex gap-1 overflow-x-auto pb-px mb-8"
        style={{ scrollbarWidth: 'none', borderBottom: '1px solid #eef0f3' }}
      >
        {countries.map((country, i) => (
          <button
            key={country.slug}
            onClick={() => setActive(i)}
            className="flex-shrink-0 px-4 py-2.5 text-sm transition-all duration-200 relative"
            style={{
              color: i === active ? '#181831' : 'rgba(24,24,49,0.4)',
              fontWeight: i === active ? 400 : 300,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {country.name}
            {/* Active underline */}
            <span
              className="absolute bottom-0 left-0 right-0 rounded-full transition-all duration-300"
              style={{
                height: '2px',
                background: '#51e74c',
                opacity: i === active ? 1 : 0,
                transform: i === active ? 'scaleX(1)' : 'scaleX(0)',
              }}
            />
          </button>
        ))}
      </div>

      {/* Content panel */}
      {c && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

          {/* Left — pitch */}
          <div>
            <h3
              className="mb-3 leading-snug"
              style={{ color: '#181831', fontWeight: 300, fontSize: 'clamp(20px, 2.5vw, 30px)' }}
            >
              Complete {c.name} guide
            </h3>
            <p className="text-sm leading-relaxed mb-6" style={{ color: 'rgba(24,24,49,0.55)', fontWeight: 300 }}>
              Everything a Macedonian student needs to apply, get funded, and move to {c.name} — researched and verified by alumni who have already done it.
            </p>

            {/* Paid badge */}
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8 text-xs"
              style={{ background: 'rgba(12,77,134,0.07)', color: '#0c4d86', fontWeight: 300 }}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
              </svg>
              One-time purchase · No subscription
            </div>

            <Link
              href={`/services/${c.slug}/country`}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-normal transition-all hover:opacity-90"
              style={{ background: '#51e74c', color: '#181831', fontWeight: 400 }}
            >
              Get {c.name} full guide
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>

          {/* Right — what's included */}
          <div
            className="rounded-2xl p-6"
            style={{ background: '#f8f9fb', border: '1px solid #eef0f3' }}
          >
            <p className="text-xs uppercase tracking-widest mb-4" style={{ color: '#51e74c' }}>What&apos;s included</p>
            <ul className="space-y-3">
              {included.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span
                    className="mt-1.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(81,231,76,0.15)' }}
                  >
                    <svg className="w-2.5 h-2.5" style={{ color: '#181831' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </span>
                  <span className="text-sm leading-relaxed" style={{ color: 'rgba(24,24,49,0.65)', fontWeight: 300 }}>
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      )}
    </div>
  )
}
