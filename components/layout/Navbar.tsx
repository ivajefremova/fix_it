'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/countries', label: 'Countries' },
  { href: '/universities', label: 'Universities' },
  { href: '/services/scholarship', label: 'Scholarships' },
  { href: '/services', label: 'Services' },
]

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [fullName, setFullName] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user ?? null)
      if (user) {
        supabase.from('profiles').select('full_name').eq('id', user.id).single()
          .then(({ data }) => setFullName(data?.full_name ?? ''))
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) setFullName('')
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // close mobile menu on route change
  useEffect(() => { setMobileMenuOpen(false) }, [pathname])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setDropdownOpen(false)
    router.push('/')
    router.refresh()
  }

  const initials = fullName
    ? fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : user?.email?.[0].toUpperCase() ?? '?'

  return (
    <nav className="sticky top-0 z-50" style={{ background: '#181831', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="max-w-[90%] mx-auto h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <span className="font-light text-xl tracking-wide" style={{ color: '#fff' }}>
            fix it<span style={{ color: '#51e74c' }}>.</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm transition-colors ${
                pathname === link.href ? 'text-white' : 'hover:text-white'
              }`}
              style={{ color: pathname === link.href ? '#fff' : 'rgba(255,255,255,0.5)' }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Desktop: user dropdown or login/signup */}
          {user ? (
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setDropdownOpen(p => !p)}
                className="hidden md:flex items-center gap-2 rounded-xl px-2 py-1.5 transition"
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center text-white text-xs flex-shrink-0">
                  {initials}
                </div>
                <span className="text-sm max-w-[120px] truncate" style={{ color: 'rgba(255,255,255,0.85)' }}>
                  {fullName || user.email}
                </span>
                <svg className="w-3 h-3 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                  <Link href="/profile" onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2.5 text-sm text-navy hover:bg-gray-50 transition-colors">
                    My Profile
                  </Link>
                  <Link href="/change-password" onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2.5 text-sm text-navy hover:bg-gray-50 transition-colors">
                    Change Password
                  </Link>
                  <div className="border-t border-gray-100 my-1" />
                  <button onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-gray-50 transition-colors">
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/login" className="text-sm transition px-3 py-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Log in
              </Link>
              <Link href="/signup"
                className="text-sm bg-blue text-white px-4 py-2 rounded-xl hover:opacity-90 transition">
                Sign up
              </Link>
            </div>
          )}

          {/* Hamburger — mobile only */}
          <button onClick={() => setMobileMenuOpen(p => !p)}
            className="md:hidden p-2" style={{ color: 'rgba(255,255,255,0.8)' }}>
            {mobileMenuOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pb-4 pt-2" style={{ background: '#181831', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          {navLinks.map(link => (
            <Link key={link.href} href={link.href}
              className="block py-3 text-sm" style={{ color: 'rgba(255,255,255,0.7)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {link.label}
            </Link>
          ))}

          {user ? (
            <div className="pt-3 space-y-1">
              <div className="flex items-center gap-3 px-1 pb-2">
                <div className="w-7 h-7 rounded-full bg-navy flex items-center justify-center text-white text-xs flex-shrink-0">
                  {initials}
                </div>
                <span className="text-sm truncate" style={{ color: 'rgba(255,255,255,0.7)' }}>{fullName || user.email}</span>
              </div>
              <Link href="/profile" onClick={() => setMobileMenuOpen(false)}
                className="block py-2.5 text-sm" style={{ color: 'rgba(255,255,255,0.7)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                My Profile
              </Link>
              <Link href="/change-password" onClick={() => setMobileMenuOpen(false)}
                className="block py-2.5 text-sm" style={{ color: 'rgba(255,255,255,0.7)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                Change Password
              </Link>
              <button onClick={() => { setMobileMenuOpen(false); handleSignOut() }}
                className="block w-full text-left py-2.5 text-sm text-red-400" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex gap-2 pt-3">
              <Link href="/login"
                className="flex-1 text-center text-sm py-2.5 rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)' }}>
                Log in
              </Link>
              <Link href="/signup"
                className="flex-1 text-center text-sm bg-blue text-white py-2.5 rounded-xl">
                Sign up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
