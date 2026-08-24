import { Suspense } from 'react'
import CommunityFeed from '@/components/community/CommunityFeed'

export const metadata = {
  title: 'Community — Fix It',
  description: 'Questions and answers from Macedonian students navigating European universities.',
}

export default function CommunityPage() {
  return (
    <main className="min-h-screen" style={{ background: '#f8f9fb' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">

        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#51e74c', fontWeight: 300, marginBottom: 8 }}>
            Community
          </p>
          <h1 style={{ color: '#181831', fontWeight: 300, fontSize: 'clamp(24px, 4vw, 38px)', marginBottom: 10, lineHeight: 1.2 }}>
            Ask. Share. Learn.
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(24,24,49,0.5)', fontWeight: 300, lineHeight: 1.6 }}>
            Real questions from Macedonian students navigating European universities. No fluff — just experience.
          </p>
        </div>

        <Suspense fallback={null}>
          <CommunityFeed />
        </Suspense>

      </div>
    </main>
  )
}
