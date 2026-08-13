# CLAUDE.md — Fix It Project Briefing

> Read this entire file before touching any code. Every decision here has a reason.
> Do not deviate from conventions below without explicit instruction from Mila.
> When in doubt, ask. When making big architectural decisions, explain what you're doing first.

---

## What Fix It Is

Fix It is a study abroad advisory platform for Macedonian students aged 16–22 and their parents. It solves a real problem: applying to European universities is overwhelming — each country has its own system, deadlines are buried, scholarship info is scattered, and the student navigating this is 17 years old with parents who are just as lost.

Fix It closes that gap with alumni-compiled, human-verified guidance. Not generic scraped info — real insight from Macedonian students who have actually done it. The founder has a network of alumni across 8 European countries who contribute their experience.

**This is not a generic study abroad aggregator. The differentiator is trust, specificity, and human insight.**

---

## The Users

**Primary:** Macedonian student, 16–22, ambitious, wants to study in Europe, paralysed by information overload.

**Secondary:** Their parent, 40s–50s, unfamiliar with European university systems, anxious, needs structure and reassurance.

**Core anxiety for both:** Missing something important — a deadline, a document, a scholarship. Every design and UX decision should reduce that anxiety. The platform is the single source of truth they can trust.

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend | Next.js 16.2.4 (App Router) | TypeScript, Tailwind CSS v4 |
| Database | Supabase (PostgreSQL) | Free tier to start |
| Auth | Supabase Auth | Email/password, server-component-protected routes |
| Storage | Supabase Storage | Photos, profile pictures, illustrations |
| Payments | Stripe | One-time purchases only for v1 |
| Hosting | Vercel | Hobby (free) until Stripe goes live, then Pro ($20/mo) |
| Email | Resend | Transactional — welcome, purchase confirmation, password reset |
| Version Control | GitHub | Every push auto-deploys to Vercel |

**Supabase project ID:** `sounaeycpausfxskctfm`

**CRITICAL: All keys live in `.env.local` — NEVER hardcode any key in any file ever.**

---

## Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=https://sounaeycpausfxskctfm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key        # server-side only, never expose to client
STRIPE_SECRET_KEY=your_stripe_secret_key               # server-side only
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_publishable_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
RESEND_API_KEY=your_resend_api_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000             # change to production URL on deploy
```

---

## Design System

### Colours
```css
--color-navy: #181831;      /* primary dark, backgrounds, text */
--color-blue: #0c4d86;      /* primary brand blue, CTAs */
--color-green: #51e74c;     /* accent green, highlights, success states */
--color-white: #ffffff;     /* page background */
```

### Typography
- **Font:** Encode Sans Expanded — load via Google Fonts
- **Weight:** Thin (100) and Light (300) preferred. Regular (400) for body copy. Never bold for headings.
- **Style:** Clean, minimal, airy. No chunky text anywhere.

### Aesthetic
- Clean, sleek, liquid glass style — frosted glass cards, subtle transparency, smooth shadows
- The Webflow homepage is the visual gold standard — match it across all pages
- Generous whitespace. No clutter. No dark mode.
- Illustrations: Figma SVGs stored in `/public/illustrations/`
- Photos: stored in Supabase Storage, fetched via URL
- Mobile first — design for mobile width first, then scale up

### Absolute Don'ts
- Never `alert()` — use toast notifications always
- No purple gradients
- No Inter, Roboto, or Arial fonts
- No generic thick-border card designs
- No dark mode
- No emoji in UI elements
- No hardcoded Supabase or Stripe keys anywhere

---

## Tailwind v4 — Important

This project uses **Tailwind CSS v4** which is CSS-first. There is NO `tailwind.config.js`.
All theme configuration goes in `globals.css` using `@theme`:

```css
@import "tailwindcss";

