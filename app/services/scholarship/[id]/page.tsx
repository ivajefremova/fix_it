import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ScholarshipDetailPage from '@/components/services/ScholarshipDetailPage'

export default async function ScholarshipDetail({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: scholarship }, { data: universities }, { data: { user } }] = await Promise.all([
    supabase
      .from('scholarships')
      .select('id, country_slug, country, name, description, amount, eligibility, deadline, link, university_slugs, scholarship_type, levels')
      .eq('id', id)
      .single(),
    supabase
      .from('universities')
      .select('slug, name, city, type, quick_summary'),
    supabase.auth.getUser(),
  ])

  if (!scholarship) notFound()

  let purchases: { package_type: string; country_slug: string }[] = []
  if (user) {
    const { data } = await supabase
      .from('purchases')
      .select('package_type, country_slug')
      .eq('user_id', user.id)
    purchases = data ?? []
  }

  return (
    <ScholarshipDetailPage
      scholarship={scholarship}
      universities={universities ?? []}
      purchases={purchases}
      isLoggedIn={!!user}
    />
  )
}
