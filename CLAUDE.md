# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> This file is the single source of truth for Claude Code working on the Fix It project.
> Read this entire file before touching any code. Every decision made here has a reason.
> Do not deviate from the conventions below without explicit instruction from the user.

---

## ⚠️ Next.js Version Warning

This project uses **Next.js 16** — which has breaking changes from Next.js 13–15. APIs, conventions, and file structure may differ from training data. Before writing any Next.js code, check `node_modules/next/dist/docs/` for the applicable guide and heed any deprecation notices.

---

## Development Commands

```bash
npm run dev      # Start dev server (Turbopack)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

No test runner is configured yet — add one before writing tests.

---

## Current State

The project is at the **initial scaffold** stage. Only the default Next.js files exist. Most dependencies listed in this document still need to be installed:

```bash
npm install @supabase/supabase-js @supabase/ssr stripe react-hot-toast resend
```

The `app/globals.css` currently uses Geist fonts and has a dark-mode media query — both must be removed and replaced with the design system below before building any pages.

---

## What Fix It Is

Fix It is a study abroad advisory platform for Macedonian students aged 16–22 and their parents. It solves a real, painful problem: the process of applying to European universities is overwhelming — each country has its own system, deadlines are buried, scholarship info is scattered, and the student navigating it is 17 years old with parents who are just as lost.

Fix It closes that gap by providing alumni-compiled, human-verified guidance — not generic scraped info, but real insight from Macedonian students who have actually done it. The founder has a network of alumni across 8 European countries who contribute their experience.

This is not a generic "study abroad" aggregator. The differentiator is trust, specificity, and human insight.

---

## The Users

**Primary:** Macedonian student, 16–22, ambitious, wants to study in Europe, paralysed by information overload.

**Secondary:** Their parent, 40s–50s, unfamiliar with European university systems, anxious, needs structure and reassurance.

Both share one core anxiety: missing something important — a deadline, a document, a scholarship. Every design and UX decision should reduce that anxiety.

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend | Next.js 15 (App Router) | TypeScript, Tailwind CSS, Turbopack |
| Database | Supabase (PostgreSQL) | Free tier to start |
| Auth | Supabase Auth | Email/password, protected routes via middleware |
| Storage | Supabase Storage | Photos, profile pictures |
| Payments | Stripe | One-time purchases only for v1 |
| Hosting | Vercel | Free Hobby tier until Stripe goes live, then Pro ($20/mo) |
| Email | Resend | Transactional emails — welcome, purchase confirmation, password reset |
| Version Control | GitHub | Every push auto-deploys to Vercel |

**Supabase project ID:** `sounaeycpausfxskctfm`
**Environment variables live in `.env.local` — NEVER hardcode keys in any file.**

---

## Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=https://sounaeycpausfxskctfm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_rotated_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # server-side only, never expose to client
STRIPE_SECRET_KEY=your_stripe_secret_key  # server-side only
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
RESEND_API_KEY=your_resend_api_key
```

---

## Design System

### Tailwind v4 Configuration

This project uses **Tailwind CSS v4**, which is CSS-first — there is no `tailwind.config.js`. All configuration happens in `app/globals.css` using `@theme`:

```css
@import "tailwindcss";

@theme {
  --color-navy: #181831;
  --color-blue: #0c4d86;
  --color-green: #51e74c;
  --font-sans: "Encode Sans Expanded", sans-serif;
}
```

Use `bg-navy`, `text-blue`, `text-green` etc. as Tailwind utilities — they come from `@theme` automatically.

### Colours
```css
--color-navy: #181831;      /* primary dark, backgrounds, text */
--color-blue: #0c4d86;      /* primary brand blue, CTAs */
--color-green: #51e74c;     /* accent green, highlights, success states */
--color-white: #ffffff;     /* background */
```

### Typography
- **Font:** Encode Sans Expanded (Google Fonts)
- **Weight:** Thin (100) and Light (300) preferred. Regular (400) for body. Never bold for headings.
- **Style:** Clean, minimal, European feel. No chunky text anywhere.

