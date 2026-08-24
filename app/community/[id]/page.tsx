import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ThreadClient from '@/components/community/ThreadClient'
import type { CommunityPost } from '@/lib/community'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('posts')
    .select('content')
    .eq('id', id)
    .eq('type', 'question')
    .single()
  if (!data) return {}
  return {
    title: `${data.content.slice(0, 60)}… — Fix It Community`,
  }
}

export default async function ThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: question }, { data: answers }] = await Promise.all([
    supabase
      .from('posts')
      .select('id, type, parent_id, author_alias, content, country_slug, university_slug, category, is_flagged, created_at')
      .eq('id', id)
      .eq('type', 'question')
      .eq('is_flagged', false)
      .single(),
    supabase
      .from('posts')
      .select('id, type, parent_id, author_alias, content, country_slug, university_slug, category, is_flagged, created_at')
      .eq('parent_id', id)
      .eq('type', 'answer')
      .eq('is_flagged', false)
      .order('created_at', { ascending: true }),
  ])

  if (!question) notFound()

  return (
    <main className="min-h-screen" style={{ background: '#f8f9fb' }}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">

        <Link
          href="/community"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(24,24,49,0.4)', fontWeight: 300, textDecoration: 'none', marginBottom: 24 }}
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to community
        </Link>

        <ThreadClient
          question={question as CommunityPost}
          initialAnswers={(answers ?? []) as CommunityPost[]}
        />

      </div>
    </main>
  )
}
