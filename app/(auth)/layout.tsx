import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start pt-10 pb-10 px-4 sm:justify-center sm:py-16"
      style={{ background: 'radial-gradient(ellipse at 65% 15%, #1a5fa3 0%, #181831 60%)' }}
    >
      <Link href="/" className="mb-8">
        <span className="text-white/90 font-light text-2xl tracking-wide">
          fix it<span style={{ color: '#51e74c' }}>.</span>
        </span>
      </Link>
      {children}
    </div>
  )
}
