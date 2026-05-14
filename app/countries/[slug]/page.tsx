import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import CountryPageClient from '@/components/countries/CountryPageClient'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('countries').select('name, tagline').eq('slug', slug).single()
  if (!data) return {}
  return {
    title: `${data.name} — Fix It`,
    description: data.tagline ?? `Study in ${data.name} — alumni-verified guide.`,
  }
}

export default async function CountryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  // Free country fields
  const { data: country } = await supabase
    .from('countries')
    .select('slug, name, tagline, overview_free, tuition_range_public, tuition_range_private, cost_of_living_range')
    .eq('slug', slug)
    .single()

  if (!country) notFound()

  // Universities for this country — free fields only + boolean level flags
  const { data: unis } = await supabase
    .from('universities')
    .select('slug, name, city, type, tuition_range, tags, ranking_summary, quick_summary, undergraduate_courses, graduate_courses')
    .eq('country_slug', slug)
    .order('name')

  const universities = (unis ?? []).map(u => ({
    slug: u.slug,
    name: u.name,
    city: u.city,
    type: u.type,
    tuition_range: u.tuition_range,
    tags: u.tags,
    ranking_summary: u.ranking_summary,
    quick_summary: u.quick_summary,
  }))

  // Auth + purchases
  const { data: { user } } = await supabase.auth.getUser()
  let hasCountryPackage = false
  let hasScholarshipPackage = false
  let hasDocumentsPackage = false
  let gated = null
  let gatedDocs = null
  let gatedScholarships: { id: string; name: string; amount: string | null; eligibility: string | null; deadline: string | null; scholarship_type: string | null; university_slugs: string[] }[] = []

  let favouritedSlugs: string[] = []

  if (user) {
    const [{ data: purchases }, { data: favRows }] = await Promise.all([
      supabase.from('purchases').select('package_type, country_slug').eq('user_id', user.id),
      supabase.from('favorites').select('item_slug').eq('user_id', user.id),
    ])

    hasCountryPackage     = purchases?.some(p => p.package_type === 'country'     && p.country_slug === slug) ?? false
    hasScholarshipPackage = purchases?.some(p => p.package_type === 'scholarship' && p.country_slug === slug) ?? false
    hasDocumentsPackage   = purchases?.some(p => p.package_type === 'documents'   && p.country_slug === slug) ?? false
    favouritedSlugs = (favRows ?? []).map(f => f.item_slug)
  }

  // Only fetch gated content if purchased — never sent to client otherwise
  if (hasCountryPackage) {
    const { data } = await supabase
      .from('countries')
      .select('why_this_country, lifestyle, finance, career, city_guide, scholarship_overview, housing_overview')
      .eq('slug', slug)
      .single()
    gated = data
  }

  if (hasDocumentsPackage) {
    const { data } = await supabase
      .from('countries')
      .select('visa_process, document_checklist, moving_guide, bank_account_guide, arrival_tips')
      .eq('slug', slug)
      .single()
    gatedDocs = data
  }

  if (hasScholarshipPackage) {
    const { data } = await supabase
      .from('scholarships')
      .select('id, name, amount, eligibility, deadline, scholarship_type, university_slugs')
      .eq('country_slug', slug)
    gatedScholarships = data ?? []
  }

  return (
    <CountryPageClient
      country={country}
      gated={gated}
      gatedDocs={gatedDocs}
      gatedScholarships={gatedScholarships}
      hasCountryPackage={hasCountryPackage}
      hasScholarshipPackage={hasScholarshipPackage}
      hasDocumentsPackage={hasDocumentsPackage}
      universities={universities}
      favouritedSlugs={favouritedSlugs}
      isLoggedIn={!!user}
    />
  )
}
