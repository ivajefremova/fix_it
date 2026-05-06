'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters.')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }

    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    toast.success('Password updated. Please log in.')
    router.push('/login')
  }

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 sm:p-10">
      <h1 className="text-2xl text-navy mb-1" style={{ fontWeight: 300 }}>
        Set new password
      </h1>
      <p className="text-gray-400 text-sm mb-8">Choose a strong password for your account.</p>

      <form onSubmit={handleReset} className="space-y-5">
        <div>
          <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wide">
            New password
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
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wide">
            Confirm new password
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
          className="w-full bg-blue text-white rounded-xl py-3 text-sm hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {loading ? 'Updating...' : 'Update password'}
        </button>
      </form>
    </div>
  )
}
