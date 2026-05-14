import { createClient } from '@/lib/supabase/server'
import UniversityList from '@/components/universities/UniversityList'
import ScholarshipTabs from '@/components/universities/ScholarshipTabs'
import RevealOnScroll from '@/components/ui/RevealOnScroll'

export const metadata = {
  title: 'Universities — Fix It',
  description: 'Browse alumni-verified university guides across 8 European countries.',
}

export default async function UniversitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ field?: string; country?: string; level?: string; type?: string; scholarship?: string }>
}) {
  const sp = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: raw }, { data: scholarshipsRaw }, { data: favRows }] = await Promise.all([
    supabase
      .from('universities')
      .select('slug, name, country, country_slug, city, type, quick_summary, tuition_range, tags, ranking_summary, scholarships, subject_rankings')
      .order('name'),
    supabase
      .from('scholarships')
      .select('id, country_slug, country, name, description, amount, eligibility, deadline, university_slugs')
      .order('name'),
    user
      ? supabase.from('favorites').select('item_slug').eq('user_id', user.id)
      : Promise.resolve({ data: [] }),
  ])

  const favouritedSlugs = new Set((favRows ?? []).map(f => f.item_slug))

  const universities = (raw ?? []).map(u => ({
    slug: u.slug,
    name: u.name,
    country: u.country,
    country_slug: u.country_slug,
    city: u.city,
    type: u.type,
    quick_summary: u.quick_summary,
    tuition_range: u.tuition_range,
    tags: u.tags,
    ranking_summary: u.ranking_summary,
    subject_rankings: (u.subject_rankings ?? {}) as Record<string, number>,
    has_scholarship: Array.isArray(u.scholarships) && u.scholarships.length > 0,
  }))

  const scholarships = (scholarshipsRaw ?? []).map(s => ({
    id: s.id,
    country_slug: s.country_slug,
    country: s.country,
    name: s.name,
    description: s.description as string | null,
    amount: s.amount as string | null,
    eligibility: s.eligibility as string | null,
    deadline: s.deadline as string | null,
    university_slugs: (s.university_slugs ?? []) as string[],
  }))

  return (
    <main className="min-h-screen" style={{ background: '#f8f9fb' }}>

      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100 py-14 sm:py-20">
        <div className="max-w-[90%] mx-auto">
          <RevealOnScroll>
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: '#51e74c' }}>Universities</p>
            <h1
              className="mb-3 leading-tight"
              style={{ color: '#181831', fontWeight: 300, fontSize: 'clamp(26px, 4vw, 46px)' }}
            >
              Find your university
            </h1>
            <p className="text-sm max-w-lg leading-relaxed" style={{ color: 'rgba(24,24,49,0.5)', fontWeight: 300 }}>
              Every guide is written by Macedonian alumni who studied there. Real admission info, real costs, real insight.
            </p>
          </RevealOnScroll>
        </div>
      </section>

      {/* ─── LIST + FILTERS ───────────────────────────────────────────────── */}
      <section className="py-10">
        <div className="max-w-[90%] mx-auto">
          <UniversityList
            universities={universities}
            initialField={sp.field}
            initialCountry={sp.country}
            initialLevel={sp.level}
            initialType={sp.type}
            initialScholarship={sp.scholarship === 'true'}
            favouritedSlugs={Array.from(favouritedSlugs)}
            isLoggedIn={!!user}
          />
        </div>
      </section>

      <div style={{ height: '1px', background: '#e4ebf3' }} />

      {/* ─── SCHOLARSHIP GUIDE ────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20">
        <div className="max-w-[90%] mx-auto">
          <RevealOnScroll>
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: '#51e74c' }}>Scholarship guide</p>
            <h2
              className="mb-3"
              style={{ color: '#181831', fontWeight: 300, fontSize: 'clamp(22px, 3vw, 36px)' }}
            >
              Need a scholarship to study abroad?
            </h2>
            <p className="text-sm mb-10 max-w-lg leading-relaxed" style={{ color: 'rgba(24,24,49,0.5)', fontWeight: 300 }}>
              Complete guide to the application process, evaluation of eligibility and criteria for the scholarship. Be 100% free of financial stress.
            </p>
          </RevealOnScroll>
          <RevealOnScroll delay={80}>
            <ScholarshipTabs universities={universities} scholarships={scholarships} />
          </RevealOnScroll>
        </div>
      </section>

    </main>
  )
}
