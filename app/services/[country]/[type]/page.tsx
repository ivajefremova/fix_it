import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PackageDetailPage from '@/components/services/PackageDetailPage'

const VALID_TYPES = ['country', 'documents']

export default async function PackagePage({
  params,
}: {
  params: Promise<{ country: string; type: string }>
}) {
  const { country: countrySlug, type: packageType } = await params

  if (!VALID_TYPES.includes(packageType)) notFound()

  const supabase = await createClient()

  const [{ data: country }, { data: { user } }] = await Promise.all([
    supabase
      .from('countries')
      .select('slug, name, tagline, overview_free')
      .eq('slug', countrySlug)
      .single(),
    supabase.auth.getUser(),
  ])

  if (!country) notFound()

  let purchases: { package_type: string; country_slug: string }[] = []
  if (user) {
    const { data } = await supabase
      .from('purchases')
      .select('package_type, country_slug')
      .eq('user_id', user.id)
    purchases = data ?? []
  }

  return (
    <PackageDetailPage
      country={country}
      packageType={packageType as 'country' | 'documents'}
      purchases={purchases}
      isLoggedIn={!!user}
    />
  )
}
