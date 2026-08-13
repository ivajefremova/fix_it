/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/preserve-manual-memoization */
'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export type DeadlineItem = {
  id: string
  label: string
  date: string
  year: number
  notes: string | null
  link: string | null
  university_name: string
  country: string
  country_slug: string
}

export type CustomDeadline = {
  id: string
  label: string
  date: string
  notes: string
  color: string
}

type CustomFull = CustomDeadline & {
  year: number
  link: null
  university_name: string
  country: string
  country_slug: string
  is_custom: true
}

type AnyDeadline = DeadlineItem | CustomFull

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAYS = ['Mo','Tu','We','Th','Fr','Sa','Su']

const COLOR_OPTIONS = [
  '#51e74c','#0c4d86','#ef4444','#f59e0b',
  '#8b5cf6','#ec4899','#06b6d4','#f97316','#10b981',
]
const DEFAULT_COLOR = '#51e74c'

function fmtShort(dateStr: string) {
  const [, m, d] = dateStr.split('-')
  return `${parseInt(d)} ${MONTHS_SHORT[parseInt(m) - 1]}`
}
function fmtFull(dateStr: string) {
  const [y, m, d] = dateStr.split('-')
  return `${parseInt(d)} ${MONTHS[parseInt(m) - 1]} ${y}`
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const EditIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)

const TrashIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
)

// ─── Deadline card ────────────────────────────────────────────────────────────