@theme {
  --color-navy: #181831;
  --color-blue: #0c4d86;
  --color-green: #51e74c;
  --font-sans: "Encode Sans Expanded", sans-serif;
}
```

Do NOT attempt to create or modify `tailwind.config.js` — it does not exist in v4.

---

## Development Commands

```bash
npm run dev      # start dev server at localhost:3000
npm run build    # production build
npm run start    # start production server
npm run lint     # run ESLint
```

Always run `npm run dev` in one terminal and Claude Code in a second terminal simultaneously.

---

## Project Structure

```
fix-it/
├── public/
│   ├── illustrations/           # Figma SVG exports
│   ├── images/                  # Static images
│   └── countries-110m.json      # GeoJSON for map component
├── app/                         # Next.js App Router (root level, NOT inside src/)
│   ├── (auth)/                  # Auth route group — navbar/footer hidden here
│   │   ├── layout.tsx           # Centered auth layout
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── change-password/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   ├── reset-password/page.tsx
│   │   └── verify-email/page.tsx
│   ├── auth/
│   │   └── callback/route.ts    # Supabase OAuth/email callback — exchanges code for session
│   ├── page.tsx                 # Homepage /
│   ├── universities/
│   │   ├── page.tsx             # /universities — list + search + filter
│   │   └── [slug]/page.tsx      # /universities/[slug] — dynamic, content gated
│   ├── countries/
│   │   ├── page.tsx             # /countries — interactive map + package tabs
│   │   └── [slug]/page.tsx      # /countries/[slug] — dynamic country page
│   ├── services/
│   │   ├── page.tsx             # /services — package overview + Stripe checkout
│   │   ├── [country]/[type]/page.tsx   # /services/[country]/country|documents
│   │   ├── scholarship/page.tsx        # /services/scholarship — browse all scholarships
│   │   └── scholarship/[id]/page.tsx   # /services/scholarship/[id] — scholarship detail
│   ├── profile/page.tsx         # /profile — protected, server-side redirect to /login
│   ├── api/
│   │   ├── stripe/webhook/route.ts
│   │   └── checkout/route.ts
│   ├── layout.tsx               # Root layout — NavbarWrapper + FooterWrapper + Toaster
│   ├── globals.css              # Global styles + Tailwind v4 theme
│   ├── error.tsx
│   └── not-found.tsx
├── components/
│   ├── ui/
│   │   └── RevealOnScroll.tsx   # Intersection Observer fade-in, directions: up/left/right/none
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── NavbarWrapper.tsx    # Hides Navbar on auth pages
│   │   ├── Footer.tsx
│   │   └── FooterWrapper.tsx    # Hides Footer on auth pages
│   ├── home/
│   │   ├── HeroSection.tsx
│   │   ├── EuropeHeroMap.tsx    # react-simple-maps interactive map (SSR disabled)
│   │   ├── CountryMarquee.tsx
│   │   ├── HomepageSearch.tsx
│   │   ├── ServicesTab.tsx
│   │   └── StatsCounter.tsx
│   ├── countries/
│   │   ├── CountriesInteractive.tsx
│   │   ├── CountryCarousel.tsx
│   │   ├── EuropeMap.tsx
│   │   ├── CountryPackageTabs.tsx
│   │   ├── DocumentsPackageTabs.tsx
│   │   ├── CountryPageClient.tsx
│   │   └── PhotoGallery.tsx
│   ├── universities/
│   │   ├── UniversityList.tsx
│   │   ├── FavouriteButton.tsx
│   │   └── ScholarshipTabs.tsx
│   ├── services/
│   │   ├── ServicesPageClient.tsx
│   │   ├── PackageDetailPage.tsx
│   │   ├── ScholarshipBrowse.tsx
│   │   ├── ScholarshipDetailPage.tsx
│   │   └── WishlistButton.tsx
│   └── profile/
│       ├── ProfilePageClient.tsx
│       └── Checklist.tsx        # localStorage-based, keyed per user ID
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   └── stripe.ts
├── types/
│   └── react-simple-maps.d.ts   # Type declarations for react-simple-maps
├── .env.local                   # Never commit
├── .gitignore                   # Must include .env.local and CLAUDE.md
└── CLAUDE.md                    # This file — never commit
```

**Auth protection:** There is no `middleware.ts`. Protected pages (`/profile`, `/change-password`) do their own server-side auth check and `redirect('/login')` if no session. This is correct for Next.js App Router — each protected server component is responsible for its own guard.

---

## Database Schema

### Content Structure — Read This First

Based on actual content documents, here is exactly how content is structured:

**University pages contain:**
- General description paragraph
- Ranking section (detailed, with specific rankings cited)
- Undergraduate courses in English (list with direct links to programme pages)
- Graduate courses in English (list with direct links)
- Admission requirements — EU students (array of requirement strings)
- Admission requirements — non-EU/extra-Schengen (array of requirement strings)
- Scholarship options (each named individually with description and eligibility)
- Accommodation options (each named individually with description)

**Country pages contain:**
- Tagline / headline
- Why this country (full persuasive section)
- Tuition fee ranges (public and private separately)
- Cost of living range
- Financial support / scholarship landscape
- Lifestyle section
- Career prospects
- City guide (multiple cities with what each is best for)
- List of recommended universities

**This structure is reflected exactly in the schema below.**

---

### Table: `countries`

```sql
create table countries (
  id                    uuid primary key default gen_random_uuid(),
  slug                  text unique not null,
  name                  text not null,
  flag_emoji            text,
  hero_image_url        text,
  home_list_image_url   text,

  -- FREE
  tagline               text,
  overview_free         text,
  tuition_range_public  text,
  tuition_range_private text,
  cost_of_living_range  text,

  -- COUNTRY PACKAGE
  why_this_country      text,
  lifestyle             text,
  finance               text,
  career                text,
  city_guide            jsonb,        -- [{city, description, best_for}]
  scholarship_overview  text,
  housing_overview      text,
  universities_list     text[],       -- slugs of recommended unis

  -- DOCUMENTS PACKAGE
  visa_process          text,
  document_checklist    jsonb,        -- [{step, description, required_docs[]}]
  moving_guide          text,
  bank_account_guide    text,
  arrival_tips          text,

  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);
