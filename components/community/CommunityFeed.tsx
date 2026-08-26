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

// ─── Sub-components ────────────────────────────────────────────────────────────

function CategoryPill({ text }: { text: string }) {
  return (
    <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 20, background: 'rgba(12,77,134,0.08)', color: '#0c4d86', fontWeight: 300, whiteSpace: 'nowrap' }}>
      {text}
    </span>
  )
}

function QuestionCard({ q, currentUserId, onDelete }: { q: Question; currentUserId: string; onDelete: (id: string) => void }) {
  const country = COMMUNITY_COUNTRIES.find(c => c.slug === q.country_slug)
  const isOwn = !!currentUserId && q.user_id === currentUserId

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const supabase = (await import('@/lib/supabase/client')).createClient()
    const { error } = await supabase.from('posts').delete().eq('id', q.id)
    if (!error) onDelete(q.id)
  }

  const inner = (
    <div
      style={{ background: 'white', borderRadius: 16, padding: '18px 22px', border: '1px solid #eef0f3', transition: 'border-color 0.15s, box-shadow 0.15s', cursor: 'pointer', position: 'relative' }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.borderColor = 'rgba(12,77,134,0.2)'
        el.style.boxShadow = '0 2px 12px rgba(0,0,0,0.07)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.borderColor = '#eef0f3'
        el.style.boxShadow = 'none'
      }}
    >
      {isOwn && (
        <button onClick={handleDelete} title="Delete" style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'rgba(24,24,49,0.25)', lineHeight: 1 }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#e53e3e' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(24,24,49,0.25)' }}>
          <svg style={{ width: 13, height: 13 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </button>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
        {q.category && <CategoryPill text={q.category} />}
        {country && (
          <span style={{ fontSize: 11, color: 'rgba(24,24,49,0.4)', fontWeight: 300 }}>{country.name}</span>
        )}
        {q.university_slug && (
          <span style={{ fontSize: 11, color: 'rgba(24,24,49,0.38)', fontWeight: 300 }}>{q.university_slug}</span>
        )}
      </div>

      <p style={{ fontSize: 13, color: '#181831', fontWeight: 300, lineHeight: 1.65, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {q.content}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 12, color: 'rgba(24,24,49,0.5)', fontWeight: 300 }}>{q.author_alias ?? 'Anonymous'}</span>
        <span style={{ color: 'rgba(24,24,49,0.18)', fontSize: 10 }}>·</span>
        <span suppressHydrationWarning style={{ fontSize: 12, color: 'rgba(24,24,49,0.35)', fontWeight: 300 }}>{timeAgo(q.created_at)}</span>
        {q.answer_count > 0 && (
          <>
            <span style={{ color: 'rgba(24,24,49,0.18)', fontSize: 10 }}>·</span>
            <span style={{ fontSize: 12, color: '#51e74c', fontWeight: 300 }}>{q.answer_count} {q.answer_count === 1 ? 'answer' : 'answers'}</span>
          </>
        )}
      </div>
    </div>
  )

  return <Link href={`/community/${q.id}`} style={{ textDecoration: 'none', display: 'block' }}>{inner}</Link>
}

function Skeleton() {
  return (
    <div className="animate-pulse" style={{ background: 'white', borderRadius: 16, padding: '18px 22px', border: '1px solid #eef0f3' }}>
      <div style={{ height: 14, background: '#f0f2f5', borderRadius: 7, width: '28%', marginBottom: 10 }} />
      <div style={{ height: 12, background: '#f0f2f5', borderRadius: 6, width: '95%', marginBottom: 6 }} />
      <div style={{ height: 12, background: '#f0f2f5', borderRadius: 6, width: '75%', marginBottom: 12 }} />
      <div style={{ height: 10, background: '#f0f2f5', borderRadius: 5, width: '22%' }} />
    </div>
  )
}

const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  borderRadius: 10,
  border: '1px solid #eef0f3',
  background: 'white',
  fontSize: 13,
  fontWeight: 300,
  fontFamily: 'inherit',
  color: '#181831',
  outline: 'none',
  cursor: 'pointer',
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 10px center',
  paddingRight: 30,
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function CommunityFeed({ countrySlug, universitySlug, compact }: Props) {
  const searchParams = useSearchParams()
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [currentUserId, setCurrentUserId] = useState('')

  const [activeCountry, setActiveCountry] = useState(
    countrySlug ?? searchParams.get('country') ?? ''
  )
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') ?? '')
  const [search, setSearch] = useState('')

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (user) setCurrentUserId(user.id)
    })
  }, [])

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const supabase = createClient()
        let qQuery = supabase
          .from('posts')
          .select('id, type, parent_id, user_id, author_alias, content, country_slug, university_slug, category, is_flagged, created_at')
          .eq('type', 'question')
          .eq('is_flagged', false)
          .order('created_at', { ascending: false })

        if (countrySlug) qQuery = qQuery.eq('country_slug', countrySlug)
        if (universitySlug) qQuery = qQuery.eq('university_slug', universitySlug)
        if (compact) qQuery = qQuery.limit(4)

        const [{ data: rawQuestions, error }, { data: rawAnswers }] = await Promise.all([
          qQuery,
          supabase.from('posts').select('parent_id').eq('type', 'answer').eq('is_flagged', false),
        ])

        if (!error) {
          const answerCounts: Record<string, number> = {}
          for (const a of rawAnswers ?? []) {
            if (a.parent_id) answerCounts[a.parent_id] = (answerCounts[a.parent_id] ?? 0) + 1
          }
          setQuestions(
            (rawQuestions ?? []).map(q => ({ ...q, answer_count: answerCounts[q.id] ?? 0 })) as Question[]
          )
        }
      } catch {
        // fetch failed — show empty state
      }
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


  function handleNewQuestion(post: CommunityPost) {
    setQuestions(prev => [{ ...post, answer_count: 0 } as Question, ...prev])
    setShowForm(false)
  }

  function handleDeleteQuestion(id: string) {
    setQuestions(prev => prev.filter(q => q.id !== id))
  }

  // ─── Compact embed ───────────────────────────────────────────────────────────
  if (compact) {
    const viewAllParams = new URLSearchParams()
    if (countrySlug) viewAllParams.set('country', countrySlug)
    if (universitySlug) viewAllParams.set('university', universitySlug)
    const viewAllHref = `/community${viewAllParams.toString() ? '?' + viewAllParams.toString() : ''}`
    const countryName = COMMUNITY_COUNTRIES.find(c => c.slug === countrySlug)?.name ?? countrySlug

    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, gap: 12 }}>
          <div>
            <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#51e74c', fontWeight: 300, marginBottom: 4 }}>Community</p>
            <h2 style={{ fontSize: 15, color: '#181831', fontWeight: 300 }}>
              {countrySlug ? `Students are asking about ${countryName}` : universitySlug ? 'Students are asking about this university' : 'From the community'}
            </h2>
          </div>
          <button
            onClick={() => setShowForm(true)}
            style={{ flexShrink: 0, fontSize: 12, padding: '7px 14px', borderRadius: 10, background: 'rgba(12,77,134,0.07)', color: '#0c4d86', fontWeight: 300, border: 'none', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
          >
            Ask something
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}><Skeleton /><Skeleton /><Skeleton /></div>
        ) : filtered.length === 0 ? (
          <div style={{ borderRadius: 16, padding: '28px 24px', textAlign: 'center', background: 'rgba(12,77,134,0.03)', border: '1px dashed rgba(12,77,134,0.15)' }}>
            <p style={{ fontSize: 13, color: 'rgba(24,24,49,0.4)', fontWeight: 300 }}>No questions yet. Be the first to ask.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map(q => <QuestionCard key={q.id} q={q} currentUserId={currentUserId} onDelete={handleDeleteQuestion} />)}
          </div>
        )}

        <div style={{ marginTop: 14 }}>
          <Link href={viewAllHref} style={{ fontSize: 12, color: '#0c4d86', fontWeight: 300, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            See all questions
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>

        {showForm && (
          <PostForm type="question" prefillCountrySlug={countrySlug} prefillUniversitySlug={universitySlug} onClose={() => setShowForm(false)} onSuccess={handleNewQuestion} />
        )}
      </div>
    )
  }

  // ─── Full standalone mode ────────────────────────────────────────────────────

  const filterPanel = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Ask button */}
      <button
        onClick={() => setShowForm(true)}
        style={{ width: '100%', padding: '11px 18px', borderRadius: 12, background: '#51e74c', color: '#181831', fontSize: 13, fontWeight: 400, border: 'none', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Ask a question
      </button>

      {/* Search */}
      <div style={{ position: 'relative' }}>
        <svg className="w-4 h-4" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'rgba(24,24,49,0.3)', pointerEvents: 'none' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search questions…"
          style={{ width: '100%', paddingLeft: 34, paddingRight: 12, paddingTop: 9, paddingBottom: 9, borderRadius: 10, border: '1px solid #eef0f3', background: 'white', fontSize: 13, fontWeight: 300, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
        />
      </div>

      {/* Country dropdown */}
      <div>
        <p style={{ fontSize: 11, color: 'rgba(24,24,49,0.45)', fontWeight: 300, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Country</p>
        <div style={{ position: 'relative' }}>
          <select value={activeCountry} onChange={e => setActiveCountry(e.target.value)} style={selectStyle}>
            <option value="">All countries</option>
            {COMMUNITY_COUNTRIES.map(c => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Category dropdown */}
      <div>
        <p style={{ fontSize: 11, color: 'rgba(24,24,49,0.45)', fontWeight: 300, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Topic</p>
        <div style={{ position: 'relative' }}>
          <select value={activeCategory} onChange={e => setActiveCategory(e.target.value)} style={selectStyle}>
            <option value="">All topics</option>
            {COMMUNITY_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Active filters summary */}
      {(activeCountry || activeCategory || search) && (
        <button
          onClick={() => { setActiveCountry(''); setActiveCategory(''); setSearch('') }}
          style={{ fontSize: 12, color: 'rgba(24,24,49,0.4)', fontWeight: 300, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', padding: 0 }}
        >
          ✕ Clear filters
        </button>
      )}

      {/* Disclaimer */}
      <div style={{ borderRadius: 12, padding: '12px 14px', background: 'rgba(12,77,134,0.04)', border: '1px solid rgba(12,77,134,0.09)' }}>
        <p style={{ fontSize: 11, color: 'rgba(24,24,49,0.5)', fontWeight: 300, lineHeight: 1.6 }}>
          All content is personal experience. Fix It does not verify accuracy — use as a starting point, not a final source.
        </p>
      </div>
    </div>
  )

  return (
    <div>
      {/* Mobile filters (shown above feed on small screens) */}
      <div className="md:hidden" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <select value={activeCountry} onChange={e => setActiveCountry(e.target.value)} style={{ ...selectStyle, fontSize: 12 }}>
              <option value="">All countries</option>
              {COMMUNITY_COUNTRIES.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, position: 'relative' }}>
            <select value={activeCategory} onChange={e => setActiveCategory(e.target.value)} style={{ ...selectStyle, fontSize: 12 }}>
              <option value="">All topics</option>
              {COMMUNITY_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <svg className="w-3.5 h-3.5" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'rgba(24,24,49,0.3)', pointerEvents: 'none' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" style={{ width: '100%', paddingLeft: 30, paddingRight: 10, paddingTop: 8, paddingBottom: 8, borderRadius: 10, border: '1px solid #eef0f3', background: 'white', fontSize: 12, fontWeight: 300, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <button
            onClick={() => setShowForm(true)}
            style={{ flexShrink: 0, padding: '8px 14px', borderRadius: 10, background: '#51e74c', color: '#181831', fontSize: 12, fontWeight: 400, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            + Ask
          </button>
        </div>
      </div>

      {/* Desktop: two-column layout */}
      <div className="flex flex-col md:flex-row gap-6 items-start">

        {/* Left: question list */}
        <div style={{ flex: 1, minWidth: 0 }}>
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
              {filtered.map(q => (
                <QuestionCard key={q.id} q={q} currentUserId={currentUserId} onDelete={handleDeleteQuestion} />
              ))}
            </div>
          )}
        </div>

        {/* Right: filter sidebar (desktop only) */}
        <div className="hidden md:block" style={{ width: 260, flexShrink: 0, position: 'sticky', top: 80 }}>
          {filterPanel}
        </div>

      </div>

      {showForm && (
        <PostForm type="question" onClose={() => setShowForm(false)} onSuccess={handleNewQuestion} />
      )}
    </div>
  )
}
