import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import RevealOnScroll from '@/components/ui/RevealOnScroll'

type CityGuide = { city: string; description: string; best_for: string }
type ChecklistItem = { step: string; description: string; required_docs?: string[] }

type CountryGated = {
  why_this_country: string | null
  lifestyle: string | null
  finance: string | null
  career: string | null
  city_guide: CityGuide[] | null
  scholarship_overview: string | null
  housing_overview: string | null
  universities_list: string[] | null
}

type DocumentsGated = {
  visa_process: string | null
  document_checklist: ChecklistItem[] | null
  moving_guide: string | null
  bank_account_guide: string | null
  arrival_tips: string | null
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-xl px-5 py-4 flex-1 min-w-[140px]"
      style={{ background: '#f8f9fb', border: '1px solid #eef0f3' }}
    >
      <p className="text-xs mb-1" style={{ color: 'rgba(24,24,49,0.4)', fontWeight: 300 }}>{label}</p>
      <p className="text-sm text-navy" style={{ fontWeight: 400 }}>{value}</p>
    </div>
  )
}

function SectionLabel({ text }: { text: string }) {
  return (
    <p className="text-xs uppercase tracking-widest mb-3" style={{ color: '#51e74c' }}>{text}</p>
  )
}

function Divider() {
  return <div style={{ height: '1px', background: '#e4ebf3' }} />
}

