'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

type Country = { slug: string; name: string; tagline: string | null; overview_free: string | null }
type Purchase = { package_type: string; country_slug: string }

type Props = {
  country: Country
  packageType: 'country' | 'documents'
  purchases: Purchase[]
  isLoggedIn: boolean
}

const PACKAGE_META = {
  country: {
    name: 'Country Guide',
    price: '€7.99',
    tagline: 'The complete picture — applying, living, and thriving.',
    description: 'Everything a Macedonian student needs to understand, apply to, and settle in {country}. Researched and written by alumni who have already done it.',
    features: [
      { label: 'Why this country', detail: 'An honest breakdown of why Macedonian students choose {country} — costs, opportunities, quality of life.' },
      { label: 'Full admission guide', detail: 'Exactly what universities want to see. Requirements, deadlines, application portals — all in one place.' },
      { label: 'Scholarship landscape', detail: 'Every government grant and university scholarship available to you, with eligibility and amounts.' },
      { label: 'City guide', detail: 'Where to live and study — the best cities for your field, cost of living, and student atmosphere.' },
      { label: 'Lifestyle & student life', detail: 'What day-to-day life actually looks like — housing, food, transport, social life.' },
      { label: 'Career prospects', detail: 'What Macedonian graduates do after. Job markets, post-study visa options, industry connections.' },
    ],
  },
  documents: {
    name: 'Documents & Relocation Guide',
    price: '€3.99',
    tagline: 'From your home in Macedonia to your first week abroad.',
    description: 'The bureaucratic reality of moving to {country} — step by step, translated into plain language by alumni who navigated it themselves.',
    features: [
      { label: 'Visa application walkthrough', detail: 'The exact steps, documents, and timelines for your student visa. No guesswork.' },
      { label: 'Document checklist', detail: 'Every document you need — apostilles, translations, health insurance — with deadlines.' },
      { label: 'Moving guide', detail: 'What to sort before you leave Macedonia: bank transfers, subscriptions, packing essentials.' },
      { label: 'Bank account setup', detail: 'How to open a local bank account or set up an international card before you land.' },
      { label: 'Arrival tips', detail: 'First-week priorities — registration, SIM card, transport cards — from alumni who have done it.' },
      { label: 'Personalised checklist', detail: 'Once purchased, your profile gets a {country}-specific relocation checklist you can tick off.' },
    ],
  },
}

