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
  const [replies, setReplies] = useState<Record<string, CommunityPost[]>>({})
  const [showForm, setShowForm] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [submittingReply, setSubmittingReply] = useState(false)
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

  // Fetch replies to all answers
  useEffect(() => {
    if (initialAnswers.length === 0) return
    async function fetchReplies() {
      const supabase = createClient()
      const answerIds = initialAnswers.map(a => a.id)
      const { data } = await supabase
        .from('posts')
        .select('*')
        .in('parent_id', answerIds)
        .order('created_at', { ascending: true })
      if (!data) return
      const grouped: Record<string, CommunityPost[]> = {}
      for (const r of data as CommunityPost[]) {
        if (!r.parent_id) continue
        if (!grouped[r.parent_id]) grouped[r.parent_id] = []
        grouped[r.parent_id].push(r)
      }
      setReplies(grouped)
    }
    fetchReplies()
  }, [initialAnswers])

  async function handleDeleteAnswer(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from('posts').delete().eq('id', id)
    if (!error) setAnswers(prev => prev.filter(a => a.id !== id))
  }

  async function handleDeleteReply(id: string, answerId: string) {
    const supabase = createClient()
    const { error } = await supabase.from('posts').delete().eq('id', id)
    if (!error) setReplies(prev => ({
      ...prev,
      [answerId]: (prev[answerId] ?? []).filter(r => r.id !== id),
    }))
  }

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

  async function submitReply(answerId: string) {
    if (!replyContent.trim()) return
    setSubmittingReply(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('posts')
      .insert({
        type: 'answer',
        parent_id: answerId,
        user_id: userId,
        author_alias: alias,
        content: replyContent.trim(),
        country_slug: question.country_slug,
        university_slug: question.university_slug,
        category: null,
        is_flagged: false,
      })
      .select()
      .single()
    setSubmittingReply(false)
    if (error) { toast.error('Could not post reply. Try again.'); return }
    toast.success('Reply posted!')
    setReplies(prev => ({
      ...prev,
      [answerId]: [...(prev[answerId] ?? []), data as CommunityPost],
    }))
    setReplyContent('')
    setReplyingTo(null)
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
          {country && <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 20, background: 'rgba(24,24,49,0.05)', color: 'rgba(24,24,49,0.5)', fontWeight: 300 }}>{country.name}</span>}
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          {answers.map((a) => {
            const answerReplies = replies[a.id] ?? []
            const isReplying = replyingTo === a.id

            return (
              <div key={a.id}>
                {/* Answer */}
                <div style={{ background: 'white', borderRadius: 16, padding: '18px 22px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', borderLeft: '3px solid #51e74c' }}>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {/* Reply button — only show if logged in */}
                      {aliasStep === 'ready' && (
                        <button
                          onClick={() => {
                            if (isReplying) { setReplyingTo(null); setReplyContent('') }
                            else { setReplyingTo(a.id); setReplyContent('') }
                          }}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            fontSize: 11, color: isReplying ? '#0c4d86' : 'rgba(24,24,49,0.35)',
                            fontFamily: 'inherit', fontWeight: 300, padding: '2px 0',
                            display: 'flex', alignItems: 'center', gap: 4,
                          }}
                        >
                          <svg style={{ width: 11, height: 11 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                          </svg>
                          {isReplying ? 'Cancel' : 'Reply'}
                        </button>
                      )}
                      <ReportButton postId={a.id} />
                      {userId && a.user_id === userId && (
                        <button onClick={() => handleDeleteAnswer(a.id)} title="Delete" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'rgba(24,24,49,0.25)' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#e53e3e' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(24,24,49,0.25)' }}>
                          <svg style={{ width: 13, height: 13 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Inline reply form */}
                {isReplying && (
                  <div style={{ marginLeft: 24, marginTop: 6, background: 'rgba(12,77,134,0.03)', borderRadius: 14, padding: '14px 18px', border: '1px solid rgba(12,77,134,0.1)' }}>
                    <p style={{ fontSize: 11, color: 'rgba(24,24,49,0.4)', fontWeight: 300, marginBottom: 8 }}>
                      Replying as <strong style={{ fontWeight: 400 }}>{alias}</strong>
                    </p>
                    <textarea
                      value={replyContent}
                      onChange={e => setReplyContent(e.target.value)}
                      placeholder={`Reply to ${a.author_alias ?? 'this answer'}…`}
                      rows={3}
                      autoFocus
                      style={{ width: '100%', padding: '10px 13px', borderRadius: 10, border: '1px solid #eef0f3', background: 'white', fontSize: 13, fontWeight: 300, fontFamily: 'inherit', outline: 'none', resize: 'none', boxSizing: 'border-box', lineHeight: 1.6, marginBottom: 8 }}
                    />
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => { setReplyingTo(null); setReplyContent('') }}
                        style={{ padding: '7px 14px', borderRadius: 9, background: '#f8f9fb', color: 'rgba(24,24,49,0.55)', fontSize: 12, fontWeight: 300, border: '1px solid #eef0f3', cursor: 'pointer', fontFamily: 'inherit' }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => submitReply(a.id)}
                        disabled={submittingReply || !replyContent.trim()}
                        style={{ padding: '7px 16px', borderRadius: 9, background: '#0c4d86', color: 'white', fontSize: 12, fontWeight: 300, border: 'none', cursor: 'pointer', fontFamily: 'inherit', opacity: !replyContent.trim() || submittingReply ? 0.5 : 1 }}
                      >
                        {submittingReply ? 'Posting…' : 'Post reply'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Nested replies */}
                {answerReplies.length > 0 && (
                  <div style={{ marginLeft: 24, marginTop: 6, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {answerReplies.map(r => (
                      <div key={r.id} style={{ background: '#f8f9fb', borderRadius: 13, padding: '13px 18px', borderLeft: '2px solid #eef0f3', position: 'relative' }}>
                        <p style={{ fontSize: 12, color: '#181831', fontWeight: 300, lineHeight: 1.7, marginBottom: 8 }}>
                          {r.content}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 11, color: 'rgba(24,24,49,0.45)', fontWeight: 300 }}>
                              {r.author_alias ?? 'Anonymous'}
                            </span>
                            <span style={{ color: 'rgba(24,24,49,0.2)', fontSize: 9 }}>·</span>
                            <span style={{ fontSize: 11, color: 'rgba(24,24,49,0.3)', fontWeight: 300 }}>
                              {timeAgo(r.created_at)}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <ReportButton postId={r.id} />
                            {userId && r.user_id === userId && (
                              <button onClick={() => handleDeleteReply(r.id, a.id)} title="Delete" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 3, color: 'rgba(24,24,49,0.22)' }}
                                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#e53e3e' }}
                                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(24,24,49,0.22)' }}>
                                <svg style={{ width: 12, height: 12 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Main answer form */}
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
