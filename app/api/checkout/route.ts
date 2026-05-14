import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

const PRICES: Record<string, { amount: number; label: string }> = {
  country:     { amount: 799,  label: 'Country Guide' },
  scholarship: { amount: 599,  label: 'Scholarship Guide' },
  documents:   { amount: 399,  label: 'Documents & Relocation' },
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { package_type, country_slug, country } = await req.json()

  const price = PRICES[package_type]
  if (!price) {
    return NextResponse.json({ error: 'Invalid package type' }, { status: 400 })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'eur',
          unit_amount: price.amount,
          product_data: {
            name: `${price.label}${country !== 'All countries' ? ` — ${country}` : ''}`,
          },
        },
      },
    ],
    metadata: { user_id: user.id, package_type, country_slug, country },
    success_url: `${siteUrl}/services?success=1`,
    cancel_url:  `${siteUrl}/services`,
  })

  return NextResponse.json({ url: session.url })
}