### Aesthetic
- Clean, sleek, liquid glass style — think frosted glass cards, subtle transparency, smooth shadows
- The homepage and navbar are the visual reference — match this across all pages
- Generous whitespace, no clutter
- Illustrations: Figma SVGs stored in `/public/illustrations/`
- Photos: stored in Supabase Storage, fetched via URL

### What NOT to do visually
- No purple gradients
- No Inter or Roboto fonts
- No generic card designs with thick borders
- No dark mode (not planned for v1)
- No emoji in UI
- No `alert()` — ever. Use toast notifications.

---

## Project Structure

The app uses the **root-level `app/` directory** (not `src/app/`). This is the actual current layout and the target structure to build toward:

```
fix-it/
├── public/
│   ├── illustrations/       # Figma SVG exports
│   └── images/              # Static images
├── app/                     # Next.js App Router (at ROOT, not inside src/)
│   ├── (auth)/              # Auth routes group
│   │   ├── login/
│   │   ├── signup/
│   │   └── change-password/
│   ├── (main)/              # Main site routes group
│   │   ├── page.tsx             # Homepage /
│   │   ├── universities/
│   │   │   ├── page.tsx         # /universities (list + search)
│   │   │   └── [slug]/
│   │   │       └── page.tsx     # /universities/[slug] (dynamic)
│   │   ├── countries/
│   │   │   ├── page.tsx         # /countries (overview)
│   │   │   └── [slug]/
│   │   │       └── page.tsx     # /countries/[slug] (dynamic)
│   │   ├── services/
│   │   │   └── page.tsx         # /services
│   │   ├── about/
│   │   │   └── page.tsx         # /about (does not exist yet — needs building)
│   │   └── quiz/
│   │       └── page.tsx         # /quiz (find your path — needs full redesign)
│   ├── profile/
│   │   └── page.tsx             # /profile (protected, logged-in users only)
│   ├── api/
│   │   ├── stripe/
│   │   │   └── webhook/
│   │   │       └── route.ts     # Stripe webhook handler
│   │   └── checkout/
│   │       └── route.ts         # Create Stripe checkout session
│   ├── layout.tsx               # Root layout (navbar + footer)
│   ├── globals.css              # Tailwind v4 + design tokens — edit this, not a config file
│   ├── not-found.tsx            # 404 page
│   └── middleware.ts            # Auth protection for routes
├── components/
│   ├── ui/                  # Reusable primitives
│   │   ├── Button.tsx
│   │   ├── Toast.tsx        # Toast notification system (replaces all alert())
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   └── Skeleton.tsx     # Loading states
│   ├── layout/
│   │   ├── Navbar.tsx       # Shared navbar — same on every page
│   │   └── Footer.tsx       # Shared footer
│   ├── universities/
│   │   ├── UniversityCard.tsx
│   │   ├── FavouriteButton.tsx
│   │   ├── SearchBar.tsx
│   │   └── FilterPanel.tsx
│   ├── profile/
│   │   ├── DeadlineCalendar.tsx
│   │   ├── Checklist.tsx
│   │   └── ProfilePicture.tsx
│   └── alumni/
│       ├── AlumniStory.tsx
│       └── RequestInfoForm.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts        # Browser Supabase client
│   │   ├── server.ts        # Server Supabase client (for RSC and API routes)
│   │   └── middleware.ts    # Supabase auth middleware helper
│   ├── stripe.ts            # Stripe client initialisation
│   └── utils.ts             # Shared utility functions
└── types/
    └── index.ts             # Shared TypeScript types
```

---

## Database Schema

### Table: `universities`
```sql
id                    uuid primary key default gen_random_uuid()
slug                  text unique not null           -- URL identifier e.g. "bocconi"
name                  text not null
country               text not null                  -- e.g. "Italy"
city                  text
type                  text                           -- e.g. "Public", "Private"
language              text                           -- language of instruction
hero_image_url        text                           -- Supabase Storage URL

-- FREE content (visible to all)
overview_free         text                           -- 2-3 sentence teaser
tuition_range         text                           -- e.g. "€5,000–€15,000/year"
entry_requirements_basic text
tags                  text[]                         -- ["business", "engineering"] for filtering

-- COUNTRY package content
overview_full         text
programmes            jsonb                          -- array of programme objects
application_process   text
housing_info          text
student_life          text
city_guide            text

-- SCHOLARSHIP package content
scholarships          jsonb                          -- array of scholarship objects

-- DOCUMENTS package content
visa_guide            text
document_checklist    jsonb                          -- array of checklist items
moving_guide          text
bank_account_guide    text

created_at            timestamptz default now()
updated_at            timestamptz default now()
```

