'use client'

import { ComposableMap, Geographies, Geography } from 'react-simple-maps'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

// ISO 3166-1 numeric IDs for the 8 Fix It countries
const FIXIT = new Set([724, 380, 276, 528, 40, 348, 705, 826])

const W = 500
const H = 520

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
                    default: {
                      fill: isFixit ? '#0c4d86' : '#e5e7eb',
                      stroke: '#ffffff',
                      strokeWidth: 0.6,
                      outline: 'none',
                    },
                    hover:   { fill: isFixit ? '#0c4d86' : '#e5e7eb', outline: 'none' },
                    pressed: { fill: isFixit ? '#0c4d86' : '#e5e7eb', outline: 'none' },
                  }}
                />
              )
            })
          }
        </Geographies>
      </ComposableMap>

      {/* Hand-drawn arrow — draws itself toward Italy/Central Europe */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{
          position: 'absolute',
          top: 0, left: 0,
          width: '100%', height: '100%',
          pointerEvents: 'none',
          overflow: 'visible',
        }}
      >
        <defs>
          <marker
            id="heroArrow"
            markerWidth="8"
            markerHeight="6"
            refX="7"
            refY="3"
            orient="auto"
          >
            <path d="M0,0.5 L7.5,3 L0,5.5 Z" fill="#181831" />
          </marker>
        </defs>
        {/* Curved path from upper-right → Italy area (~255, 370) */}
        <path
          d="M 410 90 C 445 185, 355 285, 258 368"
          fill="none"
          stroke="#181831"
          strokeWidth="2"
          strokeLinecap="round"
          markerEnd="url(#heroArrow)"
          style={{
            strokeDasharray: 450,
            strokeDashoffset: 450,
            animation: 'drawArrow 1.5s ease forwards 0.9s',
          }}
        />
      </svg>
    </div>
  )
}
