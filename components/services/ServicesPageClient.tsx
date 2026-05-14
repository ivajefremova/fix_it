'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import WishlistButton from './WishlistButton'

type Country = { slug: string; name: string }
type Purchase = { package_type: string; country_slug: string }

type Props = {
  countries: Country[]
  purchases: Purchase[]
  wishlist: Purchase[]
  isLoggedIn: boolean
  success?: boolean
}

const PACKAGES = [
  {
    id: 'country' as const,
    name: 'Country Guide',
    price: '€7.99',
    tagline: 'The full picture for your target country.',
    needsCountry: true,
    features: [
      'Why this country — in-depth analysis',
      'Lifestyle & student life',
      'City guide — where to study',
      'Finance overview & scholarship landscape',
      'Career prospects & job market',
      'Housing overview',
    ],
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c-.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
      </svg>
    ),
  },
  {
    id: 'scholarship' as const,
    name: 'Scholarship Guide',
    price: 'from €5.99',
    tagline: 'Find the right scholarship and learn exactly how to apply.',
    needsCountry: false,
    features: [
      'Eligibility requirements explained',
      'Grant amounts & coverage details',
      'Application deadlines & process',
      'Advice from students who received it',
      'Merit-based, need-based & government grants',
      'University-specific and regional scholarships',
    ],
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
      </svg>
    ),
  },
  {
    id: 'documents' as const,
    name: 'Documents & Relocation',
    price: '€3.99',
    tagline: 'From paperwork to your first week abroad.',
    needsCountry: true,
    features: [
      'Step-by-step visa application guide',
      'Complete document checklist',
      'Moving guide & what to bring',
      'Bank account setup walkthrough',
      'Arrival tips from alumni',
      'Personalised checklist in your profile',
    ],
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
]

const HOW_IT_WORKS = [
  {
    label: 'Pick your guide',
    description: 'Choose the package that matches where you are in the process.',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
    ),
  },
  {
    label: 'Pay once',
    description: 'No subscription. No recurring charges. Yours permanently.',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: 'Apply with confidence',
    description: 'Access your guide any time. Everything in one place, always up to date.',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077l1.41-.513m14.095-5.13l1.41-.513M5.106 17.785l1.15-.964m11.49-9.642l1.149-.964M7.501 19.795l.75-1.3m7.5-12.99l.75-1.3m-6.063 16.658l.26-1.477m2.605-14.772l.26-1.477m0 17.726l-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205L12 12m6.894 5.785l-1.149-.964M6.256 7.178l-1.15-.964m15.352 8.864l-1.41-.513M4.954 9.435l-1.41-.514M12.002 12l-3.75 6.495" />
      </svg>
    ),
  },
]

const BENEFITS = [
  'Written by Macedonian alumni who have actually been there — not scraped data',
  'One-time purchase, lifetime access. No subscriptions, no hidden fees',
  'Step-by-step guidance, not just information dumps',
  'Verified deadlines, scholarship requirements, and visa processes',
  'Covers everything: from application to arrival and settling in',
  'Available immediately after purchase, in your profile dashboard',
]

const TRIGGERS = [
  {
    label: 'Scholarship guide',
    question: 'Need a scholarship to study abroad, but don\'t know if you are eligible?',
    description: 'View which universities offer them and access advice and guidance from students who have received it.',
    cta: 'View Scholarship Guide',
    anchor: '#packages',
  },
  {
    label: 'Documents guide',
    question: 'Want to prepare for bureaucracy abroad?',
    description: 'Check out our Documents guide for in-depth explanations on how to move abroad — visas, bank accounts, arrival checklists and more.',
    cta: 'View Documents Guide',
    anchor: '#packages',
  },
  {
    label: 'Full country guide',
    question: 'Want a complete breakdown of applying, enrolling, getting funded and settling in?',
    description: 'Our Country Guide covers everything from admission requirements to career prospects — researched and verified by alumni.',
    cta: 'View Full Guide',
    anchor: '#packages',
  },
]

