'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import Checklist from './Checklist'

// ─── Types ─────────────────────────────────────────────────────────────────────

type FavouriteUniversity = {
  fav_id: number
  slug: string
  name: string
  country: string
  country_slug: string
  city: string | null
  type: string | null
  tuition_range: string | null
  tags: string[] | null
  ranking_summary: string | null
  status: string
  notes: string | null
  created_at: string
}

type WishlistItem = {
  id: number
  package_type: string
  country_slug: string
  country: string
  item_name: string | null
  created_at: string
}

type Props = {
  userId: string
  name: string
  email: string
  initials: string
  userType: string | null
  favourites: FavouriteUniversity[]
  wishlist: WishlistItem[]
}

// ─── Status config ──────────────────────────────────────────────────────────────

const STATUSES = [
  { value: 'researching',  label: 'Researching',      bg: 'rgba(12,77,134,0.08)',    color: '#0c4d86' },
  { value: 'planning',     label: 'Planning to apply', bg: 'rgba(245,158,11,0.1)',    color: '#b45309' },
  { value: 'applied',      label: 'Applied',           bg: 'rgba(139,92,246,0.1)',    color: '#7c3aed' },
  { value: 'accepted',     label: 'Got in!',           bg: 'rgba(81,231,76,0.15)',    color: '#15803d' },
]

function statusMeta(value: string) {
  return STATUSES.find(s => s.value === value) ?? STATUSES[0]
}

const PACKAGE_LABELS: Record<string, string> = {
  country:     'Country Guide',
  scholarship: 'Scholarship Guide',
  documents:   'Documents & Relocation',
}

const PACKAGE_PRICES: Record<string, string> = {
  country:     '€7.99',
  scholarship: '€5.99',
  documents:   '€3.99',
}

// ─── Compare modal ─────────────────────────────────────────────────────────────

