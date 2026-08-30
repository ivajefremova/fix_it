'use client'

import CountryOrbit from './CountryOrbit'

interface Country { slug: string; name: string }

const ITEMS = [
  'Application deadlines for all major universities',
  'Guide to scholarships & funding',
  'Visa & entry requirements',
  'Accommodation & housing',
  'Cost of living breakdown',
  'City-by-city student guide',
  'Health & insurance',
  'Moving essentials',
]

export default function GuidesSection({ countries }: { countries: Country[] }) {
  return (
    <section className="bg-white overflow-hidden" style={{ borderTop: '1px solid #e4ebf3' }}>
      <div className="flex flex-col lg:flex-row w-full" style={{ minHeight: 580 }}>

        {/* ── LEFT: orbit ──────────────────────────────────────────────── */}
        <div
          className="flex items-center justify-center flex-shrink-0"
          style={{ padding: '40px 32px 40px 5%' }}
        >
          <CountryOrbit
            countries={countries}
            hrefPrefix="/services/"
            hrefSuffix="/country"
          />
        </div>

        {/* ── RIGHT: heading + list — fills remaining width ────────────── */}
        <div className="flex flex-col justify-center flex-1 px-12 py-10">
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: '#51e74c' }}>Guides</p>
          <h2 className="mb-2" style={{ color: '#181831', fontWeight: 400, fontSize: 'clamp(18px, 2vw, 28px)' }}>
            Want to study abroad?
          </h2>
          <p className="mb-8" style={{ fontSize: 12, color: 'rgba(24,24,49,0.7)', fontWeight: 400 }}>
            Click any country to explore its full guide.
          </p>
          <ul className="flex flex-col" style={{ maxWidth: 480 }}>
            {ITEMS.map(item => (
              <li
                key={item}
                className="flex items-baseline justify-between gap-6"
                style={{ borderBottom: '1px solid #f0f2f5', padding: '10px 0' }}
              >
                <span style={{ fontSize: 13, color: 'rgba(24,24,49,0.65)', fontWeight: 400, lineHeight: 1.4 }}>{item}</span>
                <span style={{ color: '#51e74c', flexShrink: 0, fontSize: 14 }}>—</span>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </section>
  )
}
