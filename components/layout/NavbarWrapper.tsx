'use client'

import { usePathname } from 'next/navigation'
import Navbar from './Navbar'

const NO_NAVBAR = ['/login', '/signup', '/forgot-password', '/reset-password', '/change-password', '/verify-email']

export default function NavbarWrapper() {
  const pathname = usePathname()
  if (NO_NAVBAR.includes(pathname)) return null
  return <Navbar />
}