```

---

### Table: `universities`

```sql
create table universities (
  id                        uuid primary key default gen_random_uuid(),
  slug                      text unique not null,
  name                      text not null,
  country                   text not null,
  country_slug              text not null,
  city                      text,
  type                      text,             -- "Public" or "Private"
  hero_image_url            text,
  gallery_image_urls        text[],

  -- FREE
  overview_free             text,
  quick_summary             text,
  tuition_range             text,
  tags                      text[],           -- for filtering
  ranking_summary           text,

  -- COUNTRY PACKAGE
  overview_full             text,
  ranking_full              text,
  undergraduate_courses     jsonb,            -- [{name, link?, language?}]
  graduate_courses          jsonb,            -- [{name, link?, language?}]
  admission_eu              jsonb,            -- [{requirement: string}]
  admission_non_eu          jsonb,            -- [{requirement: string}]
  accommodation             jsonb,            -- [{name, description, link?}]
  student_life              text,

  -- SCHOLARSHIP PACKAGE
  scholarships              jsonb,            -- [{name, description, amount?, eligibility, link?}]

  -- DOCUMENTS (country-level, shown briefly on uni page)
  visa_note                 text,

  created_at                timestamptz default now(),
  updated_at                timestamptz default now()
);
```

**Example `undergraduate_courses` jsonb:**
```json
[
  {"name": "Business Administration", "link": "https://www.luiss.it/...", "language": "English"},
  {"name": "Economics and Business", "link": "https://www.luiss.it/...", "language": "English"}
]
```

**Example `admission_eu` / `admission_non_eu` jsonb:**
```json
[
  {"requirement": "High school diploma with minimum GPA 8.5/10"},
  {"requirement": "English proficiency: IELTS 6.5 or equivalent"},
  {"requirement": "Pass the LUISS admission test"}
]
```

**Example `scholarships` jsonb:**
```json
[
  {
    "name": "LUISS Merit-Based Scholarship",
    "description": "Awarded to top-performing applicants based on academic results and admission test scores.",
    "amount": "Partial or full tuition waiver",
    "eligibility": "Top academic performers"
  }
]
```

**Example `accommodation` jsonb:**
```json
[
  {
    "name": "LUISS University Residences",
    "description": "Student residences near campuses with furnished rooms and shared facilities."
  }
]
```

---

### Table: `scholarships`

Standalone scholarships table — separate from the per-university `scholarships` jsonb. Used for the Scholarships browse/detail pages.

```sql
create table scholarships (
  id                uuid primary key default gen_random_uuid(),
  country_slug      text not null,
  country           text not null,
  name              text not null,
  description       text,
  amount            text,
  eligibility       text,
  deadline          text,
  link              text,
  university_slugs  text[],         -- which universities this scholarship applies to
  scholarship_type  text,           -- "merit", "need", "government"
  levels            text[],         -- ["Bachelor", "Master", "Doctorate"]
  created_at        timestamptz default now()
);
```

---

### Table: `deadlines`

```sql
create table deadlines (
  id              uuid primary key default gen_random_uuid(),
  university_id   uuid references universities(id) on delete cascade,
  label           text not null,    -- "Application Opens", "Application Deadline", "Results Released"
  date            date not null,
  year            int not null,
  notes           text,
  link            text,             -- direct link to application portal
  created_at      timestamptz default now()
);
```

---

### Table: `personal_deadlines`

User-created deadlines in the calendar. Stored per-user in Supabase (not localStorage).

```sql
create table personal_deadlines (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid references profiles(id) on delete cascade,
  label     text not null,
  date      date not null,
  notes     text,
  color     text default '#51e74c',
  created_at timestamptz default now()
);

