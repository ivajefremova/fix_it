'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

const REASONS = [
  'Misleading information',
  'Spam',
  'Inappropriate content',
  'Other',
]

export default function ReportButton({ postId }: { postId: string }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit() {
    if (!reason) { toast.error('Select a reason'); return }
    setSubmitting(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('reports').insert({
      post_id: postId,
      reporter_id: user?.id ?? null,
      reason,
      reviewed: false,
    })
    setSubmitting(false)
    if (error) { toast.error('Could not send report'); return }
    toast.success("Reported — we'll review this.")
    setOpen(false)
    setReason('')
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: 'rgba(24,24,49,0.28)', fontSize: 11, fontWeight: 300, fontFamily: 'inherit', padding: 0 }}
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18M3 7.5h12a1.5 1.5 0 011.5 1.5v6a1.5 1.5 0 01-1.5 1.5H3" />
        </svg>
        Report
      </button>

      {open && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 950, background: 'rgba(24,24,49,0.4)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div style={{ background: 'white', borderRadius: 20, padding: '2rem', width: '100%', maxWidth: 360, boxShadow: '0 12px 48px rgba(0,0,0,0.15)' }}>
            <h3 style={{ color: '#181831', fontWeight: 300, fontSize: 15, marginBottom: 6 }}>Report this post</h3>
            <p style={{ fontSize: 12, color: 'rgba(24,24,49,0.45)', fontWeight: 300, lineHeight: 1.6, marginBottom: 20 }}>
              We'll review it and take action if needed.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 20 }}>
              {REASONS.map(r => (
                <label
                  key={r}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, cursor: 'pointer', background: reason === r ? 'rgba(12,77,134,0.05)' : 'transparent' }}
                >
                  <input
                    type="radio"
                    name="report-reason"
                    value={r}
                    checked={reason === r}
                    onChange={() => setReason(r)}
                    style={{ accentColor: '#0c4d86' }}
                  />
                  <span style={{ fontSize: 13, color: '#181831', fontWeight: 300 }}>{r}</span>
                </label>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => { setOpen(false); setReason('') }}
                style={{ flex: 1, padding: '10px', borderRadius: 10, background: '#f8f9fb', color: 'rgba(24,24,49,0.55)', fontSize: 13, fontWeight: 300, border: '1px solid #eef0f3', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={submitting || !reason}
                style={{ flex: 1, padding: '10px', borderRadius: 10, background: '#181831', color: 'white', fontSize: 13, fontWeight: 300, border: 'none', cursor: 'pointer', fontFamily: 'inherit', opacity: !reason || submitting ? 0.5 : 1 }}
              >
                {submitting ? 'Sending…' : 'Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
