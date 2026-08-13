'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const EuropeHeroMap = dynamic(() => import('./EuropeHeroMap'), {
  ssr: false,
  loading: () => <div style={{ width: '100%', height: '100%' }} />,
})

const PHRASES = [
  'Lost in paperwork?',
  'Missed a deadline?',
  'Where do I start?',
]

export default function HeroSection() {
  const [idx, setIdx]         = useState(0)
  const [visible, setVisible] = useState(true)
  const [done, setDone]       = useState(false)

  useEffect(() => {
    if (done) return
    const t = setTimeout(() => setVisible(false), 1500)
    return () => clearTimeout(t)
  }, [idx, done])

  useEffect(() => {
    if (done || visible) return
    const t = setTimeout(() => {
      if (idx >= PHRASES.length - 1) { setDone(true); setVisible(true) }
      else { setIdx(i => i + 1); setVisible(true) }
    }, 300)
    return () => clearTimeout(t)
  }, [visible, idx, done])

  return (
    <section className="relative overflow-hidden bg-white">

      {/* Arrow overlay — desktop only */}
      <svg
        className="absolute hidden md:block pointer-events-none"
        viewBox="0 0 1000 520"
        preserveAspectRatio="none"
        style={{ top: 0, left: 0, width: '100%', height: '100%', zIndex: 20, overflow: 'visible' }}
      >
        <path
          d="M 8 8 C 120 60, 250 90, 280 130 C 310 170, 220 185, 290 185 C 360 185, 490 210, 555 262 C 630 315, 555 365, 645 362 C 700 362, 748 312, 775 338"
          fill="none"
          stroke="#181831"
          strokeWidth="2"
          strokeLinecap="round"
          style={{
            strokeDasharray: 1250,
            strokeDashoffset: 1250,
            animation: 'drawArrow 2.2s ease forwards 0.9s',
          }}
        />
        <line x1="771" y1="334" x2="779" y2="342" stroke="#181831" strokeWidth="2" strokeLinecap="round"
          style={{ strokeDasharray: 12, strokeDashoffset: 12, animation: 'drawArrow 0.2s ease forwards 3.1s' }} />
        <line x1="770" y1="341" x2="780" y2="335" stroke="#181831" strokeWidth="2" strokeLinecap="round"
          style={{ strokeDasharray: 12, strokeDashoffset: 12, animation: 'drawArrow 0.2s ease forwards 3.3s' }} />
      </svg>

      {/* ── DESKTOP layout (md+): text left, map right absolutely positioned ── */}
      <div className="hidden md:block">
        <div
          className="absolute"
          style={{ left: '50%', right: 0, top: 0, bottom: 0 }}
        >
          <EuropeHeroMap />
        </div>
        <div
          className="max-w-[90%] mx-auto relative z-10 py-24"
          style={{ minHeight: '520px' }}
        >
          <HeroText done={done} visible={visible} idx={idx} />
        </div>
      </div>

      {/* ── MOBILE layout (< md): text top-left, map below, arrow top-right → map ── */}
      <div className="md:hidden flex flex-col relative" style={{ minHeight: '100dvh' }}>

        {/* Arrow — starts top-right, swirls through center, ends on Germany in the map */}
        <svg
          className="absolute pointer-events-none"
          viewBox="0 0 390 780"
          preserveAspectRatio="none"
          style={{ top: 0, left: 0, width: '100%', height: '100%', zIndex: 20 }}
        >
          <path
            d="M 345 8 C 280 35, 200 75, 215 125 C 230 175, 295 188, 265 188 C 235 188, 175 210, 195 262 C 215 314, 270 330, 245 385 C 220 440, 185 460, 188 510"
            fill="none"
            stroke="#181831"
            strokeWidth="1.5"
            strokeLinecap="round"
            style={{
              strokeDasharray: 950,
              strokeDashoffset: 950,
              animation: 'drawArrow 2.4s ease forwards 0.9s',
            }}
          />
        </svg>

        {/* Text — left-aligned, max 62% width so arrow has clear space on the right */}
        <div className="px-6 pt-12 pb-6 relative z-10" style={{ maxWidth: '62%', animation: 'fadeInUp 0.6s ease 0.1s both' }}>
          <p className="text-xs uppercase tracking-widest mb-4" style={{ color: '#51e74c' }}>
            Fix It
          </p>

          <div style={{ minHeight: '3.5rem', marginBottom: '1rem' }}>
            <p style={{
              margin: 0,
              fontSize: done ? 'clamp(38px, 10vw, 52px)' : 'clamp(24px, 7vw, 36px)',
              fontWeight: 200,
              color: '#181831',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(-6px)',
              transition: 'opacity 0.3s ease, transform 0.3s ease',
            }}>
              {done ? <>fix it<span style={{ color: '#51e74c' }}>.</span></> : PHRASES[idx]}
            </p>
          </div>

          <p className="text-xs leading-relaxed mb-6" style={{ color: 'rgba(24,24,49,0.5)', fontWeight: 300 }}>
            Alumni-verified guides across 8 European countries.
          </p>

          <Link
            href="/signup"
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-normal transition hover:opacity-90"
            style={{ background: '#51e74c', color: '#181831' }}
          >
            Get Started
          </Link>
        </div>

        {/* Map — fills remaining height */}
        <div className="flex-1" style={{ minHeight: '300px' }}>
          <EuropeHeroMap />
        </div>

      </div>

    </section>
  )
}

