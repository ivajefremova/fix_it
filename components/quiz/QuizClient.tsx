'use client'

import { useState } from 'react'
import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────────────────────

type Answers = {
  budget: string
  funding: string
  citizenship: string
  level: string
  subjects: string[]
  languages: string[]
  ranking: string
  grades: string
  cities: string
}

type UniData = {
  slug: string
  name: string
  country: string         // display name, e.g. "Italy"
  country_slug: string    // used for scoring, e.g. "italy"
  city: string | null
  quiz_subjects:      string[] | null
  quiz_languages:     string[] | null
  quiz_ranking:       string | null
  quiz_tuition:       string | null  // fallback if eu/non_eu not set
  quiz_tuition_eu:    string | null
  quiz_tuition_non_eu: string | null
  quiz_city_size:     string | null  // 'big' | 'medium' | 'small'
  quiz_programs_url:  string | null
}

type CountryRow = {
  slug: string
  name: string
  quiz_cost_score:        number | null
  quiz_tuition_score:     number | null
  quiz_scholarship_score: number | null
  quiz_non_eu_score:      number | null
  quiz_big_city_score:    number | null
  quiz_subject_scores:    Record<string, number> | null
}

// ─── Questions ────────────────────────────────────────────────────────────────

const QUESTIONS = [
  {
    id: 'budget',
    question: 'What is your monthly budget for living abroad?',
    hint: 'Include rent, food, transport, and daily costs.',
    type: 'single',
    options: [
      { value: 'low',    label: 'Under €700 / month' },
      { value: 'medium', label: '€700 – €1,000 / month' },
      { value: 'high',   label: '€1,000 – €1,400 / month' },
      { value: 'any',    label: 'No limit' },
    ],
  },
  {
    id: 'funding',
    question: 'Do you need financial support?',
    hint: null,
    type: 'single',
    options: [
      { value: 'scholarship', label: 'Yes — I need a scholarship' },
      { value: 'low_fees',    label: 'Yes — I need low tuition fees' },
      { value: 'no_concern',  label: 'No — budget is flexible' },
    ],
  },
  {
    id: 'citizenship',
    question: 'Do you hold EU or EEA citizenship?',
    hint: 'This affects tuition fees and admission across Europe.',
    type: 'single',
    options: [
      { value: 'eu',     label: 'Yes, EU / EEA citizen' },
      { value: 'non_eu', label: 'No, non-EU citizen' },
    ],
  },
  {
    id: 'level',
    question: 'Which study level are you applying for?',
    hint: null,
    type: 'single',
    options: [
      { value: 'bachelor',     label: "Bachelor's" },
      { value: 'master',       label: "Master's" },
      { value: 'doctorate',    label: 'Doctorate / PhD' },
      { value: 'single_cycle', label: 'Single-cycle (Medicine, Law, Architecture…)' },
    ],
  },
  {
    id: 'subjects',
    question: 'Which fields interest you?',
    hint: 'Select all that apply.',
    type: 'multi',
    options: [
      { value: 'business',    label: 'Business & Economics' },
      { value: 'engineering', label: 'Engineering & Technology' },
      { value: 'medicine',    label: 'Medicine & Health Sciences' },
      { value: 'law',         label: 'Law & Political Science' },
      { value: 'cs',          label: 'Computer Science & IT' },
      { value: 'arts',        label: 'Arts, Design & Architecture' },
      { value: 'social',      label: 'Social Sciences & Psychology' },
      { value: 'sciences',    label: 'Natural Sciences & Mathematics' },
      { value: 'humanities',  label: 'Humanities & Languages' },
    ],
  },
  {
    id: 'languages',
    question: 'In which languages can you study? (B2 or higher)',
    hint: 'Select all that apply. This filters your university options.',
    type: 'multi',
    options: [
      { value: 'english',   label: 'English' },
      { value: 'german',    label: 'German' },
      { value: 'french',    label: 'French' },
      { value: 'spanish',   label: 'Spanish' },
      { value: 'italian',   label: 'Italian' },
      { value: 'dutch',     label: 'Dutch' },
      { value: 'hungarian', label: 'Hungarian' },
      { value: 'slovene',   label: 'Slovene' },
      { value: 'greek',     label: 'Greek' },
    ],
  },
  {
    id: 'ranking',
    question: 'How important is university ranking?',
    hint: null,
    type: 'single',
    options: [
      { value: 'very_important', label: 'Very important — top-ranked globally (QS / Shanghai)' },
      { value: 'subject',        label: 'Important — ranked highly in my field' },
      { value: 'not_important',  label: 'Not important — quality over prestige' },
    ],
  },
  {
    id: 'grades',
    question: 'How would you describe your academic performance?',
    hint: null,
    type: 'single',
    options: [
      { value: 'excellent', label: 'Excellent  (9 – 10 / A grades)' },
      { value: 'good',      label: 'Good  (7 – 8 / B grades)' },
      { value: 'average',   label: 'Average  (5 – 6 / C grades)' },
    ],
  },
  {
    id: 'cities',
    question: 'Are you open to smaller or lesser-known cities?',
    hint: null,
    type: 'single',
    options: [
      { value: 'open',          label: 'Yes, totally open' },
      { value: 'prefer_big',    label: 'I prefer larger, well-known cities' },
      { value: 'no_preference', label: 'No preference' },
    ],
  },
]