alter table personal_deadlines enable row level security;
create policy "Users manage own personal deadlines" on personal_deadlines using (auth.uid() = user_id);
```

**Calendar colour preferences** (per-country and per-date) are stored in `localStorage` as cosmetic-only data — no Supabase table needed.

---

### Table: `profiles`

```sql
create table profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  email               text,
  full_name           text,
  user_type           text,             -- future use (student, parent, alumni, etc.)
  avatar_url          text,
  stripe_customer_id  text,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
```

---

### Table: `favorites`

Note: American spelling (`favorites`, not `favourites`). Uses `item_slug` (text) rather than a UUID foreign key, so it can favourite any slugged item.

```sql
create table favorites (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references profiles(id) on delete cascade,
  item_slug       text not null,
  status          text,             -- "Researching", "Planning to apply", "Applied", "Got in!"
  notes           text,
  created_at      timestamptz default now(),
  unique(user_id, item_slug)
);
```

---

### Table: `wishlist`

Packages a user has added to their wishlist (before or instead of purchasing).

```sql
create table wishlist (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references profiles(id) on delete cascade,
  package_type    text not null,    -- "country", "scholarship", "documents"
  country_slug    text not null,
  country         text not null,
  created_at      timestamptz default now(),
  unique(user_id, package_type, country_slug)
);
```

---

### Table: `purchases`

```sql
create table purchases (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid references profiles(id) on delete cascade,
  package_type        text not null,      -- "country", "scholarship", "documents"
  country             text not null,
  country_slug        text not null,
  stripe_payment_id   text,
  created_at          timestamptz default now(),
  unique(user_id, package_type, country_slug)
);
```

---

### Table: `posts` (Community — Stories, Questions, Answers)

Not yet built. Schema for future implementation:

```sql
create table posts (
  id              uuid primary key default gen_random_uuid(),
  university_id   uuid references universities(id) on delete cascade,
  user_id         uuid references profiles(id) on delete set null,
  type            text not null,      -- "story", "question", "answer"
  parent_id       uuid references posts(id) on delete cascade,
  author_name     text,
  programme       text,
  year_attended   text,
  content         text not null,
  is_approved     boolean default false,
  is_free         boolean default true,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);