function HeroText({ done, visible, idx }: { done: boolean; visible: boolean; idx: number }) {
  return (
    <>
      {/* Tagline blockquote */}
      <div
        className="flex justify-end mb-8"
        style={{ marginRight: '-5vw', animation: 'fadeInUp 0.7s ease 0.1s both' }}
      >
        <blockquote
          className="py-5 text-sm sm:text-base leading-snug"
          style={{
            paddingLeft: '1.5rem',
            paddingRight: '5vw',
            width: 'calc(min(100%, 52%) + 5vw)',
            color: '#181831',
            background: 'rgba(255,255,255,0.18)',
            border: '1px solid rgba(255,255,255,0.55)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            fontWeight: 500,
            margin: 0,
            borderRadius: '20px 0 0 20px',
          }}
        >
          Data-backed, alumni curated guides designed to take you from applicant to student.
        </blockquote>
      </div>

      {/* Cycling phrase / fix it. */}
      <div
        className="mb-2 w-full lg:w-[52%]"
        style={{ animation: 'fadeInUp 0.7s ease 0.25s both' }}
      >
        <div style={{ height: '10rem', overflow: 'hidden', display: 'flex', alignItems: 'flex-end' }}>
          <p
            style={{
              margin: 0,
              fontSize: done ? 'clamp(52px, 7.5vw, 96px)' : 'clamp(36px, 5.5vw, 68px)',
              fontWeight: 200,
              color: '#181831',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(-8px)',
              transition: 'opacity 0.3s ease, transform 0.3s ease',
            }}
          >
            {done ? <>fix it<span style={{ color: '#51e74c' }}>.</span></> : PHRASES[idx]}
          </p>
        </div>
      </div>

      {/* Description blockquote */}
      <div
        className="mb-8"
        style={{ marginLeft: '-5vw', animation: 'fadeInUp 0.7s ease 0.4s both' }}
      >
        <blockquote
          className="py-5 text-sm leading-relaxed"
          style={{
            paddingLeft: '5vw',
            paddingRight: '1.5rem',
            width: 'calc(min(100%, 52%) + 5vw)',
            color: '#181831',
            background: 'rgba(255,255,255,0.18)',
            border: '1px solid rgba(255,255,255,0.55)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            fontWeight: 300,
            margin: 0,
            borderRadius: '0 20px 20px 0',
          }}
        >
          Access curated, step-by-step guides for scholarships, university admissions, and relocation in 8 countries—all in one secure platform.
        </blockquote>
      </div>

      {/* CTA */}
      <div style={{ animation: 'fadeInUp 0.7s ease 0.55s both' }}>
        <Link
          href="/signup"
          className="inline-flex items-center justify-center px-5 py-2 rounded-xl text-xs font-normal transition hover:opacity-90"
          style={{ background: '#51e74c', color: '#181831' }}
        >
          Get Started
        </Link>
      </div>
    </>
  )
}
