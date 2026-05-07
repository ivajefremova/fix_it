'use client'

import { useEffect, useState } from 'react'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'

const GEO_URL = '/countries-110m.json'

const FIXIT = new Set([724, 380, 276, 528, 40, 348, 705, 826])

const W = 500
const H = 520

export default function EuropeHeroMap() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return <div style={{ width: '100%', height: '100%' }} />

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <ComposableMap
        width={W}
        height={H}
        projection="geoAzimuthalEqualArea"
        projectionConfig={{ rotate: [-12, -52, 0], scale: 900 }}
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
    </div>
  )
}
