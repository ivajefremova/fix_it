'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

type Scholarship = {
  id: string
  country_slug: string
  country: string
  name: string
  description: string | null
  amount: string | null
  eligibility: string | null
  deadline: string | null
  link: string | null
  university_slugs: string[]
  scholarship_type: string | null
  levels: string[] | null
}

type University = {
  slug: string
  name: string
  city: string | null
  type: string | null
  quick_summary: string | null
}

type Purchase = { package_type: string; country_slug: string }

type Props = {
  scholarship: Scholarship
  universities: University[]
  purchases: Purchase[]
  isLoggedIn: boolean
}

const TYPE_LABELS: Record<string, string> = {
  'merit-based': 'Merit-based',
  'need-based':  'Need-based',
  'government':  'Government grant',
}

const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  'merit-based': { bg: 'rgba(12,77,134,0.07)',  color: '#0c4d86' },
  'need-based':  { bg: 'rgba(81,231,76,0.12)',   color: '#181831' },
  'government':  { bg: 'rgba(24,24,49,0.06)',    color: 'rgba(24,24,49,0.6)' },
}

const WHAT_YOU_GET = [
  'Full eligibility requirements explained in plain language',
  'Step-by-step application process written by a recipient',
  'Required documents checklist with submission tips',
  'Deadlines and key dates — never miss a window',
  'Advice on how to strengthen your application',
  'Real experience from Macedonian students who received it',
]

