'use client'

import { useEffect, useRef } from 'react'

const BOOKS = [
  { color: '#181831', w: 148, h: 212, rot: -20, ox: -5, oy: -4, sx:  3.2,  sy: -2.8,  sr: -0.45 },
  { color: '#0c4d86', w: 162, h: 226, rot:  -8, ox: -2, oy: -2, sx:  5.0,  sy:  0.8,  sr: -0.60 },
  { color: '#51e74c', w: 144, h: 206, rot:   2, ox:  0, oy:  0, sx:  1.5,  sy:  4.5,  sr:  0.50 },
  { color: '#0c4d86', w: 138, h: 198, rot:  14, ox:  3, oy:  3, sx: -1.2,  sy:  3.2,  sr:  0.35 },
  { color: '#51e74c', w: 152, h: 218, rot:  26, ox:  6, oy:  5, sx:  2.4,  sy: -3.8,  sr:  0.55 },
  { color: '#181831', w: 134, h: 192, rot:  38, ox:  8, oy:  7, sx:  4.0,  sy:  3.2,  sr: -0.70 },
]

function Book({ color, w, h }: { color: string; w: number; h: number }) {
  const spineW = Math.round(w * 0.14)
  const pageW  = Math.round(w * 0.045)
  const light  = 'rgba(255,255,255,0.2)'
  const dimmer = 'rgba(255,255,255,0.11)'

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Main cover */}
      <rect x={spineW} y={0} width={w - spineW - pageW} height={h} fill={color} rx="3" />
      {/* Spine (same colour, darkened overlay) */}
      <rect x={0} y={0} width={spineW} height={h} fill={color} rx="3" />
      <rect x={0} y={0} width={spineW} height={h} fill="rgba(0,0,0,0.28)" rx="3" />
      {/* Spine–cover seam */}
      <rect x={spineW - 1} y={0} width={2} height={h} fill="rgba(0,0,0,0.18)" />
      {/* Page edge — cream stack */}
      <rect x={w - pageW} y={3} width={pageW} height={h - 6} fill="rgba(255,255,255,0.88)" rx="2" />
      {[...Array(7)].map((_, i) => (
        <rect
          key={i}
          x={w - pageW + 1}
          y={Math.round(((h - 6) / 8) * (i + 1) + 3)}
          width={pageW - 2}
          height={1}
          fill="rgba(0,0,0,0.09)"
        />
      ))}
      {/* Title lines on cover */}
      <rect x={spineW + 14} y={Math.round(h * 0.36)} width={Math.round((w - spineW - pageW) * 0.62)} height={4} rx="2" fill={light} />
      <rect x={spineW + 14} y={Math.round(h * 0.36) + 11} width={Math.round((w - spineW - pageW) * 0.42)} height={3} rx="1.5" fill={light} />
      {/* Author line */}
      <rect x={spineW + 14} y={Math.round(h * 0.74)} width={Math.round((w - spineW - pageW) * 0.32)} height={2.5} rx="1.25" fill={dimmer} />
    </svg>
  )
}

export default function HeroSheets() {
  const refs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      const opacity = Math.max(0, 1 - y / 400)
      BOOKS.forEach((b, i) => {
        const el = refs.current[i]
        if (!el) return
        el.style.transform = `translate(${b.ox - y * b.sx}px, ${b.oy + y * b.sy}px) rotate(${b.rot + y * b.sr}deg)`
        el.style.opacity = String(opacity)
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      {/* Shared hero text animation — injected once per page via whichever hero renders first */}
      <style>{`
        @keyframes heroTextIn {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hero-text-in { animation: heroTextIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .hero-text-in-2 { animation: heroTextIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.12s both; }
        .hero-text-in-3 { animation: heroTextIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.24s both; }
      `}</style>

      {/* No overflow:hidden — books bleed into the next section */}
      <div
        className="hidden md:block"
        style={{ width: '62%', position: 'absolute', right: 0, top: 0, bottom: 0, pointerEvents: 'none', zIndex: 20 }}
      >
        <div style={{ position: 'absolute', top: '10%', right: '10%' }}>
          {BOOKS.map((b, i) => (
            <div
              key={i}
              ref={el => { refs.current[i] = el }}
              style={{
                position: 'absolute',
                top: -b.h / 2,
                left: -b.w / 2,
                transform: `translate(${b.ox}px, ${b.oy}px) rotate(${b.rot}deg)`,
                willChange: 'transform, opacity',
                zIndex: i + 1,
                filter: 'drop-shadow(0 8px 28px rgba(0,0,0,0.28))',
              }}
            >
              <Book color={b.color} w={b.w} h={b.h} />
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
