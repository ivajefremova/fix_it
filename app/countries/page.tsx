import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import RevealOnScroll from '@/components/ui/RevealOnScroll'
import CountriesInteractive from '@/components/countries/CountriesInteractive'
import CountryPackageTabs from '@/components/countries/CountryPackageTabs'
import PhotoGallery from '@/components/countries/PhotoGallery'

export const metadata = {
  title: 'Countries — Fix It',
  description: 'Explore alumni-verified guides for 8 European study destinations.',
}

export default async function CountriesPage() {
  const supabase = await createClient()
  const { data: countries } = await supabase
    .from('countries')
    .select('slug, name, tagline, hero_image_url')
    .order('name')

  const list = countries ?? []

  return (
    <main className="bg-white min-h-screen">

      {/* ─── HERO + MAP + CAROUSEL (shared active state) ──────────────────── */}
      <CountriesInteractive countries={list} />

      <div style={{ height: '1px', background: '#e4ebf3' }} />

      {/* ─── PACKAGES TABS ────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24">
        <div className="max-w-[90%] mx-auto">
          <RevealOnScroll>
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: '#51e74c' }}>Guides</p>
            <h2
              className="mb-3"
              style={{ color: '#181831', fontWeight: 300, fontSize: 'clamp(22px, 3vw, 36px)' }}
            >
              Uninformed about a country?
            </h2>
            <p className="text-sm mb-10 max-w-lg leading-relaxed" style={{ color: 'rgba(24,24,49,0.5)', fontWeight: 300 }}>
              Pick a country and see exactly what you get — a paid, alumni-compiled guide covering everything you need to apply, get funded, and move there.
            </p>
          </RevealOnScroll>
          <RevealOnScroll delay={80}>
            <CountryPackageTabs countries={list} />
          </RevealOnScroll>
        </div>
      </section>

      <div style={{ height: '1px', background: '#e4ebf3' }} />

      {/* ─── PHOTO GALLERY ────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24">
        <div className="max-w-[90%] mx-auto">
          <RevealOnScroll>
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: '#51e74c' }}>Life abroad</p>
            <h2
              className="mb-10"
              style={{ color: '#181831', fontWeight: 300, fontSize: 'clamp(22px, 3vw, 36px)' }}
            >
              A taste of student life
            </h2>
          </RevealOnScroll>
          <RevealOnScroll delay={80}>
            <PhotoGallery />
          </RevealOnScroll>
        </div>
      </section>

      <div style={{ height: '1px', background: '#e4ebf3' }} />

      {/* ─── QUIZ ─────────────────────────────────────────────────────────── */}
      <section className="py-14 sm:py-20">
        <div className="max-w-[90%] mx-auto text-center">
          <RevealOnScroll>
            <p className="text-xs uppercase tracking-widest mb-4" style={{ color: '#51e74c' }}>Find your path</p>
            <h2
              className="mb-3"
              style={{ color: '#181831', fontWeight: 300, fontSize: 'clamp(20px, 2.5vw, 32px)' }}
            >
              Don&apos;t know where to start?
            </h2>
            <p className="text-sm mb-7 max-w-sm mx-auto" style={{ color: 'rgba(24,24,49,0.5)', fontWeight: 300 }}>
              Take the quiz and find the right country for you in 2 minutes.
            </p>
            <Link
              href="/quiz"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-normal transition-all hover:opacity-90"
              style={{ background: '#51e74c', color: '#181831', fontWeight: 400 }}
            >
              Take the quiz
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </RevealOnScroll>
        </div>
      </section>

    </main>
  )
}