// ─── Subject label map ────────────────────────────────────────────────────────

const SUBJECT_LABELS: Record<string, string> = {
  business:    'Business & Economics',
  engineering: 'Engineering',
  medicine:    'Medicine',
  law:         'Law',
  cs:          'Computer Science',
  arts:        'Arts & Design',
  social:      'Social Sciences',
  sciences:    'Natural Sciences',
  humanities:  'Humanities',
  economics:   'Economics',
}

// ─── Scoring ──────────────────────────────────────────────────────────────────

// Language scores are factual (which language is taught there) — stays static
const LANG_SCORES: Record<string, Record<string, number>> = {
  english:   { netherlands:15, uk:15, germany:12, italy:11, austria:11, france:10, spain:9,  hungary:9,  slovenia:9,  greece:7  },
  german:    { germany:15, austria:15, netherlands:5, hungary:4, italy:3,  france:3,  spain:2,  slovenia:2, greece:2, uk:2 },
  french:    { france:15, germany:2, netherlands:2, italy:2, austria:2, spain:2, hungary:2, slovenia:2, greece:2, uk:2 },
  spanish:   { spain:15,  germany:2, netherlands:2, italy:2, france:2,  austria:2, hungary:2, slovenia:2, greece:2, uk:2 },
  italian:   { italy:15,  germany:2, netherlands:2, france:2, austria:2, spain:2,  hungary:2, slovenia:2, greece:2, uk:2 },
  dutch:     { netherlands:15, germany:4, france:2, italy:2, spain:2, austria:2, hungary:2, slovenia:2, greece:2, uk:2 },
  hungarian: { hungary:15, germany:2, netherlands:2, france:2, italy:2, spain:2, austria:2, slovenia:2, greece:2, uk:2 },
  slovene:   { slovenia:15, germany:2, netherlands:2, france:2, italy:2, spain:2, austria:2, hungary:2, greece:2, uk:2 },
  greek:     { greece:15,  germany:2, netherlands:2, france:2, italy:2, spain:2, austria:2, hungary:2, slovenia:2, uk:2 },
}

function scoreCountry(c: CountryRow, a: Answers): number {
  let s = 0
  const cost        = c.quiz_cost_score        ?? 50
  const tuition     = c.quiz_tuition_score     ?? 50
  const scholarship = c.quiz_scholarship_score ?? 50

  // Budget vs cost of living — from DB (up to ~35 pts)
  const budgetMult: Record<string, number> = { low: 1.0, medium: 0.7, high: 0.35, any: 0.55 }
  s += cost * 0.35 * (budgetMult[a.budget] ?? 0.55)

  // Funding need — from DB (up to 30 pts)
  if (a.funding === 'scholarship') s += scholarship * 0.30
  else if (a.funding === 'low_fees') s += tuition * 0.30
  else s += 15

  // Language — static factual table (up to 20 pts, best match wins)
  if (a.languages.length > 0) {
    const raw = Math.max(...a.languages.map(lv => (LANG_SCORES[lv] ?? {})[c.slug] ?? 2))
    s += raw * (20 / 15)
  } else {
    s += 10
  }

  return s
}

