'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const COUNTRIES = [
  { slug: 'italy',          name: 'Italy',          flag: '🇮🇹' },
  { slug: 'germany',        name: 'Germany',        flag: '🇩🇪' },
  { slug: 'netherlands',    name: 'Netherlands',    flag: '🇳🇱' },
  { slug: 'spain',          name: 'Spain',          flag: '🇪🇸' },
  { slug: 'austria',        name: 'Austria',        flag: '🇦🇹' },
  { slug: 'hungary',        name: 'Hungary',        flag: '🇭🇺' },
  { slug: 'slovenia',       name: 'Slovenia',       flag: '🇸🇮' },
  { slug: 'united-kingdom', name: 'United Kingdom', flag: '🇬🇧' },
]

const FIELDS   = ['Business', 'Engineering', 'Medicine', 'Law', 'Sciences', 'Humanities']
const LEVELS   = ['Bachelor', 'Master', 'Doctorate']
const TYPES    = ['Public', 'Private']

const selectStyle = (active: boolean): React.CSSProperties => ({
  border: `1px solid ${active ? '#181831' : '#eef0f3'}`,
  backgroundColor: active ? '#181831' : '#fff',
  color: active ? '#fff' : 'rgba(24,24,49,0.6)',
  fontWeight: 300,
  fontFamily: 'inherit',
  fontSize: '13px',
  borderRadius: '12px',
  padding: '10px 14px',
  outline: 'none',
  cursor: 'pointer',
  appearance: 'none' as const,
  WebkitAppearance: 'none' as const,
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='${active ? 'white' : '%23999'}' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
  paddingRight: '34px',
  minWidth: '150px',
  transition: 'border-color 0.15s, background 0.15s',
})

export default function HomepageSearch() {
  const router = useRouter()

  const [country,     setCountry]     = useState('all')
  const [field,       setField]       = useState('All')
  const [level,       setLevel]       = useState('All')
  const [type,        setType]        = useState('all')
  const [scholarship, setScholarship] = useState(false)

  const activeCount = [
    country !== 'all',
    field !== 'All',
    level !== 'All',
    type !== 'all',
    scholarship,
  ].filter(Boolean).length

  function handleSearch() {
    const params = new URLSearchParams()
    if (country !== 'all') params.set('country', country)
    if (field !== 'All')   params.set('field', field)
    if (level !== 'All')   params.set('level', level.toLowerCase())
    if (type !== 'all')    params.set('type', type)
    if (scholarship)       params.set('scholarship', 'true')
    router.push(`/universities${params.size ? `?${params.toString()}` : ''}`)
  }

  return (
    <section style={{ background: '#fff', borderTop: '1px solid #e4ebf3' }}>
      <div className="max-w-[90%] mx-auto py-10 sm:py-14">

        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest mb-2" style={{ color: '#51e74c' }}>University search</p>
          <h2 className="text-2xl sm:text-3xl text-navy" style={{ fontWeight: 400 }}>
            Find the right university for you.
          </h2>
        </div>

        <div
          className="bg-white rounded-2xl p-6 sm:p-8"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #eef0f3' }}
        >
          <div className="flex flex-wrap gap-3 items-end">

            {/* Country */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-widest" style={{ color: 'rgba(24,24,49,0.35)', fontWeight: 400 }}>Country</label>
              <select value={country} onChange={e => setCountry(e.target.value)} style={selectStyle(country !== 'all')}>
                <option value="all">All countries</option>
                {COUNTRIES.map(c => (
                  <option key={c.slug} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-widest" style={{ color: 'rgba(24,24,49,0.35)', fontWeight: 400 }}>Field of study</label>
              <select value={field} onChange={e => setField(e.target.value)} style={selectStyle(field !== 'All')}>
                <option value="All">All fields</option>
                {FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>

            {/* Level */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-widest" style={{ color: 'rgba(24,24,49,0.35)', fontWeight: 400 }}>Level</label>
              <select value={level} onChange={e => setLevel(e.target.value)} style={selectStyle(level !== 'All')}>
                <option value="All">All levels</option>
                {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            {/* Type */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-widest" style={{ color: 'rgba(24,24,49,0.35)', fontWeight: 400 }}>Type</label>
              <select value={type} onChange={e => setType(e.target.value)} style={selectStyle(type !== 'all')}>
                <option value="all">All types</option>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Scholarship */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-widest" style={{ color: 'rgba(24,24,49,0.35)', fontWeight: 400 }}>Funding</label>
              <button
                onClick={() => setScholarship(p => !p)}
                className="flex items-center gap-1.5 rounded-xl text-xs transition-all duration-200"
                style={{
                  padding: '10px 14px',
                  background: scholarship ? '#51e74c' : '#fff',
                  color: scholarship ? '#181831' : 'rgba(24,24,49,0.6)',
                  fontWeight: scholarship ? 400 : 300,
                  border: `1px solid ${scholarship ? '#51e74c' : '#eef0f3'}`,
                  cursor: 'pointer',
                  fontSize: '13px',
                  whiteSpace: 'nowrap',
                }}
              >
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675" />
                </svg>
                Has scholarship
              </button>
            </div>

            {/* Search button */}
            <button
              onClick={handleSearch}
              className="inline-flex items-center gap-2 rounded-xl text-xs transition-all hover:opacity-90 flex-shrink-0"
              style={{
                padding: '10px 20px',
                background: '#51e74c',
                color: '#181831',
                fontWeight: 400,
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              {activeCount > 0 && (
                <span
                  className="w-4 h-4 rounded-full flex items-center justify-center text-white"
                  style={{ background: '#181831', fontSize: '9px', fontWeight: 600 }}
                >
                  {activeCount}
                </span>
              )}
              Search
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>

          </div>
        </div>
      </div>
    </section>
  )
}
