# LevelUp Daily verification

Last verified: 2026-08-18

## Automated checks

- `npm run test` — passed (8 Vitest tests: game formulas and React components).
- `npm run build` — passed (Next.js production build, strict TypeScript checking, and static generation).
- Playwright configuration uses an isolated port (`3100`) so local E2E runs do not collide with another dev server.

## Production smoke test

Verified against `https://hti-swart.vercel.app` after the `9c41e76` deployment:

- Neon `DATABASE_URL` is available in Production and Preview.
- `NEXTAUTH_SECRET` and `NEXTAUTH_URL` are configured in Vercel.
- Registration returns `201` and creates an account with the seeded starter habits.
- Credentials login creates a session and redirects to `/dashboard`.
- Dashboard renders nine active seeded habits for a new account.
- Task completion returns EXP and the duplicate same-day completion returns `409`.
- Habit Library returns the catalog and Morning Routine stack; adding a library habit returns `200`.
- Analytics renders contribution data and category mastery; CSV/JSON export endpoints return `200`.
- Mobile viewport audit at 375px found no horizontal overflow on Dashboard, Library, Analytics, Palettes, Leaderboard, or Settings.
- Browser console had no error-level messages during the smoke flow.

## Deployment

Vercel builds run `prisma migrate deploy`, `prisma generate`, `prisma db seed`, and `next build`. The seed is idempotent and ensures a fresh Neon database has the task, palette, badge, and habit-stack catalog before users register.