function scoreUniversity(uni: UniData, a: Answers, countryScores: Record<string, number>): number {
  const uniSubjects  = uni.quiz_subjects   ?? []
  const uniLanguages = uni.quiz_languages  ?? []
  const uniRanking   = uni.quiz_ranking    ?? 'medium'
  const uniCitySize  = uni.quiz_city_size  ?? 'medium'

  // Pick tuition tier based on student's citizenship
  const uniTuition = a.citizenship === 'non_eu'
    ? (uni.quiz_tuition_non_eu ?? uni.quiz_tuition_eu ?? uni.quiz_tuition ?? 'medium')
    : (uni.quiz_tuition_eu    ?? uni.quiz_tuition    ?? 'medium')

  // Hard filter: must be able to study in at least one of the uni's languages
  if (a.languages.length > 0 && !a.languages.some(l => uniLanguages.includes(l))) return -1

  let s = 0

  // Country match (15 pts)
  const maxC = Math.max(...Object.values(countryScores))
  s += ((countryScores[uni.country_slug] ?? 0) / maxC) * 15

  // Subject match (50 pts) — biggest factor; zero matches = hard exclude
  if (a.subjects.length > 0) {
    const matches = a.subjects.filter(sv => uniSubjects.includes(sv)).length
    if (matches === 0) return -1
    s += (matches / a.subjects.length) * 50
  } else {
    s += 25
  }

  // Budget / tuition — citizenship-aware (25 pts)
  const tuitionPts: Record<string, Record<string, number>> = {
    low:    { free:25, low:23, medium:17, high:7,  very_high:2 },
    medium: { free:25, low:23, medium:22, high:13, very_high:7 },
    high:   { free:25, low:25, medium:23, high:20, very_high:15 },
    any:    { free:25, low:23, medium:22, high:20, very_high:17 },
  }
  s += (tuitionPts[a.budget] ?? tuitionPts.any)[uniTuition] ?? 17

  // City preference (8 pts)
  if (a.cities === 'prefer_big') {
    s += uniCitySize === 'big' ? 8 : uniCitySize === 'medium' ? 3 : 0
  } else if (a.cities === 'open') {
    s += uniCitySize === 'small' ? 8 : uniCitySize === 'medium' ? 7 : 4
  } else {
    s += 4
  }

  // Ranking preference (10 pts)
  const rankPts: Record<string, Record<string, number>> = {
    very_important: { very_high:10, high:5, medium:1 },
    subject:        { very_high:8,  high:7, medium:4 },
    not_important:  { very_high:6,  high:7, medium:7 },
  }
  s += (rankPts[a.ranking] ?? rankPts.not_important)[uniRanking] ?? 5

  // Grades adjustment
  if (a.grades === 'average' && uniRanking === 'very_high') s -= 12
  if (a.grades === 'average' && uniRanking === 'high')      s -= 4
  if (a.grades === 'excellent' && uniRanking === 'very_high') s += 5

  return s
}

function explainCountry(c: CountryRow, a: Answers): string {
  const cost        = c.quiz_cost_score        ?? 50
  const tuition     = c.quiz_tuition_score     ?? 50
  const scholarship = c.quiz_scholarship_score ?? 50
  const reasons: string[] = []

  // Budget vs cost of living
  if (a.budget === 'low' && cost >= 68) reasons.push('affordable cost of living')
  else if (a.budget === 'medium' && cost >= 58) reasons.push('fits your budget')

  // Funding
  if (a.funding === 'scholarship' && scholarship >= 68) reasons.push('strong scholarship options')
  else if (a.funding === 'low_fees' && tuition >= 68) reasons.push('low tuition fees')

  // Language
  if (a.languages.length > 0) {
    const bestLang = a.languages.reduce((best, lv) => {
      const s = (LANG_SCORES[lv] ?? {})[c.slug] ?? 0
      return s > ((LANG_SCORES[best] ?? {})[c.slug] ?? 0) ? lv : best
    }, a.languages[0])
    const score = (LANG_SCORES[bestLang] ?? {})[c.slug] ?? 0
    if (score >= 11) reasons.push(`widely taught in ${bestLang.charAt(0).toUpperCase() + bestLang.slice(1)}`)
  }

  return reasons.slice(0, 2).join(' · ')
}

