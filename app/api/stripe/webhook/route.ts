import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature')!

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return new NextResponse('Webhook signature invalid', { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const { user_id, package_type, country_slug, country } = session.metadata!

    // Service role bypasses RLS
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    await supabase.from('purchases').insert({
      user_id,
      package_type,
      country,
      country_slug,
      stripe_payment_id: session.payment_intent as string,
    })
  }

  return new NextResponse('ok', { status: 200 })
}
