'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function SignupPage() {
  const [userType, setUserType] = useState<'student' | 'parent'>('student')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters.')
      return
    }

    if (!/\d/.test(password)) {
      toast.error('Password must contain at least one number.')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }

    setLoading(true)

    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, user_type: userType },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    if (data.user?.identities?.length === 0) {
      toast.error('An account with this email already exists. Try logging in.')
      setLoading(false)
      return
    }

    router.push('/verify-email')
  }

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 sm:p-10">
      <h1 className="text-2xl text-navy mb-1" style={{ fontWeight: 300 }}>
        Create your account
      </h1>
      <p className="text-gray-400 text-sm mb-6">Join Fix It and start your journey</p>

      <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
        {(['student', 'parent'] as const).map(type => (
          <button
            key={type}
            type="button"
            onClick={() => setUserType(type)}
            className={`flex-1 py-2 rounded-lg text-sm transition-all ${
              userType === type
                ? 'bg-white shadow-sm text-navy'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {type === 'student' ? 'Student' : 'Parent / Guardian'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSignup} className="space-y-5">
        <div>
          <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wide">
            Full name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            placeholder="Ana Trajkovska"
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-navy placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent transition"
          />
        </div>

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
          <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wide">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
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
          <div className="flex gap-3 mt-2">
            <span className={`text-xs ${password.length >= 8 ? 'text-green' : 'text-gray-300'}`}>
              ✓ 8+ characters
            </span>
            <span className={`text-xs ${/\d/.test(password) ? 'text-green' : 'text-gray-300'}`}>
              ✓ one number
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wide">
            Confirm password
          </label>
          <input
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="Repeat your password"
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-navy placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent transition"
          />
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
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-400">
        Already have an account?{' '}
        <Link href="/login" className="text-blue hover:underline">
          Log in
        </Link>
      </p>
    </div>
  )
}
