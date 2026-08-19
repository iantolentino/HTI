# LevelUp Daily verification

Last verified: 2026-08-19

## Mobile functional audit changelog

### Selected improvement pass (2026-08-19)

- Added timezone-aware multi-day progressive miss accounting with scheduled-day filtering, transparent regression history, and grace-period-safe streak behavior.
- Added optimistic completion updates, duplicate-write race protection, bounded historical reads, and a retryable route-level error boundary.
- Added progressive first-day navigation disclosure, remaining/completed dashboard hierarchy, onboarding routine preview, stronger monthly challenge progress, category mastery levels, schedule-day controls, habit ordering, and archive/restore instead of destructive habit removal.
- Replaced the browser-prompt account deletion flow with an accessible typed-confirmation dialog; added password visibility, confirmation, strength feedback, timezone validation, and public-profile copy/share actions.
- Public profile API now returns only aggregate heatmap buckets (never raw DailyLog rows or notes).
- Mobile polish pass adds swipe-remove Undo, visible retry states for Dashboard/Analytics/Library/Settings, and a GitHub Actions quality workflow with opt-in isolated Neon E2E.
- Analytics audit fixes monthly EXP buckets to use the account timezone and lazy-loads Recharts; the Analytics route’s initial payload dropped from roughly 255 KB to 151 KB.

- Fixed theme application race conditions: Settings now updates the visible theme immediately after a successful save and emits a single root-level theme event. The root synchronizer listens for that event and restores the saved mode and selected palette after reload or sign-in.
- The default Concrete and Concrete Dark tokens remain the source of truth. The default palette resolves to the exact documented light and dark RGB values; selected reward palettes update the accent token only, without introducing a second hard-coded theme.
- Fixed palette selection so a successfully selected owned palette updates the app immediately, instead of waiting for a reload. Locked palette controls remain disabled and the server still rejects forged requests.
- Corrected contribution heatmap intensity to use actual completed-task counts per local timezone day, rather than the number of represented categories. The graph still produces 365 cells / 53 week columns and is horizontally scrollable on a 375px viewport.
- Added a composite `DailyLog(userId, date)` index and migration for the dashboard/analytics date-range query.
- Added category filters and a real no-results state to the Habit Library. Added a mobile floating quick-add control on Dashboard.
- Kept swipe interaction pointer-driven; task cards track pointer movement with transform-only motion and expose their complete/remove affordances underneath. Reduced-motion users retain the tap controls.

### Current verification boundary

The code-level checks below passed after this audit. Full persisted user-journey checks (registration through deletion, export downloads, timezone rollover, prestige, and public-profile privacy) require an isolated Neon test database. This workspace does not contain database credentials, so those destructive/live-data checks are intentionally not represented as passed here. Run the Playwright persisted flow against a disposable Neon branch before asserting a production full-user audit.

## Automated checks

- `npm run lint` — passed with no ESLint warnings or errors.
- `npm run test` — passed (24 Vitest tests: game formulas, timezone-aware monthly analytics buckets, streak logic, onboarding and core API route validation, and React components).
- `npm run build` — passed (Next.js production build, strict TypeScript checking, and static generation).
- `prisma validate` — passed against the Prisma schema with a non-production placeholder connection string; the migration SQL also diffs cleanly from an empty schema.
- `npm run test:e2e` — the mobile landing smoke journey passed. The persisted registration journey is intentionally skipped unless `DATABASE_URL` points to an isolated Neon test database.
- The expanded persisted mobile journey is deliberately opt-in: run `E2E_RUN=1` with `E2E_DATABASE_URL` (and, when required, `E2E_DIRECT_URL`) for an isolated seeded Neon branch. It covers registration, onboarding effects, tap/swipe completions, anti-spam feedback, Library filtering/customization, exports, theme persistence, leaderboard opt-in, public-profile privacy, login persistence, and duplicate registration.
- Playwright configuration uses an isolated port (`3100`) so local E2E runs do not collide with another dev server. Configure an isolated Neon database and `NEXTAUTH_SECRET` before enabling the persisted registration/login flow in CI.

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

### Disposable account deletion smoke (2026-08-19)

- Created a generated disposable account on the deployed production app, completed onboarding, and confirmed the account reached Dashboard with seeded habits.
- Opened Profile & Settings, entered the required `DELETE` confirmation, and submitted account deletion.
- The app redirected to the landing page after deletion.
- A subsequent login attempt with the deleted generated credentials returned the expected invalid-credentials message, confirming the account was no longer usable.
- No existing user account or production habit data was used for this destructive check.

## Deployment

Vercel builds run `prisma migrate deploy`, `prisma generate`, `prisma db seed`, and `next build`. The seed is idempotent and ensures a fresh Neon database has the task, palette, badge, and habit-stack catalog before users register.
