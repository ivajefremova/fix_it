'use client'

import { useRef, useEffect, useState, useMemo, type ReactNode } from 'react'
import RevealOnScroll from '@/components/ui/RevealOnScroll'

// ─── Scroll-driven wire ───────────────────────────────────────────────────────

function ScrollWire({ sectionRef, flips }: { sectionRef: React.RefObject<HTMLElement | null>; flips: boolean[] }) {
  const fillRef = useRef<SVGPathElement>(null)
  const [dims, setDims] = useState({ w: 0, h: 0 })
  const [pathLen, setPathLen] = useState(0)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const update = () => setDims({ w: el.offsetWidth, h: el.offsetHeight })
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [sectionRef])

  const path = useMemo<string>(() => {
    const { w, h } = dims
    if (!w || !h) return ''
    const n = flips.length
    const lx = w * 0.26
    const rx = w * 0.74
    const r = Math.min(72, w * 0.06)
    const padFrac = 0.06
    const span = h * (1 - 2 * padFrac) / n
    const cy = (i: number) => h * padFrac + span * i + span * 0.5

    const parts: string[] = [`M ${flips[0] ? rx : lx} 0`]
    for (let i = 0; i < n; i++) {
      const cx = flips[i] ? rx : lx
      const cyi = cy(i)
      if (i === 0) parts.push(`V ${cyi}`)
      if (i < n - 1) {
        const ncx = flips[i + 1] ? rx : lx
        const ncyi = cy(i + 1)
        const mid = (cyi + ncyi) / 2
        if (cx !== ncx) {
          if (cx < ncx) {
            parts.push(`V ${mid - r}`, `Q ${cx} ${mid} ${cx + r} ${mid}`, `H ${ncx - r}`, `Q ${ncx} ${mid} ${ncx} ${mid + r}`)
          } else {
            parts.push(`V ${mid - r}`, `Q ${cx} ${mid} ${cx - r} ${mid}`, `H ${ncx + r}`, `Q ${ncx} ${mid} ${ncx} ${mid + r}`)
          }
        }
        parts.push(`V ${ncyi}`)
      } else {
        parts.push(`V ${h}`)
      }
    }
    return parts.join(' ')
  }, [dims, flips])

  useEffect(() => {
    const el = fillRef.current
    if (!el || !path) return
    const len = el.getTotalLength()
    setPathLen(len)
    el.style.strokeDasharray = String(len)
    el.style.strokeDashoffset = String(len)
  }, [path])

  useEffect(() => {
    if (!pathLen || !sectionRef.current) return
    const section = sectionRef.current
    const onScroll = () => {
      const rect = section.getBoundingClientRect()
      const scrollable = rect.height - window.innerHeight
      const progress = scrollable > 0 ? Math.max(0, Math.min(1, -rect.top / scrollable)) : 0
      if (fillRef.current) fillRef.current.style.strokeDashoffset = String(pathLen * (1 - progress))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [pathLen, sectionRef])

  if (!dims.w) return null
  return (
    <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'hidden' }} aria-hidden>
      <path d={path} fill="none" stroke="rgba(12,77,134,0.13)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path ref={fillRef} d={path} fill="none" stroke="#51e74c" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const I = (path: ReactNode) => (
  <svg width="44" height="44" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    {path}
  </svg>
)

