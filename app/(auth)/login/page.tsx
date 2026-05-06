'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      toast.error(
        error.message === 'Invalid login credentials'
          ? 'Incorrect email or password.'
          : error.message
      )
      setLoading(false)
      return
    }

    router.push('/profile')
    router.refresh()
  }

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 sm:p-10">
      <h1 className="text-2xl text-navy mb-1" style={{ fontWeight: 300 }}>
        Welcome back
      </h1>
      <p className="text-gray-400 text-sm mb-8">Log in to your Fix It account</p>

      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wide">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-navy placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent transition"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-xs text-gray-500 uppercase tracking-wide">Password</label>
            <Link href="/forgot-password" className="text-xs text-blue hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm text-navy placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(p => !p)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue text-white rounded-xl py-3 text-sm hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
        >
          {loading && (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {loading ? 'Logging in...' : 'Log in'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-400">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-blue hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  )
}
