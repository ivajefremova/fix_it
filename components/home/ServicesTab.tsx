'use client'

import { useState } from 'react'
import Link from 'next/link'

const services = [
  {
    id: 'scholarships',
    label: 'Scholarships',
    title: 'Stop guessing. Start applying.',
    body: 'Stop guessing your eligibility and start applying with confidence. Our scholarship packages provide detailed walkthroughs for regional and national grants, including income calculation and curated document checklists.',
    cta: 'Find Scholarship',
    href: '/services',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
      </svg>
    ),
  },
  {
    id: 'documentation',
    label: 'Documentation',
    title: "Don't let a missing stamp delay your future.",
    body: "Don't let a missing stamp delay your future. We provide technical, step-by-step instructions for visas, apostilles, and official translations, ensuring your paperwork meets strict embassy standards.",
    cta: 'See Documents',
    href: '/services',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
  {
    id: 'relocation',
    label: 'Relocation',
    title: 'A massive leap — made into a smooth landing.',
    body: "Moving to a new country is a massive leap—we make it a smooth landing. From initial pre-enrollment to finding student housing and securing your local residency permits, our country blueprints cover every essential detail.",
    cta: 'Explore Countries',
    href: '/countries',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
  },
]

export default function ServicesTab() {
  const [active, setActive] = useState(0)
  const svc = services[active]

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-0 rounded-2xl overflow-hidden shadow-sm" style={{ border: '1px solid #eef0f3' }}>

      {/* Tab list */}
      <div className="md:col-span-2" style={{ background: '#f8f9fb', borderRight: '1px solid #eef0f3' }}>
        {services.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setActive(i)}
            className="w-full text-left px-6 py-5 flex items-center gap-4 transition-all"
            style={{
              background: i === active ? 'white' : 'transparent',
              borderLeft: i === active ? '3px solid #0c4d86' : '3px solid transparent',
              borderBottom: i < services.length - 1 ? '1px solid #eef0f3' : 'none',
            }}
          >
            <div style={{ color: i === active ? '#0c4d86' : 'rgba(24,24,49,0.3)', transition: 'color 0.2s' }}>
              {s.icon}
            </div>
            <span
              className="text-sm"
              style={{ color: i === active ? '#181831' : 'rgba(24,24,49,0.45)', fontWeight: i === active ? 400 : 300, transition: 'all 0.2s' }}
            >
              {s.label}
            </span>
          </button>
        ))}
      </div>

      {/* Content panel */}
      <div className="md:col-span-3 p-8 sm:p-10 bg-white flex flex-col justify-between min-h-[280px]">
        <div>
          <div className="mb-4" style={{ color: '#0c4d86' }}>{svc.icon}</div>
          <h3 className="text-xl text-navy mb-4 leading-snug" style={{ fontWeight: 300 }}>
            {svc.title}
          </h3>
          <p className="text-sm leading-relaxed text-gray-500" style={{ fontWeight: 300 }}>
            {svc.body}
          </p>
        </div>
        <div className="mt-8">
          <Link
            href={svc.href}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm transition hover:opacity-90"
            style={{ background: '#51e74c', color: '#181831', fontWeight: 400 }}
          >
            {svc.cta}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>

    </div>
  )
}
