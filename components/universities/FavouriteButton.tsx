'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

type Props = {
  slug: string
  initialFavourited: boolean
  isLoggedIn: boolean
  size?: 'sm' | 'md'
}

export default function FavouriteButton({ slug, initialFavourited, isLoggedIn, size = 'md' }: Props) {
  const [favourited, setFavourited] = useState(initialFavourited)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isLoggedIn) { router.push('/login'); return }
    if (loading) return

    setLoading(true)
    const prev = favourited
    setFavourited(!prev)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setFavourited(prev); router.push('/login'); return }

    if (prev) {
      const { error } = await supabase.from('favorites').delete().eq('item_slug', slug).eq('user_id', user.id)
      if (error) { setFavourited(prev); toast.error('Something went wrong') }
      else toast.success('Removed from favourites')
    } else {
      const { error } = await supabase.from('favorites').insert({ item_slug: slug, user_id: user.id })
      if (error) { setFavourited(prev); toast.error('Something went wrong') }
      else toast.success('Saved to favourites!')
    }
    setLoading(false)
  }

  const dim = size === 'sm' ? 28 : 32
  const iconSize = size === 'sm' ? 13 : 15

  return (
    <button
      onClick={toggle}
      title={favourited ? 'Remove from favourites' : 'Save to favourites'}
      style={{
        width: dim, height: dim, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: '50%', border: 'none', cursor: 'pointer',
        background: favourited ? 'rgba(239,68,68,0.1)' : 'rgba(24,24,49,0.05)',
        color: favourited ? '#ef4444' : 'rgba(24,24,49,0.3)',
        transition: 'background 0.15s, color 0.15s',
      }}
      onMouseEnter={e => {
        if (!favourited) {
          ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.1)'
          ;(e.currentTarget as HTMLButtonElement).style.color = '#ef4444'
        }
      }}
      onMouseLeave={e => {
        if (!favourited) {
          ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(24,24,49,0.05)'
          ;(e.currentTarget as HTMLButtonElement).style.color = 'rgba(24,24,49,0.3)'
        }
      }}
    >
      {favourited ? (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
        </svg>
      ) : (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
      )}
    </button>
  )
}
