import Link from 'next/link'
import Image from 'next/image'
import RevealOnScroll from '@/components/ui/RevealOnScroll'
import StatsCounter from '@/components/home/StatsCounter'
import ServicesTab from '@/components/home/ServicesTab'
import CountryMarquee from '@/components/home/CountryMarquee'

const quizQuestions = [
  { text: 'What field do I want to study?',  top: '5%',  left: '215px', delay: '0s'   },
  { text: 'Do I qualify for scholarships?',  top: '28%', left: '210px', delay: '1.1s' },
  { text: 'Which language suits me?',        top: '52%', left: '218px', delay: '2.1s' },
  { text: 'What is my budget range?',        top: '76%', left: '213px', delay: '0.6s' },
]

export default function HomePage() {
  return (
    <main className="bg-white">

      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white">
        <div
          className="max-w-[90%] mx-auto relative"
          style={{ minHeight: '520px' }}
        >
          {/* Map — animated separately so text animations are independent */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: 'url(/images/Group-11-1.png)',
              backgroundPosition: '75% center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '46% auto',
              animation: 'slideInRight 1.1s cubic-bezier(0.22,1,0.36,1) 0.6s both',
            }}
          />

          {/* Text content */}
          <div className="relative z-10 py-16 sm:py-24">
            {/* Tagline — floated right */}
            <div
              className="flex justify-end mb-8"
              style={{ animation: 'fadeInUp 0.7s ease 0.1s both' }}
            >
              <blockquote
                className="py-5 px-6 text-sm sm:text-base leading-snug w-full lg:w-[52%]"
                style={{
                  color: '#1d4e89',
                  background: 'linear-gradient(rgba(29,78,137,0.08), rgba(29,78,137,0.08))',
                  borderRight: '8px solid #181831',
                  borderRadius: '20px 0 0 20px',
                  fontWeight: 500,
                  margin: 0,
                }}
              >
                Data-backed, alumni curated guides designed to take you from applicant to student.
              </blockquote>
            </div>

            {/* Main heading — left */}
            <div
              className="mb-6 w-full lg:w-[52%]"
              style={{ animation: 'fadeInUp 0.7s ease 0.25s both' }}
            >
              <h1
                style={{
                  color: '#0d4e89',
                  fontSize: 'clamp(28px, 4vw, 48px)',
                  fontWeight: 300,
                  lineHeight: 1.15,
                  margin: 0,
                }}
              >
                Education abroad<br />
                <span style={{ color: '#51e74c', fontSize: 'clamp(18px, 2.5vw, 28px)', fontWeight: 300 }}>
                  Fix your future - Fix it.
                </span>
              </h1>
            </div>

            {/* Description blockquote — left */}
            <div
              className="w-full lg:w-[52%] mb-8"
              style={{ animation: 'fadeInUp 0.7s ease 0.4s both' }}
            >
              <blockquote
                className="py-5 px-6 text-sm leading-relaxed"
                style={{
                  color: '#1d4e89',
                  background: 'linear-gradient(rgba(29,78,137,0.06), rgba(29,78,137,0.06))',
                  borderLeft: '8px solid #181831',
                  borderRadius: '0 20px 20px 0',
                  fontWeight: 300,
                  margin: 0,
                }}
              >
                Access curated, step-by-step guides for scholarships, university admissions, and relocation in 8 countries—all in one secure platform.
              </blockquote>
            </div>

            {/* CTA — left */}
            <div style={{ animation: 'fadeInUp 0.7s ease 0.55s both' }}>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl text-sm font-medium transition hover:opacity-90"
                style={{ background: '#51e74c', color: '#181831' }}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div style={{ height: '1px', background: '#e4ebf3' }} />

      {/* ─── COUNTRIES ────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20">
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

      {/* Divider */}
      <div style={{ height: '1px', background: '#e4ebf3' }} />

      {/* ─── SERVICES — tabs ──────────────────────────────────────────────── */}
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

      {/* ─── QUIZ ─────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 relative overflow-hidden bg-white">
        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(rgba(0,0,0,0.04) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        <div className="relative max-w-[90%] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

            {/* Left — quiz text */}
            <RevealOnScroll direction="left">
              <p className="text-xs uppercase tracking-widest mb-5" style={{ color: '#51e74c' }}>
                Find your path
              </p>

              <h3
                className="text-3xl sm:text-4xl mb-4"
                style={{ color: '#181831', fontWeight: 300, lineHeight: 1.25 }}
              >
                Dont know where<br />to start?
              </h3>

              <div className="flex items-baseline gap-1.5 flex-wrap mb-8">
                <span className="text-lg" style={{ color: 'rgba(24,24,49,0.55)', fontWeight: 300 }}>Try our</span>
                <span className="text-lg font-medium" style={{ color: '#51e74c' }}>quiz!</span>
                <span className="text-lg" style={{ color: 'rgba(24,24,49,0.55)', fontWeight: 300 }}>Find the right destination for you!</span>
              </div>

              <Link
                href="/quiz"
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl text-sm font-medium uppercase tracking-wider transition hover:opacity-90"
                style={{ background: '#51e74c', color: '#181831', letterSpacing: '0.1em' }}
              >
                QUIZ HERE!
              </Link>
            </RevealOnScroll>

            {/* Right — illustration left, floating pills right */}
            <RevealOnScroll direction="right" className="flex justify-center">
              <div className="relative" style={{ width: 'min(400px, 100%)', height: '280px' }}>
                {/* Image — anchored to left of container */}
                <Image
                  src="/images/Slice-5.png"
                  alt="Find your path"
                  width={200}
                  height={260}
                  style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 10, height: 'auto' }}
                />

                {/* Floating question pills — to the right of the image */}
                {quizQuestions.map((q, i) => (
                  <div
                    key={i}
                    className="absolute hidden lg:flex items-center gap-2 px-3 py-2 rounded-full text-xs whitespace-nowrap"
                    style={{
                      top: q.top,
                      left: q.left,
                      background: 'rgba(12,77,134,0.07)',
                      border: '1px solid rgba(12,77,134,0.14)',
                      color: '#1d4e89',
                      animation: `float 3.5s ease-in-out ${q.delay} infinite`,
                      zIndex: 20,
                    }}
                  >
                    <span style={{ color: '#51e74c', fontSize: '8px' }}>●</span>
                    {q.text}
                  </div>
                ))}
              </div>
            </RevealOnScroll>

          </div>
        </div>
      </section>

      {/* Divider */}
      <div style={{ height: '1px', background: '#e4ebf3' }} />

      {/* ─── ABOUT + STATS ────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20">
        <div className="max-w-[90%] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left — stats sidebar */}
            <RevealOnScroll direction="left">
              <StatsCounter />
            </RevealOnScroll>

            {/* Right — about text */}
            <RevealOnScroll direction="right">
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: '#51e74c' }}>Who we are</p>
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
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-medium transition hover:opacity-90"
                style={{ background: '#51e74c', color: '#181831' }}
              >
                Contact us
              </Link>
            </RevealOnScroll>

          </div>
        </div>
      </section>

      {/* Divider */}
      <div style={{ height: '1px', background: '#e4ebf3' }} />

      {/* ─── TRUST ────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20">
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
