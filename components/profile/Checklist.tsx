'use client'

import { useState, useEffect } from 'react'

const ITEMS = [
  { id: '1', text: 'Get your high school transcripts officially translated' },
  { id: '2', text: 'Request an apostille on your diploma' },
  { id: '3', text: 'Research visa requirements for your target country' },
  { id: '4', text: 'Open a dedicated bank account or card for abroad expenses' },
  { id: '5', text: 'Check if your target universities require specific certifications (SAT, IELTS, GMAT, etc.)' },
  { id: '6', text: 'Prepare a motivation letter template' },
  { id: '7', text: 'Get passport photos ready' },
]

export default function Checklist({ userId }: { userId: string }) {
  const storageKey = `fixit_checklist_${userId}`
  const [checked, setChecked] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) setChecked(JSON.parse(stored))
    } catch {}
    setMounted(true)
  }, [storageKey])

  const toggle = (id: string) => {
    setChecked(prev => {
      const next = prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
      try { localStorage.setItem(storageKey, JSON.stringify(next)) } catch {}
      return next
    })
  }

  const completed = checked.length
  const total = ITEMS.length
  const progress = Math.round((completed / total) * 100)

  if (!mounted) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-100 rounded w-1/3" />
          <div className="h-1.5 bg-gray-100 rounded-full" />
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base text-navy" style={{ fontWeight: 300 }}>
          Application checklist
        </h2>
        <span className="text-sm text-gray-400">{completed}/{total}</span>
      </div>

      <div className="h-1.5 bg-gray-100 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${progress}%`, background: '#51e74c' }}
        />
      </div>

      <div className="space-y-1">
        {ITEMS.map(item => {
          const done = checked.includes(item.id)
          return (
            <button
              key={item.id}
              onClick={() => toggle(item.id)}
              className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-colors ${
                done ? 'bg-gray-50' : 'hover:bg-gray-50'
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                done ? 'border-green bg-green' : 'border-gray-300'
              }`}>
                {done && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className={`text-sm leading-relaxed ${done ? 'line-through text-gray-300' : 'text-navy'}`}>
                {item.text}
              </span>
            </button>
          )
        })}
      </div>

      {completed === total && (
        <div className="mt-4 p-4 rounded-xl text-center" style={{ background: 'rgba(81,231,76,0.08)' }}>
          <p className="text-sm" style={{ color: '#181831', fontWeight: 300 }}>
            All done. Now go find your university.
          </p>
        </div>
      )}
    </div>
  )
}