function explainUniversity(uni: UniData, a: Answers, countryScores: Record<string, number>): string {
  const uniSubjects = uni.quiz_subjects  ?? []
  const uniRanking  = uni.quiz_ranking   ?? 'medium'
  const uniTuition  = uni.quiz_tuition   ?? 'medium'
  const reasons: string[] = []

  // Subject match
  if (a.subjects.length > 0) {
    const matched = a.subjects.filter(sv => uniSubjects.includes(sv))
    if (matched.length > 0) {
      const labels = matched.map(sv => SUBJECT_LABELS[sv] ?? sv)
      reasons.push(labels.length === 1 ? `Matches your interest in ${labels[0]}` : `Covers ${labels.slice(0, 2).join(' & ')}`)
    }
  }

  // Country rank among all scored countries
  const sorted = Object.entries(countryScores).sort((x, y) => y[1] - x[1])
  const countryRank = sorted.findIndex(([slug]) => slug === uni.country_slug) + 1
  if (countryRank === 1) reasons.push('in your best-matched country')
  else if (countryRank <= 3) reasons.push(`in your #${countryRank} country`)

  // Tuition vs budget — citizenship-aware
  const effectiveTuition = a.citizenship === 'non_eu'
    ? (uni.quiz_tuition_non_eu ?? uni.quiz_tuition_eu ?? uni.quiz_tuition ?? 'medium')
    : (uni.quiz_tuition_eu ?? uni.quiz_tuition ?? 'medium')
  if (effectiveTuition === 'free') {
    reasons.push('tuition-free')
  } else if (effectiveTuition === 'low' && (a.budget === 'low' || a.budget === 'medium')) {
    reasons.push('very affordable tuition')
  } else if ((effectiveTuition === 'high' || effectiveTuition === 'very_high') && a.budget === 'high') {
    reasons.push('premium tier within your budget')
  }

  // City preference
  const citySize = uni.quiz_city_size ?? 'medium'
  if (a.cities === 'prefer_big' && citySize === 'big') reasons.push(`major city — ${uni.city}`)
  else if (a.cities === 'open' && citySize === 'small') reasons.push(`smaller, focused city — ${uni.city}`)

  // Global ranking (only if student cares)
  if (uniRanking === 'very_high' && a.ranking !== 'not_important') {
    reasons.push('globally top-ranked')
  }

  return reasons.slice(0, 3).join(' · ')
}

function computeResults(a: Answers, countries: CountryRow[], universities: UniData[]) {
  const countryScores: Record<string, number> = {}
  for (const c of countries) {
    countryScores[c.slug] = scoreCountry(c, a)
  }
  const maxScore = Math.max(...Object.values(countryScores))

  const rankedCountries = countries
    .map(c => ({ slug: c.slug, name: c.name, score: countryScores[c.slug], pct: Math.round((countryScores[c.slug] / maxScore) * 100), explanation: explainCountry(c, a) }))
    .sort((a, b) => b.score - a.score)

  const scoredUnis = universities
    .map(u => ({ ...u, score: scoreUniversity(u, a, countryScores), explanation: explainUniversity(u, a, countryScores) }))
    .filter(u => u.score >= 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)

  return { rankedCountries, topUnis: scoredUnis }
}

// ─── Component ────────────────────────────────────────────────────────────────

const EMPTY: Answers = {
  budget: '', funding: '', citizenship: '', level: '', subjects: [], languages: [], ranking: '', grades: '', cities: '',
}

