'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { COMMUNITY_COUNTRIES } from '@/lib/community'

type Listing = {
  id: string
  user_id: string | null
  author_alias: string | null
  listing_type: 'offering' | 'seeking'
  title: string
  description: string | null
  city: string | null
  country_slug: string | null
  contact_info: string | null
  price: string | null
  status: string | null
  created_at: string
}

type AuthStep = 'loading' | 'login' | 'alias' | 'ready'
type View = 'list' | 'form'
type Filter = 'all' | 'offering' | 'seeking'

// ─── Multi-select dropdown ────────────────────────────────────────────────────

function MultiSelect({
  label, options, selected, onChange,
}: {
  label: string
  options: { value: string; label: string }[]
  selected: string[]
  onChange: (next: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function toggle(value: string) {
    onChange(selected.includes(value) ? selected.filter(v => v !== value) : [...selected, value])
  }

  const displayLabel = selected.length === 0
    ? label
    : selected.length === 1
      ? options.find(o => o.value === selected[0])?.label ?? label
      : `${options.find(o => o.value === selected[0])?.label} +${selected.length - 1}`

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        onClick={() => setOpen(p => !p)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 10px 6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 300,
          border: '1px solid', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
          background: selected.length > 0 ? '#181831' : '#f8f9fb',
          color: selected.length > 0 ? 'white' : 'rgba(24,24,49,0.55)',
          borderColor: selected.length > 0 ? '#181831' : '#eef0f3',
          whiteSpace: 'nowrap',
        }}
      >
        {displayLabel}
        <svg style={{ width: 10, height: 10, opacity: 0.6, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 300,
          background: 'white', borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          border: '1px solid #eef0f3', minWidth: 180, padding: '6px 0', maxHeight: 240, overflowY: 'auto',
        }}>
          {options.map(opt => (
            <label key={opt.value} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px',
              cursor: 'pointer', fontSize: 12, fontWeight: 300, color: '#181831',
              background: selected.includes(opt.value) ? 'rgba(12,77,134,0.05)' : 'transparent',
              transition: 'background 0.1s',
            }}>
              <input
                type="checkbox"
                checked={selected.includes(opt.value)}
                onChange={() => toggle(opt.value)}
                style={{ accentColor: '#181831', width: 13, height: 13, flexShrink: 0 }}
              />
              {opt.label}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function HousingBoard() {
  const [open, setOpen] = useState(false)
  const [visible, setVisible] = useState(false)
  const [listings, setListings] = useState<Listing[]>([])
  const [loadingListings, setLoadingListings] = useState(false)
  const [fetched, setFetched] = useState(false)
  const [view, setView] = useState<View>('list')
  const [filter, setFilter] = useState<Filter>('all')
  const [currentUserId, setCurrentUserId] = useState('')
  const [filterCountries, setFilterCountries] = useState<string[]>([])
  const [filterCities, setFilterCities] = useState<string[]>([])
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // auth for posting
  const [authStep, setAuthStep] = useState<AuthStep>('loading')
  const [userId, setUserId] = useState('')
  const [alias, setAlias] = useState('')
  const [aliasInput, setAliasInput] = useState('')

  // form
  const [listingType, setListingType] = useState<'offering' | 'seeking'>('offering')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [city, setCity] = useState('')
  const [countrySlug, setCountrySlug] = useState('')
  const [contactInfo, setContactInfo] = useState('')
  const [price, setPrice] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function openPanel() {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setOpen(true)
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
  }

  function closePanel() {
    setVisible(false)
    closeTimer.current = setTimeout(() => { setOpen(false); setView('list') }, 300)
  }

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (user) setCurrentUserId(user.id)
    })
  }, [])

  useEffect(() => {
    if (!open || fetched) return
    async function fetchListings() {
      setLoadingListings(true)
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('accommodation_posts')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
        setListings((data ?? []) as Listing[])
      } catch { /* not yet created */ }
      setLoadingListings(false)
      setFetched(true)
    }
    fetchListings()
  }, [open, fetched])

  useEffect(() => {
    if (view !== 'form') return
    async function checkAuth() {
      setAuthStep('loading')
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { setAuthStep('login'); return }
        setUserId(user.id)
        const { data: profile } = await supabase
          .from('profiles').select('community_alias').eq('id', user.id).single()
        if (profile?.community_alias) { setAlias(profile.community_alias); setAuthStep('ready') }
        else setAuthStep('alias')
      } catch { setAuthStep('login') }
    }
    checkAuth()
  }, [view])

  async function saveAlias() {
    const trimmed = aliasInput.trim()
    if (trimmed.length < 2) { toast.error('At least 2 characters'); return }
    const supabase = createClient()
    const { error } = await supabase.from('profiles').update({ community_alias: trimmed }).eq('id', userId)
    if (error) { toast.error('Could not save'); return }
    setAlias(trimmed); setAuthStep('ready')
  }

  async function submitListing() {
    if (!title.trim()) { toast.error('Add a title'); return }
    if (!contactInfo.trim()) { toast.error('Add your contact info'); return }
    setSubmitting(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('accommodation_posts')
        .insert({
          user_id: userId, author_alias: alias, listing_type: listingType,
          title: title.trim(), description: description.trim() || null,
          city: city.trim() || null, country_slug: countrySlug || null,
          contact_info: contactInfo.trim(), price: price.trim() || null,
          is_active: true, status: null,
        })
        .select().single()
      if (error) { toast.error('Could not post. Try again.'); setSubmitting(false); return }
      toast.success('Listing posted!')
      setListings(prev => [data as Listing, ...prev])
      setView('list')
      setTitle(''); setDescription(''); setCity(''); setCountrySlug(''); setContactInfo(''); setPrice('')
    } catch { toast.error('Could not post. Try again.') }
    setSubmitting(false)
  }

  async function deleteListing(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from('accommodation_posts').delete().eq('id', id)
    if (!error) setListings(prev => prev.filter(l => l.id !== id))
    else toast.error('Could not delete')
  }

  async function markStatus(id: string, status: 'taken' | 'found') {
    const supabase = createClient()
    const { error } = await supabase
      .from('accommodation_posts')
      .update({ status })
      .eq('id', id)
    if (!error) setListings(prev => prev.map(l => l.id === id ? { ...l, status } : l))
    else toast.error('Could not update')
  }

  // Cities normalised to lowercase for deduplication
  const availableCities = Array.from(
    new Set(
      listings
        .filter(l => filterCountries.length === 0 || filterCountries.includes(l.country_slug ?? ''))
        .map(l => l.city?.trim().toLowerCase())
        .filter((c): c is string => !!c)
    )
  ).sort()

  const filtered = listings.filter(l => {
    if (filter !== 'all' && l.listing_type !== filter) return false
    if (filterCountries.length > 0 && !filterCountries.includes(l.country_slug ?? '')) return false
    if (filterCities.length > 0 && !filterCities.includes(l.city?.trim().toLowerCase() ?? '')) return false
    return true
  })

  const hasFilters = filter !== 'all' || filterCountries.length > 0 || filterCities.length > 0

  const countryOptions = COMMUNITY_COUNTRIES.map(c => ({ value: c.slug, label: c.name }))
  const cityOptions = availableCities.map(c => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }))

  return (
    <>
      {/* ── Trigger button ── */}
      <button
        onClick={() => visible ? closePanel() : openPanel()}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '13px 24px', borderRadius: 16,
          background: visible ? '#181831' : '#0c4d86',
          color: 'white', border: 'none',
          fontSize: 14, fontWeight: 300, fontFamily: 'inherit',
          cursor: 'pointer', transition: 'all 0.2s',
          boxShadow: visible ? 'none' : '0 4px 16px rgba(12,77,134,0.35)',
          whiteSpace: 'nowrap', flexShrink: 0,
        }}
      >
        <svg style={{ width: 17, height: 17, flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" />
        </svg>
        Housing Board
        {listings.length > 0 && (
          <span style={{ background: '#51e74c', color: '#181831', fontSize: 11, fontWeight: 400, padding: '2px 8px', borderRadius: 20 }}>
            {listings.length}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Backdrop — no blur */}
          <div
            onClick={closePanel}
            style={{
              position: 'fixed', inset: 0, zIndex: 200,
              background: 'rgba(24,24,49,0.3)',
              opacity: visible ? 1 : 0,
              transition: 'opacity 0.3s ease',
            }}
          />

          {/* Panel — grows from top-right */}
          <div style={{
            position: 'fixed', top: 80, right: 24,
            width: 'min(900px, calc(100vw - 48px))',
            height: 'calc(100vh - 106px)',
            background: 'white', borderRadius: 24,
            boxShadow: '0 24px 80px rgba(0,0,0,0.18)',
            border: '1px solid #eef0f3',
            zIndex: 201, display: 'flex', flexDirection: 'column', overflow: 'hidden',
            transformOrigin: 'top right',
            transform: visible ? 'scale(1)' : 'scale(0.04)',
            opacity: visible ? 1 : 0,
            transition: 'transform 0.35s cubic-bezier(0.34,1.15,0.64,1), opacity 0.25s ease',
          }}>

            {/* Header */}
            <div style={{ padding: '26px 32px 18px', borderBottom: '1px solid #f0f2f5', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: view === 'list' ? 16 : 0 }}>
                <div>
                  {view === 'form' ? (
                    <button onClick={() => setView('list')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'rgba(24,24,49,0.4)', fontFamily: 'inherit', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10 }}>
                      <svg style={{ width: 12, height: 12 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                      Back to listings
                    </button>
                  ) : (
                    <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#51e74c', fontWeight: 300, marginBottom: 6 }}>Housing Board</p>
                  )}
                  <h2 style={{ fontSize: 'clamp(20px, 2.2vw, 26px)', color: '#181831', fontWeight: 300, margin: 0, lineHeight: 1.25 }}>
                    {view === 'form' ? 'Post a listing' : 'Looking for accommodation?'}
                  </h2>
                  {view === 'list' && (
                    <p style={{ fontSize: 13, color: 'rgba(24,24,49,0.42)', fontWeight: 300, marginTop: 5 }}>
                      Students leaving their place, rooms available, people searching — all in one spot.
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  {view === 'list' && (
                    <button onClick={() => setView('form')} style={{ fontSize: 13, padding: '9px 20px', borderRadius: 12, background: '#51e74c', color: '#181831', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 400, whiteSpace: 'nowrap' }}>
                      + Post listing
                    </button>
                  )}
                  <button onClick={closePanel} style={{ width: 34, height: 34, borderRadius: 10, background: '#f5f6f8', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg style={{ width: 14, height: 14, color: 'rgba(24,24,49,0.45)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Filter bar */}
              {view === 'list' && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                  {/* Type pills */}
                  {(['all', 'offering', 'seeking'] as const).map(f => (
                    <button key={f} onClick={() => setFilter(f)} style={{
                      padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 300,
                      border: '1px solid', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                      background: filter === f ? '#181831' : '#f8f9fb',
                      color: filter === f ? 'white' : 'rgba(24,24,49,0.5)',
                      borderColor: filter === f ? '#181831' : '#eef0f3',
                    }}>
                      {f === 'all' ? 'All' : f === 'offering' ? 'Offering' : 'Looking'}
                    </button>
                  ))}

                  <div style={{ width: 1, height: 20, background: '#eef0f3', flexShrink: 0 }} />

                  <MultiSelect
                    label="Country"
                    options={countryOptions}
                    selected={filterCountries}
                    onChange={next => { setFilterCountries(next); setFilterCities([]) }}
                  />

                  <MultiSelect
                    label="City"
                    options={cityOptions}
                    selected={filterCities}
                    onChange={setFilterCities}
                  />

                  {hasFilters && (
                    <button
                      onClick={() => { setFilter('all'); setFilterCountries([]); setFilterCities([]) }}
                      style={{ fontSize: 11, color: 'rgba(24,24,49,0.38)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: '0 2px', whiteSpace: 'nowrap' }}
                    >
                      ✕ Clear
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '22px 32px 32px' }}>

              {/* List view */}
              {view === 'list' && (
                loadingListings ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
                    {[1,2,3,4,5,6].map(i => (
                      <div key={i} className="animate-pulse" style={{ height: 140, background: '#f5f6f8', borderRadius: 16 }} />
                    ))}
                  </div>
                ) : filtered.length === 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', paddingBottom: 40 }}>
                    <div style={{ width: 52, height: 52, borderRadius: 16, background: '#f5f6f8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                      <svg style={{ width: 22, height: 22, color: 'rgba(24,24,49,0.22)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" />
                      </svg>
                    </div>
                    <p style={{ fontSize: 15, color: 'rgba(24,24,49,0.4)', fontWeight: 300, marginBottom: 6 }}>No listings yet</p>
                    <p style={{ fontSize: 13, color: 'rgba(24,24,49,0.28)', fontWeight: 300, maxWidth: 300 }}>
                      Be the first — someone might be looking for exactly your place.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
                    {filtered.map(l => {
                      const country = COMMUNITY_COUNTRIES.find(c => c.slug === l.country_slug)
                      const isOwn = !!currentUserId && l.user_id === currentUserId
                      const isTaken = !!l.status
                      const statusLabel = l.listing_type === 'offering' ? 'Taken' : 'Found'
                      return (
                        <div key={l.id} style={{
                          borderRadius: 18, border: '1px solid #eef0f3',
                          background: isTaken ? '#f5f6f8' : 'white',
                          display: 'flex', flexDirection: 'column',
                          position: 'relative', overflow: 'hidden',
                          transition: 'opacity 0.2s',
                          opacity: isTaken ? 0.75 : 1,
                        }}>
                          {/* Taken / Found full-width banner — replaces all old badges/tags for status */}
                          {isTaken && (
                            <div style={{
                              background: '#181831', color: 'white',
                              padding: '8px 20px', fontSize: 11, fontWeight: 400,
                              letterSpacing: '0.12em', textTransform: 'uppercase',
                              display: 'flex', alignItems: 'center', gap: 8,
                            }}>
                              <svg style={{ width: 12, height: 12, flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                              {statusLabel} — no longer available
                            </div>
                          )}

                          {/* Card body */}
                          <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                            {/* Top row: type badge + price + delete */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                              <span style={{
                                fontSize: 10, padding: '3px 10px', borderRadius: 20, fontWeight: 400,
                                background: l.listing_type === 'offering' ? 'rgba(81,231,76,0.15)' : 'rgba(12,77,134,0.1)',
                                color: l.listing_type === 'offering' ? '#228b20' : '#0c4d86',
                              }}>
                                {l.listing_type === 'offering' ? 'Offering a place' : 'Looking for a place'}
                              </span>
                              {l.price && (
                                <span style={{ fontSize: 11, color: '#181831', fontWeight: 400, marginLeft: 'auto' }}>
                                  {l.price}
                                </span>
                              )}
                              {isOwn && (
                                <button
                                  onClick={() => deleteListing(l.id)}
                                  title="Delete"
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'rgba(24,24,49,0.22)', marginLeft: l.price ? 0 : 'auto' }}
                                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#e53e3e' }}
                                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(24,24,49,0.22)' }}
                                >
                                  <svg style={{ width: 13, height: 13 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                  </svg>
                                </button>
                              )}
                            </div>

                            <div>
                              <p style={{ fontSize: 14, color: '#181831', fontWeight: 300, marginBottom: 3, lineHeight: 1.4 }}>
                                {l.title}
                              </p>
                              {(l.city || country) && (
                                <p style={{ fontSize: 11, color: 'rgba(24,24,49,0.38)', fontWeight: 300 }}>
                                  {[l.city, country?.name].filter(Boolean).join(', ')}
                                </p>
                              )}
                            </div>

                            {l.description && (
                              <p style={{ fontSize: 12, color: 'rgba(24,24,49,0.5)', fontWeight: 300, lineHeight: 1.6, flex: 1 }}>
                                {l.description}
                              </p>
                            )}

                            {l.contact_info && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 11px', borderRadius: 10, background: 'rgba(12,77,134,0.05)', border: '1px solid rgba(12,77,134,0.08)', marginTop: 'auto' }}>
                                <svg style={{ width: 11, height: 11, color: '#0c4d86', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                                </svg>
                                <span style={{ fontSize: 12, color: '#0c4d86', fontWeight: 300 }}>{l.contact_info}</span>
                              </div>
                            )}

                            <p style={{ fontSize: 10, color: 'rgba(24,24,49,0.26)', fontWeight: 300 }}>
                              {l.author_alias ?? 'Anonymous'}
                            </p>
                          </div>

                          {/* Owner: mark as taken/found — full-width bottom strip */}
                          {isOwn && !isTaken && (
                            <button
                              onClick={() => markStatus(l.id, l.listing_type === 'offering' ? 'taken' : 'found')}
                              style={{
                                width: '100%', padding: '10px',
                                background: 'transparent', border: 'none', borderTop: '1px solid #eef0f3',
                                cursor: 'pointer', fontSize: 11, fontFamily: 'inherit', fontWeight: 300,
                                color: 'rgba(24,24,49,0.38)', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', gap: 6, transition: 'all 0.15s',
                              }}
                              onMouseEnter={e => {
                                const b = e.currentTarget as HTMLButtonElement
                                b.style.background = '#181831'
                                b.style.color = 'white'
                              }}
                              onMouseLeave={e => {
                                const b = e.currentTarget as HTMLButtonElement
                                b.style.background = 'transparent'
                                b.style.color = 'rgba(24,24,49,0.38)'
                              }}
                            >
                              <svg style={{ width: 11, height: 11 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                              Mark as {statusLabel.toLowerCase()}
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )
              )}

              {/* Form view */}
              {view === 'form' && (
                <div style={{ maxWidth: 560, margin: '0 auto' }}>
                  {authStep === 'loading' && (
                    <div className="animate-pulse" style={{ height: 48, background: '#f5f6f8', borderRadius: 12 }} />
                  )}
                  {authStep === 'login' && (
                    <div style={{ textAlign: 'center', padding: '60px 0' }}>
                      <p style={{ fontSize: 14, color: 'rgba(24,24,49,0.5)', fontWeight: 300, marginBottom: 20 }}>Log in to post a listing</p>
                      <Link href="/login" style={{ display: 'inline-block', background: '#181831', color: 'white', padding: '11px 28px', borderRadius: 12, fontSize: 13, fontWeight: 300, textDecoration: 'none' }}>
                        Log in
                      </Link>
                    </div>
                  )}
                  {authStep === 'alias' && (
                    <div style={{ paddingTop: 8 }}>
                      <p style={{ fontSize: 14, color: '#181831', fontWeight: 300, marginBottom: 6 }}>Pick a community name first</p>
                      <p style={{ fontSize: 13, color: 'rgba(24,24,49,0.45)', fontWeight: 300, marginBottom: 18, lineHeight: 1.5 }}>
                        Shows on all your posts — nickname or first name works fine.
                      </p>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input type="text" value={aliasInput} onChange={e => setAliasInput(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') saveAlias() }}
                          placeholder="e.g. Ana from Skopje" maxLength={24}
                          style={{ flex: 1, padding: '11px 14px', borderRadius: 12, border: '1px solid #eef0f3', background: '#f8f9fb', fontSize: 13, fontFamily: 'inherit', outline: 'none' }} />
                        <button onClick={saveAlias} disabled={aliasInput.trim().length < 2}
                          style={{ padding: '11px 18px', borderRadius: 12, background: '#51e74c', color: '#181831', fontSize: 13, border: 'none', cursor: 'pointer', fontFamily: 'inherit', opacity: aliasInput.trim().length < 2 ? 0.5 : 1 }}>
                          Save
                        </button>
                      </div>
                    </div>
                  )}
                  {authStep === 'ready' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                      <p style={{ fontSize: 13, color: 'rgba(24,24,49,0.4)', fontWeight: 300 }}>
                        Posting as <strong style={{ fontWeight: 400 }}>{alias}</strong>
                      </p>

                      <div>
                        <p style={labelStyle}>I am</p>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {(['offering', 'seeking'] as const).map(t => (
                            <button key={t} onClick={() => setListingType(t)} style={{
                              flex: 1, padding: '11px', borderRadius: 12, fontSize: 13, fontWeight: 300,
                              border: '1px solid', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                              background: listingType === t ? '#181831' : '#f8f9fb',
                              color: listingType === t ? 'white' : 'rgba(24,24,49,0.55)',
                              borderColor: listingType === t ? '#181831' : '#eef0f3',
                            }}>
                              {t === 'offering' ? 'Offering a place' : 'Looking for a place'}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p style={labelStyle}>Title *</p>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                          placeholder={listingType === 'offering' ? 'e.g. Room available in Milan, July' : 'e.g. Looking for a room in Barcelona from Sept'}
                          style={inputStyle} />
                      </div>

                      <div style={{ display: 'flex', gap: 12 }}>
                        <div style={{ flex: 1 }}>
                          <p style={labelStyle}>City</p>
                          <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Milan" style={inputStyle} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={labelStyle}>Country</p>
                          <select value={countrySlug} onChange={e => setCountrySlug(e.target.value)} style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}>
                            <option value="">Any</option>
                            {COMMUNITY_COUNTRIES.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                          </select>
                        </div>
                      </div>

                      <div>
                        <p style={labelStyle}>Details</p>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4}
                          placeholder={listingType === 'offering' ? 'Size, furnished?, move-out date, any rules...' : 'Budget, preferred area, move-in date...'}
                          style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} />
                      </div>

                      <div>
                        <p style={labelStyle}>Price / Budget (optional)</p>
                        <input type="text" value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g. €450/month" style={inputStyle} />
                      </div>

                      <div>
                        <p style={labelStyle}>Contact info *</p>
                        <input type="text" value={contactInfo} onChange={e => setContactInfo(e.target.value)}
                          placeholder="WhatsApp number, email, Instagram..." style={inputStyle} />
                      </div>

                      <button onClick={submitListing} disabled={submitting || !title.trim() || !contactInfo.trim()}
                        style={{ width: '100%', padding: '13px', borderRadius: 14, background: '#51e74c', color: '#181831', fontSize: 14, fontWeight: 400, border: 'none', cursor: 'pointer', fontFamily: 'inherit', opacity: (!title.trim() || !contactInfo.trim() || submitting) ? 0.5 : 1 }}>
                        {submitting ? 'Posting…' : 'Post listing →'}
                      </button>

                      <p style={{ fontSize: 11, color: 'rgba(24,24,49,0.28)', fontWeight: 300, textAlign: 'center' }}>
                        Be honest. Misleading listings can be reported and removed.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}

const labelStyle: React.CSSProperties = {
  fontSize: 11, color: 'rgba(24,24,49,0.5)', fontWeight: 300,
  marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em',
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px', borderRadius: 12,
  border: '1px solid #eef0f3', background: '#f8f9fb',
  fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
}
