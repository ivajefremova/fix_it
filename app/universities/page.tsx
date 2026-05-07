import { createClient } from '@/lib/supabase/server'
import UniversityList from '@/components/universities/UniversityList'
import RevealOnScroll from '@/components/ui/RevealOnScroll'

export const metadata = {
  title: 'Universities — Fix It',
  description: 'Browse alumni-verified university guides across 8 European countries.',
}

export default async function UniversitiesPage() {
  const supabase = await createClient()
  const { data: universities } = await supabase
    .from('universities')
    .select('slug, name, country, country_slug, city, type, quick_summary, tuition_range, tags, ranking_summary')
    .order('name')

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
          <UniversityList universities={universities ?? []} />
        </div>
      </section>

    </main>
  )
}
