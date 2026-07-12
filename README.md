# EcoVest — Portfolio Greenifier

EcoVest is a simulated stock/ETF trading account that analyzes your portfolio and proposes an explainable reallocation toward clean-energy equities and green bonds, with a full return/risk comparison and Gemini-powered natural-language insights. Built for a hackathon spanning the Bloomberg (FinTech), OneEthos (Clean Energy), and Google Gemini API tracks.

**This is a paper-trading simulation only. There is no real brokerage connection, no real money, and no real order routing anywhere in this app.** Every account starts with $10,000 in simulated cash, every trade fills instantly at a mock listed price, and every screen that shows a balance is labeled as simulated.

Live deployment: see your team's Vercel project URL. Full deploy walkthrough (Supabase setup + Vercel env vars) is in [`DEPLOYMENT.md`](./DEPLOYMENT.md).

## Concept

1. Sign up with an email and password. Your account starts with $10,000 in simulated cash.
2. Right after your first sign-up, a one-time **Create Your Profile** step asks for your first name, last name, and which clean-energy areas you care about (Solar, Wind, EV & Battery, Sustainable Agriculture, Water & Conservation, Green Real Estate, Hydrogen). This personalizes the rest of the app.
3. From your Account page, click **Try Sample Portfolio** to instantly buy into a pre-built 13-holding portfolio, or head to **Browse** to buy and sell any of the 19 mock stocks/ETFs yourself — including a **Recommended For You** row matching your stated interests and a **Watchlist** row surfacing holdings worth a second look (high clean-energy score, low score, or high volatility).
4. The Browse table is sortable by ticker, trend, sector, price, clean-energy score, and shares held. Each stock's detail page has a price chart with a 1D/3D/1W/3M/6M/1Y/YTD range selector.
5. Every buy/sell fills instantly at the dataset's listed mock price (with quick-quantity presets — 5/10/100 shares, or "All" on a sell), updates your cash balance and holdings in real time, and is recorded in your transaction history. Buying a top-tier clean-energy stock or ETF (marked 🌱 Bonus) also earns a small simulated cash bonus on the spot — click the badge to see the exact rate before you buy.
6. Hold a portfolio that's at least 80% clean-energy by value (holdings scoring 8+/10) and you unlock a **4.50% Green Portfolio APY** — advertised on the landing page and tracked with a progress banner on your Account page until you get there.
7. The Dashboard analyzes your current holdings: sector breakdown, weighted expected return, weighted volatility, and a weighted clean-energy/ESG score (1–10).
8. A simple, explainable algorithm proposes a reallocation — trimming your lowest clean-energy-score holdings and shifting that capital into top-scoring clean-energy equities/ETFs and a green bond proxy, while capping any single sector's weight. When two candidate holdings score similarly, the one matching your stated interests gets a slightly larger share of the freed capital.
9. Click **Apply Reallocation** and the app translates the suggested move directly into a batch of sell-then-buy orders, executed through the exact same trade engine as any manual trade.
10. Gemini API calls generate: (a) plain-English ESG summaries for the 2–3 flagged (trimmed) holdings, based on a mock sustainability report excerpt, and (b) a one-paragraph rationale explaining why the reallocation was suggested.
11. A chat panel lets you ask Gemini free-form questions about any holding — grounded in the same dataset (sector, score, return, volatility, sustainability notes, and your current position size) shown on the dashboard.
12. A global search (in the header, once signed in) jumps straight to any page or feature — dashboard, browse, a specific holding, the chat panel, and more.
13. Forgot your password? The login page has a **Forgot password?** link that emails a one-hour, single-use reset link (via Resend) to set a new one — no security questions, no support ticket.

## Tech stack

