'use client'

import { useEffect, useState } from 'react'
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

const SLUG_COORDS: Record<string, [number, number]> = {
  spain:       [-3.7,  40.4],
  austria:     [16.4,  48.2],
  slovenia:    [14.5,  46.1],
  hungary:     [19.1,  47.5],
  netherlands: [4.9,   52.4],
  uk:          [-0.1,  51.5],
  germany:     [13.4,  52.5],
  italy:       [12.5,  41.9],
}

type Props = {
  countries: { slug: string }[]
  active: number
  onSelect: (index: number) => void
}

export default function EuropeMap({ countries, active, onSelect }: Props) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  if (!mounted) {
    return <div style={{ height: 360, background: '#f8f9fb', borderRadius: 16 }} />
  }

  return (
    <div style={{ borderRadius: 16, overflow: 'hidden', background: '#f0f4f8' }}>
      <ComposableMap
        projection="geoAzimuthalEqualArea"
        projectionConfig={{ rotate: [-12, -53, 0], scale: 920 }}
        style={{ width: '100%', height: '360px' }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map(geo => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                style={{
                  default: { fill: '#dde3ea', stroke: '#f0f4f8', strokeWidth: 0.7, outline: 'none' },
                  hover:   { fill: '#dde3ea', outline: 'none' },
                  pressed: { fill: '#dde3ea', outline: 'none' },
                }}
              />
            ))
          }
        </Geographies>

        {countries.map(({ slug }, idx) => {
          const coords = SLUG_COORDS[slug]
          if (!coords) return null
          const isActive = idx === active
          return (
            <Marker
              key={slug}
              coordinates={coords}
              onClick={() => onSelect(idx)}
            >
              {isActive && (
                <circle
                  r={18}
                  fill="#51e74c"
                  opacity={0.15}
                  style={{ pointerEvents: 'none' }}
                />
              )}
              <circle
                r={isActive ? 7 : 5}
                fill={isActive ? '#51e74c' : '#181831'}
                opacity={isActive ? 1 : 0.45}
                stroke={isActive ? '#fff' : 'none'}
                strokeWidth={isActive ? 1.5 : 0}
                style={{
                  cursor: 'pointer',
                  transition: 'r 0.25s ease, fill 0.25s ease, opacity 0.25s ease',
                }}
              />
            </Marker>
          )
        })}
      </ComposableMap>
    </div>
  )
}
