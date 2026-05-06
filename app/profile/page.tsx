import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Checklist from '@/components/profile/Checklist'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, user_type, avatar_url')
    .eq('id', user.id)
    .single()

  const name = profile?.full_name ?? ''
  const initials = name
    ? name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
    : user.email?.[0].toUpperCase() ?? '?'

  return (
    <main className="min-h-screen" style={{ background: '#f8f9fb' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">

        {/* Profile header */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 mb-6 shadow-sm flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-navy flex items-center justify-center text-white text-xl flex-shrink-0" style={{ fontWeight: 300 }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl text-navy" style={{ fontWeight: 300 }}>
              {name || 'Welcome'}
            </h1>
            <p className="text-sm text-gray-400 mt-0.5 truncate">
              {profile?.email || user.email}
            </p>
          </div>
          {profile?.user_type && (
            <span className={`hidden sm:block text-xs px-3 py-1 rounded-full border flex-shrink-0 ${
              profile.user_type === 'student'
                ? 'border-blue/30 text-blue'
                : 'text-green border-green/30'
            }`}>
              {profile.user_type === 'student' ? 'Student' : 'Parent'}
            </span>
          )}
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Checklist — takes up 2 cols */}
          <div className="lg:col-span-2">
            <Checklist userId={user.id} />
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-6">

            {/* Saved universities */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-base text-navy mb-4" style={{ fontWeight: 300 }}>
                Saved universities
              </h2>
              <div className="text-center py-4">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                  </svg>
                </div>
                <p className="text-sm text-gray-400 mb-2">No universities saved yet.</p>
                <Link href="/universities" className="text-xs text-blue hover:underline">
                  Browse universities →
                </Link>
              </div>
            </div>

            {/* Packages */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-base text-navy mb-4" style={{ fontWeight: 300 }}>
                My packages
              </h2>
              <div className="text-center py-4">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-400 mb-2">No packages purchased yet.</p>
                <Link href="/services" className="text-xs text-blue hover:underline">
                  View packages →
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  )
}
