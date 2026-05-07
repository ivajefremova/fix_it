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
  "Don't know where to start?",
]

export default function HeroSection() {
  const [idx, setIdx]       = useState(0)
  const [visible, setVisible] = useState(true)
  const [done, setDone]     = useState(false)

  // Fade out after 1.5 s
  useEffect(() => {
    if (done) return
    const t = setTimeout(() => setVisible(false), 1500)
    return () => clearTimeout(t)
  }, [idx, done])

  // After fade-out (300 ms), advance or lock on "fix it."
  useEffect(() => {
    if (done || visible) return
    const t = setTimeout(() => {
      if (idx >= PHRASES.length - 1) {
        setDone(true)
        setVisible(true)
      } else {
        setIdx(i => i + 1)
        setVisible(true)
      }
    }, 300)
    return () => clearTimeout(t)
  }, [visible, idx, done])

  return (
    <section className="relative overflow-hidden bg-white">
      <div className="max-w-[90%] mx-auto relative" style={{ minHeight: '520px' }}>

        {/* SVG Europe map — right half, desktop only */}
        <div
          className="absolute hidden lg:block"
          style={{
            right: 0, top: 0, bottom: 0, width: '52%',
            animation: 'slideInRight 1.1s cubic-bezier(0.22,1,0.36,1) 0.6s both',
          }}
        >
          <EuropeHeroMap />
        </div>

        {/* Text */}
        <div className="relative z-10 py-16 sm:py-24">

          {/* Tagline blockquote — floated right */}
          <div
            className="flex justify-end mb-8"
            style={{ animation: 'fadeInUp 0.7s ease 0.1s both' }}
          >
            <blockquote
              className="py-5 px-6 text-sm sm:text-base leading-snug w-[70%] rounded-[20px] lg:rounded-tr-none lg:rounded-br-none"
              style={{
                color: '#181831',
                background: 'rgba(255,255,255,0.18)',
                border: '1px solid rgba(255,255,255,0.55)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                fontWeight: 500,
                margin: 0,
              }}
            >
              Data-backed, alumni curated guides designed to take you from applicant to student.
            </blockquote>
          </div>

          {/* Cycling phrase + heading */}
          <div
            className="mb-6 w-full lg:w-[52%]"
            style={{ animation: 'fadeInUp 0.7s ease 0.25s both' }}
          >
            {/* Animated phrase */}
            <div style={{ minHeight: '2.2rem', marginBottom: '0.6rem', overflow: 'hidden' }}>
              <p
                style={{
                  margin: 0,
                  fontSize: 'clamp(16px, 2vw, 26px)',
                  fontWeight: 200,
                  color: '#181831',
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateY(0)' : 'translateY(-6px)',
                  transition: 'opacity 0.3s ease, transform 0.3s ease',
                  letterSpacing: '-0.01em',
                }}
              >
                {done
                  ? <>fix it<span style={{ color: '#51e74c' }}>.</span></>
                  : PHRASES[idx]
                }
              </p>
            </div>

            {/* Static heading */}
            <h1
              style={{
                color: '#181831',
                fontSize: 'clamp(28px, 4vw, 48px)',
                fontWeight: 300,
                lineHeight: 1.15,
                margin: 0,
              }}
            >
              Education abroad<br />
              <span style={{ color: '#181831', fontSize: 'clamp(18px, 2.5vw, 28px)', fontWeight: 300 }}>
                Fix your future - fix it<span style={{ color: '#51e74c' }}>.</span>
              </span>
            </h1>
          </div>

          {/* Description blockquote */}
          <div
            className="w-[52%] mb-8"
            style={{ animation: 'fadeInUp 0.7s ease 0.4s both' }}
          >
            <blockquote
              className="py-5 px-6 text-sm leading-relaxed rounded-[20px] lg:rounded-tl-none lg:rounded-bl-none"
              style={{
                color: '#181831',
                background: 'rgba(255,255,255,0.18)',
                border: '1px solid rgba(255,255,255,0.55)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                fontWeight: 300,
                margin: 0,
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
      </div>
    </section>
  )
}