```

---

### Table: `messages`

Not yet built. Schema for future implementation:

```sql
create table messages (
  id              uuid primary key default gen_random_uuid(),
  sender_id       uuid references profiles(id) on delete cascade,
  recipient_id    uuid references profiles(id) on delete cascade,
  post_id         uuid references posts(id) on delete set null,
  content         text not null,
  is_read         boolean default false,
  created_at      timestamptz default now()
);
```

---

### Table: `notifications`

Not yet built. Schema for future implementation:

```sql
create table notifications (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references profiles(id) on delete cascade,
  type            text not null,    -- "deadline_approaching", "message_received", "post_answered"
  message         text not null,
  link            text,
  is_read         boolean default false,
  created_at      timestamptz default now()
);
```

---

## Row Level Security (RLS)

Enable RLS on ALL tables:

```sql
-- profiles
alter table profiles enable row level security;
create policy "Users view own profile" on profiles for select using (auth.uid() = id);
create policy "Users update own profile" on profiles for update using (auth.uid() = id);

-- favorites
alter table favorites enable row level security;
create policy "Users manage own favorites" on favorites using (auth.uid() = user_id);

-- wishlist
alter table wishlist enable row level security;
create policy "Users manage own wishlist" on wishlist using (auth.uid() = user_id);

-- purchases
alter table purchases enable row level security;
create policy "Users view own purchases" on purchases for select using (auth.uid() = user_id);

-- scholarships — public read
alter table scholarships enable row level security;
create policy "Public read scholarships" on scholarships for select using (true);

-- notifications
alter table notifications enable row level security;
create policy "Users view own notifications" on notifications for select using (auth.uid() = user_id);
create policy "Users update own notifications" on notifications for update using (auth.uid() = user_id);

-- messages
alter table messages enable row level security;
create policy "Users see own messages" on messages for select using (auth.uid() = sender_id or auth.uid() = recipient_id);
create policy "Users send messages" on messages for insert with check (auth.uid() = sender_id);

-- universities, countries, deadlines — public read
alter table universities enable row level security;
create policy "Public read universities" on universities for select using (true);

alter table countries enable row level security;
create policy "Public read countries" on countries for select using (true);

alter table deadlines enable row level security;
create policy "Public read deadlines" on deadlines for select using (true);

-- posts — approved posts public
alter table posts enable row level security;
create policy "Public read approved posts" on posts for select using (is_approved = true);
create policy "Users create posts" on posts for insert with check (auth.uid() = user_id);
```

---

## Content Gating

Content is NEVER sent to client unless user has purchased the package. Omit from server response entirely — do NOT hide with CSS.

```typescript
// Always in a server component
const { data: purchases } = await supabase
  .from('purchases')
  .select('package_type, country_slug')
  .eq('user_id', user?.id ?? '')

const hasCountryPackage = purchases?.some(
  p => p.package_type === 'country' && p.country_slug === university.country_slug
) ?? false

const hasScholarshipPackage = purchases?.some(
  p => p.package_type === 'scholarship' && p.country_slug === university.country_slug
) ?? false

