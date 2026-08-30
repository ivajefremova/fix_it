'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { COMMUNITY_COUNTRIES, COMMUNITY_CATEGORIES, type CommunityPost } from '@/lib/community'

type Props = {
  type: 'question' | 'answer'
  parentId?: string
  prefillCountrySlug?: string
  prefillUniversitySlug?: string
  onClose: () => void
  onSuccess: (post: CommunityPost) => void
}

type Step = 'loading' | 'login' | 'alias' | 'form'

export default function PostForm({ type, parentId, prefillCountrySlug, prefillUniversitySlug, onClose, onSuccess }: Props) {
  const [step, setStep] = useState<Step>('loading')
  const [userId, setUserId] = useState('')
  const [alias, setAlias] = useState('')
  const [aliasInput, setAliasInput] = useState('')
  const [savingAlias, setSavingAlias] = useState(false)

  const [content, setContent] = useState('')
  const [category, setCategory] = useState('')
  const [country, setCountry] = useState(prefillCountrySlug ?? '')
  const [university, setUniversity] = useState(prefillUniversitySlug ?? '')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setStep('login'); return }
      setUserId(user.id)
      const { data: profile } = await supabase
        .from('profiles')
        .select('community_alias')
        .eq('id', user.id)
        .single()
      if (profile?.community_alias) {
        setAlias(profile.community_alias)
        setStep('form')
      } else {
        setStep('alias')
      }
    }
    init()
  }, [])

  async function saveAlias() {
    const trimmed = aliasInput.trim()
    if (trimmed.length < 2) { toast.error('Alias must be at least 2 characters'); return }
    if (trimmed.length > 24) { toast.error('Maximum 24 characters'); return }
    setSavingAlias(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({ community_alias: trimmed })
      .eq('id', userId)
    setSavingAlias(false)
    if (error) { toast.error('Could not save alias'); return }
    setAlias(trimmed)
    setStep('form')
  }

  async function submit() {
    if (!content.trim()) { toast.error('Write something first'); return }
    if (type === 'question' && !category) { toast.error('Pick a category'); return }
    setSubmitting(true)
    const supabase = createClient()
    const payload = {
      type,
      parent_id: parentId ?? null,
      user_id: userId,
      author_alias: alias,
      content: content.trim(),
      country_slug: country || null,
      university_slug: university.trim() || null,
      category: type === 'question' ? category : null,
      is_flagged: false,
    }
    const { data, error } = await supabase
      .from('posts')
      .insert(payload)
      .select()
      .single()
    setSubmitting(false)
    if (error) { toast.error('Could not post. Try again.'); return }
    toast.success(type === 'question' ? 'Question posted!' : 'Answer posted!')
    onSuccess(data as CommunityPost)
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 900, background: 'rgba(24,24,49,0.72)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{ background: 'white', borderRadius: 24, padding: '2rem', width: '100%', maxWidth: 480, position: 'relative', boxShadow: '0 12px 48px rgba(0,0,0,0.18)', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
        >
          <svg className="w-5 h-5" style={{ color: 'rgba(24,24,49,0.82)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Loading */}
        {step === 'loading' && (
          <div style={{ padding: '2rem 0', textAlign: 'center' }}>
            <div className="animate-pulse" style={{ color: 'rgba(24,24,49,0.7)', fontSize: 14, fontWeight: 400 }}>Loading…</div>
          </div>
        )}

        {/* Not logged in */}
        {step === 'login' && (
          <div style={{ padding: '1.5rem 0', textAlign: 'center' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <svg className="w-5 h-5" style={{ color: '#0c4d86' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <h2 style={{ color: '#181831', fontWeight: 400, fontSize: 16, marginBottom: 8 }}>Log in to post</h2>
            <p style={{ color: 'rgba(24,24,49,0.75)', fontWeight: 400, fontSize: 13, lineHeight: 1.6, marginBottom: 24 }}>
              You can read everything without an account. Log in to ask questions or share answers.
            </p>
            <Link
              href="/login"
              style={{ display: 'inline-block', background: '#181831', color: 'white', padding: '10px 24px', borderRadius: 12, fontSize: 13, fontWeight: 400, textDecoration: 'none' }}
            >
              Log in
            </Link>
          </div>
        )}

        {/* Alias setup */}
        {step === 'alias' && (
          <div>
            <h2 style={{ color: '#181831', fontWeight: 400, fontSize: 16, marginBottom: 8 }}>Pick your community name</h2>
            <p style={{ color: 'rgba(24,24,49,0.75)', fontWeight: 400, fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>
              This is how you appear on all your posts — anonymous but recognisable. First name, nickname, or anything you like.
            </p>
            <input
              type="text"
              value={aliasInput}
              onChange={e => setAliasInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') saveAlias() }}
              placeholder="e.g. Ana from Skopje"
              maxLength={24}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #eef0f3', background: '#f8f9fb', fontSize: 13, fontWeight: 400, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', marginBottom: 12 }}
            />
            {aliasInput.trim().length >= 2 && (
              <p style={{ fontSize: 12, color: 'rgba(24,24,49,0.7)', fontWeight: 400, marginBottom: 16 }}>
                You'll appear as: <strong style={{ fontWeight: 400 }}>{aliasInput.trim()}</strong>
              </p>
            )}
            <button
              onClick={saveAlias}
              disabled={savingAlias || aliasInput.trim().length < 2}
              style={{ width: '100%', padding: '11px', borderRadius: 12, background: '#51e74c', color: '#181831', fontSize: 13, fontWeight: 400, border: 'none', cursor: 'pointer', opacity: aliasInput.trim().length < 2 ? 0.5 : 1 }}
            >
              {savingAlias ? 'Saving…' : 'Set name and continue →'}
            </button>
          </div>
        )}

        {/* Form */}
        {step === 'form' && (
          <div>
            <h2 style={{ color: '#181831', fontWeight: 400, fontSize: 16, marginBottom: 4 }}>
              {type === 'question' ? 'Ask a question' : 'Write an answer'}
            </h2>
            <p style={{ fontSize: 12, color: 'rgba(24,24,49,0.7)', fontWeight: 400, marginBottom: 20 }}>
              Posting as <strong style={{ fontWeight: 400 }}>{alias}</strong>
            </p>

            {type === 'question' && (
              <>
                {/* Category */}
                <div style={{ marginBottom: 16 }}>
                  <p style={{ fontSize: 11, color: 'rgba(24,24,49,0.75)', fontWeight: 400, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Category *</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {COMMUNITY_CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setCategory(c => c === cat ? '' : cat)}
                        style={{
                          padding: '5px 12px',
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 400,
                          fontFamily: 'inherit',
                          border: '1px solid',
                          cursor: 'pointer',
                          background: category === cat ? 'rgba(12,77,134,0.1)' : '#f8f9fb',
                          color: category === cat ? '#0c4d86' : 'rgba(24,24,49,0.78)',
                          borderColor: category === cat ? 'rgba(12,77,134,0.25)' : '#eef0f3',
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Country */}
                <div style={{ marginBottom: 16 }}>
                  <p style={{ fontSize: 11, color: 'rgba(24,24,49,0.75)', fontWeight: 400, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Country</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {COMMUNITY_COUNTRIES.map(c => (
                      <button
                        key={c.slug}
                        onClick={() => setCountry(prev => prev === c.slug ? '' : c.slug)}
                        style={{
                          padding: '5px 10px',
                          borderRadius: 10,
                          fontSize: 12,
                          fontWeight: 400,
                          fontFamily: 'inherit',
                          border: '1px solid',
                          cursor: 'pointer',
                          background: country === c.slug ? '#181831' : '#f8f9fb',
                          color: country === c.slug ? 'white' : 'rgba(24,24,49,0.78)',
                          borderColor: country === c.slug ? '#181831' : '#eef0f3',
                        }}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* University */}
                <div style={{ marginBottom: 16 }}>
                  <p style={{ fontSize: 11, color: 'rgba(24,24,49,0.75)', fontWeight: 400, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>University (optional)</p>
                  <input
                    type="text"
                    value={university}
                    onChange={e => setUniversity(e.target.value)}
                    placeholder="e.g. Bocconi, Sapienza…"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #eef0f3', background: '#f8f9fb', fontSize: 13, fontWeight: 400, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </>
            )}

            {/* Content */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 11, color: 'rgba(24,24,49,0.75)', fontWeight: 400, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {type === 'question' ? 'Your question *' : 'Your answer *'}
              </p>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder={type === 'question' ? 'What do you want to know?' : 'Share what you know or experienced…'}
                rows={4}
                style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #eef0f3', background: '#f8f9fb', fontSize: 13, fontWeight: 400, fontFamily: 'inherit', outline: 'none', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.6 }}
              />
            </div>

            <button
              onClick={submit}
              disabled={submitting}
              style={{ width: '100%', padding: '11px', borderRadius: 12, background: '#51e74c', color: '#181831', fontSize: 13, fontWeight: 400, border: 'none', cursor: 'pointer', opacity: submitting ? 0.6 : 1 }}
            >
              {submitting ? 'Posting…' : type === 'question' ? 'Post question →' : 'Post answer →'}
            </button>

            <p style={{ fontSize: 11, color: 'rgba(24,24,49,0.82)', fontWeight: 400, textAlign: 'center', marginTop: 12 }}>
              Be respectful. Misleading posts can be reported and removed.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