- **Framework:** Next.js 14 (App Router), single deployable app — API routes handle all backend logic. Deployed on Vercel.
- **Styling:** Tailwind CSS. A navy/green/white fintech palette on functional screens (dashboard, account, browse), and a warmer "forest" theme (hand-drawn treeline silhouettes, sway-leaf accents, soft green gradients) on the marketing-facing pages — Landing, About, Features, FAQ.
- **Charts:** Recharts (donut chart for sector breakdown, radial gauge for clean-energy tilt, bar chart for return/risk, area chart with range selector for stock price history).
- **AI:** Google Gemini, called via **Vertex AI** (`@google/genai`) rather than a plain Gemini Developer API key — used for ESG summarization, reallocation rationale, and the grounded chat assistant. All three are live API calls, no hardcoded responses. Vertex AI auth accepts either a service-account JSON file path (local dev) or the entire JSON key inlined as one env var (required on Vercel, which has no persistent filesystem to point a file path at) — see `lib/gemini.ts`.
- **Data:** Static JSON dataset of 19 stocks/ETFs/bonds (`data/holdings.json`), each with ticker, name, sector, historical average return, volatility, a 1–10 clean-energy/ESG score, one or more interest tags drawn from the same 7-category list used on the profile page, a mock 2–3 paragraph sustainability report excerpt, and a mock trading price. Price history charts are a deterministic seeded random walk (`lib/priceHistory.ts`), not real market data.
- **Auth:** A lightweight custom email/password system — bcrypt-hashed passwords, JWT session tokens (`jose`) in an httpOnly cookie, and route protection via Next.js middleware. No NextAuth or Supabase Auth; the whole auth surface lives in two small files (`lib/auth.ts` for password hashing, `lib/session.ts` for the JWT/cookie logic).
- **Database:** Supabase (hosted Postgres, accessed via `@supabase/supabase-js`). User accounts, positions, and transaction history all live here so the app works the same locally and on Vercel — Vercel's serverless functions have no persistent filesystem, so an earlier `node:sqlite`-based version only worked for local dev. Row Level Security is enabled on every table with **no public policies**; all access goes through the service-role key from server-side API routes only (`lib/supabaseAdmin.ts` → `lib/db.ts`), since the app keeps its own custom auth instead of Supabase Auth. Schema lives in [`supabase/schema.sql`](./supabase/schema.sql).
- **Email:** [Resend](https://resend.com) (`resend` npm package, `lib/email.ts`) sends the forgot-password reset link. A reset request generates a random token, stores only its SHA-256 hash + a 1-hour expiry on the user row, and emails a link containing the raw token — the same "never store the secret itself" pattern used for passwords.

## Project structure

```
app/
  page.tsx                    Public marketing landing page (forest theme)
  about/page.tsx              GROW acronym (Green Return On Wealth) brand story
  features/page.tsx           Interactive, animated feature showcase
  faq/page.tsx                 Frequently asked questions
  login/, signup/             Auth pages
  forgot-password/page.tsx    Request a password reset link by email
  reset-password/page.tsx     Set a new password from an emailed reset token
  profile/page.tsx             One-time "Create Your Profile" onboarding (name + interests)
  account/page.tsx            Cash balance, holdings, Try Sample Portfolio, Green Portfolio APY status
  browse/page.tsx             Sortable buy/sell table, Recommended For You, Watchlist
  stock/[ticker]/page.tsx     Stock detail — price chart with range selector, buy/sell
  transactions/page.tsx       Transaction history table
  dashboard/page.tsx          Sector/return/risk/reallocation dashboard + chat
  api/
    auth/signup, login, logout    Account creation & session cookie
    auth/forgot-password/route.ts Generate + email a password reset token
    auth/reset-password/route.ts  Validate the token and set a new password
    account/route.ts              Current account summary (cash, positions, value, profile)
    profile/route.ts              Save/load first name, last name, interest tags
    trade/route.ts                Manual buy/sell — the core trade execution path
    transactions/route.ts         Transaction history
    portfolio/sample/route.ts     Liquidate + buy into the sample portfolio
    reallocation/apply/route.ts   Recompute + execute the suggested reallocation as trades
    esg-summary/route.ts          Gemini: summarize a holding's sustainability excerpt
    rationale/route.ts            Gemini: explain the reallocation
    chat/route.ts                 Gemini: grounded Q&A chatbot
middleware.ts                 Protects /account, /browse, /stock, /transactions, /dashboard, /profile
components/                   Dashboard UI, auth-aware header + global search, trade modal,
                               bonus badge popover, Green Portfolio APY banner, landing page,
                               forest-theme decorations (silhouette, leaf icons)
lib/
  types.ts                    Shared TypeScript types + INTEREST_CATEGORIES list
  reallocation.ts             Portfolio metrics + reallocation algorithm (interest-aware)
  trade.ts                    executeTrade() — the one execution path every trade uses
  bonus.ts                    Clean-Energy Buy Bonus eligibility rule — shared by server + client
  apy.ts                      Green Portfolio APY eligibility (80% green by value -> 4.50% APY)
  priceHistory.ts             Deterministic seeded price-history + range-selector generator
  searchIndex.ts               Static index of pages/features powering global search
  db.ts                       Supabase-backed users/positions/transactions store (async)
  supabaseAdmin.ts             Server-only Supabase client (service-role key, bypasses RLS)
  auth.ts                     Password hashing (bcrypt) — Node-only, route handlers only
  session.ts                  JWT sign/verify + cookie helpers — edge-safe, used by middleware too
  gemini.ts                   Gemini (Vertex AI) client wrapper
  email.ts                    Resend client wrapper — sends the password reset email
data/
  holdings.json                19 mock stocks/ETFs/bonds with ESG scores, interest tags, excerpts, and prices
  samplePortfolio.json          Pre-built sample portfolio weights
supabase/
  schema.sql                   Postgres schema (users, positions, transactions) — run once per Supabase project
```

## Running locally

Requires Node 18.17+ (Next.js 14) and a free [Supabase](https://supabase.com) project.

```bash
npm install
cp .env.local.example .env.local   # fill in your Supabase + Gemini/Vertex AI values, and a random AUTH_SECRET
npm run dev
```

Before your first run, open your Supabase project's SQL Editor and run the entire contents of `supabase/schema.sql` once (safe to re-run). See `.env.local.example` for exactly which values go where, and [`DEPLOYMENT.md`](./DEPLOYMENT.md) for the full walkthrough (including Vercel deployment).

Open http://localhost:3000, sign up with any email/password (8+ characters), fill out the one-time **Create Your Profile** step (name + at least one clean-energy interest), then use **Try Sample Portfolio** on the Account page for the fastest path to a full dashboard.

Without Gemini/Vertex AI credentials set, everything else still works fully — trading, the dashboard, and the reallocation math are all local; only the three Gemini-powered panels (ESG insight cards, rationale, chat) will show a message asking you to set up credentials.

To build for production: `npm run build && npm run start`.

### Working with teammates / forks

`.env.local` is intentionally gitignored — it holds live secrets (Supabase service-role key, Gemini/Vertex service-account key, session secret) and should never be committed. Share its contents with teammates directly (Slack/DM, not GitHub) so everyone points at the same Supabase project. If your `npm run dev` shows `Unexpected token '<', "<!DOCTYPE "` on signup/login, it almost always means `.env.local` is missing or `npm install` hasn't been run since the Supabase migration — see the checklist in `DEPLOYMENT.md`.

## How EcoVest addresses each sponsor track

### Bloomberg — FinTech
This isn't just charts on top of a green theme — it's a working (simulated) brokerage: real account balances, real buy/sell execution against listed prices with quick-quantity presets, a sortable market browser with trend indicators and a watchlist, per-stock price charts with a multi-range selector, a transaction ledger, and a weighted return/volatility model with a full before/after benchmark. Every trade — manual or via "Apply Reallocation" — runs through the exact same `executeTrade()` function in `lib/trade.ts`, so cash, positions, and history stay consistent no matter where a trade originates. Overselling and overspending are blocked with clear error messages, and the reallocation math is a simple, explainable weighted average — not a black box. The whole app is deployed on Vercel with a real hosted Postgres database (Supabase) backing it, not a local-only demo.

### OneEthos — Clean Energy
Every holding carries an explicit clean-energy/ESG score, and the dashboard's headline gauge is a "Clean-Energy Tilt Score" comparing current vs. suggested portfolios. "Apply Reallocation" doesn't just suggest a change — it executes it, moving real (simulated) capital out of low-scoring fossil-fuel holdings like Exxon and Chevron and into clean-energy equities (ENPH, FSLR, TAN, ICLN) and a green bond proxy (BGRN), with the actual dollar amount shifted shown live on the dashboard. Personalization is layered on top, not bolted on: the one-time profile step captures which clean-energy areas the user actually cares about, which drives a "Recommended For You" list and Watchlist on Browse and acts as a soft tiebreaker in the reallocation math itself. Two direct, felt incentives reward going green rather than only reacting to an algorithm's suggestion: a **Clean-Energy Buy Bonus** (2% simulated cash on qualifying buys) and a **Green Portfolio APY** (4.50% once 80%+ of portfolio value is in 8+/10-scoring holdings) — both advertised up front (landing page, account page) rather than hidden.

### Google Gemini — Best use of the Gemini API
Gemini is used in three distinct, visible ways, called via Vertex AI (`lib/gemini.ts`):
- `POST /api/esg-summary` — summarizes a holding's mock sustainability report excerpt into a plain-English clean-energy fit explanation.
- `POST /api/rationale` — generates a one-paragraph, numbers-grounded explanation of why the reallocation was suggested.
- `POST /api/chat` — a free-form Q&A assistant, grounded in the exact holdings data and position sizes shown on the dashboard, so it won't answer from generic knowledge about a company.

## Reallocation logic, in plain terms

1. Rank current holdings by clean-energy/ESG score.
2. Trim 40% of the weight from the bottom-quartile scorers (lowest ESG scores).
3. Build the target list: a preferred set of high-scoring clean-energy equities/ETFs (ICLN, FSLR, ENPH, TAN, NEE), a green bond proxy (BGRN), plus any other dataset holding that scores 7+ **and** matches one of the user's stated interests from their profile.
4. Distribute the freed-up weight across that target list, weighted by ESG score — with a small fixed boost applied to interest-matching holdings, so when two candidates score similarly, the one aligned with the user's interests gets a slightly larger share. This never overrides the ESG ranking itself, only how freed capital is split among already-qualified targets.
5. If any sector would exceed 35% of the portfolio after step 4, scale that sector back down and redistribute the overflow into the target list (same interest-aware weighting) — preserving reasonable diversification.
6. Recompute portfolio-level expected return, volatility, and clean-energy score as weighted averages of the (now normalized) holdings.
7. On "Apply Reallocation," the server re-derives this same calculation from your live positions and profile interests (never trusting client-supplied amounts), converts each weight change into whole shares at the listed price, and executes sells before buys through the trade engine.

This is a simplified, explainable model — it uses weighted averages rather than a full covariance-based risk model, by design, so every figure can be explained on the spot. All return/risk/price figures are illustrative and simulated for demo purposes — this is not investment advice.

## Clean-Energy Buy Bonus

A small, Robinhood-style incentive layered on top of the core simulation: buying shares of a holding scoring 8+/10 on clean-energy (`GREEN_BONUS_MIN_SCORE` in `lib/bonus.ts`) instantly credits a 2% simulated cash bonus (`GREEN_BONUS_PERCENT`) on top of the trade, recorded as its own `BONUS` row in transaction history. It applies uniformly through `executeTrade()`, so it fires the same way whether the buy came from a manual order, the sample-portfolio loader, or "Apply Reallocation" — never from a sell, and never invented client-side (the server computes and credits it). Eligible holdings are marked with a 🌱 Bonus badge on Browse and the stock detail page; clicking the badge opens a popover showing the exact bonus rate before you buy — like Robinhood surfacing which stock you'll get before you complete an action, the incentive is visible up front, not a hidden surprise. This is still simulated cash; nothing here is a real reward or real money.

## Green Portfolio APY

A second, portfolio-level incentive on top of the per-trade bonus: once at least 80% of your holdings' total value is in stocks/ETFs scoring 8+/10 on clean-energy (`GREEN_APY_MIN_SHARE`/`GREEN_APY_MIN_SCORE` in `lib/apy.ts`), the account becomes eligible for a simulated **4.50% APY** (`GREEN_APY_RATE`) — rewarding sustained green allocation, not just individual green purchases. Eligibility is computed live from your current positions and the dataset's ESG scores (`computeGreenApyStatus()`), and surfaced in two places: a banner on the Account page (showing your current green share and progress toward 80% if you haven't hit it yet, or a celebratory eligible state if you have) and a dedicated section on the landing page advertising the incentive to signed-out visitors. Like the buy bonus, this is simulated only — no real yield is paid on any real asset.
