# RaLaEX v2

A household finance app I built for my wife and me. We share one login, both of us log income and spending from our phones, and the dashboard shows where the month's money went and how much of each budget is left. The UI is in Indonesian because that's who uses it.

It's a PWA rather than a native app so it installs on both phones and works on the laptop too, with nothing to publish to an app store.

<p>
  <img src="docs/dashboard.png" alt="Dashboard on desktop" width="72%">
  <img src="docs/mobile.png" alt="Dashboard on a phone" width="22%">
</p>

<sub>Screenshots from a local run against the Supabase CLI stack, with made-up data.</sub>

## What it does

- Income and expense lists with search, category and date filters, plus a quick-add modal from anywhere in the app.
- Receipt photos (JPG, PNG, WebP, HEIC) attached to a transaction, stored in a private Supabase Storage bucket.
- Dashboard for this week, this month, this year or a custom range: totals, spending per category, an income vs spending trend and a 6-month comparison.
- Weekly or monthly budgets per category. An expense that pushes a budget past 80% or 100% writes a notification, and the dashboard shows a banner.
- Recurring transactions (salary, internet bill) on a weekly or monthly schedule.
- Categories with their own icon and color.
- Export to Excel, CSV or PDF, and a yearly cleanup page that lets you download a year before deleting it.
- Installable as a PWA.

## How it works

- Next.js App Router. The pages are mostly client components that query Supabase directly with the public anon key. Row Level Security on every table only lets an authenticated session in.
- Login is a server action. The username is turned into `<username>@ralaex.app` and signed in with Supabase Auth, so the household only has to remember a short name.
- `middleware.ts` refreshes the session cookie on each request and sends logged-out visitors to `/login`.
- The notification bell listens on a Supabase Realtime channel for new rows in `notifications`.
- Two routes under `src/app/api/` are meant for Vercel Cron (`vercel.json`): one posts due recurring transactions, the other reminds me once a year to back up old data. Both check a `CRON_SECRET` bearer token.

## Stack

Next.js 16, React 19, TypeScript, Supabase (Postgres, Auth, Storage, Realtime) through `@supabase/ssr`, Recharts, SheetJS and jsPDF for exports, lucide-react icons, plain CSS. Hosted on Vercel.

## Run it

You need Node 20.9 or newer and a Supabase project (the free tier is enough).

```bash
git clone https://github.com/ramaraihan12/ralaexV2.0 ralaex
cd ralaex
npm ci
cp .env.example .env.local
npm run dev
```

Then open http://localhost:3000.

| Variable | What it is |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL from Supabase, Project Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | The anon (public) key from the same page |
| `CRON_SECRET` | Any long random string. Only the cron routes use it |

### Database

1. In the Supabase SQL Editor, run `database-setup.sql`. It creates the five tables, RLS policies, `updated_at` triggers and the private `receipts` bucket.
2. Under Authentication > Users, add a user with the email `yourname@ralaex.app` and a password. Log in with `yourname`.
3. Turn off public sign-ups in the Auth settings. The policies trust any logged-in user, so nobody else should be able to create one.
4. For the live notification bell, enable Realtime on the `notifications` table (Database > Publications). Without it the list still loads, it just doesn't update on its own.

To try it without a cloud project, the Supabase CLI works too (needs Docker):

```bash
npx supabase init
npx supabase start
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -f database-setup.sql
npx supabase status -o env   # API_URL and ANON_KEY go into .env.local
```

Add the user in Studio at http://127.0.0.1:54323 the same way as above.

## Tests

```bash
npm test
```

The tests cover the date and currency helpers, the budget range and alert logic, and the recurring next-date calculation. CI runs lint, the tests and a production build. Lint and build are also worth running:

```bash
npm run lint
npm run build
```

`next build` prerenders pages, so it needs the two `NEXT_PUBLIC_SUPABASE_*` variables set. Dummy values are fine for a build check.

## Notes

- One shared account is on purpose. It keeps the app simple, but it also means RLS is "logged in or not". Multi-user data separation would need a `user_id` column and per-user policies.
- The cron routes don't do their job yet. The middleware redirects them to `/login`, and even past that they use the anon key, which RLS blocks without a session. They need an `/api` exclusion and a service-role client. Until then, recurring items won't post on their own.
- `xlsx` is the old 0.18.5 build from npm, which has open advisories. SheetJS now ships fixed versions from its own CDN, so that's the next dependency to swap.
- Tests only cover the pure helpers. The hooks and components that talk to Supabase have none.
## License

MIT
