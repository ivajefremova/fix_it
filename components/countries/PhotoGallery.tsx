'use client'

import { useState } from 'react'

// Drop your photo paths here when ready — e.g. '/images/countries/italy-1.jpg'
const photos: { src: string; caption: string; country: string }[] = []

const placeholders = [
  { label: 'Campus life', country: 'Italy' },
  { label: 'City centre', country: 'Germany' },
  { label: 'Student housing', country: 'Spain' },
  { label: 'University grounds', country: 'Netherlands' },
  { label: 'Local life', country: 'Austria' },
]

export default function PhotoGallery() {
  const [active, setActive] = useState(0)

  const items = photos.length > 0 ? photos : null

  if (!items) {
    return (
      <div className="relative">
        {/* Scrollable strip of placeholder slides */}
        <div
          className="flex gap-4 overflow-x-auto pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {placeholders.map((p, i) => (
            <div
              key={i}
              className="flex-shrink-0 rounded-2xl flex flex-col items-center justify-center"
              style={{
                width: 'min(360px, 78vw)',
                height: '260px',
                background: 'linear-gradient(145deg, #f0f2f6 0%, #e4eaf2 100%)',
                border: '1px solid #eef0f3',
              }}
            >
              <svg className="w-9 h-9 mb-3" style={{ color: 'rgba(24,24,49,0.15)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              <p className="text-xs" style={{ color: 'rgba(24,24,49,0.3)', fontWeight: 300 }}>{p.country} · {p.label}</p>
              <p className="text-xs mt-1" style={{ color: 'rgba(24,24,49,0.2)', fontWeight: 300 }}>Photos coming soon</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Real gallery (used once you add photos to the array above)
  const current = items[active]
  return (
    <div className="relative">
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{ height: '400px' }}
      >
        <img
          src={current.src}
          alt={current.caption}
          className="w-full h-full object-cover"
        />
        <div
          className="absolute bottom-0 left-0 right-0 px-6 py-4"
          style={{ background: 'linear-gradient(transparent, rgba(24,24,49,0.6))' }}
        >
          <p className="text-sm text-white" style={{ fontWeight: 300 }}>{current.caption}</p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 300 }}>{current.country}</p>
        </div>
      </div>

      {items.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className="rounded-full transition-all duration-300"
              style={{
                height: '5px',
                width: i === active ? '22px' : '5px',
                background: i === active ? '#0c4d86' : '#d1d5db',
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