const ICONS = {
  search:        I(<path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />),
  book:          I(<path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />),
  heart:         I(<path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />),
  calendar:      I(<><path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /><path d="M12 15h.008v.008H12V15z" /></>),
  clipboard:     I(<><path d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /></>),
  chat:          I(<path d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />),
  award:         I(<><path d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675" /></>),
  home:          I(<path d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" />),
  people:        I(<><path d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></>),
  handRaise:     I(<path d="M10.05 4.575a1.575 1.575 0 10-3.15 0v3m3.15-3v-1.5a1.575 1.575 0 013.15 0v1.5m-3.15 0l.075 5.925m3.075.75V4.575m0 0a1.575 1.575 0 013.15 0V15M6.9 7.575a1.575 1.575 0 10-3.15 0v8.175a6.75 6.75 0 006.75 6.75h2.018a5.25 5.25 0 003.712-1.538l1.732-1.732a5.25 5.25 0 001.538-3.712l.003-2.024a.668.668 0 01.198-.471 1.575 1.575 0 10-2.228-2.228 3.818 3.818 0 00-1.12 2.687M6.9 7.575V12m6.27 4.318A4.49 4.49 0 0116.35 15m.002 0h-.002" />),
}

// ─── Step data ────────────────────────────────────────────────────────────────

type StepDef = {
  n: string
  heading: string
  body: string
  flip: boolean
  revealDir: 'left' | 'right'
  icon: ReactNode
}

const STEPS: StepDef[] = [
  {
    n: '01',
    heading: 'Search your path',
    body: 'Filter by country, field of study, and degree level. Find universities that actually match where you want to go — not just the obvious names.',
    flip: false,
    revealDir: 'left',
    icon: ICONS.search,
  },
  {
    n: '02',
    heading: 'Dig into what matters',
    body: 'Read alumni-compiled university profiles: rankings, English programmes, admission requirements for EU and non-EU students — specific and verified, not scraped from a brochure.',
    flip: true,
    revealDir: 'right',
    icon: ICONS.book,
  },
  {
    n: '03',
    heading: 'Save the ones that spark something',
    body: 'Shortlist universities with one tap. Track your status from Researching to Got in!, add private notes, and compare up to three side by side.',
    flip: false,
    revealDir: 'left',
    icon: ICONS.heart,
  },
  {
    n: '04',
    heading: 'Own your timeline',
    body: 'Every application deadline lives in your personal calendar. Colour-code by country, add your own key dates, and never wake up to a window that already closed.',
    flip: true,
    revealDir: 'right',
    icon: ICONS.calendar,
  },
  {
    n: '05',
    heading: 'Get the paperwork right',
    body: 'Step-by-step visa guides, document checklists, bank account tips, and moving advice — built specifically for Macedonian applicants, not a generic guide.',
    flip: false,
    revealDir: 'left',
    icon: ICONS.clipboard,
  },
  {
    n: '06',
    heading: 'Lock in your scholarship',
    body: 'Browse every scholarship available to Macedonian students in Europe. Filter by country, type, and level — then follow the guide written by someone who actually received it.',
    flip: true,
    revealDir: 'right',
    icon: ICONS.award,
  },
  {
    n: '07',
    heading: 'Sort your place to live',
    body: 'The Housing Board connects students leaving their flats with students looking for one. Post a listing, filter by country and city, and find somewhere real.',
    flip: false,
    revealDir: 'left',
    icon: ICONS.home,
  },
  {
    n: '08',
    heading: 'Ask someone who\'s been there',
    body: 'Post your questions to the community. Other Macedonian students — and alumni who navigated the same path — will answer. Real experience, not a chatbot.',
    flip: true,
    revealDir: 'right',
    icon: ICONS.chat,
  },
  {
    n: '09',
    heading: 'Find your people',
    body: 'The community is full of Macedonian students who took the same leap across Europe. Read their stories, follow their threads, and realise you\'re not alone in this.',
    flip: false,
    revealDir: 'left',
    icon: ICONS.people,
  },
  {
    n: '10',
    heading: 'Help the one behind you',
    body: 'Once you\'ve done it, pay it forward. Answer questions, share your experience, and close the loop for the next student staring at the same overwhelming page you once were.',
    flip: true,
    revealDir: 'right',
    icon: ICONS.handRaise,
  },
]

// ─── Step row ─────────────────────────────────────────────────────────────────

function Step({ heading, body, icon, flip }: StepDef) {
  const visual = (
    <div className="flex flex-col items-center justify-center" style={{ minHeight: 180 }}>
      <div style={{ color: '#0c4d86' }}>{icon}</div>
    </div>
  )

  const text = (
    <div
      className="flex flex-col justify-center py-2"
      style={{ maxWidth: 480, textAlign: flip ? 'left' : 'right', background: '#fff', borderRadius: 12, padding: '10px 18px' }}
    >
      <h3
        className="text-navy mb-3 leading-snug"
        style={{ fontSize: 'clamp(21px, 2.4vw, 27px)', fontWeight: 400 }}
      >
        {heading}
      </h3>
      <p style={{ fontSize: 16, color: '#181831', fontWeight: 400, lineHeight: 1.75 }}>
        {body}
      </p>
    </div>
  )

  return (
    <div className={`flex flex-col ${flip ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-8 md:gap-20`}>
      <div className="flex-1 w-full">{visual}</div>
      <div className="flex-1 w-full" style={{ display: 'flex', justifyContent: flip ? 'flex-start' : 'flex-end' }}>{text}</div>
    </div>
  )
}

// ─── Section ──────────────────────────────────────────────────────────────────

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null)
  const closingRef = useRef<HTMLDivElement>(null)
  const [closingVisible, setClosingVisible] = useState(false)

  useEffect(() => {
    const el = closingRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setClosingVisible(true); obs.disconnect() } },
      { threshold: 0.3 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <section ref={sectionRef as React.RefObject<HTMLDivElement>} className="bg-white py-24 sm:py-32" style={{ position: 'relative' }}>
      <ScrollWire sectionRef={sectionRef} flips={STEPS.map((s, i) => i === STEPS.length - 1 ? false : s.flip)} />
      <div className="max-w-[90%] mx-auto" style={{ position: 'relative', zIndex: 1 }}>

        <RevealOnScroll className="mb-20 sm:mb-24">
          <div style={{ background: '#fff', display: 'inline-block', borderRadius: 10, padding: '8px 16px' }}>
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: '#51e74c' }}>
              How it works
            </p>
            <h2
              className="text-navy leading-snug"
              style={{ fontSize: 'clamp(24px, 3.5vw, 38px)', fontWeight: 400 }}
            >
              Everything you need. In one place.
            </h2>
          </div>
        </RevealOnScroll>

        {STEPS.map((step, i) => (
          <div key={step.n} style={{ marginBottom: i < STEPS.length - 1 ? '5rem' : 0 }}>
            <RevealOnScroll direction={step.revealDir} delay={60}>
              <Step {...step} />
            </RevealOnScroll>
          </div>
        ))}

        {/* Closing statement */}
        <div
          ref={closingRef}
          style={{
            marginTop: '22rem',
            textAlign: 'center',
            opacity: closingVisible ? 1 : 0,
            transform: closingVisible ? 'translateY(0) scale(1)' : 'translateY(32px) scale(0.97)',
            transition: 'opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          <p style={{
            fontSize: 'clamp(20px, 4vw, 40px)',
            fontWeight: 500, color: '#181831', lineHeight: 1.4,
            background: '#fff', borderRadius: 12, padding: '8px 24px', display: 'inline-block',
          }}>
            Don&apos;t search for people with answers. &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;fix it<span style={{ color: '#51e74c' }}>.</span>
          </p>
          <div style={{ marginTop: '2.5rem' }}>
            <a
              href="/signup"
              style={{
                display: 'inline-block',
                background: '#51e74c',
                color: '#181831',
                fontWeight: 500,
                fontSize: 16,
                padding: '14px 36px',
                borderRadius: 12,
                textDecoration: 'none',
                fontFamily: 'inherit',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              Sign up!
            </a>
          </div>
        </div>

      </div>
    </section>
  )
}
