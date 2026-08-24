/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { COMMUNITY_COUNTRIES, COMMUNITY_CATEGORIES, type CommunityPost, timeAgo } from '@/lib/community'
import PostForm from './PostForm'

type Question = CommunityPost & { answer_count: number }

type Props = {
  countrySlug?: string
  universitySlug?: string
  compact?: boolean
}

function CategoryPill({ text }: { text: string }) {
  return (
    <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 20, background: 'rgba(12,77,134,0.08)', color: '#0c4d86', fontWeight: 300 }}>
      {text}
    </span>
  )
}

function QuestionCard({ q }: { q: Question }) {
  const country = COMMUNITY_COUNTRIES.find(c => c.slug === q.country_slug)
  return (
    <Link href={`/community/${q.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        className="group"
        style={{ background: 'white', borderRadius: 16, padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', border: '1px solid #f0f2f5', transition: 'border-color 0.15s, box-shadow 0.15s', cursor: 'pointer' }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLDivElement
          el.style.borderColor = 'rgba(12,77,134,0.18)'
          el.style.boxShadow = '0 2px 10px rgba(0,0,0,0.08)'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLDivElement
          el.style.borderColor = '#f0f2f5'
          el.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
          {q.category && <CategoryPill text={q.category} />}
          {country && <span style={{ fontSize: 14 }} title={country.name}>{country.emoji}</span>}
          {q.university_slug && (
            <span style={{ fontSize: 11, color: 'rgba(24,24,49,0.4)', fontWeight: 300 }}>{q.university_slug}</span>
          )}
        </div>

        <p style={{ fontSize: 13, color: '#181831', fontWeight: 300, lineHeight: 1.6, marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {q.content}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'rgba(24,24,49,0.45)', fontWeight: 300 }}>
            {q.author_alias ?? 'Anonymous'}
          </span>
          <span style={{ color: 'rgba(24,24,49,0.2)', fontSize: 10 }}>·</span>
          <span style={{ fontSize: 12, color: 'rgba(24,24,49,0.35)', fontWeight: 300 }}>
            {timeAgo(q.created_at)}
          </span>
          {q.answer_count > 0 && (
            <>
              <span style={{ color: 'rgba(24,24,49,0.2)', fontSize: 10 }}>·</span>
              <span style={{ fontSize: 12, color: 'rgba(24,24,49,0.4)', fontWeight: 300 }}>
                {q.answer_count} {q.answer_count === 1 ? 'answer' : 'answers'}
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  )
}

function Skeleton() {
  return (
    <div className="animate-pulse" style={{ background: 'white', borderRadius: 16, padding: '16px 20px', border: '1px solid #f0f2f5' }}>
      <div style={{ height: 16, background: '#f0f2f5', borderRadius: 8, width: '30%', marginBottom: 10 }} />
      <div style={{ height: 12, background: '#f0f2f5', borderRadius: 6, width: '90%', marginBottom: 6 }} />
      <div style={{ height: 12, background: '#f0f2f5', borderRadius: 6, width: '70%', marginBottom: 10 }} />
      <div style={{ height: 10, background: '#f0f2f5', borderRadius: 6, width: '25%' }} />
    </div>
  )
}

export default function CommunityFeed({ countrySlug, universitySlug, compact }: Props) {
  const searchParams = useSearchParams()
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const [activeCountry, setActiveCountry] = useState(
    countrySlug ?? searchParams.get('country') ?? ''
  )
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') ?? '')
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      const supabase = createClient()

      let qQuery = supabase
        .from('posts')
        .select('id, type, parent_id, author_alias, content, country_slug, university_slug, category, is_flagged, created_at')
        .eq('type', 'question')
        .eq('is_flagged', false)
        .order('created_at', { ascending: false })

      if (countrySlug) qQuery = qQuery.eq('country_slug', countrySlug)
      if (universitySlug) qQuery = qQuery.eq('university_slug', universitySlug)
      if (compact) qQuery = qQuery.limit(4)

      const [{ data: rawQuestions }, { data: rawAnswers }] = await Promise.all([
        qQuery,
        supabase
          .from('posts')
          .select('parent_id')
          .eq('type', 'answer')
          .eq('is_flagged', false),
      ])

      const answerCounts: Record<string, number> = {}
      for (const a of rawAnswers ?? []) {
        if (a.parent_id) answerCounts[a.parent_id] = (answerCounts[a.parent_id] ?? 0) + 1
      }

      setQuestions(
        (rawQuestions ?? []).map(q => ({ ...q, answer_count: answerCounts[q.id] ?? 0 })) as Question[]
      )
      setLoading(false)
    }
    load()
  }, [countrySlug, universitySlug, compact])

  const filtered = useMemo(() => {
    if (compact) return questions
    let q = questions
    if (activeCountry) q = q.filter(x => x.country_slug === activeCountry)
    if (activeCategory) q = q.filter(x => x.category === activeCategory)
    if (search) {
      const s = search.toLowerCase()
      q = q.filter(x => x.content.toLowerCase().includes(s) || (x.university_slug ?? '').toLowerCase().includes(s))
    }
    return q
  }, [questions, activeCountry, activeCategory, search, compact])

  const countryName = COMMUNITY_COUNTRIES.find(c => c.slug === countrySlug)?.name ?? countrySlug

  function handleNewQuestion(post: CommunityPost) {
    setQuestions(prev => [{ ...post, answer_count: 0 } as Question, ...prev])
    setShowForm(false)
  }

  // ─── Compact embed mode ──────────────────────────────────────────────────────

  if (compact) {
    const viewAllParams = new URLSearchParams()
    if (countrySlug) viewAllParams.set('country', countrySlug)
    if (universitySlug) viewAllParams.set('university', universitySlug)
    const viewAllHref = `/community${viewAllParams.toString() ? '?' + viewAllParams.toString() : ''}`

    const heading = countrySlug
      ? `Students are asking about ${countryName}`
      : universitySlug
      ? 'Students are asking about this university'
      : 'From the community'

    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, gap: 12 }}>
          <div>
            <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#51e74c', fontWeight: 300, marginBottom: 4 }}>Community</p>
            <h2 style={{ fontSize: 15, color: '#181831', fontWeight: 300 }}>{heading}</h2>
          </div>
          <button
            onClick={() => setShowForm(true)}
            style={{ flexShrink: 0, fontSize: 12, padding: '7px 14px', borderRadius: 10, background: 'rgba(12,77,134,0.07)', color: '#0c4d86', fontWeight: 300, border: 'none', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
          >
            Ask something
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Skeleton /><Skeleton /><Skeleton />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ borderRadius: 16, padding: '32px 24px', textAlign: 'center', background: 'rgba(12,77,134,0.03)', border: '1px dashed rgba(12,77,134,0.15)' }}>
            <p style={{ fontSize: 13, color: 'rgba(24,24,49,0.4)', fontWeight: 300 }}>No questions yet. Be the first to ask.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map(q => <QuestionCard key={q.id} q={q} />)}
          </div>
        )}

        <div style={{ marginTop: 16 }}>
          <Link
            href={viewAllHref}
            style={{ fontSize: 12, color: '#0c4d86', fontWeight: 300, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
          >
            See all questions
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>

        {showForm && (
          <PostForm
            type="question"
            prefillCountrySlug={countrySlug}
            prefillUniversitySlug={universitySlug}
            onClose={() => setShowForm(false)}
            onSuccess={handleNewQuestion}
          />
        )}
      </div>
    )
  }

  // ─── Full standalone mode ────────────────────────────────────────────────────

  return (
    <div>
      {/* Disclaimer */}
      <div style={{ borderRadius: 14, padding: '12px 16px', marginBottom: 24, display: 'flex', alignItems: 'flex-start', gap: 10, background: 'rgba(12,77,134,0.04)', border: '1px solid rgba(12,77,134,0.1)' }}>
        <svg className="w-4 h-4 flex-shrink-0" style={{ color: '#0c4d86', marginTop: 1 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
        <p style={{ fontSize: 12, color: 'rgba(24,24,49,0.55)', fontWeight: 300, lineHeight: 1.6 }}>
          All content is personal experience shared by community members. Fix It does not verify accuracy — use as a starting point, not a final source.
        </p>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 12 }}>
        <svg className="w-4 h-4" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(24,24,49,0.3)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search questions…"
          style={{ width: '100%', paddingLeft: 38, paddingRight: 14, paddingTop: 10, paddingBottom: 10, borderRadius: 12, border: '1px solid #eef0f3', background: 'white', fontSize: 13, fontWeight: 300, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
        />
      </div>

      {/* Country filter */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
        {[{ slug: '', name: 'All', emoji: '' }, ...COMMUNITY_COUNTRIES].map(c => (
          <button
            key={c.slug}
            onClick={() => c.slug === '' ? setActiveCountry('') : setActiveCountry(prev => prev === c.slug ? '' : c.slug)}
            style={{
              padding: '5px 12px',
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 300,
              fontFamily: 'inherit',
              border: '1px solid',
              cursor: 'pointer',
              background: activeCountry === c.slug ? '#181831' : 'white',
              color: activeCountry === c.slug ? 'white' : 'rgba(24,24,49,0.55)',
              borderColor: activeCountry === c.slug ? '#181831' : '#eef0f3',
            }}
          >
            {c.emoji ? `${c.emoji} ${c.name}` : c.name}
          </button>
        ))}
      </div>

      {/* Category filter */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
        {['All topics', ...COMMUNITY_CATEGORIES].map((cat, i) => {
          const val = i === 0 ? '' : cat
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(prev => prev === val ? '' : val)}
              style={{
                padding: '4px 12px',
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 300,
                fontFamily: 'inherit',
                border: '1px solid',
                cursor: 'pointer',
                background: activeCategory === val ? 'rgba(12,77,134,0.1)' : 'transparent',
                color: activeCategory === val ? '#0c4d86' : 'rgba(24,24,49,0.45)',
                borderColor: activeCategory === val ? 'rgba(12,77,134,0.2)' : '#eef0f3',
              }}
            >
              {cat}
            </button>
          )
        })}
      </div>

      {/* Ask button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button
          onClick={() => setShowForm(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 12, background: '#51e74c', color: '#181831', fontSize: 13, fontWeight: 400, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Ask a question
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1,2,3,4,5].map(i => <Skeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ borderRadius: 16, padding: '48px 24px', textAlign: 'center', background: 'rgba(12,77,134,0.03)', border: '1px dashed rgba(12,77,134,0.12)' }}>
          <p style={{ fontSize: 14, color: 'rgba(24,24,49,0.5)', fontWeight: 300, marginBottom: 4 }}>
            {search || activeCountry || activeCategory ? 'No matching questions.' : 'No questions yet.'}
          </p>
          <p style={{ fontSize: 12, color: 'rgba(24,24,49,0.35)', fontWeight: 300 }}>Be the first to ask something.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(q => <QuestionCard key={q.id} q={q} />)}
        </div>
      )}

      {showForm && (
        <PostForm
          type="question"
          onClose={() => setShowForm(false)}
          onSuccess={handleNewQuestion}
        />
      )}
    </div>
  )
}