const hasDocumentsPackage = purchases?.some(
  p => p.package_type === 'documents' && p.country_slug === university.country_slug
) ?? false
```

**Free (all users):** overview_free, quick_summary, tuition_range, tags, ranking_summary, visa_note

**Country package:** overview_full, ranking_full, all courses + links, admission requirements, accommodation, student_life

**Scholarship package:** scholarships jsonb (per university) + scholarships table rows (per country)

**Documents package:** country visa_process, document_checklist, moving_guide, bank_account_guide, arrival_tips

---

## Auth Flow

Auth is handled at the page level — there is no Next.js middleware file. Protected server components check the session themselves:

```typescript
// Example: app/profile/page.tsx
const { data: { user } } = await supabase.auth.getUser()
if (!user) redirect('/login')
```

The `app/auth/callback/route.ts` handles both OAuth and email magic-link/recovery flows — it exchanges the code for a session and redirects to `/profile` (normal login) or `/reset-password` (password recovery).

On signup: Supabase trigger auto-creates a `profiles` row.

---

## Stripe Integration

```typescript
// app/api/checkout/route.ts — creates a Stripe Checkout session
const PRICES: Record<string, { amount: number; label: string }> = {
  country:     { amount: 799,  label: 'Country Guide' },
  scholarship: { amount: 599,  label: 'Scholarship Guide' },
  documents:   { amount: 399,  label: 'Documents & Relocation' },
}
```

```typescript
// app/api/stripe/webhook/route.ts — writes to purchases table on payment success
if (event.type === 'checkout.session.completed') {
  const { user_id, package_type, country_slug, country } = session.metadata!
  // service role bypasses RLS
  await supabase.from('purchases').insert({ user_id, package_type, country, country_slug, stripe_payment_id })
}
```

---

## Favourites — FavouriteButton Pattern

Table is `favorites` (American spelling). Stores `item_slug` (text), not a university UUID.

```typescript
// Optimistic toggle
const prev = favourited
setFavourited(!prev)

