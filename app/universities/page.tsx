import { createClient } from '@/lib/supabase/server'
import UniversityList from '@/components/universities/UniversityList'
import ScholarshipTabs from '@/components/universities/ScholarshipTabs'
import UniversityHero from '@/components/universities/UniversityHero'
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
      .select('slug, name, country, country_slug, city, type, quick_summary, tuition_range, tags, ranking_summary, scholarships, subject_rankings, hero_image_url, qs_rank, shanghai_rank')
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
    hero_image_url: u.hero_image_url as string | null,
    qs_rank: u.qs_rank as number | null,
    shanghai_rank: u.shanghai_rank as number | null,
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
      <UniversityHero />

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
      <section className="bg-white" style={{ borderTop: '1px solid #e4ebf3', minHeight: '100vh' }}>
        <div className="px-[4%]" style={{ paddingTop: '10rem', paddingBottom: '7rem' }}>
          <RevealOnScroll>
            <ScholarshipTabs universities={universities} scholarships={scholarships} />
          </RevealOnScroll>
        </div>
      </section>

    </main>
  )
}
