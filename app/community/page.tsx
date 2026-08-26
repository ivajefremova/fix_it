import { Suspense } from 'react'
import CommunityFeed from '@/components/community/CommunityFeed'
import HousingBoard from '@/components/community/HousingBoard'

export const metadata = {
  title: 'Community — Fix It',
  description: 'Questions and answers from Macedonian students navigating European universities.',
}

export default function CommunityPage() {
  return (
    <main className="min-h-screen" style={{ background: '#f8f9fb' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#51e74c', fontWeight: 300, marginBottom: 8 }}>
              Community
            </p>
            <h1 style={{ color: '#181831', fontWeight: 300, fontSize: 'clamp(24px, 3.5vw, 36px)', marginBottom: 10, lineHeight: 1.2 }}>
              Ask. Share. Learn.
            </h1>
            <p style={{ fontSize: 14, color: 'rgba(24,24,49,0.5)', fontWeight: 300, lineHeight: 1.6, maxWidth: 520 }}>
              Real questions from Macedonian students navigating European universities. No fluff — just experience.
            </p>
          </div>
          <HousingBoard />
        </div>

        <Suspense fallback={null}>
          <CommunityFeed />
        </Suspense>

      </div>
    </main>
  )
}
