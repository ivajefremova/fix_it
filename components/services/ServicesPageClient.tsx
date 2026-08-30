'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import WishlistButton from './WishlistButton'
import HeroSheets from '@/components/ui/HeroSheets'
import RevealOnScroll from '@/components/ui/RevealOnScroll'

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
    tagline: 'Want to secure a scholarship with a full guide from students who have done it?',
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


// ─── Why Fix It — zig-zag with image slots ────────────────────────────────────

const WHY_STEPS = [
  {
    n: '01',
    heading: 'Your deadlines. All in one place.',
    body: 'A personalised, always-updated calendar of every deadline you need — university applications, enrollment dates, scholarship applications, or both. Nothing slips through.',
    flip: false,
    image: '/images/ss%20/WhatsApp%20Image%202026-08-30%20at%2001.53.58.jpeg',
    imgWidth: 460,
    imgOffset: 'translateY(40px) translateX(-24px)',
  },
  {
    n: '02',
    heading: 'Know before it\'s too late.',
    body: 'Get notified when a deadline is approaching. No more checking tabs and hoping you remembered. The reminder comes to you.',
    flip: true,
    image: '/images/ss%20/image%204.png',
    imgWidth: 530,
    imgOffset: 'translateY(-36px) translateX(20px)',
  },
  {
    n: '03',
    heading: 'Depth that actually helps.',
    body: 'Read in-depth information carefully curated by students — explaining specific situations, clearing up vague official guidance and giving real personal experience from people who went through it.',
    flip: false,
    image: '/images/ss%20/image%206.png',
    imgWidth: 430,
    imgOffset: 'translateY(50px) translateX(-18px)',
  },
]

function ScrollWire({ sectionRef, flips }: { sectionRef: React.RefObject<HTMLElement | null>; flips: boolean[] }) {
  const fillRef = useRef<SVGPathElement>(null)
  const [dims, setDims] = useState({ w: 0, h: 0 })
  const [pathLen, setPathLen] = useState(0)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const update = () => setDims({ w: el.offsetWidth, h: el.offsetHeight })
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [sectionRef])

  const path = useMemo<string>(() => {
    const { w, h } = dims
    if (!w || !h) return ''
    const n = flips.length
    const lx = w * 0.26
    const rx = w * 0.74
    const r = Math.min(72, w * 0.06)
    const padFrac = 0.09
    const span = h * (1 - 2 * padFrac) / n
    const cy = (i: number) => h * padFrac + span * i + span * 0.5

    const parts: string[] = [`M ${flips[0] ? rx : lx} 0`]
    for (let i = 0; i < n; i++) {
      const cx = flips[i] ? rx : lx
      const cyi = cy(i)
      if (i === 0) parts.push(`V ${cyi}`)
      if (i < n - 1) {
        const ncx = flips[i + 1] ? rx : lx
        const ncyi = cy(i + 1)
        const mid = (cyi + ncyi) / 2
        if (cx < ncx) {
          parts.push(`V ${mid - r}`, `Q ${cx} ${mid} ${cx + r} ${mid}`, `H ${ncx - r}`, `Q ${ncx} ${mid} ${ncx} ${mid + r}`)
        } else {
          parts.push(`V ${mid - r}`, `Q ${cx} ${mid} ${cx - r} ${mid}`, `H ${ncx + r}`, `Q ${ncx} ${mid} ${ncx} ${mid + r}`)
        }
        parts.push(`V ${ncyi}`)
      } else {
        parts.push(`V ${h}`)
      }
    }
    return parts.join(' ')
  }, [dims, flips])

  useEffect(() => {
    const el = fillRef.current
    if (!el || !path) return
    const len = el.getTotalLength()
    setPathLen(len)
    el.style.strokeDasharray = String(len)
    el.style.strokeDashoffset = String(len)
  }, [path])

  useEffect(() => {
    if (!pathLen || !sectionRef.current) return
    const section = sectionRef.current
    const onScroll = () => {
      const rect = section.getBoundingClientRect()
      const scrollable = rect.height - window.innerHeight
      const progress = scrollable > 0 ? Math.max(0, Math.min(1, -rect.top / scrollable)) : 0
      if (fillRef.current) fillRef.current.style.strokeDashoffset = String(pathLen * (1 - progress))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [pathLen, sectionRef])

  if (!dims.w) return null
  return (
    <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'hidden' }} aria-hidden>
      <path d={path} fill="none" stroke="rgba(12,77,134,0.13)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path ref={fillRef} d={path} fill="none" stroke="#51e74c" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function WhyStep({ body, flip, image, imgWidth, imgOffset }: typeof WHY_STEPS[0]) {
  const imgJustify = flip ? 'flex-end' : 'flex-start'
  const textPadding = flip ? { paddingRight: '5rem' } : { paddingLeft: '5rem' }

  const imageEl = (
    <div style={{ display: 'flex', justifyContent: imgJustify }}>
      <img
        src={image}
        alt=""
        style={{
          width: `${imgWidth}px`, maxWidth: '100%', height: 'auto', borderRadius: 16, display: 'block',
          transform: imgOffset,
        }}
      />
    </div>
  )

  const text = (
    <div className="flex flex-col" style={{ maxWidth: 500, ...textPadding, background: '#fff', borderRadius: 12, padding: '12px 20px' }}>
      <p style={{ fontSize: 'clamp(19px, 1.8vw, 23px)', color: '#181831', fontWeight: 400, lineHeight: 2, fontFamily: 'inherit' }}>
        {body}
      </p>
    </div>
  )

  return (
    <div className={`flex flex-col ${flip ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-10 md:gap-16`}>
      <div className="flex-1 w-full">
        <RevealOnScroll direction={flip ? 'right' : 'left'}>
          {imageEl}
        </RevealOnScroll>
      </div>
      <div className="flex-1 w-full" style={{ textAlign: 'left' }}>
        <RevealOnScroll direction={flip ? 'left' : 'right'} delay={80}>
          {text}
        </RevealOnScroll>
      </div>
    </div>
  )
}

