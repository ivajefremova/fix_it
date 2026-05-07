import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import RevealOnScroll from '@/components/ui/RevealOnScroll'

type Course      = { name: string; link?: string; language?: string }
type Requirement = { requirement: string }
type Scholarship = { name: string; description?: string; amount?: string; eligibility?: string; link?: string }
type Accommodation = { name: string; description?: string; link?: string }

type CountryGated = {
  overview_full:         string | null
  ranking_full:          string | null
  undergraduate_courses: Course[] | null
  graduate_courses:      Course[] | null
  admission_eu:          Requirement[] | null
  admission_non_eu:      Requirement[] | null
  accommodation:         Accommodation[] | null
  student_life:          string | null
}

type ScholarshipGated = {
  scholarships: Scholarship[] | null
}

/* ── small helpers ───────────────────────────────────────────────────────── */

function SectionLabel({ text }: { text: string }) {
  return <p className="text-xs uppercase tracking-widest mb-3" style={{ color: '#51e74c' }}>{text}</p>
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`bg-white rounded-2xl p-6 sm:p-8 ${className}`}
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)' }}
    >
      {children}
    </div>
  )
}

function LockedCard({ title, description }: { title: string; description: string }) {
  return (
    <Card>
      <div className="flex flex-col items-center text-center py-6">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center mb-5"
          style={{ background: '#f0f2f5' }}
        >
          <svg className="w-5 h-5" style={{ color: '#0c4d86' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
        <h3 className="text-base text-navy mb-2" style={{ fontWeight: 300 }}>{title}</h3>
        <p className="text-sm mb-7 max-w-sm leading-relaxed" style={{ color: 'rgba(24,24,49,0.5)', fontWeight: 300 }}>
          {description}
        </p>
        <Link
          href="/services"
          className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-normal transition hover:opacity-90"
          style={{ background: '#51e74c', color: '#181831', fontWeight: 400 }}
        >
          View packages
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>
    </Card>
  )
}

function CourseRow({ course }: { course: Course }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3" style={{ borderBottom: '1px solid #f0f2f5' }}>
      <div className="flex items-center gap-2 min-w-0">
        <span style={{ color: '#51e74c', fontSize: '8px', flexShrink: 0 }}>●</span>
        <span className="text-sm text-navy truncate" style={{ fontWeight: 300 }}>{course.name}</span>
        {course.language && course.language !== 'English' && (
          <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: '#f0f2f5', color: 'rgba(24,24,49,0.5)', fontWeight: 300 }}>
            {course.language}
          </span>
        )}
      </div>
      {course.link && (
        <a
          href={course.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs flex-shrink-0 flex items-center gap-1 transition-opacity hover:opacity-70"
          style={{ color: '#0c4d86', fontWeight: 300 }}
        >
          Programme page
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
        </a>
      )}
    </div>
  )
}

/* ── metadata ────────────────────────────────────────────────────────────── */

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('universities')
    .select('name, quick_summary')
    .eq('slug', slug)
    .single()

  if (!data) return {}
  return {
    title: `${data.name} — Fix It`,
    description: data.quick_summary ?? `University guide for ${data.name}.`,
  }
}

/* ── page ────────────────────────────────────────────────────────────────── */

