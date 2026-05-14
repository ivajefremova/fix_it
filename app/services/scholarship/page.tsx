import { createClient } from '@/lib/supabase/server'
import ScholarshipBrowse from '@/components/services/ScholarshipBrowse'

export const metadata = {
  title: 'Scholarship Guides — Fix It',
  description: 'Browse all available scholarships for Macedonian students studying in Europe.',
}

export default async function ScholarshipBrowsePage() {
  const supabase = await createClient()

  const [{ data: scholarships }, { data: universities }, { data: { user } }] = await Promise.all([
    supabase
      .from('scholarships')
      .select('id, country_slug, country, name, description, amount, eligibility, deadline, university_slugs, scholarship_type, levels')
      .order('country'),
    supabase
      .from('universities')
      .select('slug, name'),
    supabase.auth.getUser(),
  ])

  let purchases: { package_type: string; country_slug: string }[] = []
  let wishlistedIds: string[] = []
  if (user) {
    const [{ data: purchaseData }, { data: wishlistData }] = await Promise.all([
      supabase.from('purchases').select('package_type, country_slug').eq('user_id', user.id),
      supabase.from('wishlist').select('country_slug').eq('user_id', user.id).eq('package_type', 'scholarship'),
    ])
    purchases    = purchaseData ?? []
    wishlistedIds = (wishlistData ?? []).map(w => w.country_slug)
  }

  return (
    <ScholarshipBrowse
      scholarships={scholarships ?? []}
      universities={universities ?? []}
      purchases={purchases}
      isLoggedIn={!!user}
      wishlistedIds={wishlistedIds}
    />
  )
}