function WhyFixIt() {
  const sectionRef = useRef<HTMLElement>(null)
  const closingRef = useRef<HTMLDivElement>(null)
  const [closingVisible, setClosingVisible] = useState(false)
  useEffect(() => {
    const el = closingRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setClosingVisible(true); obs.disconnect() } },
      { threshold: 0.3 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <section ref={sectionRef as React.RefObject<HTMLDivElement>} className="bg-white" style={{ borderTop: '1px solid #e4ebf3', borderBottom: '1px solid #e4ebf3', paddingTop: '8rem', paddingBottom: '8rem', position: 'relative' }}>
      <ScrollWire sectionRef={sectionRef} flips={WHY_STEPS.map(s => s.flip)} />
      <div className="max-w-[90%] mx-auto" style={{ position: 'relative', zIndex: 1 }}>

        {/* Zig-zag rows */}
        {WHY_STEPS.map((step, i) => (
          <div key={step.n} style={{ marginBottom: i < WHY_STEPS.length - 1 ? '8rem' : 0 }}>
            <WhyStep {...step} />
          </div>
        ))}

        {/* Closing statement */}
        <div
          ref={closingRef}
          style={{
            marginTop: '22rem',
            textAlign: 'center',
            opacity: closingVisible ? 1 : 0,
            transform: closingVisible ? 'translateY(0) scale(1)' : 'translateY(32px) scale(0.97)',
            transition: 'opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          <p style={{
            fontSize: 'clamp(20px, 4vw, 40px)',
            fontWeight: 500, color: '#181831', lineHeight: 1.4,
            background: '#fff', borderRadius: 12, padding: '8px 24px', display: 'inline-block',
          }}>
            Don&apos;t search for people with answers. &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;fix it<span style={{ color: '#51e74c' }}>.</span>
          </p>
        </div>

      </div>
    </section>
  )
}

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
      <section
        className="bg-white border-b"
        style={{ borderColor: '#e4ebf3', minHeight: '560px', position: 'relative' }}
      >
        <div className="max-w-[90%] mx-auto flex items-center" style={{ minHeight: '560px' }}>

          {/* Text */}
          <div className="flex-1 py-24 z-10 relative">
            {success && (
              <div
                className="mb-8 px-5 py-3 rounded-xl text-sm inline-flex items-center gap-2"
                style={{ background: 'rgba(81,231,76,0.12)', color: '#181831', fontWeight: 400 }}
              >
                <svg className="w-4 h-4" style={{ color: '#51e74c' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Payment successful — your guide is ready.
              </div>
            )}
            <p className="text-xs uppercase tracking-widest mb-4 hero-text-in" style={{ color: '#51e74c' }}>Guides & pricing</p>
            <h1
              className="leading-tight mb-4 hero-text-in-2"
              style={{ color: '#181831', fontWeight: 400, fontSize: 'clamp(28px, 4vw, 52px)' }}
            >
              Everything you need.
            </h1>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 hero-text-in-3">
              {['One-time purchase', 'Alumni-verified', 'Lifetime access'].map((t, i) => (
                <span key={i} className="flex items-center gap-2 text-sm" style={{ color: 'rgba(24,24,49,0.75)', fontWeight: 400 }}>
                  <span style={{ color: '#51e74c', fontSize: 8 }}>●</span>
                  {t}
                </span>
              ))}
            </div>
          </div>

          <HeroSheets />

        </div>
      </section>

      {/* ─── WHY FIX IT — ZIG-ZAG ─────────────────────────────────────────────── */}
      <WhyFixIt />

      <div className="max-w-[90%] mx-auto py-10 sm:py-14 space-y-12">

        {/* ─── PACKAGES ────────────────────────────────────────────────────────── */}
        <div id="packages">
          <p className="text-xs uppercase tracking-widest mb-6" style={{ color: 'rgba(24,24,49,0.65)', fontWeight: 400 }}>Choose your guide</p>
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
                    <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'rgba(24,24,49,0.65)', fontWeight: 400 }}>
                      {pkg.name}
                    </p>
                    <div className="flex items-baseline gap-1.5 mb-2">
                      <span style={{ fontSize: 'clamp(28px, 3vw, 36px)', fontWeight: 200, color: '#181831', letterSpacing: '-0.02em' }}>
                        {pkg.price}
                      </span>
                      <span className="text-xs" style={{ color: 'rgba(24,24,49,0.65)', fontWeight: 400 }}>
                        {pkg.needsCountry ? '/ country' : '/ scholarship'}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: 'rgba(24,24,49,0.75)', fontWeight: 400 }}>
                      {pkg.tagline}
                    </p>
                  </div>

                  {/* Features */}
                  <div className="px-8 py-6 flex-1">
                    <ul className="space-y-3">
                      {pkg.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed" style={{ color: 'rgba(24,24,49,0.82)', fontWeight: 400 }}>
                          <span className="mt-1 flex-shrink-0" style={{ color: '#51e74c', fontSize: 8 }}>●</span>
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
                        <span className="text-xs" style={{ color: 'rgba(24,24,49,0.65)', fontWeight: 400 }}>
                          {isSaved ? 'Saved for later' : 'Save for later'}
                        </span>
                      </div>
                    )}
                    {pkg.needsCountry && (
                      <select
                        value={selectedCountry[pkg.id] ?? ''}
                        onChange={e => setSelectedCountry(prev => ({ ...prev, [pkg.id]: e.target.value }))}
                        className="w-full rounded-xl px-4 py-3 text-sm outline-none transition"
                        style={{
                          border: '1px solid #e4ebf3',
                          background: '#fafafa',
                          color: selectedCountry[pkg.id] ? '#181831' : 'rgba(24,24,49,0.65)',
                          fontWeight: 400,
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
                        className="w-full py-3 rounded-xl text-sm text-center"
                        style={{ background: 'rgba(81,231,76,0.1)', color: '#181831', fontWeight: 400 }}
                      >
                        ✓ Already purchased
                      </div>
                    ) : (
                      <button
                        onClick={() => handleNavigate(pkg.id)}
                        disabled={!canNavigate}
                        className="w-full py-3 rounded-xl text-sm font-normal transition hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
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
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(24,24,49,0.78)', fontWeight: 400 }}>{item.a}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  )
}
