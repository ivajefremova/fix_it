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

      {/* Map — fills section height via top+bottom:0, clipped by section overflow:hidden */}
      <div
        className="absolute hidden md:block"
        style={{ left: '50%', right: 0, top: 0, bottom: 0 }}
      >
        <EuropeHeroMap />
      </div>

      {/* Arrow overlay — spans full section so it can start from top-right corner */}
      <svg
        className="absolute hidden md:block pointer-events-none"
        viewBox="0 0 1000 520"
        preserveAspectRatio="none"
        style={{ top: 0, left: 0, width: '100%', height: '100%', zIndex: 20, overflow: 'visible' }}
      >
        <defs>
          <marker id="heroArrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <path d="M0,0.5 L7.5,3 L0,5.5 Z" fill="#181831" />
          </marker>
        </defs>

        {/* Two swirls: first above fix it. text, second in map area — clean 45° arrival at X */}
        <path
          d="M 8 8 C 120 60, 250 90, 280 130 C 310 170, 220 185, 290 185 C 360 185, 490 210, 555 262 C 630 315, 555 365, 645 362 C 700 362, 748 312, 775 338"
          fill="none"
          stroke="#181831"
          strokeWidth="2"
          strokeLinecap="round"
          markerEnd="url(#heroArrow)"
          style={{
            strokeDasharray: 1250,
            strokeDashoffset: 1250,
            animation: 'drawArrow 2.2s ease forwards 0.9s',
          }}
        />

        {/* X mark at (775, 338) */}
        <line x1="771" y1="334" x2="779" y2="342" stroke="#181831" strokeWidth="2" strokeLinecap="round"
          style={{ strokeDasharray: 12, strokeDashoffset: 12, animation: 'drawArrow 0.2s ease forwards 3.1s' }} />
        <line x1="770" y1="341" x2="780" y2="335" stroke="#181831" strokeWidth="2" strokeLinecap="round"
          style={{ strokeDasharray: 12, strokeDashoffset: 12, animation: 'drawArrow 0.2s ease forwards 3.3s' }} />
      </svg>

      {/* Text — minHeight here drives the section height so bottom:0 on map works */}
      <div
        className="max-w-[90%] mx-auto relative z-10 py-16 sm:py-24"
        style={{ minHeight: '520px' }}
      >

        {/* Tagline blockquote — bleeds to section RIGHT edge, text aligns with content right */}
        <div
          className="flex justify-end mb-8"
          style={{ marginRight: '-5vw', animation: 'fadeInUp 0.7s ease 0.1s both' }}
        >
          <blockquote
            className="py-5 text-sm sm:text-base leading-snug"
            style={{
              paddingLeft: '1.5rem',
              paddingRight: '5vw',
              width: 'calc(52% + 5vw)',
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

        {/* Cycling phrase */}
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

        {/* Description blockquote — bleeds to section LEFT edge, text aligns with fix it. */}
        <div
          className="mb-8"
          style={{ marginLeft: '-5vw', animation: 'fadeInUp 0.7s ease 0.4s both' }}
        >
          <blockquote
            className="py-5 text-sm leading-relaxed"
            style={{
              paddingLeft: '5vw',
              paddingRight: '1.5rem',
              width: 'calc(52% + 5vw)',
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

      </div>
    </section>
  )
}
