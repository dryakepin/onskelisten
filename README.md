# Ønskelisten

Kåre's family wish list as a hosted web app: Kåre maintains the list, and family members open it from a personal link in an email and reserve gifts, with no account needed.

- **Product description:** https://claude.ai/artifact/5mtsQbyS1WdMS1BWKrnZ3E (the source of truth for scope and decisions)
- **Stack (planned):** Next.js on Vercel, Supabase Postgres + Auth (Google sign-in for the owner), Resend for email, Vercel Cron for weekly price refresh.
- **Predecessor:** the Claude artifact at https://claude.ai/artifact/QNaDqDSKdD24wpj4iwyS2y, which stays live until v1 passes the acceptance test.

## Status

v1 skeleton: owner list management, giver links and reservations, Gmail compose links, seasonal themes, weekly price refresh. Not deployed yet: see [SETUP.md](SETUP.md).

## Development

```
cp .env.example .env.local   # fill in values from SETUP.md
npm install
npm run dev                  # http://localhost:3000
npm test && npm run typecheck
```
