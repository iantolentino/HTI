# LevelUp Daily

LevelUp Daily is a mobile-first habit tracker where real-world habits earn EXP, levels, badges, and color palette rewards. It is built with Next.js App Router, TypeScript strict mode, Tailwind CSS variables, Prisma, Neon Postgres, NextAuth credentials, Vitest, and Playwright.

## Local setup

1. Copy `.env.example` to `.env` and fill in a Neon database connection. Use the pooled Neon endpoint for `DATABASE_URL` and its direct endpoint for `DIRECT_URL`.
2. Install packages: `npm install`
3. Generate the client and migrate: `npx prisma generate && npx prisma migrate dev --name init`
4. Seed the starter habits, palettes, and badges: `npx prisma db seed`
5. Run locally: `npm run dev`

Registration is open. Passwords are bcrypt hashed and credentials login is handled by NextAuth.

## Quality checks

Run `npm test` for the game engine and component suite. Run `npx playwright install && npm run test:e2e` for the mobile browser journey. `npm run build` runs the production build. The test suite covers EXP/target/regression/vault/timezone logic and core UI interactions. Before deployment, run Prisma migration and seed against a fresh Neon project.

## Deploying to Vercel

Import the GitHub repository into Vercel, add `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL`, then deploy. The supplied `vercel.json` generates Prisma before the production build. Neon’s pooled connection must remain in `DATABASE_URL` for serverless traffic.

## Feature map

- Daily quests with progressive scaling, EXP, anti-grinding returns, touch swipe completion, level titles, gentle tone, and mobile navigation.
- Habit library and stacks, analytics heatmaps, category balance, rewards/palettes, anonymous leaderboard, public aggregate profiles, and independent dark mode.
- Prisma data model includes user-owned habits, logs, palette/badge ownership, privacy choices, prestige counters, and the EXP vault.

## Test status

The repository includes automated unit/component tests and a mobile Playwright journey. Run the commands above after configuring Neon to validate the connected application environment.
