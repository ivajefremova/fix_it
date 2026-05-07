import Link from 'next/link'

const platform = [
  { href: '/', label: 'Home' },
  { href: '/universities', label: 'Universities' },
  { href: '/countries', label: 'Countries' },
  { href: '/services', label: 'Services' },
  { href: '/quiz', label: 'Find your path' },
  { href: '/about', label: 'About us' },
]

const account = [
  { href: '/signup', label: 'Create account' },
  { href: '/login', label: 'Log in' },
  { href: '/profile', label: 'My profile' },
]

const countries = ['Italy', 'Germany', 'Netherlands', 'Spain', 'Austria', 'Hungary', 'Slovenia', 'United Kingdom']

export default function Footer() {
  return (
    <footer style={{ background: '#181831' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-8">

        {/* Top grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 pb-12 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <span className="text-white font-light text-2xl tracking-wide">
                fix it<span style={{ color: '#51e74c' }}>.</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-white/40 mb-6" style={{ fontWeight: 300 }}>
              Alumni-verified guidance for Macedonian students applying to European universities.
            </p>
          </div>

          {/* Platform */}
          <div>
            <p className="text-xs uppercase tracking-widest mb-4 text-white/30">Platform</p>
            <ul className="space-y-2.5">
              {platform.map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/55 hover:text-white transition-colors" style={{ fontWeight: 300 }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <p className="text-xs uppercase tracking-widest mb-4 text-white/30">Account</p>
            <ul className="space-y-2.5">
              {account.map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/55 hover:text-white transition-colors" style={{ fontWeight: 300 }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Countries */}
          <div>
            <p className="text-xs uppercase tracking-widest mb-4 text-white/30">Countries</p>
            <ul className="space-y-2.5">
              {countries.map(c => (
                <li key={c}>
                  <Link
                    href={`/countries/${c.toLowerCase().replace(' ', '-')}`}
                    className="text-sm text-white/55 hover:text-white transition-colors"
                    style={{ fontWeight: 300 }}
                  >
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs uppercase tracking-widest mb-4 text-white/30">Contact us</p>
            <div className="space-y-3">
              <a
                href="mailto:contactfixit@gmail.com"
                className="flex items-start gap-2.5 text-sm text-white/55 hover:text-white transition-colors"
                style={{ fontWeight: 300 }}
              >
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                contactfixit@gmail.com
              </a>
              <p className="text-xs text-white/30 leading-relaxed" style={{ fontWeight: 300 }}>
                We typically respond within 24 hours.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30" style={{ fontWeight: 300 }}>
            © {new Date().getFullYear()} Fix It. Built for Macedonian students.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-xs text-white/30 hover:text-white/60 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-xs text-white/30 hover:text-white/60 transition-colors">
              Terms
            </Link>
          </div>
        </div>

      </div>
    </footer>
  )
}