if (prev) {
  const { error } = await supabase.from('favorites').delete().eq('item_slug', slug).eq('user_id', user.id)
  if (error) { setFavourited(prev); toast.error('Something went wrong') }
  else toast.success('Removed from favourites')
} else {
  const { error } = await supabase.from('favorites').insert({ item_slug: slug, user_id: user.id })
  if (error) { setFavourited(prev); toast.error('Something went wrong') }
  else toast.success('Saved to favourites!')
}
```

---

## Toast Notifications

Use `sonner`. Add `<Toaster />` to root layout once. Use everywhere:

```typescript
import { toast } from 'sonner'
toast.success('Saved!')
toast.error('Please log in first')
```

**Never `alert()`. Never `confirm()`. Never `prompt()`.**

---

## Profile Dashboard Features

1. **Favourited universities** — grid with status tracking (Researching / Planning to apply / Applied / Got in!), notes per university, compare modal (up to 3 unis)
2. **Checklist** — 7 hardcoded application items, stored in `localStorage` keyed by user ID (not Supabase). No database table needed.
3. **Wishlist (Guides tab)** — packages the user has saved but not yet purchased, links to checkout
4. **Deadline calendar** — fully built. Shows deadlines from purchased country packages + user's personal deadlines. Features: month navigation with pop-in animations, click any date to add a personal deadline (pre-filled), click a deadline date to view details and pick a colour, per-country and per-date colour overrides (stored in `localStorage`), personal deadlines stored in `personal_deadlines` Supabase table (add / edit / remove with optimistic updates).
5. **Profile picture** — not built yet
6. **Notifications bell** — not built yet

---

## Countries Covered (10)

Spain, Austria, Slovenia, Hungary, Netherlands, United Kingdom, Germany, Italy, France, Greece

Schema supports unlimited countries — just add rows.

---

## Shared Components

**Navbar** — logo, Countries, Universities, Scholarships, Services nav links; Login/Profile avatar; mobile hamburger. Hidden on auth pages via NavbarWrapper.

**Footer** — logo, nav links, social links, copyright, GDPR notice. Hidden on auth pages via FooterWrapper.

Both in `components/layout/`, imported once in `app/layout.tsx` via their wrapper components.

---

## Community System

Not yet built. When built:

Posts table handles everything:
- `type: "story"` — alumni experience
- `type: "question"` — user asks something  
- `type: "answer"` — reply (has parent_id)

All posts moderated (`is_approved = true`) before showing. Messages between users stay on platform via `messages` table. No email communication.

---

## Build Order

1. ✅ Next.js project setup
2. ✅ Dependencies: supabase, stripe, sonner, resend, react-simple-maps
3. ✅ Supabase client setup (client.ts + server.ts)
4. ✅ Auth protection — server-component-level redirects, Supabase auth callback route
5. ✅ Database schema — countries, universities, scholarships, profiles, favorites, wishlist, purchases, deadlines
6. ✅ Shared Navbar + Footer (with auth-page wrappers)
7. ✅ Homepage — hero, map, country marquee, search, services tabs, stats counter
8. ✅ Universities list page + search + filter (country tabs, field/level/type filters)
9. ✅ Dynamic university page `/universities/[slug]` + content gating
10. ✅ Countries overview page — interactive map + package pitch tabs
11. ✅ Dynamic country page `/countries/[slug]` + content gating
12. ✅ Auth pages — login, signup, change-password, forgot-password, reset-password, verify-email
13. ✅ Favourites — heart toggle, optimistic updates, status tracking, notes, compare modal
14. ✅ Profile dashboard — favourites grid, checklist (localStorage), wishlist (guides tab)
15. ✅ Services page + package detail pages (`/services/[country]/[type]`)
16. ✅ Stripe webhook handler
17. ✅ Scholarships browse + detail pages (`/services/scholarship`, `/services/scholarship/[id]`)
18. ✅ Deadline calendar — personal deadlines (`personal_deadlines` table), colour coding, add/edit/remove, click-to-add on any date
19. Messaging platform — user-to-user and/or alumni DMs via `messages` table
20. About page
21. Quiz redesign
22. Resend transactional emails (no more "via Supabase" sender)
23. GDPR cookie banner + Privacy / Terms pages
24. Stripe payments live
25. Notifications bell
26. Mobile audit
27. SEO — metadata, Open Graph, sitemap
28. Macedonian locale — Phase 2, NOT v1

---

## Seed Data

```sql
insert into countries (slug, name, flag_emoji, tagline, overview_free, tuition_range_public, tuition_range_private, cost_of_living_range) values
('italy', 'Italy', '🇮🇹', 'A European degree. Lower costs. Better life.', 'Italy offers world-class universities in historic cities with some of the lowest tuition fees in Western Europe.', '€300–€3,000/year', '€8,000–€16,000/year', '€700–€1,200/month'),
('germany', 'Germany', '🇩🇪', 'Tuition-free education in the heart of Europe.', 'Germany offers tuition-free public universities with strong industry connections.', '€0–€3,000/year (semester fees)', '€10,000–€20,000/year', '€800–€1,400/month'),
('netherlands', 'Netherlands', '🇳🇱', 'English-first education, global mindset.', 'The Netherlands leads Europe in English-taught programmes.', '€2,500–€4,000/year (EU)', '€8,000–€20,000/year', '€900–€1,500/month'),
('spain', 'Spain', '🇪🇸', 'Sun, culture, and serious academic credentials.', 'Spain combines vibrant city life with affordable education.', '€700–€3,000/year', '€8,000–€18,000/year', '€700–€1,100/month'),
('austria', 'Austria', '🇦🇹', 'Central Europe quality, at Central Europe prices.', 'Austria offers excellent public universities in stunning cities.', '€700–€1,500/year', '€8,000–€15,000/year', '€800–€1,300/month'),
('hungary', 'Hungary', '🇭🇺', 'Affordable, international, and underrated.', 'Hungary offers affordable tuition with a growing international student community.', '€2,000–€6,000/year', '€4,000–€10,000/year', '€500–€900/month'),
('slovenia', 'Slovenia', '🇸🇮', 'Europe''s hidden gem for international students.', 'Slovenia offers low costs and high quality of life.', '€3,000–€6,000/year', '€4,000–€8,000/year', '€600–€1,000/month'),
('uk', 'United Kingdom', '🇬🇧', 'World-class universities. Global recognition.', 'The UK is home to some of the world''s most prestigious universities.', '£9,000–£25,000/year', '£15,000–£40,000/year', '£900–£1,800/month'),
('france', 'France', '🇫🇷', 'World-class education at European prices.', 'France is home to some of Europe''s most prestigious institutions, with public universities offering world-class education at surprisingly low tuition fees.', '€170–€3,770/year', '€5,000–€20,000/year', '€900–€1,500/month'),
('greece', 'Greece', '🇬🇷', 'Ancient culture. Modern opportunities. Low costs.', 'Greece offers affordable education at established public universities, combined with one of Europe''s most affordable student lifestyles and a rich cultural experience.', '€1,500–€6,000/year', '€3,000–€8,000/year', '€600–€1,000/month');

