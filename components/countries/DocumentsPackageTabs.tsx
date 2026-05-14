'use client'

import { useState } from 'react'
import Link from 'next/link'

type Country = { slug: string; name: string }

const included = [
  'Step-by-step visa application guide',
  'Complete document checklist with deadlines',
  'Moving guide — what to sort before you leave',
  'Bank account setup walkthrough',
  'Arrival tips from alumni who have done it',
  'Personalised relocation checklist in your profile',
]

export default function DocumentsPackageTabs({ countries }: { countries: Country[] }) {
  const [active, setActive] = useState(0)
  const c = countries[active]

  return (
    <div>
      {/* Tab list */}
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

      {c && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

          {/* Left — pitch */}
          <div>
            <h3
              className="mb-3 leading-snug"
              style={{ color: '#181831', fontWeight: 300, fontSize: 'clamp(20px, 2.5vw, 30px)' }}
            >
              Moving to {c.name}?
            </h3>
            <p className="text-sm leading-relaxed mb-6" style={{ color: 'rgba(24,24,49,0.55)', fontWeight: 300 }}>
              Visas, apostilles, bank accounts, housing — the logistics of moving abroad are overwhelming. Our {c.name} Documents & Relocation guide walks you through every step, written by alumni who have already done it.
            </p>

            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8 text-xs"
              style={{ background: 'rgba(12,77,134,0.07)', color: '#0c4d86', fontWeight: 300 }}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
              </svg>
              One-time purchase · €3.99 per country
            </div>

            <Link
              href={`/services/${c.slug}/documents`}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-normal transition-all hover:opacity-90"
              style={{ background: '#51e74c', color: '#181831' }}
            >
              Get {c.name} documents guide
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
