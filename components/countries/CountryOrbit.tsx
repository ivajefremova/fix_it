'use client'

import Link from 'next/link'

interface Country { slug: string; name: string }

interface Props {
  countries: Country[]
  hrefPrefix: string
  hrefSuffix?: string
  selected?: string
  onHover?: (slug: string) => void
}

const W = 168   // card width px
const H = 130   // card height px
const R = 195   // orbit radius — cards intentionally close/slightly overlapping
const S = (R + Math.ceil(W / 2) + 12) * 2   // ≈ 582px

export default function CountryOrbit({ countries, hrefPrefix, hrefSuffix = '', selected, onHover }: Props) {
  const n = countries.length

  return (
    <div style={{ position: 'relative', width: S, height: S, flexShrink: 0 }}>
      <style>{`
        @keyframes co-fwd { to { transform: rotate(360deg);  } }
        @keyframes co-rev { to { transform: rotate(-360deg); } }
        .co-ring        { animation: co-fwd 34s linear infinite; }
        .co-ring:hover  { animation-play-state: paused; }
        .co-inner       { animation: co-rev 34s linear infinite; }
        .co-ring:hover .co-inner { animation-play-state: paused; }
        .co-card { transition: border-color 0.15s, box-shadow 0.15s; }
        .co-card:hover  { border-color: #51e74c !important; box-shadow: 0 4px 18px rgba(24,24,49,0.13) !important; }
        .co-card:hover .co-cta { background: #1a6098 !important; }
        .co-active      { border-color: #51e74c !important; }
      `}</style>

      {/* Orbit track */}
      <div style={{ position:'absolute', inset:0, borderRadius:'50%', border:'1px dashed rgba(24,24,49,0.08)' }} />

      {/* Ring — rotates forward */}
      <div className="co-ring" style={{ position:'absolute', inset:0 }}>
        {countries.map((c, i) => {
          const angle = (i / n) * 360
          const isActive = c.slug === selected

          return (
            <div
              key={c.slug}
              style={{
                position: 'absolute',
                top: '50%', left: '50%',
                marginTop: -(H / 2),
                marginLeft: -(W / 2),
                // 1. Rotate to orbit position + translate out
                transform: `rotate(${angle}deg) translateX(${R}px)`,
              }}
            >
              {/* 2. Cancel the tilt introduced by the position angle */}
              <div style={{ transform: `rotate(${-angle}deg)` }}>
                {/* 3. Counter-rotate at ring speed — net rotation = 0, card always upright */}
                <div className="co-inner">
                  <Link
                    href={`${hrefPrefix}${c.slug}${hrefSuffix}`}
                    onMouseEnter={() => onHover?.(c.slug)}
                    className={`co-card${isActive ? ' co-active' : ''}`}
                    style={{
                      display: 'flex', flexDirection: 'column',
                      width: W, height: H,
                      borderRadius: 16,
                      border: `1px solid ${isActive ? '#51e74c' : '#eef0f3'}`,
                      background: 'white',
                      boxShadow: '0 2px 10px rgba(24,24,49,0.08)',
                      overflow: 'hidden',
                      textDecoration: 'none',
                    }}
                  >
                    <div style={{ flex:1, display:'flex', alignItems:'flex-end', padding:'16px 16px 10px' }}>
                      <p style={{ fontSize:15, fontWeight:300, color:'#181831', lineHeight:1.3 }}>{c.name}</p>
                    </div>
                    <div className="co-cta" style={{ background:'#0c4d86', padding:'9px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', transition:'background 0.15s' }}>
                      <span style={{ fontSize:11, fontWeight:400, color:'white' }}>View guide</span>
                      <svg style={{ width:11, height:11, color:'white' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