export default function ScholarshipDetailPage({ scholarship: s, universities, purchases, isLoggedIn }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const uniBySlug = Object.fromEntries(universities.map(u => [u.slug, u]))
  const coveredUnis = s.university_slugs.map(sl => uniBySlug[sl]).filter(Boolean)
  const alreadyOwned = purchases.some(p => p.package_type === 'scholarship' && p.country_slug === s.country_slug)
  const typeColors = TYPE_COLORS[s.scholarship_type ?? 'merit-based'] ?? TYPE_COLORS['merit-based']

  async function handleBuy() {
    if (!isLoggedIn) {
      toast.error('Please log in to purchase a scholarship guide.')
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
        body: JSON.stringify({ package_type: 'scholarship', country_slug: s.country_slug, country: s.country }),
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

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <Link href="/services" className="text-xs hover:opacity-70 transition" style={{ color: 'rgba(24,24,49,0.4)', fontWeight: 300 }}>Guides</Link>
            <span style={{ color: 'rgba(24,24,49,0.25)', fontSize: '10px' }}>›</span>
            <Link href="/services/scholarship" className="text-xs hover:opacity-70 transition" style={{ color: 'rgba(24,24,49,0.4)', fontWeight: 300 }}>Scholarships</Link>
            <span style={{ color: 'rgba(24,24,49,0.25)', fontSize: '10px' }}>›</span>
            <span className="text-xs" style={{ color: '#51e74c', fontWeight: 300 }}>{s.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">

            {/* Left */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span
                  className="text-xs px-2.5 py-1 rounded-full"
                  style={{ background: typeColors.bg, color: typeColors.color, fontWeight: 300 }}
                >
                  {TYPE_LABELS[s.scholarship_type ?? 'merit-based']}
                </span>
                <span className="text-xs" style={{ color: 'rgba(24,24,49,0.35)', fontWeight: 300 }}>{s.country}</span>
                {s.levels && s.levels.map(l => (
                  <span key={l} className="text-xs px-2.5 py-1 rounded-full" style={{ background: '#f0f2f5', color: 'rgba(24,24,49,0.5)', fontWeight: 300 }}>
                    {l.charAt(0).toUpperCase() + l.slice(1)}
                  </span>
                ))}
              </div>

              <h1
                className="mb-4 leading-tight"
                style={{ color: '#181831', fontWeight: 200, fontSize: 'clamp(24px, 3.5vw, 46px)', letterSpacing: '-0.02em' }}
              >
                {s.name}
              </h1>

              {s.description && (
                <p className="text-sm max-w-md leading-relaxed mb-5" style={{ color: 'rgba(24,24,49,0.55)', fontWeight: 300 }}>
                  {s.description}
                </p>
              )}

              <div className="flex flex-wrap gap-4 text-xs">
                {s.amount && (
                  <div>
                    <p className="mb-0.5 uppercase tracking-widest" style={{ color: 'rgba(24,24,49,0.35)', fontWeight: 400, fontSize: '10px' }}>Amount</p>
                    <p style={{ color: '#0c4d86', fontWeight: 300 }}>{s.amount}</p>
                  </div>
                )}
                {s.deadline && (
                  <div>
                    <p className="mb-0.5 uppercase tracking-widest" style={{ color: 'rgba(24,24,49,0.35)', fontWeight: 400, fontSize: '10px' }}>Deadline</p>
                    <p style={{ color: '#181831', fontWeight: 300 }}>{s.deadline}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right — purchase card */}
            <div
              className="bg-white rounded-2xl p-8"
              style={{ border: '1px solid #eef0f3', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
            >
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'rgba(24,24,49,0.35)', fontWeight: 300 }}>Scholarship Guide</p>
              <div className="flex items-baseline gap-1.5 mb-1">
                <span style={{ fontSize: 'clamp(32px, 4vw, 44px)', fontWeight: 200, color: '#181831', letterSpacing: '-0.02em' }}>€5.99</span>
                <span className="text-xs" style={{ color: 'rgba(24,24,49,0.35)', fontWeight: 300 }}>one-time</span>
              </div>
              <p className="text-xs mb-6" style={{ color: 'rgba(24,24,49,0.4)', fontWeight: 300 }}>
                Full guide to applying for this scholarship — written by a Macedonian student who received it.
              </p>

              {alreadyOwned ? (
                <div className="w-full py-3 rounded-xl text-sm text-center mb-4" style={{ background: 'rgba(81,231,76,0.1)', color: '#181831', fontWeight: 300 }}>
                  ✓ You already own this guide
                </div>
              ) : (
                <button
                  onClick={handleBuy}
                  disabled={loading}
                  className="w-full py-3 rounded-xl text-sm font-normal transition hover:opacity-90 disabled:opacity-50 mb-4 flex items-center justify-center gap-2"
                  style={{ background: '#51e74c', color: '#181831', border: 'none', cursor: 'pointer' }}
                >
                  {loading ? 'Redirecting to payment…' : 'Get this scholarship guide'}
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

        {/* ─── ELIGIBILITY ──────────────────────────────────────────────────────── */}
        {s.eligibility && (
          <div className="bg-white rounded-2xl p-8 sm:p-10" style={{ border: '1px solid #eef0f3' }}>
            <p className="text-xs uppercase tracking-widest mb-4" style={{ color: '#51e74c' }}>Eligibility</p>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(24,24,49,0.65)', fontWeight: 300 }}>{s.eligibility}</p>
          </div>
        )}

        {/* ─── WHAT'S IN THE GUIDE ──────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-8 sm:p-10" style={{ border: '1px solid #eef0f3' }}>
          <p className="text-xs uppercase tracking-widest mb-8" style={{ color: '#51e74c' }}>What&apos;s in the guide</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {WHAT_YOU_GET.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="mt-1.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: 'rgba(81,231,76,0.15)' }}>
                  <svg className="w-2.5 h-2.5" style={{ color: '#181831' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </span>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(24,24,49,0.65)', fontWeight: 300 }}>{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── COVERED UNIVERSITIES ─────────────────────────────────────────────── */}
        {coveredUnis.length > 0 && (
          <div className="bg-white rounded-2xl p-8 sm:p-10" style={{ border: '1px solid #eef0f3' }}>
            <p className="text-xs uppercase tracking-widest mb-6" style={{ color: '#51e74c' }}>
              {coveredUnis.length === 1 ? 'University' : 'Universities'} this scholarship applies to
            </p>
            <div className="space-y-3">
              {coveredUnis.map(u => (
                <Link
                  key={u.slug}
                  href={`/universities/${u.slug}`}
                  className="flex items-center justify-between p-4 rounded-xl group transition hover:bg-gray-50"
                  style={{ border: '1px solid #f0f2f5', textDecoration: 'none' }}
                >
                  <div>
                    <p className="text-sm text-navy mb-0.5" style={{ fontWeight: 300 }}>{u.name}</p>
                    <p className="text-xs" style={{ color: 'rgba(24,24,49,0.4)', fontWeight: 300 }}>
                      {[u.city, u.type].filter(Boolean).join(' · ')}
                      {u.quick_summary ? ` · ${u.quick_summary}` : ''}
                    </p>
                  </div>
                  <svg className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" style={{ color: '#0c4d86' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ─── BACK LINK ────────────────────────────────────────────────────────── */}
        <div>
          <Link
            href="/services/scholarship"
            className="inline-flex items-center gap-1.5 text-xs transition hover:opacity-70"
            style={{ color: 'rgba(24,24,49,0.4)', fontWeight: 300 }}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to all scholarships
          </Link>
        </div>

      </div>
    </main>
  )
}
