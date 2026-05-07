'use client'

import { usePathname } from 'next/navigation'
import Footer from './Footer'

const NO_FOOTER = ['/login', '/signup', '/forgot-password', '/reset-password', '/change-password', '/verify-email']

export default function FooterWrapper() {
  const pathname = usePathname()
  if (NO_FOOTER.includes(pathname)) return null
  return <Footer />
}
