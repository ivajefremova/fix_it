/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { COMMUNITY_COUNTRIES, type CommunityPost, timeAgo } from '@/lib/community'
import ReportButton from './ReportButton'

type Props = {
  question: CommunityPost
  initialAnswers: CommunityPost[]
}

type AliasStep = 'loading' | 'ready' | 'needs_alias' | 'not_logged_in'

export default function ThreadClient({ question, initialAnswers }: Props) {
  const [answers, setAnswers] = useState<CommunityPost[]>(initialAnswers)
  const [showForm, setShowForm] = useState(false)
  const [aliasStep, setAliasStep] = useState<AliasStep>('loading')
  const [userId, setUserId] = useState('')
  const [alias, setAlias] = useState('')
  const [aliasInput, setAliasInput] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const country = COMMUNITY_COUNTRIES.find(c => c.slug === question.country_slug)

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setAliasStep('not_logged_in'); return }
      setUserId(user.id)
      const { data: profile } = await supabase
        .from('profiles')
        .select('community_alias')
        .eq('id', user.id)
        .single()
      if (profile?.community_alias) {
        setAlias(profile.community_alias)
        setAliasStep('ready')
      } else {
        setAliasStep('needs_alias')
      }
    }
    checkAuth()
  }, [])

  async function saveAlias() {
    const trimmed = aliasInput.trim()
    if (trimmed.length < 2) { toast.error('Alias must be at least 2 characters'); return }
    if (trimmed.length > 24) { toast.error('Maximum 24 characters'); return }
    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({ community_alias: trimmed })
      .eq('id', userId)
    if (error) { toast.error('Could not save alias'); return }
    setAlias(trimmed)
    setAliasStep('ready')
  }

  async function submitAnswer() {
    if (!content.trim()) { toast.error('Write something first'); return }
    setSubmitting(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('posts')
      .insert({
        type: 'answer',
        parent_id: question.id,
        user_id: userId,
        author_alias: alias,
        content: content.trim(),
        country_slug: question.country_slug,
        university_slug: question.university_slug,
        category: null,
        is_flagged: false,
      })
      .select()
      .single()
    setSubmitting(false)
    if (error) { toast.error('Could not post. Try again.'); return }
    toast.success('Answer posted!')
    setAnswers(prev => [...prev, data as CommunityPost])
    setContent('')
    setShowForm(false)
  }

  return (
    <div>
      {/* Question card */}
      <div style={{ background: 'white', borderRadius: 20, padding: '24px 28px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
          {question.category && (
            <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 20, background: 'rgba(12,77,134,0.08)', color: '#0c4d86', fontWeight: 300 }}>
              {question.category}
            </span>
          )}
          {country && <span style={{ fontSize: 15 }} title={country.name}>{country.emoji}</span>}
          {question.university_slug && (
            <span style={{ fontSize: 12, color: 'rgba(24,24,49,0.4)', fontWeight: 300 }}>{question.university_slug}</span>
          )}
        </div>

        <p style={{ fontSize: 16, color: '#181831', fontWeight: 300, lineHeight: 1.7, marginBottom: 16 }}>
          {question.content}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: 'rgba(24,24,49,0.5)', fontWeight: 300 }}>
              {question.author_alias ?? 'Anonymous'}
            </span>
            <span style={{ color: 'rgba(24,24,49,0.2)', fontSize: 10 }}>·</span>
            <span style={{ fontSize: 12, color: 'rgba(24,24,49,0.35)', fontWeight: 300 }}>
              {timeAgo(question.created_at)}
            </span>
          </div>
          <ReportButton postId={question.id} />
        </div>
      </div>

      {/* Answers header */}
      <div style={{ padding: '16px 4px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: 12, color: 'rgba(24,24,49,0.4)', fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {answers.length} {answers.length === 1 ? 'answer' : 'answers'}
        </p>
      </div>

      {/* Answer cards */}
      {answers.length === 0 ? (
        <div style={{ borderRadius: 16, padding: '28px 24px', textAlign: 'center', background: 'rgba(12,77,134,0.03)', border: '1px dashed rgba(12,77,134,0.12)', marginBottom: 16 }}>
          <p style={{ fontSize: 13, color: 'rgba(24,24,49,0.4)', fontWeight: 300 }}>No answers yet. Be the first to help.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {answers.map((a, i) => (
            <div
              key={a.id}
              style={{ background: 'white', borderRadius: 16, padding: '18px 22px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', borderLeft: '3px solid #51e74c' }}
            >
              <p style={{ fontSize: 13, color: '#181831', fontWeight: 300, lineHeight: 1.7, marginBottom: 12 }}>
                {a.content}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, color: 'rgba(24,24,49,0.5)', fontWeight: 300 }}>
                    {a.author_alias ?? 'Anonymous'}
                  </span>
                  <span style={{ color: 'rgba(24,24,49,0.2)', fontSize: 10 }}>·</span>
                  <span style={{ fontSize: 12, color: 'rgba(24,24,49,0.35)', fontWeight: 300 }}>
                    {timeAgo(a.created_at)}
                  </span>
                </div>
                <ReportButton postId={a.id} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Answer form */}
      <div style={{ background: 'white', borderRadius: 20, padding: '24px 28px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        {aliasStep === 'loading' && (
          <div className="animate-pulse" style={{ height: 40, background: '#f0f2f5', borderRadius: 10 }} />
        )}

        {aliasStep === 'not_logged_in' && (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <p style={{ fontSize: 13, color: 'rgba(24,24,49,0.5)', fontWeight: 300, marginBottom: 12 }}>
              Log in to write an answer
            </p>
            <Link
              href="/login"
              style={{ display: 'inline-block', background: '#181831', color: 'white', padding: '9px 22px', borderRadius: 10, fontSize: 13, fontWeight: 300, textDecoration: 'none' }}
            >
              Log in
            </Link>
          </div>
        )}

        {aliasStep === 'needs_alias' && (
          <div>
            <p style={{ fontSize: 14, color: '#181831', fontWeight: 300, marginBottom: 6 }}>Pick a community name to answer</p>
            <p style={{ fontSize: 12, color: 'rgba(24,24,49,0.45)', fontWeight: 300, marginBottom: 14, lineHeight: 1.5 }}>
              Anonymous but recognisable — first name, nickname, whatever you like.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                value={aliasInput}
                onChange={e => setAliasInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveAlias() }}
                placeholder="e.g. Ana from Skopje"
                maxLength={24}
                style={{ flex: 1, padding: '9px 14px', borderRadius: 10, border: '1px solid #eef0f3', background: '#f8f9fb', fontSize: 13, fontWeight: 300, fontFamily: 'inherit', outline: 'none' }}
              />
              <button
                onClick={saveAlias}
                disabled={aliasInput.trim().length < 2}
                style={{ padding: '9px 16px', borderRadius: 10, background: '#51e74c', color: '#181831', fontSize: 13, fontWeight: 400, border: 'none', cursor: 'pointer', fontFamily: 'inherit', opacity: aliasInput.trim().length < 2 ? 0.5 : 1 }}
              >
                Save
              </button>
            </div>
          </div>
        )}

        {aliasStep === 'ready' && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            style={{ width: '100%', padding: '12px 16px', borderRadius: 12, background: '#f8f9fb', border: '1px solid #eef0f3', textAlign: 'left', fontSize: 13, color: 'rgba(24,24,49,0.4)', fontWeight: 300, fontFamily: 'inherit', cursor: 'text' }}
          >
            Write an answer…
          </button>
        )}

        {aliasStep === 'ready' && showForm && (
          <div>
            <p style={{ fontSize: 12, color: 'rgba(24,24,49,0.4)', fontWeight: 300, marginBottom: 10 }}>
              Answering as <strong style={{ fontWeight: 400 }}>{alias}</strong>
            </p>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Share what you know or experienced…"
              rows={4}
              autoFocus
              style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #eef0f3', background: '#f8f9fb', fontSize: 13, fontWeight: 300, fontFamily: 'inherit', outline: 'none', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.6, marginBottom: 10 }}
            />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                onClick={() => { setShowForm(false); setContent('') }}
                style={{ padding: '9px 16px', borderRadius: 10, background: '#f8f9fb', color: 'rgba(24,24,49,0.55)', fontSize: 13, fontWeight: 300, border: '1px solid #eef0f3', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Cancel
              </button>
              <button
                onClick={submitAnswer}
                disabled={submitting || !content.trim()}
                style={{ padding: '9px 20px', borderRadius: 10, background: '#51e74c', color: '#181831', fontSize: 13, fontWeight: 400, border: 'none', cursor: 'pointer', fontFamily: 'inherit', opacity: !content.trim() || submitting ? 0.5 : 1 }}
              >
                {submitting ? 'Posting…' : 'Post answer →'}
              </button>
            </div>
            <p style={{ fontSize: 11, color: 'rgba(24,24,49,0.3)', fontWeight: 300, marginTop: 10 }}>
              Be respectful. Misleading answers can be reported and removed.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
