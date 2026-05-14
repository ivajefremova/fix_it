import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfilePageClient from '@/components/profile/ProfilePageClient'

export const metadata = { title: 'My Profile — Fix It' }

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [{ data: profile }, { data: favRows }, { data: wishlistRows }] = await Promise.all([
    supabase.from('profiles').select('full_name, email, user_type').eq('id', user.id).single(),
    supabase
      .from('favorites')
      .select('id, item_slug, status, notes, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('wishlist')
      .select('id, package_type, country_slug, country, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
  ])

  // Enrich favourites with university data
  const slugs = (favRows ?? []).map(f => f.item_slug)
  const { data: uniData } = slugs.length
    ? await supabase
        .from('universities')
        .select('slug, name, country, country_slug, city, type, tuition_range, tags, ranking_summary')
        .in('slug', slugs)
    : { data: [] }

  const uniBySlug = Object.fromEntries((uniData ?? []).map(u => [u.slug, u]))

  const favourites = (favRows ?? [])
    .filter(f => uniBySlug[f.item_slug])
    .map(f => {
      const u = uniBySlug[f.item_slug]
      return {
        fav_id:        f.id as number,
        slug:          f.item_slug,
        name:          u.name,
        country:       u.country,
        country_slug:  u.country_slug,
        city:          u.city,
        type:          u.type,
        tuition_range: u.tuition_range,
        tags:          u.tags,
        ranking_summary: u.ranking_summary,
        status:        f.status ?? 'researching',
        notes:         f.notes ?? null,
        created_at:    f.created_at,
      }
    })

  // For scholarship wishlist items, country_slug holds the scholarship UUID — fetch names
  const scholarshipIds = (wishlistRows ?? [])
    .filter(w => w.package_type === 'scholarship')
    .map(w => w.country_slug)

  const { data: scholarshipData } = scholarshipIds.length
    ? await supabase.from('scholarships').select('id, name').in('id', scholarshipIds)
    : { data: [] }

  const scholarshipNameById = Object.fromEntries((scholarshipData ?? []).map(s => [s.id, s.name]))

  const wishlist = (wishlistRows ?? []).map(w => ({
    id:           w.id as number,
    package_type: w.package_type,
    country_slug: w.country_slug,
    country:      w.country,
    item_name:    w.package_type === 'scholarship'
                    ? (scholarshipNameById[w.country_slug] ?? 'Scholarship')
                    : null,
    created_at:   w.created_at,
  }))

  const name     = profile?.full_name ?? ''
  const email    = profile?.email ?? user.email ?? ''
  const initials = name
    ? name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
    : email[0]?.toUpperCase() ?? '?'

  return (
    <ProfilePageClient
      userId={user.id}
      name={name}
      email={email}
      initials={initials}
      userType={profile?.user_type ?? null}
      favourites={favourites}
      wishlist={wishlist}
    />
  )
}