export default async function UniversityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  // Free fields only in the base query
  const { data: university } = await supabase
    .from('universities')
    .select('slug, name, country, country_slug, city, type, overview_free, quick_summary, tuition_range, tags, ranking_summary, visa_note')
    .eq('slug', slug)
    .single()

  if (!university) notFound()

  // Auth + purchase check — server side only
  const { data: { user } } = await supabase.auth.getUser()

  let hasCountryPackage    = false
  let hasScholarshipPackage = false
  let countryGated: CountryGated | null     = null
  let scholarshipGated: ScholarshipGated | null = null

  if (user) {
    const { data: purchases } = await supabase
      .from('purchases')
      .select('package_type, country_slug')
      .eq('user_id', user.id)

    hasCountryPackage = purchases?.some(
      p => p.package_type === 'country' && p.country_slug === university.country_slug
    ) ?? false

    hasScholarshipPackage = purchases?.some(
      p => p.package_type === 'scholarship' && p.country_slug === university.country_slug
    ) ?? false
  }

  // Only fetch gated content if purchased — never expose otherwise
  if (hasCountryPackage) {
    const { data } = await supabase
      .from('universities')
      .select('overview_full, ranking_full, undergraduate_courses, graduate_courses, admission_eu, admission_non_eu, accommodation, student_life')
      .eq('slug', slug)
      .single()
    countryGated = data as CountryGated | null
  }

  if (hasScholarshipPackage) {
    const { data } = await supabase
      .from('universities')
      .select('scholarships')
      .eq('slug', slug)
      .single()
    scholarshipGated = data as ScholarshipGated | null
  }

  const undergradCourses = countryGated?.undergraduate_courses ?? []
  const gradCourses      = countryGated?.graduate_courses ?? []
  const admissionEU      = countryGated?.admission_eu ?? []
  const admissionNonEU   = countryGated?.admission_non_eu ?? []
  const accommodation    = countryGated?.accommodation ?? []
  const scholarships     = scholarshipGated?.scholarships ?? []

  return (
    <main className="min-h-screen" style={{ background: '#f8f9fb' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-5">

        {/* Back link */}
        <Link
          href="/universities"
          className="inline-flex items-center gap-1.5 text-xs transition-opacity hover:opacity-70"
          style={{ color: 'rgba(24,24,49,0.4)', fontWeight: 300 }}
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          All universities
        </Link>

        {/* ─── HERO CARD ──────────────────────────────────────────────────── */}
        <RevealOnScroll>
          <Card>
            <div className="flex items-start justify-between gap-4 mb-5">
              <p className="text-xs" style={{ color: 'rgba(24,24,49,0.4)', fontWeight: 300 }}>
                {[university.city, university.country].filter(Boolean).join(' · ')}
              </p>
              {university.type && (
                <span
                  className="text-xs px-2.5 py-1 rounded-full flex-shrink-0"
                  style={{
                    background: university.type === 'Public' ? 'rgba(12,77,134,0.07)' : 'rgba(81,231,76,0.1)',
                    color: university.type === 'Public' ? '#0c4d86' : '#181831',
                    fontWeight: 300,
                  }}
                >
                  {university.type}
                </span>
              )}
            </div>

            <h1
              className="mb-2 leading-tight"
              style={{ color: '#181831', fontWeight: 300, fontSize: 'clamp(22px, 3.5vw, 36px)' }}
            >
              {university.name}
            </h1>

            {university.quick_summary && (
              <p className="text-sm mb-4" style={{ color: '#0c4d86', fontWeight: 300 }}>
                {university.quick_summary}
              </p>
            )}

            {university.ranking_summary && (
              <div className="flex items-center gap-2">
                <span style={{ color: '#51e74c', fontSize: '8px' }}>●</span>
                <p className="text-xs" style={{ color: 'rgba(24,24,49,0.5)', fontWeight: 300 }}>
                  {university.ranking_summary}
                </p>
              </div>
            )}
          </Card>
        </RevealOnScroll>

        {/* ─── STATS CARD ─────────────────────────────────────────────────── */}
        {(university.tuition_range || (university.tags && university.tags.length > 0)) && (
          <RevealOnScroll delay={60}>
            <Card>
              <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                {university.tuition_range && (
                  <div>
                    <p className="text-xs mb-1" style={{ color: 'rgba(24,24,49,0.4)', fontWeight: 300 }}>Tuition / year</p>
                    <p className="text-base text-navy" style={{ fontWeight: 300 }}>{university.tuition_range}</p>
                  </div>
                )}
                {university.tuition_range && university.tags && university.tags.length > 0 && (
                  <div className="hidden sm:block w-px self-stretch" style={{ background: '#f0f2f5' }} />
                )}
                {university.tags && university.tags.length > 0 && (
                  <div>
                    <p className="text-xs mb-2" style={{ color: 'rgba(24,24,49,0.4)', fontWeight: 300 }}>Fields of study</p>
                    <div className="flex flex-wrap gap-1.5">
                      {university.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="text-xs px-2.5 py-1 rounded-full capitalize"
                          style={{ background: '#f0f2f5', color: 'rgba(24,24,49,0.55)', fontWeight: 300 }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </RevealOnScroll>
        )}

        {/* ─── FREE OVERVIEW ──────────────────────────────────────────────── */}
        {university.overview_free && (
          <RevealOnScroll delay={100}>
            <Card>
              <SectionLabel text="Overview" />
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(24,24,49,0.65)', fontWeight: 300 }}>
                {university.overview_free}
              </p>
            </Card>
          </RevealOnScroll>
        )}

        {/* ─── COUNTRY PACKAGE ────────────────────────────────────────────── */}
        <RevealOnScroll delay={120}>
          {!hasCountryPackage ? (
            <LockedCard
              title="Full university guide"
              description={`Unlock the complete ${university.name} guide — full overview, all courses with links, admission requirements, accommodation, and student life.`}
            />
          ) : (
            <div className="space-y-5">

              {/* Full overview + ranking */}
              {(countryGated?.overview_full || countryGated?.ranking_full) && (
                <Card>
                  {countryGated.overview_full && (
                    <>
                      <SectionLabel text="In depth" />
                      <div className="space-y-3 mb-6">
                        {countryGated.overview_full.split('\n\n').map((para, i) => (
                          <p key={i} className="text-sm leading-relaxed" style={{ color: 'rgba(24,24,49,0.65)', fontWeight: 300 }}>
                            {para}
                          </p>
                        ))}
                      </div>
                    </>
                  )}
                  {countryGated.ranking_full && (
                    <>
                      <SectionLabel text="Rankings" />
                      <p className="text-sm leading-relaxed" style={{ color: 'rgba(24,24,49,0.65)', fontWeight: 300 }}>
                        {countryGated.ranking_full}
                      </p>
                    </>
                  )}
                </Card>
              )}

              {/* Courses */}
              {(undergradCourses.length > 0 || gradCourses.length > 0) && (
                <Card>
                  <SectionLabel text="Programmes in English" />
                  {undergradCourses.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm text-navy mb-1" style={{ fontWeight: 300 }}>Undergraduate</h3>
                      <div>
                        {undergradCourses.map((c, i) => <CourseRow key={i} course={c} />)}
                      </div>
                    </div>
                  )}
                  {gradCourses.length > 0 && (
                    <div>
                      <h3 className="text-sm text-navy mb-1" style={{ fontWeight: 300 }}>Graduate</h3>
                      <div>
                        {gradCourses.map((c, i) => <CourseRow key={i} course={c} />)}
                      </div>
                    </div>
                  )}
                </Card>
              )}

              {/* Admission requirements */}
              {(admissionEU.length > 0 || admissionNonEU.length > 0) && (
                <Card>
                  <SectionLabel text="Admission requirements" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {admissionEU.length > 0 && (
                      <div>
                        <h3 className="text-sm text-navy mb-3" style={{ fontWeight: 300 }}>EU students</h3>
                        <ul className="space-y-2">
                          {admissionEU.map((r, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'rgba(24,24,49,0.65)', fontWeight: 300 }}>
                              <span className="mt-1.5 flex-shrink-0" style={{ color: '#51e74c', fontSize: '7px' }}>●</span>
                              {r.requirement}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {admissionNonEU.length > 0 && (
                      <div>
                        <h3 className="text-sm text-navy mb-3" style={{ fontWeight: 300 }}>Non-EU students</h3>
                        <ul className="space-y-2">
                          {admissionNonEU.map((r, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'rgba(24,24,49,0.65)', fontWeight: 300 }}>
                              <span className="mt-1.5 flex-shrink-0" style={{ color: '#51e74c', fontSize: '7px' }}>●</span>
                              {r.requirement}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Accommodation */}
              {accommodation.length > 0 && (
                <Card>
                  <SectionLabel text="Accommodation" />
                  <div className="space-y-3">
                    {accommodation.map((a, i) => (
                      <div
                        key={i}
                        className="rounded-xl p-4"
                        style={{ background: '#f8f9fb', border: '1px solid #eef0f3' }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm text-navy mb-1" style={{ fontWeight: 300 }}>{a.name}</p>
                            {a.description && (
                              <p className="text-xs leading-relaxed" style={{ color: 'rgba(24,24,49,0.5)', fontWeight: 300 }}>
                                {a.description}
                              </p>
                            )}
                          </div>
                          {a.link && (
                            <a
                              href={a.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs flex-shrink-0 transition-opacity hover:opacity-70"
                              style={{ color: '#0c4d86', fontWeight: 300 }}
                            >
                              Visit ↗
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Student life */}
              {countryGated?.student_life && (
                <Card>
                  <SectionLabel text="Student life" />
                  <div className="space-y-3">
                    {countryGated.student_life.split('\n\n').map((para, i) => (
                      <p key={i} className="text-sm leading-relaxed" style={{ color: 'rgba(24,24,49,0.65)', fontWeight: 300 }}>
                        {para}
                      </p>
                    ))}
                  </div>
                </Card>
              )}

            </div>
          )}
        </RevealOnScroll>

        {/* ─── SCHOLARSHIP PACKAGE ────────────────────────────────────────── */}
        <RevealOnScroll delay={140}>
          {!hasScholarshipPackage ? (
            <LockedCard
              title="Scholarship guide"
              description={`See every scholarship available at ${university.name} — names, amounts, eligibility criteria, and how to apply.`}
            />
          ) : scholarships.length > 0 ? (
            <Card>
              <SectionLabel text="Scholarships" />
              <div className="space-y-4">
                {scholarships.map((s, i) => (
                  <div
                    key={i}
                    className="rounded-xl p-5"
                    style={{ background: '#f8f9fb', border: '1px solid #eef0f3' }}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <p className="text-sm text-navy" style={{ fontWeight: 300 }}>{s.name}</p>
                      {s.amount && (
                        <span
                          className="text-xs px-2.5 py-1 rounded-full flex-shrink-0"
                          style={{ background: 'rgba(81,231,76,0.12)', color: '#181831', fontWeight: 300 }}
                        >
                          {s.amount}
                        </span>
                      )}
                    </div>
                    {s.description && (
                      <p className="text-xs leading-relaxed mb-2" style={{ color: 'rgba(24,24,49,0.55)', fontWeight: 300 }}>
                        {s.description}
                      </p>
                    )}
                    {s.eligibility && (
                      <p className="text-xs" style={{ color: 'rgba(24,24,49,0.4)', fontWeight: 300 }}>
                        Eligibility: {s.eligibility}
                      </p>
                    )}
                    {s.link && (
                      <a
                        href={s.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs mt-3 transition-opacity hover:opacity-70"
                        style={{ color: '#0c4d86', fontWeight: 300 }}
                      >
                        Apply
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <Card>
              <SectionLabel text="Scholarships" />
              <p className="text-sm" style={{ color: 'rgba(24,24,49,0.4)', fontWeight: 300 }}>
                Scholarship details coming soon.
              </p>
            </Card>
          )}
        </RevealOnScroll>

        {/* ─── VISA NOTE ──────────────────────────────────────────────────── */}
        {university.visa_note && (
          <RevealOnScroll delay={160}>
            <Card>
              <SectionLabel text="Visa" />
              <p className="text-sm leading-relaxed mb-4" style={{ color: 'rgba(24,24,49,0.65)', fontWeight: 300 }}>
                {university.visa_note}
              </p>
              <Link
                href={`/countries/${university.country_slug}`}
                className="inline-flex items-center gap-1.5 text-xs transition-opacity hover:opacity-70"
                style={{ color: '#0c4d86', fontWeight: 300 }}
              >
                Full visa guide for {university.country}
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </Card>
          </RevealOnScroll>
        )}

      </div>
    </main>
  )
}
