import { createClient } from '@/lib/supabase/server'
import QuizClient from '@/components/quiz/QuizClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Find Your Path — Fix It',
  description: 'Answer 9 quick questions and get a personalised ranking of European study destinations and universities.',
}

export default async function QuizPage() {
  const supabase = await createClient()

  const [{ data: countries, error }, { data: universities }] = await Promise.all([
    supabase
      .from('countries')
      .select('slug, name, quiz_cost_score, quiz_tuition_score, quiz_scholarship_score, quiz_non_eu_score, quiz_big_city_score, quiz_subject_scores')
      .order('name'),
    supabase
      .from('universities')
      .select('slug, name, country, country_slug, city, quiz_subjects, quiz_ranking, quiz_tuition, quiz_tuition_eu, quiz_tuition_non_eu, quiz_city_size, quiz_languages, quiz_programs_url')
      .not('quiz_subjects', 'is', null)
      .order('name'),
  ])

  if (error) console.error('[quiz] countries fetch error:', error.message)
  console.log('[quiz] countries fetched:', countries?.length ?? 0)
  console.log('[quiz] universities fetched:', universities?.length ?? 0)

  return <QuizClient countries={countries ?? []} universities={universities ?? []} />
}
