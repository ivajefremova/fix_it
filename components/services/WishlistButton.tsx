'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

type Props = {
  packageType: string
  countrySlug: string
  country: string
  initialSaved: boolean
  isLoggedIn: boolean
}

export default function WishlistButton({ packageType, countrySlug, country, initialSaved, isLoggedIn }: Props) {
  const [saved, setSaved] = useState(initialSaved)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isLoggedIn) { router.push('/login'); return }
    if (loading) return

    setLoading(true)
    const prev = saved
    setSaved(!prev)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaved(prev); router.push('/login'); return }

    if (prev) {
      const { error } = await supabase.from('wishlist')
        .delete().eq('package_type', packageType).eq('country_slug', countrySlug).eq('user_id', user.id)
      if (error) { setSaved(prev); toast.error('Something went wrong') }
      else toast.success('Removed from saved')
    } else {
      const { error } = await supabase.from('wishlist')
        .insert({ package_type: packageType, country_slug: countrySlug, country, user_id: user.id })
      if (error) { setSaved(prev); toast.error('Something went wrong') }
      else toast.success('Saved for later!')
    }
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      title={saved ? 'Remove from saved' : 'Save for later'}
      style={{
        width: 32, height: 32, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: '50%', border: 'none', cursor: 'pointer',
        background: saved ? 'rgba(239,68,68,0.1)' : 'rgba(24,24,49,0.05)',
        color: saved ? '#ef4444' : 'rgba(24,24,49,0.3)',
        transition: 'background 0.15s, color 0.15s',
      }}
      onMouseEnter={e => {
        if (!saved) {
          ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.1)'
          ;(e.currentTarget as HTMLButtonElement).style.color = '#ef4444'
        }
      }}
      onMouseLeave={e => {
        if (!saved) {
          ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(24,24,49,0.05)'
          ;(e.currentTarget as HTMLButtonElement).style.color = 'rgba(24,24,49,0.3)'
        }
      }}
    >
      {saved ? (
        <svg width={15} height={15} viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
        </svg>
      ) : (
        <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
      )}
    </button>
  )
}