### Table: `countries`
```sql
id                    uuid primary key default gen_random_uuid()
slug                  text unique not null           -- e.g. "italy"
name                  text not null
flag_emoji            text
hero_image_url        text
overview_free         text
cost_of_living_range  text
overview_full         text                           -- country package
visa_overview         text                           -- documents package
created_at            timestamptz default now()
```

### Table: `deadlines`
```sql
id                    uuid primary key default gen_random_uuid()
university_id         uuid references universities(id) on delete cascade
label                 text not null                  -- e.g. "Application Opens", "Deadline", "Results"
date                  date not null
notes                 text
created_at            timestamptz default now()
```

### Table: `alumni_stories`
```sql
id                    uuid primary key default gen_random_uuid()
university_id         uuid references universities(id) on delete cascade
author_name           text not null
programme             text
year_attended         text
story_text            text not null                  -- main story body
is_free               boolean default true           -- true = show to all, false = paid only
created_at            timestamptz default now()
```

### Table: `profiles`
```sql
id                    uuid primary key references auth.users(id) on delete cascade
email                 text
full_name             text
avatar_url            text                           -- Supabase Storage URL
stripe_customer_id    text                           -- links to Stripe customer
created_at            timestamptz default now()
updated_at            timestamptz default now()
```

### Table: `favourites`
```sql
id                    uuid primary key default gen_random_uuid()
user_id               uuid references profiles(id) on delete cascade
university_id         uuid references universities(id) on delete cascade
created_at            timestamptz default now()
unique(user_id, university_id)
```

### Table: `purchases`
```sql
id                    uuid primary key default gen_random_uuid()
user_id               uuid references profiles(id) on delete cascade
package_type          text not null                  -- "country", "scholarship", "documents"
country               text                           -- which country this purchase covers
stripe_payment_id     text
created_at            timestamptz default now()
unique(user_id, package_type, country)
```

### Table: `checklist_items`
```sql
id                    uuid primary key default gen_random_uuid()
user_id               uuid references profiles(id) on delete cascade
text                  text not null
is_completed          boolean default false
is_hardcoded          boolean default true           -- false = generated from favourites/packages
university_id         uuid references universities(id)
created_at            timestamptz default now()
```

---

## Content Gating Rules

This is critical. Get this right.

Every university page checks the user's purchases before rendering content:

```typescript
// Server component — fetch user purchases server-side
const purchases = await supabase
  .from('purchases')
  .select('package_type, country')
  .eq('user_id', user.id)

const hasCountryPackage = purchases.some(
  p => p.package_type === 'country' && p.country === university.country
)
const hasScholarshipPackage = purchases.some(
  p => p.package_type === 'scholarship' && p.country === university.country
)
const hasDocumentsPackage = purchases.some(
  p => p.package_type === 'documents' && p.country === university.country
)
```

- Content is NEVER sent to the client unless the user has purchased the relevant package
- Do NOT just hide content with CSS — omit it entirely from the server response
- Use Next.js server components for all gated content rendering
- Row Level Security (RLS) in Supabase is the backup enforcement layer

---

## Auth Rules

- All auth is handled by Supabase Auth
- Protected routes: `/profile` and any checkout flow
- Middleware in `middleware.ts` (at project root, alongside `app/`) checks session and redirects unauthenticated users to `/login`
- After login, redirect to `/profile`
- After signup, send welcome email via Resend
- Never use Webflow's auth or any third-party auth beyond Supabase