insert into universities (slug, name, country, country_slug, city, type, overview_free, quick_summary, tuition_range, tags, ranking_summary) values
('luiss', 'LUISS Guido Carli', 'Italy', 'italy', 'Rome', 'Private', 'Located in the heart of Rome, LUISS is one of Italy''s top private universities, known for economics, business, law, and political science.', '#1 private university in Italy', '€12,000–€17,000/year', ARRAY['business','economics','law','political science'], '#1 large private university in Italy (CENSIS 2025/2026)'),
('bocconi', 'Bocconi University', 'Italy', 'italy', 'Milan', 'Private', 'Bocconi is Europe''s leading business school, consistently ranked among the best globally for economics, management, and finance.', 'Europe''s top business school', '€14,000–€28,000/year', ARRAY['business','economics','finance','management'], 'Top 20 globally for Corporate Finance (FT Rankings)'),
('sapienza', 'Sapienza University of Rome', 'Italy', 'italy', 'Rome', 'Public', 'One of the largest and oldest universities in Europe, Sapienza offers a vast range of programmes at very affordable tuition.', 'Largest university in Europe', '€900–€3,000/year', ARRAY['sciences','humanities','medicine','law','engineering'], 'Top 200 globally (QS 2026)'),
('bologna', 'University of Bologna', 'Italy', 'italy', 'Bologna', 'Public', 'Founded in 1088, Bologna is the world''s oldest university and offers a classic European academic experience.', 'The world''s oldest university', '€400–€3,000/year', ARRAY['humanities','sciences','law','engineering'], 'Top 200 globally (QS 2026)'),
('padova', 'University of Padova', 'Italy', 'italy', 'Padova', 'Public', 'Founded in 1222, University of Padova is one of Europe''s most prestigious public research universities, home to Galileo Galilei.', '#233 globally (QS 2026)', '€400–€2,500/year', ARRAY['sciences','engineering','medicine','economics'], '#233 QS World University Rankings 2026');
```

---

## Critical Rules — Non-Negotiable

1. **Never `alert()` or `confirm()` or `prompt()`** — always sonner toasts
2. **Never hardcode any key** — always `.env.local`
3. **Never build static pages for universities or countries** — always `[slug]` dynamic routes
4. **Never send gated content to client** — omit from server response, not CSS hidden
5. **Never trust client for payment verification** — always webhook + purchases table
6. **Never `sudo npm install`** — causes Mac permission issues
7. **Always use server Supabase client in server components and API routes**
8. **Always handle loading states** — skeleton/pulse placeholders, never blank flashes
9. **Always handle null/empty content gracefully** — content added independently of build
10. **Always commit after each working feature** — clear messages, push to GitHub
11. **Mobile first** — build and test mobile width first
12. **App Router at root level** — `app/` not `src/app/`; no `middleware.ts`, auth is page-level

---

## Notes for Claude Code

- Mila is the user — non-technical, explain big decisions in plain language before making them
- Always ask before making architectural changes not covered in this document
- Webflow export is reference only — use for visual/CSS inspiration, never copy HTML directly
- When a feature is complete, tell Mila what was built and what to test at localhost:3000
- This is a real product for real users — quality matters, no shortcuts on UX or error handling
- Tailwind v4 — no tailwind.config.js, CSS-first @theme in globals.css
- Content is added by research team independently — always handle missing/null fields gracefully
