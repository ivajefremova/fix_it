'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function ChangePasswordPage() {
  const [email, setEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace('/login')
      } else {
        setEmail(user.email ?? '')
        setChecking(false)
      }
    })
  }, [router])

  const handleChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters.')
      return
    }

    if (!/\d/.test(newPassword)) {
      toast.error('New password must contain at least one number.')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }

    setLoading(true)

    const supabase = createClient()

    // Verify current password by re-authenticating
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword,
    })

    if (verifyError) {
      toast.error('Current password is incorrect.')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    toast.success('Password updated successfully.')
    router.push('/profile')
  }

  if (checking) return null

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 sm:p-10">
      <h1 className="text-2xl text-navy mb-1" style={{ fontWeight: 300 }}>
        Change password
      </h1>
      <p className="text-gray-400 text-sm mb-8">Update the password for your account.</p>

      <form onSubmit={handleChange} className="space-y-5">

        {/* Current password */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-xs text-gray-500 uppercase tracking-wide">
              Current password
            </label>
            <Link href="/forgot-password" className="text-xs text-blue hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showCurrent ? 'text' : 'password'}
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder="Your current password"
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm text-navy placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent transition"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(p => !p)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
            >
              {showCurrent ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {/* New password */}
        <div>
          <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wide">
            New password
          </label>
          <div className="relative">
            <input
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Min. 8 characters"
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm text-navy placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent transition"
            />
            <button
              type="button"
              onClick={() => setShowNew(p => !p)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
            >
              {showNew ? 'Hide' : 'Show'}
            </button>
          </div>
          <div className="flex gap-3 mt-2">
            <span className={`text-xs ${newPassword.length >= 8 ? 'text-green' : 'text-gray-300'}`}>
              ✓ 8+ characters
            </span>
            <span className={`text-xs ${/\d/.test(newPassword) ? 'text-green' : 'text-gray-300'}`}>
              ✓ one number
            </span>
          </div>
        </div>

        {/* Confirm new password */}
        <div>
          <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wide">
            Confirm new password
          </label>
          <input
            type={showNew ? 'text' : 'password'}
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="Repeat your new password"
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

      <p className="mt-6 text-center">
        <Link href="/profile" className="text-sm text-blue hover:underline">
          Back to profile
        </Link>
      </p>
    </div>
  )
}