```typescript
// middleware.ts (at project root, not inside app/)
export async function middleware(request: NextRequest) {
  const supabase = createMiddlewareClient({ req: request, res: response })
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session && request.nextUrl.pathname.startsWith('/profile')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
}
```

---

## Stripe Integration

Three package types, each tied to a specific country:

| Package | `package_type` value | What it unlocks |
|---|---|---|
| Full Country | `country` | Full university + country content |
| Scholarship | `scholarship` | All scholarship details |
| Documents & Visa | `documents` | Visa guide, checklists, moving info |

**Purchase flow:**
1. User clicks buy on `/services` or a university page
2. POST to `/api/checkout` → creates Stripe Checkout session with metadata: `{ user_id, package_type, country }`
3. User completes payment on Stripe-hosted page
4. Stripe sends webhook to `/api/stripe/webhook`
5. Webhook handler verifies signature, reads metadata, inserts row into `purchases` table
6. User is redirected back to site with content now unlocked

**NEVER unlock content by trusting the client. Always verify via the `purchases` table server-side.**

---

## Stripe Webhook Handler Pattern

```typescript
// src/app/api/stripe/webhook/route.ts
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!
  
  let event: Stripe.Event
  
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    return new Response('Webhook signature verification failed', { status: 400 })
  }
  
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.CheckoutSession
    const { user_id, package_type, country } = session.metadata!
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // use service role for webhook
    )
    
    await supabase.from('purchases').insert({
      user_id,
      package_type,
      country,
      stripe_payment_id: session.payment_intent as string
    })
  }
  
  return new Response('ok', { status: 200 })
}
```

---

## Favourites System

