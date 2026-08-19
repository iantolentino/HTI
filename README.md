# LevelUp Daily

LevelUp Daily is a mobile-first habit tracker for building consistent routines. Users add real-life habits, complete them each day, earn experience points, level up, unlock visual palettes, and review their progress over time. The interface is designed for a 375px phone viewport first and scales up for larger screens.

## How the app works

1. Create an account with an email, password, display name, and timezone. Passwords are stored as bcrypt hashes and authentication uses NextAuth Credentials.
2. Complete the short onboarding quiz. Your answers activate the most relevant starter habits instead of presenting an empty dashboard.
3. Open the Dashboard each day. Active habits are grouped by category and show their current target, completion state, and EXP value.
4. Tap Complete, or swipe a task from left to right. A task can only award EXP once per user and local calendar day. A left swipe removes the habit from the active list; tap controls remain available as an accessible fallback.
5. Earn EXP toward the next level. Progressive habits scale their target with your level, while static habits award a fixed amount. Combo bonuses, streaks, perfect-week rewards, badges, and the EXP vault reward consistency without requiring a perfect record.
6. Spend your progress on rewards. Level milestones unlock palettes. Select an unlocked palette from Rewards, or use the independent dark-mode switch in Settings. Palette colors are CSS custom properties, so the app changes immediately without a rebuild.
7. Review Analytics for the 365-day contribution heatmap, category heatmaps, EXP trends, category balance, streaks, best day, and data export.

Missed days are recorded honestly but presented gently. A grace period protects early streaks, and returning after a gap shows a welcome-back summary instead of punitive copy.

## Main screens

- Landing: product overview with Login and Register actions.
- Dashboard: today's active habits, EXP progress, level title, streak, growth percentage, recap cards, and quick add.
- Onboarding: a one-time preference quiz that selects starter habits.
- Library: search and filter the habit catalog by category and difficulty, view the reason a habit is useful, add individual habits or curated stacks, and customize an icon, unit, or progressive target.
- Analytics: contribution heatmaps, monthly EXP trend, category radar, streaks, best-day insight, and CSV or JSON export.
- Rewards: palette grid with rarity, unlock conditions, mystery-pool reveals, and prestige-only rewards when eligible.
- Leaderboard: optional anonymous ranking by streak. Only a chosen nickname and aggregate streak values are shown.
- Profile and Settings: display name, password, timezone, theme, leaderboard and public-profile privacy, badges, lifetime statistics, prestige, export-before-delete, and account deletion.
- Public profile: a read-only `/u/[shareSlug]` page with aggregate level, streak, badges, and contribution activity. It never exposes tasks, notes, email, or other private data.

## Progression rules

- Next-level EXP: `ceil(100 * level^1.15)`.
- Progressive target: `baseTarget + floor(level * scalingFactor)`, unless a personal override is set.
- Progressive completion EXP: `baseExp + floor(currentTarget * 0.5)`.
- Static-task dampening: additional static habits in the same category and day receive a diminishing multiplier, with a 50% floor. Progressive tasks are exempt.
- Anti-spam protection: completions submitted too close together receive a friendly slow-down response and are delayed rather than silently double-counted.
- Regression: three consecutive missed full-target days lower a progressive target by about 15% (never below its base target) and append a dated history entry.
- Daily reset and streak bucketing use the timezone saved on the user account, not server UTC.
- Completing every active habit in one day grants a combo bonus. Seven consecutive complete days grant the perfect-week bonus and badge.
- The EXP vault stores a capped surplus from unusually strong days and can provide a small boost after an under-performing day.
- Prestige becomes available after all non-seasonal palettes are unlocked. It resets level and current EXP while keeping palettes, badges, lifetime statistics, and the prestige count.

## Technology

- Next.js 14 App Router with TypeScript strict mode
- Tailwind CSS with runtime CSS custom-property palette tokens
- Prisma ORM with Neon PostgreSQL (`postgresql` provider)
- NextAuth.js Credentials provider and bcrypt password hashing
- Vitest and React Testing Library
- Playwright for mobile browser journeys
- Recharts loaded only on Analytics to keep the dashboard bundle smaller
- Vercel deployment through GitHub

## Local development

### Requirements

- Node.js 18.17 or newer
- A Neon PostgreSQL project

### Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment template:

   ```bash
   cp .env.example .env
   ```

3. Set the variables below. `DATABASE_URL` must be Neon's pooled connection string for serverless traffic. `DIRECT_URL` should be Neon's direct connection string for Prisma migrations.

   ```env
   DATABASE_URL="postgresql://..."
   DIRECT_URL="postgresql://..."
   NEXTAUTH_SECRET="a-long-random-secret"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. Generate Prisma Client and apply migrations:

   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

5. Seed the catalog, starter habits, stacks, palettes, and badges:

   ```bash
   npx prisma db seed
   ```

6. Start the development server:

   ```bash
   npm run dev
   ```

Open `http://localhost:3000` on a phone-sized viewport. Registration is open to anyone; no invite or approval step is required.

## Testing and verification

Run the local checks with:

```bash
npm run lint
npm run test
npm run build
npx playwright install
npm run test:e2e
```

The current repository checks include EXP formulas, progressive scaling, regression, vault logic, anti-gaming returns, timezone bucketing, streaks, onboarding, palette states, heatmaps, core route validation, and mobile UI interactions. The landing Playwright smoke journey runs without external credentials.

The persisted Playwright journey is intentionally opt-in and must use a disposable Neon branch, never production data:

```bash
E2E_RUN=1 E2E_DATABASE_URL="postgresql://..." E2E_DIRECT_URL="postgresql://..." NEXTAUTH_SECRET="..." npm run test:e2e
```

When enabled, it exercises registration, onboarding effects, tap and swipe completion, anti-spam feedback, library filtering and customization, analytics exports, theme persistence, leaderboard opt-in, public-profile privacy, login persistence, duplicate registration, and seeded historical analytics. The fixture creates varied DailyLogs so the heatmap and best-day assertions use real non-uniform data.

See [TESTING.md](TESTING.md) for the verification boundary, production smoke results, and the disposable-account deletion smoke record.

## Deploying to Vercel

1. Push this repository to GitHub and import it into Vercel.
2. Add `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL` to the Production environment. Use the Vercel/Neon integration if preferred; confirm both pooled and direct URLs are present.
3. Deploy. `vercel.json` runs `prisma migrate deploy`, `prisma generate`, and `next build`.
4. Seed the connected Neon database once with `npx prisma db seed` from a trusted environment, or run the seed command through a controlled deployment workflow.

For serverless deployments, keep the pooled Neon URL in `DATABASE_URL`. Do not expose either database URL to client-side code. Rotate `NEXTAUTH_SECRET` only when you intentionally want to invalidate existing sessions.

## Database and data safety

The Prisma schema contains users, active habits, daily logs, palettes, palette ownership, badges, habit stacks, and privacy settings. Daily logs are unique per user, task, and local date, which prevents duplicate rewards while preserving historical records. Account deletion cascades related records after the user passes the typed confirmation gate; the Settings page offers CSV or JSON export before deletion.

Never point destructive E2E tests at the production Neon database. Use a separate Neon branch or project and separate authentication secret.

## Repository scripts

- `npm run dev`: start Next.js in development mode
- `npm run lint`: run ESLint
- `npm run test`: run Vitest in non-watch mode
- `npm run test:e2e`: run Playwright tests
- `npm run build`: run the production build
- `npx prisma studio`: inspect local or configured Neon data
- `npx prisma migrate deploy`: apply committed migrations in deployment environments
- `npx prisma db seed`: populate the catalog and reward data
