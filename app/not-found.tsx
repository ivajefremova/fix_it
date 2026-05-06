import Link from 'next/link'

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
      style={{ background: 'radial-gradient(ellipse at 65% 15%, #1a5fa3 0%, #181831 60%)' }}
    >
      <p className="text-sm uppercase tracking-widest mb-4 font-light" style={{ color: '#51e74c' }}>
        404
      </p>
      <h1 className="text-white text-4xl mb-3" style={{ fontWeight: 100 }}>
        This page needs fixing.
      </h1>
      <p className="text-sm mb-10 max-w-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="bg-blue text-white text-sm px-8 py-3 rounded-xl hover:opacity-90 transition"
      >
        Back to home
      </Link>
    </div>
  )
}
