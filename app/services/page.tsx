import { createClient } from '@/lib/supabase/server'
import ServicesPageClient from '@/components/services/ServicesPageClient'

export const metadata = {
  title: 'Guides & Pricing — Fix It',
  description: 'Get the complete guide for your target country. One-time purchase, instant access.',
}

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>
}) {
  const supabase = await createClient()
  const { success } = await searchParams

  const { data: countries } = await supabase
    .from('countries')
    .select('slug, name')
    .order('name')

  const { data: { user } } = await supabase.auth.getUser()

  let purchases: { package_type: string; country_slug: string }[] = []
  let wishlist: { package_type: string; country_slug: string }[] = []
  if (user) {
    const [{ data: purchaseData }, { data: wishlistData }] = await Promise.all([
      supabase.from('purchases').select('package_type, country_slug').eq('user_id', user.id),
      supabase.from('wishlist').select('package_type, country_slug').eq('user_id', user.id),
    ])
    purchases = purchaseData ?? []
    wishlist  = wishlistData ?? []
  }

  return (
    <ServicesPageClient
      countries={countries ?? []}
      purchases={purchases}
      wishlist={wishlist}
      isLoggedIn={!!user}
      success={success === '1'}
    />
  )
}
