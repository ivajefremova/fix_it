import Link from 'next/link'
import Image from 'next/image'
import RevealOnScroll from '@/components/ui/RevealOnScroll'
import StatsCounter from '@/components/home/StatsCounter'
import ServicesTab from '@/components/home/ServicesTab'
import CountryMarquee from '@/components/home/CountryMarquee'
import HeroSection from '@/components/home/HeroSection'
import HomepageSearch from '@/components/home/HomepageSearch'


export default function HomePage() {
  return (
    <main style={{ background: '#f0f2f5' }}>

      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <HeroSection />

      {/* Divider */}
      <div style={{ height: '1px', background: '#e4ebf3' }} />

      {/* ─── COUNTRIES ────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-[90%] mx-auto mb-10">
          <RevealOnScroll>
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: '#51e74c' }}>Destinations</p>
            <h2 className="text-2xl sm:text-3xl text-navy" style={{ fontWeight: 400 }}>
              Find your dream study destination
            </h2>
          </RevealOnScroll>
        </div>
        <CountryMarquee />
      </section>

      {/* ─── SEARCH ───────────────────────────────────────────────────────── */}
      <HomepageSearch />

      {/* Divider */}
      <div style={{ height: '1px', background: '#e4ebf3' }} />

      {/* ─── SERVICES ─────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-[90%] mx-auto">
          <RevealOnScroll className="mb-10">
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: '#51e74c' }}>What we cover</p>
            <h2 className="text-2xl sm:text-3xl text-navy" style={{ fontWeight: 400 }}>
              Essential information, all here.
            </h2>
          </RevealOnScroll>
          <RevealOnScroll delay={100}>
            <ServicesTab />
          </RevealOnScroll>
        </div>
      </section>

      {/* Divider */}
      <div style={{ height: '1px', background: '#e4ebf3' }} />

      {/* ─── ABOUT + STATS ────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-[90%] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <RevealOnScroll direction="left">
              <StatsCounter />
            </RevealOnScroll>
            <RevealOnScroll direction="right">
              <div className="rounded-2xl p-8 sm:p-10 bg-white shadow-sm">
                <p className="text-xs uppercase tracking-widest mb-3" style={{ color: '#51e74c' }}>Who we are</p>
                <h2
                  className="text-2xl sm:text-3xl mb-4 leading-snug text-navy"
                  style={{ fontWeight: 400 }}
                >
                  Real insight from students who have actually done it.
                </h2>
                <p className="mb-1 text-sm leading-relaxed" style={{ color: 'rgba(24,24,49,0.6)', fontWeight: 300 }}>
                  Fix It is built by Macedonian alumni studying across Europe — people who navigated every deadline, visa, and housing search themselves. No generic scraped data. Just verified, lived experience.
                </p>
                <p className="mb-8 text-xs uppercase tracking-widest mt-3" style={{ color: 'rgba(24,24,49,0.4)', fontWeight: 400 }}>
                  Macedonian Alumni Students · From all over Europe
                </p>
                <Link
                  href="/about"
                  className="inline-flex items-center justify-center px-5 py-2 rounded-xl text-xs font-normal transition hover:opacity-90"
                  style={{ background: '#51e74c', color: '#181831' }}
                >
                  Contact us
                </Link>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div style={{ height: '1px', background: '#e4ebf3' }} />

      {/* ─── QUIZ ─────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-[90%] mx-auto">
          <RevealOnScroll>
            <div className="flex flex-col items-center text-center">
              <p className="text-xs uppercase tracking-widest mb-4" style={{ color: '#51e74c' }}>
                Fix your path
              </p>
              <h3
                className="mb-3 leading-tight"
                style={{ color: '#181831', fontWeight: 300, fontSize: 'clamp(24px, 3.5vw, 42px)' }}
              >
                Don&apos;t know where to start?
              </h3>
              <p className="text-sm mb-8 max-w-sm leading-relaxed" style={{ color: 'rgba(24,24,49,0.5)', fontWeight: 300 }}>
                Answer 5 quick questions and we&apos;ll match you with the right country and universities for your goals.
              </p>

              <Image
                src="/images/Slice-5.png"
                alt="Find your path"
                width={140}
                height={180}
                className="mb-8"
                style={{ height: 'auto', opacity: 0.92 }}
              />

              <Link
                href="/quiz"
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-normal transition hover:opacity-90"
                style={{ background: '#51e74c', color: '#181831' }}
              >
                Take the quiz
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* Divider */}
      <div style={{ height: '1px', background: '#e4ebf3' }} />

      {/* ─── TRUST ────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-[90%] mx-auto text-center">
          <RevealOnScroll>
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: '#51e74c' }}>Why trust us</p>
            <h2 className="text-2xl sm:text-3xl mb-4 text-navy" style={{ fontWeight: 400 }}>
              Accurate, structured, and human-verified.
            </h2>
            <p className="text-sm max-w-xl mx-auto leading-relaxed" style={{ color: 'rgba(24,24,49,0.6)', fontWeight: 300 }}>
              Every guide on Fix It is written by someone who lived it. We provide everything you need — scholarships, visas, housing, deadlines — in one clear, reliable platform.
            </p>
          </RevealOnScroll>
        </div>
      </section>

    </main>
  )
}
