'use client'

import { useRef, useEffect, useState } from 'react'

const stats = [
  { value: 10,   suffix: '',   label: 'Countries covered' },
  { value: 100,  suffix: '+',  label: 'Universities indexed' },
  { value: 100,  suffix: '+',  label: 'Scholarships tracked' },
]

function Counter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); observer.disconnect() } },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!started) return
    const duration = 1800
    const startTime = Date.now()
    const ease = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
    const tick = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      setCount(Math.round(ease(progress) * target))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [started, target])

  return <span ref={ref}>{count}{suffix}</span>
}

export default function StatsCounter() {
  return (
    <div className="flex flex-col" style={{ borderLeft: '3px solid #51e74c' }}>
      {stats.map((s, i) => (
        <div
          key={s.label}
          className="py-8 px-8"
          style={{ borderBottom: i < stats.length - 1 ? '1px solid #eef0f3' : 'none' }}
        >
          <p className="text-3xl text-navy mb-1" style={{ fontWeight: 100, letterSpacing: '-0.02em' }}>
            <Counter target={s.value} suffix={s.suffix} />
          </p>
          <p className="text-xs uppercase tracking-widest" style={{ color: 'rgba(24,24,49,0.4)', fontWeight: 300 }}>
            {s.label}
          </p>
        </div>
      ))}
    </div>
  )
}