function CompareModal({ unis, onClose }: { unis: FavouriteUniversity[]; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const rows: { label: string; key: keyof FavouriteUniversity }[] = [
    { label: 'City',     key: 'city' },
    { label: 'Country',  key: 'country' },
    { label: 'Type',     key: 'type' },
    { label: 'Tuition',  key: 'tuition_range' },
    { label: 'Ranking',  key: 'ranking_summary' },
  ]

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(24,24,49,0.45)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onClick={onClose}
    >
      <div
        style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 700, maxHeight: '85vh', overflow: 'auto', padding: '2rem' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs uppercase tracking-widest" style={{ color: '#51e74c' }}>Comparing</p>
          <button onClick={onClose} style={{ color: 'rgba(24,24,49,0.4)', background: 'none', border: 'none', cursor: 'pointer' }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* University name headers */}
        <div style={{ display: 'grid', gridTemplateColumns: `120px repeat(${unis.length}, 1fr)`, gap: '1rem', marginBottom: '1.5rem' }}>
          <div />
          {unis.map(u => (
            <div key={u.slug}>
              <Link href={`/universities/${u.slug}`} className="text-sm text-navy hover:underline" style={{ fontWeight: 300 }}>{u.name}</Link>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(24,24,49,0.4)', fontWeight: 300 }}>{u.city}</p>
            </div>
          ))}
        </div>

        {/* Comparison rows */}
        {rows.map(row => (
          <div
            key={row.key}
            style={{ display: 'grid', gridTemplateColumns: `120px repeat(${unis.length}, 1fr)`, gap: '1rem', padding: '0.75rem 0', borderTop: '1px solid #f0f2f5' }}
          >
            <p className="text-xs" style={{ color: 'rgba(24,24,49,0.4)', fontWeight: 300 }}>{row.label}</p>
            {unis.map(u => (
              <p key={u.slug} className="text-sm text-navy" style={{ fontWeight: 300 }}>
                {(u[row.key] as string | null) ?? '—'}
              </p>
            ))}
          </div>
        ))}

        {/* Tags row */}
        <div
          style={{ display: 'grid', gridTemplateColumns: `120px repeat(${unis.length}, 1fr)`, gap: '1rem', padding: '0.75rem 0', borderTop: '1px solid #f0f2f5' }}
        >
          <p className="text-xs" style={{ color: 'rgba(24,24,49,0.4)', fontWeight: 300 }}>Fields</p>
          {unis.map(u => (
            <div key={u.slug} className="flex flex-wrap gap-1">
              {(u.tags ?? []).slice(0, 3).map(t => (
                <span key={t} className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#f0f2f5', color: 'rgba(24,24,49,0.55)', fontWeight: 300 }}>{t}</span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Note editor ───────────────────────────────────────────────────────────────

function NoteEditor({ favId, initialNote, onSave }: { favId: number; initialNote: string | null; onSave: (note: string) => void }) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(initialNote ?? '')
  const [saving, setSaving] = useState(false)
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { if (open) ref.current?.focus() }, [open])

  const save = async () => {
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase.from('favorites').update({ notes: value || null }).eq('id', favId)
    setSaving(false)
    if (error) { toast.error('Could not save note'); return }
    onSave(value)
    setOpen(false)
    toast.success('Note saved')
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs transition-opacity hover:opacity-70"
        style={{ color: initialNote ? 'rgba(24,24,49,0.55)' : 'rgba(24,24,49,0.3)', fontWeight: 300, background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}
      >
        {initialNote ? `"${initialNote.slice(0, 50)}${initialNote.length > 50 ? '…' : ''}"` : '+ Add note'}
      </button>
    )
  }

  return (
    <div className="mt-2">
      <textarea
        ref={ref}
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Your note..."
        rows={2}
        className="w-full rounded-xl text-xs resize-none focus:outline-none"
        style={{ background: '#f8f9fb', border: '1px solid #e4ebf3', padding: '8px 10px', fontFamily: 'inherit', fontWeight: 300, color: '#181831' }}
      />
      <div className="flex gap-2 mt-1.5">
        <button
          onClick={save}
          disabled={saving}
          className="text-xs px-3 py-1 rounded-lg transition hover:opacity-90"
          style={{ background: '#181831', color: '#fff', fontWeight: 300, border: 'none', cursor: 'pointer' }}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button
          onClick={() => { setOpen(false); setValue(initialNote ?? '') }}
          className="text-xs px-3 py-1 rounded-lg"
          style={{ background: '#f0f2f5', color: 'rgba(24,24,49,0.55)', fontWeight: 300, border: 'none', cursor: 'pointer' }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

// ─── Universities tab ──────────────────────────────────────────────────────────

function UniversitiesTab({ initialFavourites, userId }: { initialFavourites: FavouriteUniversity[]; userId: string }) {
  const [favs, setFavs] = useState(initialFavourites)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [sort, setSort] = useState<'recent' | 'az' | 'country'>('recent')
  const [compareIds, setCompareIds] = useState<Set<number>>(new Set())
  const [showCompare, setShowCompare] = useState(false)

  const sorted = useMemo(() => {
    const list = [...favs]
    if (sort === 'az')      list.sort((a, b) => a.name.localeCompare(b.name))
    if (sort === 'country') list.sort((a, b) => a.country.localeCompare(b.country))
    return list
  }, [favs, sort])

  const byCountry = useMemo(() => {
    const map = new Map<string, { country: string; slug: string; items: FavouriteUniversity[] }>()
    for (const f of sorted) {
      if (!map.has(f.country_slug)) map.set(f.country_slug, { country: f.country, slug: f.country_slug, items: [] })
      map.get(f.country_slug)!.items.push(f)
    }
    return Array.from(map.values())
  }, [sorted])

  const compareList = favs.filter(f => compareIds.has(f.fav_id))

  const updateStatus = async (favId: number, status: string) => {
    setFavs(prev => prev.map(f => f.fav_id === favId ? { ...f, status } : f))
    const supabase = createClient()
    const { error } = await supabase.from('favorites').update({ status }).eq('id', favId)
    if (error) toast.error('Could not update status')
  }

  const updateNote = (favId: number, note: string) => {
    setFavs(prev => prev.map(f => f.fav_id === favId ? { ...f, notes: note || null } : f))
  }

  const removeSelected = async () => {
    if (!selected.size) return
    const ids = Array.from(selected)
    setFavs(prev => prev.filter(f => !ids.includes(f.fav_id)))
    setSelected(new Set())
    const supabase = createClient()
    for (const id of ids) {
      await supabase.from('favorites').delete().eq('id', id)
    }
    toast.success(`Removed ${ids.length} ${ids.length === 1 ? 'university' : 'universities'}`)
  }

  const toggleSelect = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleCompare = (id: number) => {
    setCompareIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id); return next }
      if (next.size >= 3) { toast.error('You can compare up to 3 universities'); return prev }
      next.add(id)
      return next
    })
  }

  if (favs.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: '#f0f2f5' }}>
          <svg className="w-6 h-6" style={{ color: 'rgba(24,24,49,0.2)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </div>
        <p className="text-sm mb-1" style={{ color: 'rgba(24,24,49,0.5)', fontWeight: 300 }}>No saved universities yet.</p>
        <p className="text-xs mb-6" style={{ color: 'rgba(24,24,49,0.35)', fontWeight: 300 }}>Heart a university while browsing to save it here.</p>
        <Link
          href="/universities"
          className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs transition hover:opacity-90"
          style={{ background: '#51e74c', color: '#181831', fontWeight: 400 }}
        >
          Explore universities
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>
    )
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Sort */}
        <div className="flex gap-1">
          {([['recent', 'Recent'], ['az', 'A–Z'], ['country', 'Country']] as const).map(([v, label]) => (
            <button
              key={v}
              onClick={() => setSort(v)}
              className="text-xs px-3 py-1.5 rounded-full transition-all"
              style={{
                background: sort === v ? '#181831' : '#f0f2f5',
                color: sort === v ? '#fff' : 'rgba(24,24,49,0.55)',
                fontWeight: sort === v ? 400 : 300,
                border: 'none', cursor: 'pointer',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Compare */}
        {compareIds.size >= 2 && (
          <button
            onClick={() => setShowCompare(true)}
            className="text-xs px-4 py-1.5 rounded-full transition hover:opacity-90"
            style={{ background: '#0c4d86', color: '#fff', fontWeight: 300, border: 'none', cursor: 'pointer' }}
          >
            Compare {compareIds.size}
          </button>
        )}

        {/* Bulk remove */}
        {selected.size > 0 && (
          <button
            onClick={removeSelected}
            className="text-xs px-4 py-1.5 rounded-full transition hover:opacity-90"
            style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontWeight: 300, border: 'none', cursor: 'pointer' }}
          >
            Remove {selected.size}
          </button>
        )}
      </div>

      {/* Country groups */}
      <div className="space-y-8">
        {byCountry.map(group => (
          <div key={group.slug}>
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: 'rgba(24,24,49,0.35)', fontWeight: 400 }}>
              {group.country}
            </p>
            <div className="space-y-3">
              {group.items.map(f => {
                const meta = statusMeta(f.status)
                const isSelected = selected.has(f.fav_id)
                const isComparing = compareIds.has(f.fav_id)

                return (
                  <div
                    key={f.fav_id}
                    className="bg-white rounded-2xl p-5"
                    style={{
                      border: `1px solid ${isSelected ? '#ef4444' : isComparing ? '#0c4d86' : '#eef0f3'}`,
                      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                      transition: 'border-color 0.15s',
                    }}
                  >
                    <div className="flex items-start gap-3">
                      {/* Select checkbox */}
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(f.fav_id)}
                        style={{ marginTop: 3, flexShrink: 0, accentColor: '#ef4444', cursor: 'pointer' }}
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
                          <Link href={`/universities/${f.slug}`} className="text-base text-navy hover:underline" style={{ fontWeight: 300 }}>
                            {f.name}
                          </Link>

                          {/* Status dropdown */}
                          <select
                            value={f.status}
                            onChange={e => updateStatus(f.fav_id, e.target.value)}
                            className="text-xs rounded-full px-3 py-1 outline-none flex-shrink-0"
                            style={{
                              background: meta.bg,
                              color: meta.color,
                              fontWeight: 300,
                              fontFamily: 'inherit',
                              border: 'none',
                              cursor: 'pointer',
                              appearance: 'none',
                              WebkitAppearance: 'none',
                            }}
                          >
                            {STATUSES.map(s => (
                              <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                          </select>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          {f.city && <span className="text-xs" style={{ color: 'rgba(24,24,49,0.4)', fontWeight: 300 }}>{f.city}</span>}
                          {f.city && f.type && <span style={{ color: '#e4ebf3', fontSize: 10 }}>·</span>}
                          {f.type && (
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{
                              background: f.type === 'Public' ? 'rgba(12,77,134,0.08)' : 'rgba(81,231,76,0.1)',
                              color: f.type === 'Public' ? '#0c4d86' : '#181831', fontWeight: 300,
                            }}>{f.type}</span>
                          )}
                          {f.tuition_range && (
                            <>
                              <span style={{ color: '#e4ebf3', fontSize: 10 }}>·</span>
                              <span className="text-xs" style={{ color: 'rgba(24,24,49,0.4)', fontWeight: 300 }}>{f.tuition_range}</span>
                            </>
                          )}
                        </div>

                        {/* Tags */}
                        {f.tags && f.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {f.tags.filter(t => !['english','bachelor','master','doctorate'].includes(t)).slice(0, 4).map(tag => (
                              <span key={tag} className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#f0f2f5', color: 'rgba(24,24,49,0.5)', fontWeight: 300 }}>{tag}</span>
                            ))}
                          </div>
                        )}

                        {/* Notes */}
                        <NoteEditor favId={f.fav_id} initialNote={f.notes} onSave={note => updateNote(f.fav_id, note)} />
                      </div>

                      {/* Compare toggle */}
                      <button
                        onClick={() => toggleCompare(f.fav_id)}
                        className="text-xs px-3 py-1.5 rounded-full flex-shrink-0 transition-all"
                        style={{
                          background: isComparing ? 'rgba(12,77,134,0.1)' : '#f0f2f5',
                          color: isComparing ? '#0c4d86' : 'rgba(24,24,49,0.4)',
                          fontWeight: 300, border: 'none', cursor: 'pointer',
                        }}
                        title="Add to comparison"
                      >
                        {isComparing ? 'Comparing' : 'Compare'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Explore more */}
      <div className="mt-10 text-center">
        <Link
          href="/universities"
          className="inline-flex items-center gap-1.5 text-sm transition-opacity hover:opacity-70"
          style={{ color: '#0c4d86', fontWeight: 300 }}
        >
          Explore more universities
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>

      {/* Compare modal */}
      {showCompare && compareList.length >= 2 && (
        <CompareModal unis={compareList} onClose={() => setShowCompare(false)} />
      )}
    </>
  )
}

// ─── Packages tab ──────────────────────────────────────────────────────────────

function PackagesTab({ initialWishlist }: { initialWishlist: WishlistItem[] }) {
  const [items, setItems] = useState(initialWishlist)
  const [selected, setSelected] = useState<Set<number>>(new Set())

  const removeSelected = async () => {
    if (!selected.size) return
    const ids = Array.from(selected)
    setItems(prev => prev.filter(i => !ids.includes(i.id)))
    setSelected(new Set())
    const supabase = createClient()
    for (const id of ids) {
      await supabase.from('wishlist').delete().eq('id', id)
    }
    toast.success(`Removed ${ids.length} ${ids.length === 1 ? 'item' : 'items'}`)
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: '#f0f2f5' }}>
          <svg className="w-6 h-6" style={{ color: 'rgba(24,24,49,0.2)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c-.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
          </svg>
        </div>
        <p className="text-sm mb-1" style={{ color: 'rgba(24,24,49,0.5)', fontWeight: 300 }}>No saved guides yet.</p>
        <p className="text-xs mb-6" style={{ color: 'rgba(24,24,49,0.35)', fontWeight: 300 }}>Heart a guide on the services page to save it for later.</p>
        <Link
          href="/services"
          className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs transition hover:opacity-90"
          style={{ background: '#51e74c', color: '#181831', fontWeight: 400 }}
        >
          Explore guides
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>
    )
  }

  return (
    <>
      {selected.size > 0 && (
        <div className="flex justify-end mb-4">
          <button
            onClick={removeSelected}
            className="text-xs px-4 py-1.5 rounded-full transition hover:opacity-90"
            style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontWeight: 300, border: 'none', cursor: 'pointer' }}
          >
            Remove {selected.size}
          </button>
        </div>
      )}

      <div className="space-y-3">
        {items.map(item => (
          <div
            key={item.id}
            className="bg-white rounded-2xl p-5 flex items-center gap-4"
            style={{
              border: `1px solid ${selected.has(item.id) ? '#ef4444' : '#eef0f3'}`,
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              transition: 'border-color 0.15s',
            }}
          >
            <input
              type="checkbox"
              checked={selected.has(item.id)}
              onChange={() => {
                setSelected(prev => {
                  const next = new Set(prev)
                  next.has(item.id) ? next.delete(item.id) : next.add(item.id)
                  return next
                })
              }}
              style={{ flexShrink: 0, accentColor: '#ef4444', cursor: 'pointer' }}
            />

            <div className="flex-1 min-w-0">
              <p className="text-sm text-navy" style={{ fontWeight: 300 }}>
                {item.package_type === 'scholarship'
                  ? (item.item_name ?? 'Scholarship Guide')
                  : (PACKAGE_LABELS[item.package_type] ?? item.package_type)}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(24,24,49,0.4)', fontWeight: 300 }}>
                {item.country}
                {item.package_type !== 'scholarship' && ` · ${PACKAGE_LABELS[item.package_type]}`}
              </p>
            </div>

            <p className="text-base flex-shrink-0" style={{ color: '#181831', fontWeight: 200, letterSpacing: '-0.02em' }}>
              {PACKAGE_PRICES[item.package_type] ?? '—'}
            </p>

            <Link
              href={item.package_type === 'scholarship'
                ? `/services/scholarship/${item.country_slug}`
                : `/services/${item.country_slug}/${item.package_type}`}
              className="text-xs px-4 py-2 rounded-xl flex-shrink-0 transition hover:opacity-90"
              style={{ background: '#51e74c', color: '#181831', fontWeight: 400 }}
            >
              Get it
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/services"
          className="inline-flex items-center gap-1.5 text-sm transition-opacity hover:opacity-70"
          style={{ color: '#0c4d86', fontWeight: 300 }}
        >
          Explore all guides
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>
    </>
  )
}

// ─── Main ──────────────────────────────────────────────────────────────────────

const TABS = ['Universities', 'Guides'] as const
type Tab = typeof TABS[number]

export default function ProfilePageClient({ userId, name, email, initials, userType, favourites, wishlist }: Props) {
  const [tab, setTab] = useState<Tab>('Universities')

  return (
    <main className="min-h-screen" style={{ background: '#f8f9fb' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">

        {/* Header */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 mb-6 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg flex-shrink-0" style={{ background: '#181831', fontWeight: 300 }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl text-navy" style={{ fontWeight: 300 }}>{name || 'Welcome'}</h1>
            <p className="text-sm mt-0.5 truncate" style={{ color: 'rgba(24,24,49,0.4)', fontWeight: 300 }}>{email}</p>
          </div>
          {userType && (
            <span className="hidden sm:block text-xs px-3 py-1 rounded-full flex-shrink-0" style={{
              border: `1px solid ${userType === 'student' ? 'rgba(12,77,134,0.3)' : 'rgba(81,231,76,0.4)'}`,
              color: userType === 'student' ? '#0c4d86' : '#15803d',
              fontWeight: 300,
            }}>
              {userType === 'student' ? 'Student' : 'Parent'}
            </span>
          )}
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* Left — Checklist */}
          <div className="lg:col-span-1">
            <Checklist userId={userId} />
          </div>

          {/* Right — Favourites tabs */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="flex border-b" style={{ borderColor: '#eef0f3' }}>
                {TABS.map(t => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className="px-6 py-4 text-sm transition-all relative flex-shrink-0"
                    style={{
                      color: tab === t ? '#181831' : 'rgba(24,24,49,0.4)',
                      fontWeight: tab === t ? 400 : 300,
                      background: 'none', border: 'none', cursor: 'pointer',
                      borderBottom: tab === t ? '2px solid #181831' : '2px solid transparent',
                      marginBottom: -1,
                    }}
                  >
                    {t}
                    {t === 'Universities' && favourites.length > 0 && (
                      <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full" style={{ background: '#f0f2f5', color: 'rgba(24,24,49,0.5)', fontWeight: 300 }}>
                        {favourites.length}
                      </span>
                    )}
                    {t === 'Guides' && wishlist.length > 0 && (
                      <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full" style={{ background: '#f0f2f5', color: 'rgba(24,24,49,0.5)', fontWeight: 300 }}>
                        {wishlist.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {tab === 'Universities' && <UniversitiesTab initialFavourites={favourites} userId={userId} />}
                {tab === 'Guides'       && <PackagesTab initialWishlist={wishlist} />}
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}