function LockedCard({ title, description, href = '/services' }: { title: string; description: string; href?: string }) {
  return (
    <div
      className="rounded-2xl p-10 text-center"
      style={{ background: '#f8f9fb', border: '1px solid #eef0f3' }}
    >
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center mx-auto mb-5"
        style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}
      >
        <svg className="w-5 h-5" style={{ color: '#0c4d86' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
      </div>
      <h3 className="text-base text-navy mb-2" style={{ fontWeight: 300 }}>{title}</h3>
      <p className="text-sm mb-7 max-w-xs mx-auto leading-relaxed" style={{ color: 'rgba(24,24,49,0.5)', fontWeight: 300 }}>
        {description}
      </p>
      <Link
        href={href}
        className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm transition hover:opacity-90"
        style={{ background: '#51e74c', color: '#181831', fontWeight: 400 }}
      >
        View packages
      </Link>
    </div>
  )
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('countries')
    .select('name, tagline')
    .eq('slug', slug)
    .single()

  if (!data) return {}
  return {
    title: `${data.name} — Fix It`,
    description: data.tagline ?? `Study in ${data.name} — alumni-verified guide.`,
  }
}

export default async function CountryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch country — only select free fields first
  const { data: country } = await supabase
    .from('countries')
    .select('slug, name, tagline, overview_free, tuition_range_public, tuition_range_private, cost_of_living_range')
    .eq('slug', slug)
    .single()

  if (!country) notFound()

  // Auth + purchases — server-side only
  const { data: { user } } = await supabase.auth.getUser()

  let hasCountryPackage = false
  let hasDocumentsPackage = false
  let countryGated: CountryGated | null = null
  let documentsGated: DocumentsGated | null = null

  if (user) {
    const { data: purchases } = await supabase
      .from('purchases')
      .select('package_type, country_slug')
      .eq('user_id', user.id)

    hasCountryPackage = purchases?.some(
      p => p.package_type === 'country' && p.country_slug === slug
    ) ?? false

    hasDocumentsPackage = purchases?.some(
      p => p.package_type === 'documents' && p.country_slug === slug
    ) ?? false
  }

  // Only fetch gated content if user has purchased — never send to client otherwise
  if (hasCountryPackage) {
    const { data } = await supabase
      .from('countries')
      .select('why_this_country, lifestyle, finance, career, city_guide, scholarship_overview, housing_overview, universities_list')
      .eq('slug', slug)
      .single()
    countryGated = data as CountryGated | null
  }

  if (hasDocumentsPackage) {
    const { data } = await supabase
      .from('countries')
      .select('visa_process, document_checklist, moving_guide, bank_account_guide, arrival_tips')
      .eq('slug', slug)
      .single()
    documentsGated = data as DocumentsGated | null
  }

  const cityGuide = countryGated?.city_guide as CityGuide[] | null
  const documentChecklist = documentsGated?.document_checklist as ChecklistItem[] | null

  return (
    <main className="bg-white min-h-screen">

      {/* ─── BREADCRUMB + HERO ─────────────────────────────────────────────── */}
      <section className="py-14 sm:py-20 border-b border-gray-100">
        <div className="max-w-[90%] mx-auto">
          <Link
            href="/countries"
            className="inline-flex items-center gap-1.5 text-xs mb-8 transition-opacity hover:opacity-70"
            style={{ color: 'rgba(24,24,49,0.4)', fontWeight: 300 }}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            All countries
          </Link>

          <RevealOnScroll>
            <h1
              className="mb-3"
              style={{ color: '#181831', fontWeight: 300, fontSize: 'clamp(28px, 4vw, 52px)', lineHeight: 1.15 }}
            >
              {country.name}
            </h1>
            {country.tagline && (
              <p className="text-base sm:text-lg max-w-xl" style={{ color: 'rgba(24,24,49,0.5)', fontWeight: 300 }}>
                {country.tagline}
              </p>
            )}
          </RevealOnScroll>
        </div>
      </section>

      {/* ─── QUICK STATS ───────────────────────────────────────────────────── */}
      {(country.tuition_range_public || country.tuition_range_private || country.cost_of_living_range) && (
        <section className="py-8 border-b border-gray-100">
          <div className="max-w-[90%] mx-auto flex flex-wrap gap-3">
            {country.tuition_range_public && (
              <StatCard label="Public tuition / year" value={country.tuition_range_public} />
            )}
            {country.tuition_range_private && (
              <StatCard label="Private tuition / year" value={country.tuition_range_private} />
            )}
            {country.cost_of_living_range && (
              <StatCard label="Living costs / month" value={country.cost_of_living_range} />
            )}
          </div>
        </section>
      )}

      {/* ─── FREE OVERVIEW ─────────────────────────────────────────────────── */}
      {country.overview_free && (
        <>
          <section className="py-14 sm:py-16">
            <div className="max-w-[90%] mx-auto max-w-3xl">
              <RevealOnScroll>
                <SectionLabel text="Overview" />
                <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'rgba(24,24,49,0.65)', fontWeight: 300 }}>
                  {country.overview_free}
                </p>
              </RevealOnScroll>
            </div>
          </section>
          <Divider />
        </>
      )}

      {/* ─── COUNTRY PACKAGE ───────────────────────────────────────────────── */}
      <section className="py-14 sm:py-20">
        <div className="max-w-[90%] mx-auto">
          {!hasCountryPackage ? (
            <RevealOnScroll>
              <LockedCard
                title="Full country guide"
                description={`Unlock the complete ${country.name} guide — why this country, lifestyle, career prospects, city breakdown, scholarships, and housing.`}
              />
            </RevealOnScroll>
          ) : (
            <div className="space-y-14">

              {countryGated?.why_this_country && (
                <RevealOnScroll>
                  <SectionLabel text="Why this country" />
                  <h2 className="text-xl sm:text-2xl text-navy mb-4" style={{ fontWeight: 300 }}>
                    Why study in {country.name}?
                  </h2>
                  <p className="text-sm leading-relaxed max-w-3xl" style={{ color: 'rgba(24,24,49,0.65)', fontWeight: 300 }}>
                    {countryGated.why_this_country}
                  </p>
                </RevealOnScroll>
              )}

              {(countryGated?.lifestyle || countryGated?.career) && (
                <RevealOnScroll>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {countryGated?.lifestyle && (
                      <div className="rounded-2xl p-6" style={{ background: '#f8f9fb', border: '1px solid #eef0f3' }}>
                        <SectionLabel text="Lifestyle" />
                        <p className="text-sm leading-relaxed" style={{ color: 'rgba(24,24,49,0.65)', fontWeight: 300 }}>
                          {countryGated.lifestyle}
                        </p>
                      </div>
                    )}
                    {countryGated?.career && (
                      <div className="rounded-2xl p-6" style={{ background: '#f8f9fb', border: '1px solid #eef0f3' }}>
                        <SectionLabel text="Career prospects" />
                        <p className="text-sm leading-relaxed" style={{ color: 'rgba(24,24,49,0.65)', fontWeight: 300 }}>
                          {countryGated.career}
                        </p>
                      </div>
                    )}
                  </div>
                </RevealOnScroll>
              )}

              {countryGated?.finance && (
                <RevealOnScroll>
                  <SectionLabel text="Finances" />
                  <p className="text-sm leading-relaxed max-w-3xl" style={{ color: 'rgba(24,24,49,0.65)', fontWeight: 300 }}>
                    {countryGated.finance}
                  </p>
                </RevealOnScroll>
              )}

              {countryGated?.scholarship_overview && (
                <RevealOnScroll>
                  <SectionLabel text="Scholarships" />
                  <p className="text-sm leading-relaxed max-w-3xl" style={{ color: 'rgba(24,24,49,0.65)', fontWeight: 300 }}>
                    {countryGated.scholarship_overview}
                  </p>
                </RevealOnScroll>
              )}

              {countryGated?.housing_overview && (
                <RevealOnScroll>
                  <SectionLabel text="Housing" />
                  <p className="text-sm leading-relaxed max-w-3xl" style={{ color: 'rgba(24,24,49,0.65)', fontWeight: 300 }}>
                    {countryGated.housing_overview}
                  </p>
                </RevealOnScroll>
              )}

              {cityGuide && cityGuide.length > 0 && (
                <RevealOnScroll>
                  <SectionLabel text="City guide" />
                  <h2 className="text-xl sm:text-2xl text-navy mb-6" style={{ fontWeight: 300 }}>
                    Where to study in {country.name}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cityGuide.map((c, i) => (
                      <div
                        key={i}
                        className="rounded-2xl p-5"
                        style={{ border: '1px solid #eef0f3', background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                      >
                        <h3 className="text-base text-navy mb-2" style={{ fontWeight: 300 }}>{c.city}</h3>
                        {c.best_for && (
                          <p className="text-xs mb-3 px-2 py-1 rounded-full inline-block" style={{ background: 'rgba(81,231,76,0.1)', color: '#181831', fontWeight: 300 }}>
                            Best for: {c.best_for}
                          </p>
                        )}
                        {c.description && (
                          <p className="text-sm leading-relaxed" style={{ color: 'rgba(24,24,49,0.55)', fontWeight: 300 }}>
                            {c.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </RevealOnScroll>
              )}

            </div>
          )}
        </div>
      </section>

      <Divider />

      {/* ─── DOCUMENTS PACKAGE ─────────────────────────────────────────────── */}
      <section className="py-14 sm:py-20">
        <div className="max-w-[90%] mx-auto">
          {!hasDocumentsPackage ? (
            <RevealOnScroll>
              <LockedCard
                title="Documents & relocation guide"
                description={`Step-by-step visa instructions, document checklist, moving guide, bank account setup, and arrival tips for ${country.name}.`}
              />
            </RevealOnScroll>
          ) : (
            <div className="space-y-14">

              {documentsGated?.visa_process && (
                <RevealOnScroll>
                  <SectionLabel text="Visa process" />
                  <h2 className="text-xl sm:text-2xl text-navy mb-4" style={{ fontWeight: 300 }}>
                    Getting your visa
                  </h2>
                  <p className="text-sm leading-relaxed max-w-3xl" style={{ color: 'rgba(24,24,49,0.65)', fontWeight: 300 }}>
                    {documentsGated.visa_process}
                  </p>
                </RevealOnScroll>
              )}

              {documentChecklist && documentChecklist.length > 0 && (
                <RevealOnScroll>
                  <SectionLabel text="Document checklist" />
                  <h2 className="text-xl sm:text-2xl text-navy mb-6" style={{ fontWeight: 300 }}>
                    What you need to prepare
                  </h2>
                  <div className="space-y-3 max-w-2xl">
                    {documentChecklist.map((item, i) => (
                      <div
                        key={i}
                        className="rounded-xl p-5"
                        style={{ border: '1px solid #eef0f3', background: 'white' }}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs"
                            style={{ background: 'rgba(81,231,76,0.12)', color: '#181831', fontWeight: 400 }}
                          >
                            {i + 1}
                          </div>
                          <div>
                            <p className="text-sm text-navy mb-1" style={{ fontWeight: 400 }}>{item.step}</p>
                            {item.description && (
                              <p className="text-xs leading-relaxed" style={{ color: 'rgba(24,24,49,0.5)', fontWeight: 300 }}>
                                {item.description}
                              </p>
                            )}
                            {item.required_docs && item.required_docs.length > 0 && (
                              <ul className="mt-2 space-y-1">
                                {item.required_docs.map((doc, j) => (
                                  <li key={j} className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(24,24,49,0.5)', fontWeight: 300 }}>
                                    <span style={{ color: '#51e74c', fontSize: '8px' }}>●</span>
                                    {doc}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </RevealOnScroll>
              )}

              {(documentsGated?.moving_guide || documentsGated?.bank_account_guide || documentsGated?.arrival_tips) && (
                <RevealOnScroll>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {documentsGated?.moving_guide && (
                      <div className="rounded-2xl p-6" style={{ background: '#f8f9fb', border: '1px solid #eef0f3' }}>
                        <SectionLabel text="Moving guide" />
                        <p className="text-sm leading-relaxed" style={{ color: 'rgba(24,24,49,0.65)', fontWeight: 300 }}>
                          {documentsGated.moving_guide}
                        </p>
                      </div>
                    )}
                    {documentsGated?.bank_account_guide && (
                      <div className="rounded-2xl p-6" style={{ background: '#f8f9fb', border: '1px solid #eef0f3' }}>
                        <SectionLabel text="Bank account" />
                        <p className="text-sm leading-relaxed" style={{ color: 'rgba(24,24,49,0.65)', fontWeight: 300 }}>
                          {documentsGated.bank_account_guide}
                        </p>
                      </div>
                    )}
                    {documentsGated?.arrival_tips && (
                      <div className="rounded-2xl p-6" style={{ background: '#f8f9fb', border: '1px solid #eef0f3' }}>
                        <SectionLabel text="Arrival tips" />
                        <p className="text-sm leading-relaxed" style={{ color: 'rgba(24,24,49,0.65)', fontWeight: 300 }}>
                          {documentsGated.arrival_tips}
                        </p>
                      </div>
                    )}
                  </div>
                </RevealOnScroll>
              )}

            </div>
          )}
        </div>
      </section>

    </main>
  )
}