export default function QuizClient({ countries, universities }: { countries: CountryRow[], universities: UniData[] }) {
  const [step, setStep]       = useState<number>(-1)  // -1 = intro
  const [answers, setAnswers] = useState<Answers>(EMPTY)
  const [fading, setFading]   = useState(false)

  const q = QUESTIONS[step]
  const isMulti = q?.type === 'multi'
  const currentVal = q ? (answers as Record<string, unknown>)[q.id] : null
  const hasAnswer  = isMulti
    ? (currentVal as string[])?.length > 0
    : !!currentVal

  function transition(fn: () => void) {
    setFading(true)
    setTimeout(() => { fn(); setFading(false) }, 220)
  }

  function pick(value: string) {
    if (fading) return  // prevent double-advance during transition
    const id = q.id as keyof Answers
    if (isMulti) {
      const cur = (answers[id] as string[]) ?? []
      const next = cur.includes(value) ? cur.filter(v => v !== value) : [...cur, value]
      setAnswers(prev => ({ ...prev, [id]: next }))
    } else {
      setAnswers(prev => ({ ...prev, [id]: value }))
      setTimeout(() => transition(() => setStep(s => s + 1)), 160)
    }
  }

  function goNext() { if (!fading) transition(() => setStep(s => s + 1)) }
  function goBack() { if (!fading) transition(() => setStep(s => s - 1)) }

  const results = step === QUESTIONS.length ? computeResults(answers, countries, universities) : null

  // ── Intro ──────────────────────────────────────────────────────────────────
  if (step === -1) {
    return (
      <main style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 5%' }}>
        <div style={{ maxWidth: 560, width: '100%', textAlign: 'center',
          opacity: fading ? 0 : 1, transform: fading ? 'translateY(12px)' : 'translateY(0)',
          transition: 'opacity 0.22s ease, transform 0.22s ease' }}>
          <p style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#51e74c', marginBottom: 20 }}>Find your path</p>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 200, color: '#181831', lineHeight: 1.15, marginBottom: 16 }}>
            Find your perfect study destination.
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(24,24,49,0.75)', fontWeight: 400, lineHeight: 1.7, marginBottom: 40, maxWidth: 420, margin: '0 auto 40px' }}>
            Answer 9 quick questions and we'll rank all 10 countries we cover from best to least suitable for you — plus your top 10 matching universities.
          </p>
          <button
            onClick={() => transition(() => setStep(0))}
            style={{ background: '#51e74c', color: '#181831', border: 'none', borderRadius: 14, padding: '14px 36px', fontSize: 15, fontWeight: 400, fontFamily: 'inherit', cursor: 'pointer', transition: 'opacity 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Start the quiz
          </button>
        </div>
      </main>
    )
  }

  // ── Results ────────────────────────────────────────────────────────────────
  if (step === QUESTIONS.length && results) {
    return (
      <main style={{ background: '#fff', minHeight: '100vh', paddingBottom: 100 }}>
        <div style={{ maxWidth: '90%', margin: '0 auto', paddingTop: 60,
          opacity: fading ? 0 : 1, transition: 'opacity 0.22s ease' }}>

          {/* Header */}
          <p style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#51e74c', marginBottom: 10 }}>Your results</p>
          <h1 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 200, color: '#181831', marginBottom: 6 }}>Your best matches</h1>
          <p style={{ fontSize: 15, color: 'rgba(24,24,49,0.72)', fontWeight: 400, marginBottom: 52 }}>
            Based on your answers — your top destinations and universities.
          </p>

          {/* Two-column layout */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,3fr) minmax(0,2fr)', gap: '48px 64px', alignItems: 'start' }}>

            {/* LEFT — universities */}
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 20 }}>
                <p style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#51e74c' }}>
                  Top universities for you
                </p>
                <Link href="/universities" style={{ fontSize: 12, color: 'rgba(24,24,49,0.7)', fontWeight: 400, textDecoration: 'none' }}>
                  Browse all →
                </Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {results.topUnis.length === 0 ? (
                  <p style={{ fontSize: 13, color: 'rgba(24,24,49,0.7)', fontWeight: 400 }}>
                    No universities matched your language and subject filters. Try broadening your selections.
                  </p>
                ) : results.topUnis.map((u, i) => (
                  <div key={u.slug + i} style={{
                    border: `1px solid ${i === 0 ? '#51e74c' : '#eef0f3'}`,
                    borderRadius: 16, overflow: 'hidden', background: i === 0 ? '#f7fff7' : '#fff',
                    display: 'flex', alignItems: 'stretch',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                  }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = i === 0 ? '#51e74c' : 'rgba(12,77,134,0.25)'; el.style.boxShadow = i === 0 ? '0 2px 14px rgba(81,231,76,0.12)' : '0 2px 14px rgba(12,77,134,0.06)' }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = i === 0 ? '#51e74c' : '#eef0f3'; el.style.boxShadow = 'none' }}
                  >
                    {/* Rank number */}
                    <div style={{ width: 40, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #f0f2f5' }}>
                      <span style={{ fontSize: 12, fontWeight: 400, color: 'rgba(24,24,49,0.58)' }}>{i + 1}</span>
                    </div>
                    {/* Info */}
                    <div style={{ flex: 1, padding: '14px 16px' }}>
                      <p style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(24,24,49,0.65)', marginBottom: 4 }}>
                        {u.country} · {u.city}
                      </p>
                      <p style={{ fontSize: 15, fontWeight: i === 0 ? 400 : 300, color: '#181831', lineHeight: 1.3 }}>{u.name}</p>
                      {u.explanation && (
                        <p style={{ fontSize: 12, color: 'rgba(24,24,49,0.38)', fontWeight: 400, marginTop: 5, lineHeight: 1.5 }}>{u.explanation}</p>
                      )}
                    </div>
                    {/* CTA */}
                    <a
                      href={u.quiz_programs_url ?? '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6,
                        padding: '0 18px', background: '#0c4d86', textDecoration: 'none',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#0a3f6e')}
                      onMouseLeave={e => (e.currentTarget.style.background = '#0c4d86')}
                    >
                      <span style={{ fontSize: 11, fontWeight: 400, color: '#fff', whiteSpace: 'nowrap' }}>View</span>
                      <svg style={{ width: 11, height: 11, color: '#fff' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — countries */}
            <div style={{ position: 'sticky', top: 80 }}>
              <p style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#51e74c', marginBottom: 20 }}>
                Countries ranked
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {results.rankedCountries.map((c, i) => (
                  <Link key={c.slug} href={`/countries/${c.slug}`} style={{ textDecoration: 'none' }}>
                    <div style={{
                      display: 'flex', alignItems: 'flex-start', gap: 12, padding: '11px 14px', borderRadius: 12,
                      border: `1px solid ${i === 0 ? '#51e74c' : '#eef0f3'}`,
                      background: i === 0 ? '#f7fff7' : '#fff',
                      transition: 'border-color 0.15s, box-shadow 0.15s',
                    }}
                      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#51e74c'; el.style.boxShadow = '0 2px 10px rgba(81,231,76,0.1)' }}
                      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = i === 0 ? '#51e74c' : '#eef0f3'; el.style.boxShadow = 'none' }}
                    >
                      <span style={{ fontSize: 11, color: i === 0 ? '#0c4d86' : 'rgba(24,24,49,0.58)', fontWeight: 400, width: 16, flexShrink: 0, textAlign: 'right', paddingTop: 1 }}>{i + 1}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: i === 0 ? 400 : 300, color: '#181831', margin: 0 }}>{c.name}</p>
                        {c.explanation && <p style={{ fontSize: 12, color: 'rgba(24,24,49,0.38)', fontWeight: 400, margin: '3px 0 0', lineHeight: 1.4 }}>{c.explanation}</p>}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0, paddingTop: 2 }}>
                        <div style={{ width: 52, height: 3, borderRadius: 3, background: '#f0f2f5' }}>
                          <div style={{ height: '100%', borderRadius: 3, width: `${c.pct}%`, background: i === 0 ? '#51e74c' : i < 3 ? 'rgba(12,77,134,0.4)' : 'rgba(12,77,134,0.15)' }} />
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 400, color: i === 0 ? '#51e74c' : 'rgba(24,24,49,0.65)' }}>{c.pct}%</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <button
                onClick={() => { setAnswers(EMPTY); transition(() => setStep(-1)) }}
                style={{ marginTop: 28, width: '100%', background: '#0c4d86', border: 'none', borderRadius: 12, padding: '13px 0', fontSize: 14, fontWeight: 400, color: '#fff', fontFamily: 'inherit', cursor: 'pointer', transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#0a3f6e')}
                onMouseLeave={e => (e.currentTarget.style.background = '#0c4d86')}
              >
                Retake the quiz
              </button>
            </div>
          </div>
        </div>
      </main>
    )
  }

  // ── Question ───────────────────────────────────────────────────────────────
  const selectedMulti = isMulti ? ((answers as Record<string, unknown>)[q.id] as string[]) ?? [] : []
  const selectedSingle = !isMulti ? (answers as Record<string, unknown>)[q.id] as string : ''
  const progress = ((step + 1) / QUESTIONS.length) * 100

  return (
    <main style={{ minHeight: '100vh', background: '#fff', display: 'flex', flexDirection: 'column' }}>
      {/* Progress */}
      <div style={{ height: 3, background: '#f0f2f5', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ height: '100%', background: '#51e74c', width: `${progress}%`, transition: 'width 0.4s ease' }} />
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '60px 5% 40px' }}>
        <div style={{ maxWidth: 560, width: '100%',
          opacity: fading ? 0 : 1, transform: fading ? 'translateY(12px)' : 'translateY(0)',
          transition: 'opacity 0.22s ease, transform 0.22s ease' }}>

          <p style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#51e74c', marginBottom: 24 }}>
            Question {step + 1} of {QUESTIONS.length}
          </p>
          <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 200, color: '#181831', lineHeight: 1.3, marginBottom: q.hint ? 8 : 28 }}>
            {q.question}
          </h2>
          {q.hint && (
            <p style={{ fontSize: 14, color: 'rgba(24,24,49,0.7)', fontWeight: 400, marginBottom: 24 }}>{q.hint}</p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {q.options.map(opt => {
              const active = isMulti ? selectedMulti.includes(opt.value) : selectedSingle === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => pick(opt.value)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 18px', borderRadius: 14, cursor: 'pointer',
                    border: `1.5px solid ${active ? '#51e74c' : '#eef0f3'}`,
                    background: active ? '#f7fff7' : '#fff',
                    textAlign: 'left', fontFamily: 'inherit',
                    transition: 'border-color 0.15s, background 0.15s',
                  }}
                  onMouseEnter={e => { if (!active) { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(12,77,134,0.25)'; el.style.background = 'rgba(12,77,134,0.02)' } }}
                  onMouseLeave={e => { if (!active) { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#eef0f3'; el.style.background = '#fff' } }}
                >
                  {/* Checkbox / radio indicator */}
                  <span style={{
                    width: 18, height: 18, borderRadius: isMulti ? 5 : 9, flexShrink: 0,
                    border: `1.5px solid ${active ? '#51e74c' : 'rgba(24,24,49,0.18)'}`,
                    background: active ? '#51e74c' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s',
                  }}>
                    {active && (
                      isMulti
                        ? <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        : <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'white', display: 'block' }} />
                    )}
                  </span>
                  <span style={{ fontSize: 15, fontWeight: active ? 400 : 300, color: '#181831', lineHeight: 1.4 }}>{opt.label}</span>
                </button>
              )
            })}
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 32 }}>
            <button
              onClick={goBack}
              style={{ background: 'transparent', border: '1px solid rgba(12,77,134,0.2)', borderRadius: 12, padding: '12px 24px', fontSize: 14, fontWeight: 400, color: '#0c4d86', fontFamily: 'inherit', cursor: 'pointer', transition: 'border-color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(12,77,134,0.4)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(12,77,134,0.2)')}
            >
              Back
            </button>
            {isMulti && (
              <button
                onClick={goNext}
                disabled={!hasAnswer}
                style={{
                  background: hasAnswer ? '#51e74c' : '#f0f2f5',
                  color: hasAnswer ? '#181831' : 'rgba(24,24,49,0.82)',
                  border: 'none', borderRadius: 12, padding: '12px 28px',
                  fontSize: 14, fontWeight: 400, fontFamily: 'inherit',
                  cursor: hasAnswer ? 'pointer' : 'not-allowed', transition: 'background 0.15s',
                }}
              >
                {step === QUESTIONS.length - 1 ? 'See results' : 'Next'}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
