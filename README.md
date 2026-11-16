# Ønskelisten

Kåre's family wish list as a hosted web app: Kåre maintains the list, and family members sign in with Google or open a personal link from an email, and reserve gifts.

- **Product description:** https://claude.ai/artifact/5mtsQbyS1WdMS1BWKrnZ3E (the source of truth for scope and decisions)
- **Stack:** Next.js on Vercel, Supabase Postgres + Auth (Google sign-in), Gmail compose links for the family mail, Vercel Cron for weekly price refresh.
- **Predecessor:** the Claude artifact at https://claude.ai/artifact/QNaDqDSKdD24wpj4iwyS2y, which stays live until v1 passes the acceptance test.

## Status

v1: owner list management, giver Google sign-in and personal links, reservations, Gmail compose links, seasonal themes, weekly price refresh. Runs locally against a local Supabase; not deployed yet: see [SETUP.md](SETUP.md).

## Development

```
supabase start               # local database and auth (needs Docker)
cp .env.example .env.local   # fill in from `supabase status`, or from SETUP.md for the hosted project
npm install
npm run dev                  # http://localhost:3000
npm test && npm run typecheck
```
