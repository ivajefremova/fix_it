export const COMMUNITY_COUNTRIES = [
  { slug: 'spain',       name: 'Spain' },
  { slug: 'italy',       name: 'Italy' },
  { slug: 'france',      name: 'France' },
  { slug: 'germany',     name: 'Germany' },
  { slug: 'netherlands', name: 'Netherlands' },
  { slug: 'austria',     name: 'Austria' },
  { slug: 'hungary',     name: 'Hungary' },
  { slug: 'slovenia',    name: 'Slovenia' },
  { slug: 'uk',          name: 'UK' },
  { slug: 'greece',      name: 'Greece' },
]

export const COMMUNITY_CATEGORIES = [
  'University admission',
  'Scholarships',
  'Visa & documents',
  'Student life',
  'General',
]

export type CommunityPost = {
  id: string
  type: 'question' | 'answer'
  parent_id: string | null
  user_id: string | null
  author_alias: string | null
  content: string
  country_slug: string | null
  university_slug: string | null
  category: string | null
  is_flagged: boolean
  created_at: string
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}