The heart button must:
1. On page load — check if this university is in the user's favourites and show filled/empty heart accordingly
2. On click — optimistically update UI immediately (don't wait for server)
3. On server confirm — show toast notification ("Saved!" or "Removed!")
4. Never use `alert()` — ever

```typescript
// FavouriteButton.tsx pattern
const [isFavourited, setIsFavourited] = useState(false)
const [loading, setLoading] = useState(true)

useEffect(() => {
  // Check on mount if already favourited
  checkFavouriteStatus()
}, [])

const toggleFavourite = async () => {
  setIsFavourited(prev => !prev) // optimistic update
  const { error } = isFavourited ? await removeFavourite() : await addFavourite()
  if (error) {
    setIsFavourited(prev => !prev) // revert on error
    toast.error('Something went wrong')
  } else {
    toast.success(isFavourited ? 'Removed from favourites' : 'Saved to favourites')
  }
}
```

---

## Toast Notifications

Use `react-hot-toast` or `sonner` — install one at the start, use it everywhere. Never `alert()`.

```typescript
import toast from 'react-hot-toast'

toast.success('Saved to favourites')
toast.error('Please log in to save universities')
toast('Redirecting to checkout...')
```

Add `<Toaster />` to the root layout once.

---

## Profile Dashboard Features

The profile page (`/profile`) is the most complex page. It has:

1. **Favourited universities** — grid of university cards, each with remove button, links to university page
2. **Deadline calendar** — populated from `deadlines` table for all favourited universities. Shows month view, deadlines highlighted. Built with a lightweight calendar library or custom component.
3. **Checklist** — hardcoded tasks for free users (e.g. "Get transcripts translated", "Research visa requirements"). For paid users, additional tasks generated from their favourited universities and purchased packages using data from `checklist_items` table.
4. **Profile picture** — upload to Supabase Storage, display as avatar. Bucket: `avatars`.
5. **Purchased packages** — display which packages they own with unlock date.

---

## Pages — Status and Notes

| Page | Route | Status | Notes |
|---|---|---|---|
| Homepage | `/` | Exists in Webflow | Rebuild in Next.js, preserve liquid glass style exactly |
| Countries overview | `/countries` | Exists in Webflow | Make dynamic from Supabase |
| Country detail | `/countries/[slug]` | Empty in Webflow | Build dynamic route |
| Universities list | `/universities` | Exists in Webflow | Add search + filter |
| University detail | `/universities/[slug]` | Empty shell in Webflow | Build dynamic route with content gating |
| Services | `/services` | Exists in Webflow | Add real Stripe checkout buttons |
| Profile | `/profile` | Exists in Webflow | Major rebuild with all dashboard features |
| Login | `/login` | Exists in Webflow | Rebuild with proper Supabase auth UI |
| Signup | `/signup` | Missing | Build from scratch |
| Change password | `/change-password` | Exists in Webflow | Rebuild cleanly |
| About us | `/about` | MISSING | Build from scratch — tell the Fix It story |
| Quiz | `/quiz` | Exists but broken | Full redesign — questions, style, results |
| 404 | Not found | Exists in Webflow | Rebuild in Next.js |

---

## The "Find Your Path" Quiz

Current state: hardcoded, ugly, off-brand. Needs full rebuild.

How it should work:
1. Multi-step questionnaire (one question per screen, progress bar)
2. Questions cover: field of study, budget range, preferred language, country vibe preference, city size preference, importance of scholarships
3. Each answer filters the universities array
4. End result: "Here are your top 3 matches" with university cards
5. Encourage signup to save results

Questions are hardcoded logic in v1 — no AI, no complex algorithm. Just filtering.

---

## Alumni Stories

- Each university page shows 1 alumni story for free users, all stories for paid (country package)
- Stories have: author name, programme, year, story text
- At the bottom of each story: "Want to know more? Request more info" → simple form that emails the Fix It team (via Resend)
- Stories are entered into Supabase by the research team via Table Editor
- In v1 there is no peer-to-peer chat — just the request form connecting to the Fix It team

---

## About Us Page

Does not exist yet. Must be built. This page is critical for trust — especially for the parent user.

Content to include:
- Who built Fix It and why
- The alumni network — students across 8 countries
- The research methodology — how info is verified
- Why this is more trustworthy than Googling
- A human, warm tone — not corporate

Design should feel personal and credible.

---

## Content — How It Gets Added

The research team (the founder's friend) adds all university and country content directly via the Supabase Table Editor — no coding required, it looks like a spreadsheet.

Schema is built first by the developer. Then content is added independently. These two workstreams run in parallel.

**Content structure per university (what the research team fills in):**
- Overview (free + full versions)
- Programmes offered
- Application process
- Tuition and costs
- Housing
- Student life
- Deadlines (separate table, linked to university)
- Scholarships
- Visa/documents guide
- Alumni stories (separate table)

Do NOT wait for content before building the pages. Build with placeholder/seed data, real content slots in automatically when added.

---

## Shared Components Rules

- **Navbar** — identical on every page. Contains: logo, Home, Countries (dropdown populated from Supabase), Universities, Services, MyProfile / Login button depending on auth state
- **Footer** — identical on every page. Needs redesign from current Webflow version. Should include: logo, nav links, social links, copyright, GDPR notice
- Both are in `src/components/layout/` and imported in `src/app/layout.tsx`

---

## Build Order — Do Not Skip Steps

1. ✅ Next.js project setup (TypeScript, Tailwind, App Router)
2. ✅ Install dependencies: `@supabase/supabase-js`, `@supabase/ssr`, `react-hot-toast`, `stripe`
3. Supabase client setup (`lib/supabase/client.ts` and `lib/supabase/server.ts`)
4. Shared layout — Navbar + Footer components
5. Middleware for auth protection
6. Homepage — pixel-perfect rebuild from Webflow reference
7. Supabase schema creation (all tables above)
8. Auth pages — login, signup, change password
9. Universities list page with search + filter
10. Dynamic university page `/universities/[slug]` with content gating
11. Dynamic country page `/countries/[slug]`
12. Favourites system — heart button, optimistic updates, toasts
13. Profile dashboard — favourites grid, calendar, checklist, profile picture
14. Services page with real Stripe checkout
15. Stripe webhook handler
16. Alumni stories component
17. About us page
18. Quiz redesign
19. Transactional emails via Resend
20. GDPR cookie banner
21. Mobile responsiveness audit
22. SEO — metadata, Open Graph, sitemap
23. Macedonian locale (i18n) — phase 2, not v1

---

## Critical Rules — Read Before Every Task

1. **Never `alert()`** — always use toast notifications
2. **Never hardcode Supabase or Stripe keys** — always `.env.local`
3. **Never build static pages for universities or countries** — always dynamic routes with `[slug]`
4. **Never send gated content to the client** — omit from server response entirely
5. **Never trust the client for payment confirmation** — always verify via Stripe webhook + `purchases` table
6. **Never use `sudo npm install`** — causes permission issues
7. **Always use the Supabase server client in server components and API routes** — never the browser client
8. **Always handle loading states** — use skeleton components, never blank flashes
9. **Always handle errors gracefully** — catch errors, show user-friendly messages via toast
10. **Always check auth state before rendering profile content** — redirect to login if no session
11. **Mobile first** — design and test on mobile width first, then desktop
12. **Commit frequently** — after each feature is working, commit to GitHub with a clear message

---

## What Already Exists (Webflow Export Reference)

The Webflow export is in the `/webflow-reference` folder. Use it as a visual and CSS reference only. Do NOT copy the HTML directly — it is full of Webflow-specific classes and CMS placeholders that mean nothing outside Webflow.

What to take from it:
- CSS variables and colour values
- Font loading (Encode Sans Expanded via Google Fonts)
- Layout proportions and spacing feel
- Component visual designs (navbar, cards, buttons)
- SVG illustrations in `/images/`

The Supabase JS in those files shows the old favourites logic — use it as a reference for what was attempted, not as code to copy.

---

## Seed Data

Before the research team adds real content, use this seed data to develop against:

```sql
INSERT INTO countries (slug, name, flag_emoji, overview_free, cost_of_living_range) VALUES
('italy', 'Italy', '🇮🇹', 'Italy offers world-class universities in historic cities.', '€700–€1,200/month'),
('germany', 'Germany', '🇩🇪', 'Germany has tuition-free public universities and strong industry ties.', '€800–€1,400/month'),
('netherlands', 'Netherlands', '🇳🇱', 'The Netherlands is known for English-taught programmes and innovation.', '€900–€1,500/month'),
('spain', 'Spain', '🇪🇸', 'Spain offers vibrant culture and affordable living for students.', '€700–€1,100/month'),
('austria', 'Austria', '🇦🇹', 'Austria combines excellent education with central European culture.', '€800–€1,300/month'),
('hungary', 'Hungary', '🇭🇺', 'Hungary offers affordable tuition and a growing international student community.', '€500–€900/month'),
('slovenia', 'Slovenia', '🇸🇮', 'Slovenia is an underrated gem with low costs and high quality of life.', '€600–€1,000/month'),
('uk', 'United Kingdom', '🇬🇧', 'The UK is home to some of the world''s most prestigious universities.', '£900–£1,800/month');

INSERT INTO universities (slug, name, country, city, overview_free, tuition_range, tags) VALUES
('bocconi', 'Bocconi University', 'Italy', 'Milan', 'One of Europe''s top business schools, located in Milan.', '€14,000–€28,000/year', ARRAY['business', 'economics', 'finance']),
('luiss', 'LUISS Guido Carli', 'Italy', 'Rome', 'A prestigious private university in Rome focused on business and law.', '€14,000–€20,000/year', ARRAY['business', 'law', 'political science']),
('lmu', 'Ludwig Maximilian University', 'Germany', 'Munich', 'One of Germany''s oldest and most reputable universities.', '€0–€3,000/year', ARRAY['research', 'medicine', 'sciences']),
('corvinus', 'Corvinus University', 'Hungary', 'Budapest', 'A leading business and social sciences university in Budapest.', '€3,000–€6,000/year', ARRAY['business', 'economics', 'social sciences']);
```

---

## Notes for Claude Code

- When in doubt about a design decision, refer to the Webflow export homepage as the gold standard
- The user (Mila) is non-technical — explain what you're doing in plain language when making big decisions
- Ask before making architectural changes that aren't covered in this document
- The content team adds data independently — always design components to handle empty/missing data gracefully
- This is a real product for real users — quality matters, don't cut corners on UX
- When a feature is complete, tell Mila clearly what was built and what to test
