'use client'

import { ComposableMap, Geographies, Geography } from 'react-simple-maps'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

const FIXIT = new Set([724, 380, 276, 528, 40, 348, 705, 826])

const W = 500
const H = 520

// Arrow starts at the far-left of the map (x=0, centre of hero section),
// sweeps right, does a small twirl near Central Europe, lands on Italy (~255,370)
const ARROW = 'M 2 262 C 90 238, 190 205, 220 248 C 250 290, 208 318, 238 306 C 260 296, 266 338, 255 370'
const ARROW_LEN = 540

// X mark — centre (255,370), arms slanted ~20° off-axis, half-size 5px
// arm 1: shallow diagonal (55° from horizontal)
// arm 2: steep diagonal (35° from horizontal)
const Xa = { x1: 251, y1: 366, x2: 259, y2: 374 }   // 55° arm
const Xb = { x1: 250, y1: 373, x2: 260, y2: 367 }   // 35° arm (the cross)
const X_LEN = 13  // rough length of each arm

// Timings — arrow: 1.5s starting at 0.9s → done at 2.4s → X draws at 2.4s / 2.6s
const ARROW_DELAY  = '0.9s'
const X_DELAY_1    = '2.4s'
const X_DELAY_2    = '2.6s'   // second arm staggered, no calc()

export default function EuropeHeroMap() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <ComposableMap
        width={W}
        height={H}
        projection="geoAzimuthalEqualArea"
        projectionConfig={{ rotate: [-12, -53, 0], scale: 600 }}
        style={{ width: '100%', height: '100%' }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map(geo => {
              const isFixit = FIXIT.has(parseInt(String(geo.id), 10))
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  style={{
                    default: { fill: isFixit ? '#0c4d86' : '#e5e7eb', stroke: '#fff', strokeWidth: 0.6, outline: 'none' },
                    hover:   { fill: isFixit ? '#0c4d86' : '#e5e7eb', outline: 'none' },
                    pressed: { fill: isFixit ? '#0c4d86' : '#e5e7eb', outline: 'none' },
                  }}
                />
              )
            })
          }
        </Geographies>
      </ComposableMap>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible' }}
      >
        <defs>
          <marker id="heroArrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <path d="M0,0.5 L7.5,3 L0,5.5 Z" fill="#181831" />
          </marker>
        </defs>

        {/* Twirling arrow */}
        <path
          d={ARROW}
          fill="none"
          stroke="#181831"
          strokeWidth="2"
          strokeLinecap="round"
          markerEnd="url(#heroArrow)"
          style={{
            strokeDasharray: ARROW_LEN,
            strokeDashoffset: ARROW_LEN,
            animation: `drawArrow 1.5s ease forwards ${ARROW_DELAY}`,
          }}
        />

        {/* X mark — arm 1 */}
        <line
          {...Xa}
          stroke="#181831"
          strokeWidth="2"
          strokeLinecap="round"
          style={{
            strokeDasharray: X_LEN,
            strokeDashoffset: X_LEN,
            animation: `drawArrow 0.2s ease forwards ${X_DELAY_1}`,
          }}
        />
        {/* X mark — arm 2 */}
        <line
          {...Xb}
          stroke="#181831"
          strokeWidth="2"
          strokeLinecap="round"
          style={{
            strokeDasharray: X_LEN,
            strokeDashoffset: X_LEN,
            animation: `drawArrow 0.2s ease forwards ${X_DELAY_2}`,
          }}
        />
      </svg>
    </div>
  )
}