function DeadlineCard({ d, color }: { d: AnyDeadline; color: string }) {
  const parts = fmtShort(d.date).split(' ')
  const isCustom = 'is_custom' in d && d.is_custom
  const textOnColor = color === DEFAULT_COLOR ? '#181831' : '#fff'
  const subOnColor  = color === DEFAULT_COLOR ? 'rgba(24,24,49,0.5)' : 'rgba(255,255,255,0.7)'

  return (
    <div style={{ background: '#f8f9fb', border: '1px solid #eef0f3', borderRadius: 12, padding: '10px 12px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <div style={{ flexShrink: 0, borderRadius: 10, width: 38, height: 38, background: color, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: textOnColor, lineHeight: 1 }}>{parts[0]}</span>
        <span style={{ fontSize: 9, fontWeight: 400, color: subOnColor, lineHeight: 1.4 }}>{parts[1]}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
          <p style={{ fontSize: 12, fontWeight: 400, color: '#181831', lineHeight: 1.4, margin: 0 }}>{d.label}</p>
          {isCustom && (
            <span style={{ background: 'rgba(24,24,49,0.06)', color: 'rgba(24,24,49,0.4)', fontWeight: 300, fontSize: 9, borderRadius: 20, padding: '2px 6px', flexShrink: 0 }}>
              personal
            </span>
          )}
        </div>
        <p style={{ fontSize: 11, color: 'rgba(24,24,49,0.4)', fontWeight: 300, margin: '2px 0 0' }}>{d.university_name}</p>
        {d.notes && (
          <p style={{ fontSize: 11, color: 'rgba(24,24,49,0.4)', fontWeight: 300, margin: '4px 0 0', lineHeight: 1.5 }}>{d.notes}</p>
        )}
        {d.link && (
          <a href={d.link} target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, color: '#0c4d86', fontWeight: 300, marginTop: 4, textDecoration: 'none', opacity: 1, transition: 'opacity 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
            Portal
            <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </a>
        )}
      </div>
    </div>
  )
}

// ─── Shared form fields ───────────────────────────────────────────────────────

function DeadlineFormFields({ label, date, notes, color, setLabel, setDate, setNotes, setColor }: {
  label: string; date: string; notes: string; color: string
  setLabel: (v: string) => void; setDate: (v: string) => void
  setNotes: (v: string) => void; setColor: (v: string) => void
}) {
  const inputStyle = { background: '#fff', border: '1px solid #e4ebf3', borderRadius: 8, padding: '7px 10px', fontFamily: 'inherit', fontWeight: 300, color: '#181831', fontSize: 12, width: '100%', boxSizing: 'border-box' as const, outline: 'none' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <input type="text" placeholder="Label (e.g. Apply to Bocconi)" value={label}
        onChange={e => setLabel(e.target.value)} style={inputStyle} />
      <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} />
      <input type="text" placeholder="Note (optional)" value={notes}
        onChange={e => setNotes(e.target.value)} style={inputStyle} />
      <div>
        <p style={{ fontSize: 11, color: 'rgba(24,24,49,0.4)', fontWeight: 300, margin: '0 0 6px' }}>Colour</p>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {COLOR_OPTIONS.map(c => (
            <button key={c} onClick={() => setColor(c)} style={{
              width: 20, height: 20, borderRadius: 6, border: 'none', cursor: 'pointer', background: c, flexShrink: 0,
              outline: color === c ? '2px solid #181831' : 'none', outlineOffset: 2,
              boxShadow: color === c ? `0 2px 6px ${c}88` : 'none', transition: 'outline 0.1s',
            }} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Add deadline form ────────────────────────────────────────────────────────

function AddDeadlineForm({ onAdd, onClose, initialDate = '' }: {
  onAdd: (d: CustomDeadline) => void
  onClose: () => void
  initialDate?: string
}) {
  const [label, setLabel] = useState('')
  const [date, setDate]   = useState(initialDate)
  const [notes, setNotes] = useState('')
  const [color, setColor] = useState(DEFAULT_COLOR)

  const submit = () => {
    if (!label.trim() || !date) return
    onAdd({ id: String(Date.now()), label: label.trim(), date, notes: notes.trim(), color })
    onClose()
  }

  return (
    <div style={{ background: '#f8f9fb', border: '1px solid #eef0f3', borderRadius: 14, padding: 16, marginBottom: 16 }}>
      <p style={{ fontSize: 10, fontWeight: 400, color: 'rgba(24,24,49,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 12px' }}>New deadline</p>
      <DeadlineFormFields label={label} date={date} notes={notes} color={color}
        setLabel={setLabel} setDate={setDate} setNotes={setNotes} setColor={setColor} />
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button onClick={submit} disabled={!label.trim() || !date}
          style={{ background: '#181831', color: '#fff', border: 'none', borderRadius: 9, padding: '6px 16px', fontSize: 12, fontWeight: 300, cursor: 'pointer', opacity: !label.trim() || !date ? 0.4 : 1, fontFamily: 'inherit', transition: 'opacity 0.15s' }}>
          Add
        </button>
        <button onClick={onClose}
          style={{ background: '#ebebef', color: 'rgba(24,24,49,0.55)', border: 'none', borderRadius: 9, padding: '6px 16px', fontSize: 12, fontWeight: 300, cursor: 'pointer', fontFamily: 'inherit' }}>
          Cancel
        </button>
      </div>
    </div>
  )
}

// ─── Edit deadline form ───────────────────────────────────────────────────────

function EditDeadlineForm({ deadline, onSave, onClose }: {
  deadline: CustomDeadline
  onSave: (updates: Omit<CustomDeadline, 'id'>) => void
  onClose: () => void
}) {
  const [label, setLabel] = useState(deadline.label)
  const [date, setDate]   = useState(deadline.date)
  const [notes, setNotes] = useState(deadline.notes)
  const [color, setColor] = useState(deadline.color)

  const submit = () => {
    if (!label.trim() || !date) return
    onSave({ label: label.trim(), date, notes: notes.trim(), color })
  }

  return (
    <div style={{ background: '#eef4fb', border: '1px solid #c9dff2', borderRadius: 14, padding: 16 }}>
      <p style={{ fontSize: 10, fontWeight: 400, color: '#0c4d86', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 12px', opacity: 0.7 }}>Edit deadline</p>
      <DeadlineFormFields label={label} date={date} notes={notes} color={color}
        setLabel={setLabel} setDate={setDate} setNotes={setNotes} setColor={setColor} />
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button onClick={submit} disabled={!label.trim() || !date}
          style={{ background: '#0c4d86', color: '#fff', border: 'none', borderRadius: 9, padding: '6px 16px', fontSize: 12, fontWeight: 300, cursor: 'pointer', opacity: !label.trim() || !date ? 0.4 : 1, fontFamily: 'inherit', transition: 'opacity 0.15s' }}>
          Save
        </button>
        <button onClick={onClose}
          style={{ background: '#ebebef', color: 'rgba(24,24,49,0.55)', border: 'none', borderRadius: 9, padding: '6px 16px', fontSize: 12, fontWeight: 300, cursor: 'pointer', fontFamily: 'inherit' }}>
          Cancel
        </button>
      </div>
    </div>
  )
}

// ─── Colour picker popup ──────────────────────────────────────────────────────

function ColorPickerPopup({
  dateStr, pos, items, colorPrefs, dateColorOverrides,
  onApplyToCountry, onApplyToDate,
  onEditPersonal, onRemovePersonal,
  onClose,
}: {
  dateStr: string
  pos: { x: number; y: number; containerWidth: number }
  items: AnyDeadline[]
  colorPrefs: Record<string, string>
  dateColorOverrides: Record<string, string>
  onApplyToCountry: (slug: string, color: string) => void
  onApplyToDate: (dateStr: string, color: string) => void
  onEditPersonal: (id: string) => void
  onRemovePersonal: (id: string) => void
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  const dbItems = items.filter(d => !('is_custom' in d && d.is_custom)) as DeadlineItem[]
  const personalItems = items.filter(d => 'is_custom' in d && d.is_custom) as CustomFull[]
  const uniqueSlugs = [...new Set(dbItems.map(d => d.country_slug))].filter(Boolean)
  const singleCountry = uniqueSlugs.length === 1 ? dbItems.find(d => d.country_slug === uniqueSlugs[0]) : null

  const currentColor = dateColorOverrides[dateStr]
    ?? (uniqueSlugs.length === 1 ? colorPrefs[uniqueSlugs[0]] : null)
    ?? DEFAULT_COLOR

  const [picked, setPicked] = useState(currentColor)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    const id = setTimeout(() => document.addEventListener('mousedown', handler), 0)
    return () => { clearTimeout(id); document.removeEventListener('mousedown', handler) }
  }, [onClose])

  const popupW = 224
  const left = Math.max(4, Math.min(pos.x - popupW / 2, pos.containerWidth - popupW - 4))
  const hasColorSection = dbItems.length > 0

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute', top: pos.y, left, width: popupW, zIndex: 400,
        background: '#fff', borderRadius: 16, padding: '14px 14px 12px',
        boxShadow: '0 8px 32px rgba(24,24,49,0.16), 0 2px 8px rgba(24,24,49,0.06)',
        border: '1px solid #eef0f3',
      }}
    >
      {/* Colour section — only for purchase deadlines */}
      {hasColorSection && (
        <>
          <p style={{ fontSize: 10, fontWeight: 400, color: 'rgba(24,24,49,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 10px' }}>
            Pick a colour
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
            {COLOR_OPTIONS.map(c => (
              <div key={c} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <button onClick={() => setPicked(c)} style={{
                  width: 22, height: 22, borderRadius: 7, border: 'none', cursor: 'pointer', background: c,
                  outline: picked === c ? '2.5px solid #181831' : 'none', outlineOffset: 2,
                  boxShadow: picked === c ? `0 2px 8px ${c}88` : 'none', transition: 'outline 0.1s',
                }} />
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: c === currentColor ? 'rgba(24,24,49,0.35)' : 'transparent' }} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: personalItems.length > 0 ? 0 : 2 }}>
            {singleCountry && (
              <button
                onClick={() => { onApplyToCountry(singleCountry.country_slug, picked); toast.success('Colour applied to all guide deadlines'); onClose() }}
                style={{ background: picked, color: picked === DEFAULT_COLOR ? '#181831' : '#fff', border: 'none', cursor: 'pointer', borderRadius: 9, padding: '7px 10px', fontFamily: 'inherit', fontWeight: 400, fontSize: 12, textAlign: 'left', transition: 'opacity 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.82')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                All deadlines from this purchase
              </button>
            )}
            <button
              onClick={() => { onApplyToDate(dateStr, picked); toast.success('Colour applied to this date'); onClose() }}
              style={{ background: '#f0f2f5', color: 'rgba(24,24,49,0.6)', border: 'none', cursor: 'pointer', borderRadius: 9, padding: '7px 10px', fontFamily: 'inherit', fontWeight: 300, fontSize: 12, textAlign: 'left', transition: 'opacity 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              Add colour
            </button>
          </div>
        </>
      )}

      {/* Personal deadlines section — edit / remove */}
      {personalItems.length > 0 && (
        <div style={{ borderTop: hasColorSection ? '1px solid #f0f2f5' : 'none', marginTop: hasColorSection ? 10 : 0, paddingTop: hasColorSection ? 10 : 0 }}>
          <p style={{ fontSize: 10, fontWeight: 400, color: 'rgba(24,24,49,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 8px' }}>
            Personal
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {personalItems.map(p => (
              <div key={p.id} style={{ background: '#f8f9fb', borderRadius: 9, padding: '7px 9px' }}>
                <p style={{ fontSize: 12, fontWeight: 300, color: '#181831', margin: '0 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.label}</p>
                <div style={{ display: 'flex', gap: 5 }}>
                  <button
                    onClick={() => { onEditPersonal(p.id) }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(12,77,134,0.1)', border: 'none', cursor: 'pointer', borderRadius: 6, padding: '3px 8px', color: '#0c4d86', fontSize: 11, fontFamily: 'inherit', fontWeight: 300 }}>
                    <EditIcon /> edit
                  </button>
                  <button
                    onClick={() => { onRemovePersonal(p.id); onClose() }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(239,68,68,0.1)', border: 'none', cursor: 'pointer', borderRadius: 6, padding: '3px 8px', color: '#ef4444', fontSize: 11, fontFamily: 'inherit', fontWeight: 300 }}>
                    <TrashIcon /> remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Deadline card row (right panel) ─────────────────────────────────────────

function DeadlineCardRow({ d, color, editingId, onEdit, onRemove, onSave, onCancelEdit }: {
  d: AnyDeadline
  color: string
  editingId: string | null
  onEdit: (id: string) => void
  onRemove: (id: string) => void
  onSave: (id: string, updates: Omit<CustomDeadline, 'id'>) => void
  onCancelEdit: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const isCustom = 'is_custom' in d && d.is_custom
  const isEditing = editingId === d.id

  if (isCustom && isEditing) {
    const cd = d as CustomFull
    return (
      <EditDeadlineForm
        deadline={{ id: cd.id, label: cd.label, date: cd.date, notes: cd.notes || '', color: cd.color }}
        onSave={(updates) => onSave(cd.id, updates)}
        onClose={onCancelEdit}
      />
    )
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <DeadlineCard d={d} color={color} />
      {isCustom && (
        <div style={{
          display: 'flex', gap: 6, paddingLeft: 2, marginTop: 5,
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.15s',
          pointerEvents: hovered ? 'auto' : 'none',
        }}>
          <button
            onClick={() => onEdit(d.id)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: 'rgba(12,77,134,0.1)', border: 'none', cursor: 'pointer', borderRadius: 6, padding: '3px 8px', color: '#0c4d86', fontSize: 10, fontFamily: 'inherit', fontWeight: 300 }}>
            <EditIcon /> edit
          </button>
          <button
            onClick={() => onRemove(d.id)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: 'rgba(239,68,68,0.1)', border: 'none', cursor: 'pointer', borderRadius: 6, padding: '3px 8px', color: '#ef4444', fontSize: 10, fontFamily: 'inherit', fontWeight: 300 }}>
            <TrashIcon /> remove
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function DeadlineCalendar({
  deadlines,
  userId,
  initialPersonalDeadlines,
}: {
  deadlines: DeadlineItem[]
  userId: string
  initialPersonalDeadlines: CustomDeadline[]
}) {
  const today = new Date()
  const todayStr = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-')

  const [year,  setYear]  = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  const [selected,        setSelected]        = useState<string | null>(null)
  const [hoveredDate,     setHoveredDate]     = useState<string | null>(null)
  const [showAddForm,     setShowAddForm]     = useState(false)
  const [addFormDate,     setAddFormDate]     = useState('')
  const [editingId,       setEditingId]       = useState<string | null>(null)
  const [colorPickerDate, setColorPickerDate] = useState<string | null>(null)
  const [colorPickerPos,  setColorPickerPos]  = useState({ x: 0, y: 0, containerWidth: 800 })
  const gridRef = useRef<HTMLDivElement>(null)

  const [customDeadlines,    setCustomDeadlines]    = useState<CustomDeadline[]>(initialPersonalDeadlines)
  const [colorPrefs,         setColorPrefs]         = useState<Record<string, string>>({})
  const [dateColorOverrides, setDateColorOverrides] = useState<Record<string, string>>({})

  useEffect(() => {
    try {
      const cols = localStorage.getItem(`fix-it-dl-colors-${userId}`)
      if (cols) setColorPrefs(JSON.parse(cols))
      const dco = localStorage.getItem(`fix-it-dl-date-colors-${userId}`)
      if (dco) setDateColorOverrides(JSON.parse(dco))
    } catch { /* ignore */ }
  }, [userId])

  // ── CRUD ──────────────────────────────────────────────────────────────────

  const addCustom = async (d: CustomDeadline) => {
    setCustomDeadlines(prev => [...prev, d])
    const supabase = createClient()
    const { data, error } = await supabase
      .from('personal_deadlines')
      .insert({ user_id: userId, label: d.label, date: d.date, notes: d.notes || null, color: d.color })
      .select('id').single()
    if (error) {
      setCustomDeadlines(prev => prev.filter(x => x.id !== d.id))
      toast.error('Could not save deadline')
      return
    }
    setCustomDeadlines(prev => prev.map(x => x.id === d.id ? { ...x, id: String(data.id) } : x))
    toast.success('Deadline saved!')
  }

  const removeCustom = async (id: string) => {
    const snapshot = customDeadlines
    setCustomDeadlines(prev => prev.filter(d => d.id !== id))
    const supabase = createClient()
    const { error } = await supabase.from('personal_deadlines').delete().eq('id', id)
    if (error) {
      setCustomDeadlines(snapshot)
      toast.error('Could not remove deadline')
      return
    }
    toast.success('Deadline removed')
  }

  const editCustom = async (id: string, updates: Omit<CustomDeadline, 'id'>) => {
    const original = customDeadlines.find(d => d.id === id)
    if (!original) return
    setCustomDeadlines(prev => prev.map(d => d.id === id ? { id, ...updates } : d))
    setEditingId(null)
    const supabase = createClient()
    const { error } = await supabase
      .from('personal_deadlines')
      .update({ label: updates.label, date: updates.date, notes: updates.notes || null, color: updates.color })
      .eq('id', id)
    if (error) {
      setCustomDeadlines(prev => prev.map(d => d.id === id ? original : d))
      toast.error('Could not save changes')
      return
    }
    toast.success('Deadline updated!')
  }

  // ── Colour helpers ────────────────────────────────────────────────────────

  const applyToCountry = (slug: string, color: string) => {
    setColorPrefs(prev => {
      const next = { ...prev, [slug]: color }
      localStorage.setItem(`fix-it-dl-colors-${userId}`, JSON.stringify(next))
      return next
    })
    setDateColorOverrides(prev => {
      const purchaseDates = new Set(
        allDeadlines
          .filter(d => !('is_custom' in d && d.is_custom) && (d as DeadlineItem).country_slug === slug)
          .map(d => d.date.slice(0, 10))
      )
      const next = { ...prev }
      let changed = false
      for (const d of Object.keys(next)) {
        if (purchaseDates.has(d)) { delete next[d]; changed = true }
      }
      if (changed) localStorage.setItem(`fix-it-dl-date-colors-${userId}`, JSON.stringify(next))
      return changed ? next : prev
    })
  }

  const applyToDate = (ds: string, color: string) => {
    setDateColorOverrides(prev => {
      const next = { ...prev, [ds]: color }
      localStorage.setItem(`fix-it-dl-date-colors-${userId}`, JSON.stringify(next))
      return next
    })
  }

  // ── Derived ───────────────────────────────────────────────────────────────

  const allDeadlines: AnyDeadline[] = useMemo(() => {
    const personal: CustomFull[] = customDeadlines.map(c => ({
      ...c,
      year: parseInt(c.date.split('-')[0]),
      link: null,
      university_name: 'Personal',
      country: 'Personal',
      country_slug: 'personal',
      is_custom: true,
    }))
    return [...deadlines, ...personal]
  }, [deadlines, customDeadlines])

  const byDate = useMemo(() => {
    const map = new Map<string, AnyDeadline[]>()
    for (const d of allDeadlines) {
      const key = d.date.slice(0, 10)
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(d)
    }
    return map
  }, [allDeadlines])

  const { daysInMonth, startOffset } = useMemo(() => {
    const first = new Date(year, month, 1).getDay()
    const offset = first === 0 ? 6 : first - 1
    return { daysInMonth: new Date(year, month + 1, 0).getDate(), startOffset: offset }
  }, [year, month])

  const upcoming = useMemo(() => {
    const cutoffDate = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000)
    const cutoffStr = [cutoffDate.getFullYear(), String(cutoffDate.getMonth() + 1).padStart(2, '0'), String(cutoffDate.getDate()).padStart(2, '0')].join('-')
    return allDeadlines
      .filter(d => d.date.slice(0, 10) >= todayStr && d.date.slice(0, 10) <= cutoffStr)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 8)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDeadlines])

  // ── Navigation ────────────────────────────────────────────────────────────

  // Close only the popup (keep selected for right panel)
  const closePicker = () => setColorPickerDate(null)
  // Close popup and deselect day
  const closeAll = () => { setColorPickerDate(null); setSelected(null) }

  const prevMonth = () => {
    setSelected(null); setEditingId(null); closePicker()
    if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    setSelected(null); setEditingId(null); closePicker()
    if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1)
  }

  // ── Colours ───────────────────────────────────────────────────────────────

  const resolveColor = (dateStr: string, d: AnyDeadline): string => {
    if ('is_custom' in d && d.is_custom) return (d as CustomFull).color
    if (dateColorOverrides[dateStr]) return dateColorOverrides[dateStr]
    return colorPrefs[(d as DeadlineItem).country_slug] ?? DEFAULT_COLOR
  }

  const dayCellColor = (dateStr: string): string => {
    const items = byDate.get(dateStr)
    if (!items?.length) return DEFAULT_COLOR
    if (dateColorOverrides[dateStr]) return dateColorOverrides[dateStr]
    const first = items[0]
    if ('is_custom' in first && first.is_custom) return (first as CustomFull).color
    return colorPrefs[(first as DeadlineItem).country_slug] ?? DEFAULT_COLOR
  }

  const selectedDeadlines = selected ? (byDate.get(selected) ?? []) : []

  // Open add form pre-filled with a date
  const openAddForDate = (dateStr: string) => {
    setAddFormDate(dateStr)
    setShowAddForm(true)
    setSelected(null)
    setColorPickerDate(null)
    setEditingId(null)
  }

  // When "edit" is triggered from the popup → close picker but keep selected so right panel shows
  const handleEditFromPopup = (id: string) => {
    setEditingId(id)
    setSelected(colorPickerDate!)  // stay on this day in right panel
    setColorPickerDate(null)       // close just the picker
  }

  return (
    <>
      <style>{`
        @keyframes calPop {
          from { opacity: 0; transform: scale(0.55); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes addPulse {
          0%, 100% { opacity: 0.25; transform: scale(0.85); }
          50%       { opacity: 0.65; transform: scale(1); }
        }
      `}</style>

      <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 2px 16px rgba(24,24,49,0.06)', padding: '28px 32px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <p style={{ fontSize: 10, fontWeight: 400, color: 'rgba(24,24,49,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>
            Deadline Calendar
          </p>
          <button
            onClick={() => { setShowAddForm(v => !v); setAddFormDate(''); setSelected(null); closePicker() }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: showAddForm ? '#f0f2f5' : '#181831',
              color: showAddForm ? 'rgba(24,24,49,0.55)' : '#fff',
              border: 'none', cursor: 'pointer', borderRadius: 10, padding: '6px 14px',
              fontFamily: 'inherit', fontWeight: 300, fontSize: 12, transition: 'background 0.15s',
            }}
          >
            {showAddForm ? 'Cancel' : (
              <>
                <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add deadline
              </>
            )}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'row', gap: 36, alignItems: 'flex-start', flexWrap: 'wrap' }}>

          {/* ── Calendar grid ── */}
          <div ref={gridRef} style={{ flex: '1 1 280px', minWidth: 0, position: 'relative' }}>

            {/* Month nav */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px 10px', color: 'rgba(24,24,49,0.3)', lineHeight: 0 }}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <p style={{ fontWeight: 200, letterSpacing: '-0.02em', color: '#181831', fontSize: 'clamp(17px, 2.5vw, 24px)', margin: 0 }}>
                {MONTHS[month]} <span style={{ color: 'rgba(24,24,49,0.28)' }}>{year}</span>
              </p>
              <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px 10px', color: 'rgba(24,24,49,0.3)', lineHeight: 0 }}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>

            {/* Day headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 6 }}>
              {DAYS.map(d => (
                <div key={d} style={{ textAlign: 'center', fontSize: 11, padding: '4px 0', color: 'rgba(24,24,49,0.22)', fontWeight: 400, letterSpacing: '0.05em' }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Grid */}
            <div key={`${year}-${month}`} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
              {Array.from({ length: startOffset }).map((_, i) => (
                <div key={`b-${i}`} style={{ height: 52 }} />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day      = i + 1
                const dateStr  = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                const hasDeadline = byDate.has(dateStr)
                const isToday    = dateStr === todayStr
                const isSelected = selected === dateStr
                const cellColor  = hasDeadline ? dayCellColor(dateStr) : DEFAULT_COLOR
                const count      = byDate.get(dateStr)?.length ?? 0
                const animDelay  = hasDeadline ? `${(startOffset + i) * 26}ms` : '0ms'
                const isHovered  = hoveredDate === dateStr

                return (
                  <button
                    key={day}
                    title={hasDeadline
                      ? `${count} deadline${count !== 1 ? 's' : ''} — click to view`
                      : `Click to add a deadline for ${fmtFull(dateStr)}`}
                    onMouseEnter={() => setHoveredDate(dateStr)}
                    onMouseLeave={() => setHoveredDate(null)}
                    onClick={(e) => {
                      if (hasDeadline) {
                        if (colorPickerDate === dateStr) { closePicker(); setSelected(null); return }
                        const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect()
                        const gridRect = gridRef.current!.getBoundingClientRect()
                        setColorPickerPos({
                          x: rect.left + rect.width / 2 - gridRect.left,
                          y: rect.bottom - gridRect.top + 8,
                          containerWidth: gridRect.width,
                        })
                        setColorPickerDate(dateStr)
                        setSelected(dateStr)
                        setShowAddForm(false)
                        setEditingId(null)
                      } else {
                        openAddForDate(dateStr)
                      }
                    }}
                    style={{
                      position: 'relative',
                      height: 52,
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: 11,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 3,
                      background: isSelected
                        ? '#181831'
                        : hasDeadline
                          ? cellColor
                          : isToday
                            ? 'rgba(12,77,134,0.06)'
                            : isHovered
                              ? 'rgba(81,231,76,0.08)'
                              : 'transparent',
                      transition: 'background 0.14s',
                      boxShadow: hasDeadline && !isSelected
                        ? `0 4px 12px ${cellColor}44`
                        : isSelected
                          ? '0 4px 14px rgba(24,24,49,0.18)'
                          : 'none',
                      animation: hasDeadline
                        ? `calPop 0.35s cubic-bezier(0.34,1.56,0.64,1) ${animDelay} both`
                        : 'none',
                    }}
                  >
                    <span style={{
                      fontSize: hasDeadline ? 17 : 14,
                      fontWeight: hasDeadline ? 600 : isToday ? 500 : 300,
                      color: isSelected
                        ? '#51e74c'
                        : hasDeadline
                          ? (cellColor === DEFAULT_COLOR ? '#181831' : '#fff')
                          : isToday
                            ? '#0c4d86'
                            : isHovered
                              ? 'rgba(24,24,49,0.7)'
                              : 'rgba(24,24,49,0.55)',
                      lineHeight: 1,
                      letterSpacing: '-0.02em',
                    }}>
                      {day}
                    </span>

                    {/* Count badge */}
                    {hasDeadline && !isSelected && count > 1 && (
                      <span style={{ fontSize: 9, fontWeight: 500, color: cellColor === DEFAULT_COLOR ? 'rgba(24,24,49,0.5)' : 'rgba(255,255,255,0.7)', letterSpacing: '0.03em', lineHeight: 1 }}>
                        {count}
                      </span>
                    )}

                    {/* Selected dot */}
                    {isSelected && (
                      <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#51e74c', display: 'block' }} />
                    )}

                    {/* Add hint on empty cell hover */}
                    {!hasDeadline && isHovered && (
                      <span style={{
                        position: 'absolute', bottom: 5,
                        fontSize: 13, lineHeight: 1,
                        color: 'rgba(81,231,76,0.7)',
                        animation: 'addPulse 1.4s ease-in-out infinite',
                        fontWeight: 300,
                      }}>+</span>
                    )}
                  </button>
                )
              })}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 18 }}>
              <span style={{ width: 11, height: 11, borderRadius: 4, background: DEFAULT_COLOR, display: 'inline-block', flexShrink: 0, boxShadow: '0 2px 6px rgba(81,231,76,0.4)' }} />
              <span style={{ fontSize: 11, color: 'rgba(24,24,49,0.3)', fontWeight: 300 }}>
                Click any date — highlighted days have details &amp; colour options
              </span>
            </div>

            {/* Popup — absolutely positioned inside the grid so it scrolls with the page */}
            {colorPickerDate && (
              <ColorPickerPopup
                dateStr={colorPickerDate}
                pos={colorPickerPos}
                items={byDate.get(colorPickerDate) ?? []}
                colorPrefs={colorPrefs}
                dateColorOverrides={dateColorOverrides}
                onApplyToCountry={applyToCountry}
                onApplyToDate={applyToDate}
                onEditPersonal={handleEditFromPopup}
                onRemovePersonal={(id) => {
                  removeCustom(id)
                  setColorPickerDate(null)
                  setSelected(null)
                }}
                onClose={closeAll}
              />
            )}
          </div>

          {/* ── Right panel ── */}
          <div style={{ width: 248, flexShrink: 0 }}>

            {/* Add form — key resets state when pre-filled date changes */}
            {showAddForm && (
              <AddDeadlineForm
                key={addFormDate}
                initialDate={addFormDate}
                onAdd={addCustom}
                onClose={() => { setShowAddForm(false); setAddFormDate('') }}
              />
            )}

            {/* Selected day */}
            {!showAddForm && selectedDeadlines.length > 0 && (
              <>
                <p style={{ fontSize: 10, fontWeight: 400, color: 'rgba(24,24,49,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 12px' }}>
                  {selected ? fmtFull(selected) : ''}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {selectedDeadlines.map(d => (
                    <DeadlineCardRow
                      key={d.id}
                      d={d}
                      color={resolveColor(selected!, d)}
                      editingId={editingId}
                      onEdit={setEditingId}
                      onRemove={removeCustom}
                      onSave={editCustom}
                      onCancelEdit={() => setEditingId(null)}
                    />
                  ))}
                </div>

                <button
                  onClick={() => openAddForDate(selected!)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 12, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit', fontWeight: 300, fontSize: 12, color: '#0c4d86', opacity: 1, transition: 'opacity 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.6')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Add personal deadline for this day
                </button>

                <button
                  onClick={() => { setSelected(null); closePicker() }}
                  style={{ display: 'block', marginTop: 10, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit', fontWeight: 300, fontSize: 12, color: 'rgba(24,24,49,0.35)', opacity: 1, transition: 'opacity 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.6')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  ← Upcoming
                </button>
              </>
            )}

            {/* Upcoming */}
            {!showAddForm && !selected && upcoming.length > 0 && (
              <>
                <p style={{ fontSize: 10, fontWeight: 400, color: 'rgba(24,24,49,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 12px' }}>Upcoming</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {upcoming.map(d => (
                    <DeadlineCardRow
                      key={d.id}
                      d={d}
                      color={resolveColor(d.date.slice(0, 10), d)}
                      editingId={editingId}
                      onEdit={setEditingId}
                      onRemove={removeCustom}
                      onSave={editCustom}
                      onCancelEdit={() => setEditingId(null)}
                    />
                  ))}
                </div>
              </>
            )}

            {!showAddForm && !selected && upcoming.length === 0 && allDeadlines.length > 0 && (
              <p style={{ fontSize: 12, color: 'rgba(24,24,49,0.3)', fontWeight: 300, margin: 0 }}>
                No deadlines in the next 90 days. Navigate forward to see future dates.
              </p>
            )}

            {!showAddForm && !selected && allDeadlines.length === 0 && (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <p style={{ fontSize: 12, color: 'rgba(24,24,49,0.4)', fontWeight: 300, margin: '0 0 10px' }}>
                  No deadlines yet. Add your own or purchase a guide.
                </p>
                <Link href="/services" style={{ fontSize: 12, color: '#0c4d86', fontWeight: 300, textDecoration: 'none', opacity: 1, transition: 'opacity 0.15s' }}
                  onMouseEnter={e => ((e.target as HTMLElement).style.opacity = '0.6')}
                  onMouseLeave={e => ((e.target as HTMLElement).style.opacity = '1')}>
                  Browse guides →
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>

    </>
  )
}
