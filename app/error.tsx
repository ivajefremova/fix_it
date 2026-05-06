'use client'

import Link from 'next/link'

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
      style={{ background: 'radial-gradient(ellipse at 65% 15%, #1a5fa3 0%, #181831 60%)' }}
    >
      <p className="text-sm uppercase tracking-widest mb-4 font-light" style={{ color: '#51e74c' }}>
        Error
      </p>
      <h1 className="text-white text-4xl mb-3" style={{ fontWeight: 100 }}>
        Something broke.
      </h1>
      <p className="text-sm mb-10 max-w-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
        An unexpected error occurred. Try again or head back home.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="bg-blue text-white text-sm px-8 py-3 rounded-xl hover:opacity-90 transition"
        >
          Try again
        </button>
        <Link
          href="/"
          className="text-white text-sm px-8 py-3 rounded-xl transition border"
          style={{ background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)' }}
        >
          Back to home
        </Link>
      </div>
    </div>
  )
}