export default function PackageDetailPage({ country, packageType, purchases, isLoggedIn }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const meta = PACKAGE_META[packageType]
  const alreadyOwned = purchases.some(p => p.package_type === packageType && p.country_slug === country.slug)

  function fill(text: string) {
    return text.replace(/{country}/g, country.name)
  }

  async function handleBuy() {
    if (!isLoggedIn) {
      toast.error('Please log in to purchase a guide.')
      router.push('/login')
      return
    }
    if (alreadyOwned) {
      toast.info('You already own this guide.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ package_type: packageType, country_slug: country.slug, country: country.name }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else toast.error('Something went wrong. Please try again.')
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ background: '#f0f2f5', minHeight: '100vh' }}>

      {/* ─── HERO ─────────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b" style={{ borderColor: '#e4ebf3' }}>
        <div className="max-w-[90%] mx-auto py-14 sm:py-20">
          <div className="flex items-center gap-2 mb-4">
            <Link href="/services" className="text-xs hover:opacity-70 transition" style={{ color: 'rgba(24,24,49,0.4)', fontWeight: 300 }}>
              Guides
            </Link>
            <span style={{ color: 'rgba(24,24,49,0.25)', fontSize: '10px' }}>›</span>
            <span className="text-xs" style={{ color: 'rgba(24,24,49,0.4)', fontWeight: 300 }}>{country.name}</span>
            <span style={{ color: 'rgba(24,24,49,0.25)', fontSize: '10px' }}>›</span>
            <span className="text-xs" style={{ color: '#51e74c', fontWeight: 300 }}>{meta.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
            <div>
              <p className="text-xs uppercase tracking-widest mb-3" style={{ color: '#51e74c' }}>{meta.name}</p>
              <h1
                className="mb-3 leading-tight"
                style={{ color: '#181831', fontWeight: 200, fontSize: 'clamp(28px, 4vw, 52px)', letterSpacing: '-0.02em' }}
              >
                {country.name}
              </h1>
              <p className="text-sm max-w-md leading-relaxed mb-6" style={{ color: 'rgba(24,24,49,0.5)', fontWeight: 300 }}>
                {fill(meta.description)}
              </p>
              <p className="text-xs" style={{ color: 'rgba(24,24,49,0.35)', fontWeight: 300, fontStyle: 'italic' }}>
                {country.tagline}
              </p>
            </div>

            {/* Purchase card */}
            <div
              className="bg-white rounded-2xl p-8"
              style={{ border: '1px solid #eef0f3', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
            >
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'rgba(24,24,49,0.35)', fontWeight: 300 }}>{meta.name}</p>
              <div className="flex items-baseline gap-1.5 mb-1">
                <span style={{ fontSize: 'clamp(32px, 4vw, 44px)', fontWeight: 200, color: '#181831', letterSpacing: '-0.02em' }}>
                  {meta.price}
                </span>
                <span className="text-xs" style={{ color: 'rgba(24,24,49,0.35)', fontWeight: 300 }}>one-time</span>
              </div>
              <p className="text-xs mb-6" style={{ color: 'rgba(24,24,49,0.4)', fontWeight: 300 }}>{fill(meta.tagline)}</p>

              {alreadyOwned ? (
                <div
                  className="w-full py-3 rounded-xl text-sm text-center mb-4"
                  style={{ background: 'rgba(81,231,76,0.1)', color: '#181831', fontWeight: 300 }}
                >
                  ✓ You already own this guide
                </div>
              ) : (
                <button
                  onClick={handleBuy}
                  disabled={loading}
                  className="w-full py-3 rounded-xl text-sm font-normal transition hover:opacity-90 disabled:opacity-50 mb-4 flex items-center justify-center gap-2"
                  style={{ background: '#51e74c', color: '#181831', border: 'none', cursor: 'pointer' }}
                >
                  {loading ? 'Redirecting to payment…' : `Get ${country.name} ${meta.name}`}
                  {!loading && (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  )}
                </button>
              )}

              <div className="flex items-center justify-center gap-4 text-xs" style={{ color: 'rgba(24,24,49,0.3)', fontWeight: 300 }}>
                <span>One-time payment</span>
                <span>·</span>
                <span>Instant access</span>
                <span>·</span>
                <span>Secure checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[90%] mx-auto py-10 sm:py-14 space-y-8">

        {/* ─── WHAT'S INCLUDED ──────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-8 sm:p-10" style={{ border: '1px solid #eef0f3' }}>
          <p className="text-xs uppercase tracking-widest mb-8" style={{ color: '#51e74c' }}>What&apos;s included</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {meta.features.map((f, i) => (
              <div key={i} className="flex items-start gap-4">
                <span
                  className="mt-1 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(81,231,76,0.15)' }}
                >
                  <svg className="w-3 h-3" style={{ color: '#181831' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </span>
                <div>
                  <p className="text-sm text-navy mb-1" style={{ fontWeight: 300 }}>{f.label}</p>
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(24,24,49,0.5)', fontWeight: 300 }}>{fill(f.detail)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── ALSO AVAILABLE ───────────────────────────────────────────────────── */}
        <div>
          <p className="text-xs uppercase tracking-widest mb-5" style={{ color: 'rgba(24,24,49,0.35)', fontWeight: 400 }}>Also available for {country.name}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {packageType !== 'country' && (
              <Link
                href={`/services/${country.slug}/country`}
                className="bg-white rounded-2xl p-6 flex items-start gap-4 transition hover:shadow-md group"
                style={{ border: '1px solid #eef0f3', textDecoration: 'none' }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(12,77,134,0.08)', color: '#0c4d86' }}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c-.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'rgba(24,24,49,0.35)', fontWeight: 300 }}>Country Guide</p>
                  <p className="text-sm text-navy mb-1" style={{ fontWeight: 300 }}>Full {country.name} guide</p>
                  <p className="text-xs" style={{ color: '#0c4d86', fontWeight: 300 }}>€7.99 · one-time</p>
                </div>
                <svg className="w-4 h-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#0c4d86' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            )}
            {packageType !== 'documents' && (
              <Link
                href={`/services/${country.slug}/documents`}
                className="bg-white rounded-2xl p-6 flex items-start gap-4 transition hover:shadow-md group"
                style={{ border: '1px solid #eef0f3', textDecoration: 'none' }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(12,77,134,0.08)', color: '#0c4d86' }}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'rgba(24,24,49,0.35)', fontWeight: 300 }}>Documents & Relocation</p>
                  <p className="text-sm text-navy mb-1" style={{ fontWeight: 300 }}>{country.name} relocation guide</p>
                  <p className="text-xs" style={{ color: '#0c4d86', fontWeight: 300 }}>€3.99 · one-time</p>
                </div>
                <svg className="w-4 h-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#0c4d86' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            )}
            <Link
              href="/services/scholarship"
              className="bg-white rounded-2xl p-6 flex items-start gap-4 transition hover:shadow-md group"
              style={{ border: '1px solid #eef0f3', textDecoration: 'none' }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(12,77,134,0.08)', color: '#0c4d86' }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'rgba(24,24,49,0.35)', fontWeight: 300 }}>Scholarship Guide</p>
                <p className="text-sm text-navy mb-1" style={{ fontWeight: 300 }}>Browse all scholarships</p>
                <p className="text-xs" style={{ color: '#0c4d86', fontWeight: 300 }}>from €5.99 · per scholarship</p>
              </div>
              <svg className="w-4 h-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#0c4d86' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>

      </div>
    </main>
  )
}