export default function ServicesPageClient({ countries, purchases, wishlist, isLoggedIn, success }: Props) {
  const router = useRouter()
  const [selectedCountry, setSelectedCountry] = useState<Record<string, string>>({
    country: '',
    documents: '',
  })

  function hasPurchased(packageId: string, countrySlug: string) {
    return purchases.some(p => p.package_type === packageId && p.country_slug === countrySlug)
  }

  function handleNavigate(packageId: string) {
    if (packageId === 'scholarship') {
      router.push('/services/scholarship')
      return
    }
    const slug = selectedCountry[packageId]
    if (!slug) return
    router.push(`/services/${slug}/${packageId}`)
  }

  return (
    <main style={{ background: '#f0f2f5', minHeight: '100vh' }}>

      {/* ─── HERO ──────────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b" style={{ borderColor: '#e4ebf3' }}>
        <div className="max-w-[90%] mx-auto py-14 sm:py-20">
          {success && (
            <div
              className="mb-8 px-5 py-3 rounded-xl text-sm inline-flex items-center gap-2"
              style={{ background: 'rgba(81,231,76,0.12)', color: '#181831', fontWeight: 300 }}
            >
              <svg className="w-4 h-4" style={{ color: '#51e74c' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Payment successful — your guide is ready.
            </div>
          )}
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: '#51e74c' }}>Guides & pricing</p>
          <h1
            className="mb-3 leading-tight"
            style={{ color: '#181831', fontWeight: 200, fontSize: 'clamp(32px, 5vw, 60px)', letterSpacing: '-0.02em' }}
          >
            Everything you need.<br />Nothing you don&apos;t.
          </h1>
          <p className="text-sm max-w-md leading-relaxed" style={{ color: 'rgba(24,24,49,0.5)', fontWeight: 300 }}>
            One-time purchases. Alumni-verified. Yours permanently.
          </p>
        </div>
      </div>

      <div className="max-w-[90%] mx-auto py-10 sm:py-14 space-y-12">

        {/* ─── BENEFITS ────────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-8 sm:p-10" style={{ border: '1px solid #eef0f3' }}>
          <p className="text-xs uppercase tracking-widest mb-6" style={{ color: '#51e74c' }}>Why Fix It guides</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {BENEFITS.map((b, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="mt-1.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: 'rgba(81,231,76,0.15)' }}>
                  <svg className="w-2.5 h-2.5" style={{ color: '#181831' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </span>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(24,24,49,0.65)', fontWeight: 300 }}>{b}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── TRIGGERS ────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TRIGGERS.map((t, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 flex flex-col"
              style={{ border: '1px solid #eef0f3' }}
            >
              <p className="text-xs uppercase tracking-widest mb-3" style={{ color: '#51e74c', fontWeight: 400 }}>{t.label}</p>
              <p className="text-sm leading-snug mb-3 text-navy" style={{ fontWeight: 300, fontSize: 'clamp(15px, 1.5vw, 17px)' }}>
                {t.question}
              </p>
              <p className="text-xs leading-relaxed mb-6" style={{ color: 'rgba(24,24,49,0.5)', fontWeight: 300 }}>
                {t.description}
              </p>
              <a
                href={t.anchor}
                className="mt-auto inline-flex items-center gap-1.5 text-xs transition-all hover:opacity-80"
                style={{ color: '#0c4d86', fontWeight: 300 }}
              >
                {t.cta}
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                </svg>
              </a>
            </div>
          ))}
        </div>

        {/* ─── PACKAGES ────────────────────────────────────────────────────────── */}
        <div id="packages">
          <p className="text-xs uppercase tracking-widest mb-6" style={{ color: 'rgba(24,24,49,0.35)', fontWeight: 400 }}>Choose your guide</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PACKAGES.map(pkg => {
              const slug = pkg.needsCountry ? selectedCountry[pkg.id] : 'all'
              const owned = hasPurchased(pkg.id, slug)
              const canNavigate = pkg.id === 'scholarship' || !!selectedCountry[pkg.id]
              const isSaved = wishlist.some(w => w.package_type === pkg.id && w.country_slug === (slug || ''))

              return (
                <div
                  key={pkg.id}
                  className="bg-white rounded-2xl shadow-sm flex flex-col"
                  style={{ border: '1px solid #eef0f3' }}
                >
                  {/* Header */}
                  <div className="p-8 pb-6 border-b" style={{ borderColor: '#f0f2f5' }}>
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
                      style={{ background: 'rgba(12,77,134,0.08)', color: '#0c4d86' }}
                    >
                      {pkg.icon}
                    </div>
                    <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'rgba(24,24,49,0.35)', fontWeight: 300 }}>
                      {pkg.name}
                    </p>
                    <div className="flex items-baseline gap-1.5 mb-2">
                      <span style={{ fontSize: 'clamp(28px, 3vw, 36px)', fontWeight: 200, color: '#181831', letterSpacing: '-0.02em' }}>
                        {pkg.price}
                      </span>
                      <span className="text-xs" style={{ color: 'rgba(24,24,49,0.35)', fontWeight: 300 }}>
                        {pkg.needsCountry ? '/ country' : '/ scholarship'}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: 'rgba(24,24,49,0.5)', fontWeight: 300 }}>
                      {pkg.tagline}
                    </p>
                  </div>

                  {/* Features */}
                  <div className="px-8 py-6 flex-1">
                    <ul className="space-y-3">
                      {pkg.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs leading-relaxed" style={{ color: 'rgba(24,24,49,0.6)', fontWeight: 300 }}>
                          <span className="mt-0.5 flex-shrink-0" style={{ color: '#51e74c', fontSize: 8 }}>●</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Country selector + CTA */}
                  <div className="px-8 pb-8 space-y-3">
                    {/* Wishlist heart — only for country/documents packages when a country is selected */}
                    {pkg.id !== 'scholarship' && !!selectedCountry[pkg.id] && !owned && (
                      <div className="flex items-center gap-2">
                        <WishlistButton
                          packageType={pkg.id}
                          countrySlug={slug || ''}
                          country={countries.find(c => c.slug === slug)?.name ?? ''}
                          initialSaved={isSaved}
                          isLoggedIn={isLoggedIn}
                        />
                        <span className="text-xs" style={{ color: 'rgba(24,24,49,0.35)', fontWeight: 300 }}>
                          {isSaved ? 'Saved for later' : 'Save for later'}
                        </span>
                      </div>
                    )}
                    {pkg.needsCountry && (
                      <select
                        value={selectedCountry[pkg.id] ?? ''}
                        onChange={e => setSelectedCountry(prev => ({ ...prev, [pkg.id]: e.target.value }))}
                        className="w-full rounded-xl px-4 py-2.5 text-xs outline-none transition"
                        style={{
                          border: '1px solid #e4ebf3',
                          background: '#fafafa',
                          color: selectedCountry[pkg.id] ? '#181831' : 'rgba(24,24,49,0.35)',
                          fontWeight: 300,
                          fontFamily: 'inherit',
                        }}
                      >
                        <option value="" disabled>Select a country</option>
                        {countries.map(c => (
                          <option key={c.slug} value={c.slug}>{c.name}</option>
                        ))}
                      </select>
                    )}

                    {owned ? (
                      <div
                        className="w-full py-2.5 rounded-xl text-xs text-center"
                        style={{ background: 'rgba(81,231,76,0.1)', color: '#181831', fontWeight: 300 }}
                      >
                        ✓ Already purchased
                      </div>
                    ) : (
                      <button
                        onClick={() => handleNavigate(pkg.id)}
                        disabled={!canNavigate}
                        className="w-full py-2.5 rounded-xl text-xs font-normal transition hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                        style={{ background: '#51e74c', color: '#181831' }}
                      >
                        {pkg.id === 'scholarship' ? 'Browse Scholarships' : `View ${pkg.name}`}
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ─── HOW IT WORKS ────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-sm">
          <p className="text-xs uppercase tracking-widest mb-8" style={{ color: '#51e74c' }}>How it works</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 relative">
            <div
              className="absolute hidden sm:block"
              style={{ top: 16, left: 'calc(16.66% + 16px)', right: 'calc(16.66% + 16px)', height: '1px', background: '#e4ebf3' }}
            />
            {HOW_IT_WORKS.map((step, i) => (
              <div key={i} className="flex flex-col items-start sm:items-center sm:text-center px-0 sm:px-6 mb-8 sm:mb-0">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center mb-4 relative z-10"
                  style={{ background: 'white', border: '1px solid #e4ebf3', color: '#0c4d86' }}
                >
                  {step.icon}
                </div>
                <p className="text-sm text-navy mb-1.5" style={{ fontWeight: 300 }}>{step.label}</p>
                <p className="text-xs leading-relaxed max-w-[200px]" style={{ color: 'rgba(24,24,49,0.45)', fontWeight: 300 }}>
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── FAQ ─────────────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-sm">
          <p className="text-xs uppercase tracking-widest mb-8" style={{ color: '#51e74c' }}>FAQ</p>
          <div className="space-y-6 max-w-2xl">
            {[
              { q: 'Is this a subscription?', a: 'No. Every guide is a one-time purchase. Once you buy it, it\'s yours permanently with no recurring charges.' },
              { q: 'Can I buy guides for multiple countries?', a: 'Yes — the Country Guide and Documents packages are per-country. Buy one for Italy, then another for Germany whenever you need it.' },
              { q: 'What if a country doesn\'t have content yet?', a: 'We\'re adding content country by country. If you buy a guide for a country still being compiled, you\'ll get access as soon as it\'s live.' },
              { q: 'Who writes the guides?', a: 'Every guide is compiled by Macedonian alumni who have studied in that country themselves. No scraped data — just lived experience.' },
            ].map((item, i) => (
              <div key={i} style={{ borderBottom: i < 3 ? '1px solid #f0f2f5' : 'none', paddingBottom: i < 3 ? '1.5rem' : 0 }}>
                <p className="text-sm text-navy mb-2" style={{ fontWeight: 400 }}>{item.q}</p>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(24,24,49,0.55)', fontWeight: 300 }}>{item.a}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  )
}
