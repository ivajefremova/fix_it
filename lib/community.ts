export const COMMUNITY_COUNTRIES = [
  { slug: 'spain',       name: 'Spain',       emoji: '🇪🇸' },
  { slug: 'italy',       name: 'Italy',       emoji: '🇮🇹' },
  { slug: 'france',      name: 'France',      emoji: '🇫🇷' },
  { slug: 'germany',     name: 'Germany',     emoji: '🇩🇪' },
  { slug: 'netherlands', name: 'Netherlands', emoji: '🇳🇱' },
  { slug: 'austria',     name: 'Austria',     emoji: '🇦🇹' },
  { slug: 'hungary',     name: 'Hungary',     emoji: '🇭🇺' },
  { slug: 'slovenia',    name: 'Slovenia',    emoji: '🇸🇮' },
  { slug: 'uk',          name: 'UK',          emoji: '🇬🇧' },
  { slug: 'greece',      name: 'Greece',      emoji: '🇬🇷' },
]

export const COMMUNITY_CATEGORIES = [
  'University admission',
  'Scholarships',
  'Visa & documents',
  'Student life',
  'Accommodation',
  'General',
]

export type CommunityPost = {
  id: string
  type: 'question' | 'answer'
  parent_id: string | null
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
