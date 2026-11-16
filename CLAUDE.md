# Ønskelisten – notes for Claude

Kåre's family wish list. Product description: https://claude.ai/artifact/5mtsQbyS1WdMS1BWKrnZ3E

## Rules that protect the product

- **Owner code paths never read `reservations`.** That covers `app/admin/**`, `app/admin/actions.ts` and anything they import. Only `reservationsForGivers()` in `lib/queries.ts` reads it, and only giver views call it. Deleting a reservation when a gift is received is allowed: it reveals nothing.
- **The browser never talks to Supabase directly.** All data access is server-side with the service-role key (`lib/db.ts`, `server-only`). RLS denies every client role.
- **Givers sign in with Google, nothing else.** They are matched on `givers.email` (stored lower-case). Nobody signs up: Kåre adds givers. There are no personal links: a link Kåre could copy would let him see the reservations.
- **The owner is never a giver.** `giverFromEmail()` refuses `OWNER_EMAILS` and `saveGiver` rejects them, so the owner's Google session can't open the giver view.
- UI text and emails are Danish. Code, comments and commits are English.

## Layout

- `app/page.tsx` giver list (reserve / bought / release)
- `app/admin/*` owner pages; `app/admin/actions.ts` owner server actions (each starts with `requireOwner()`)
- `lib/` pure helpers (`price`, `season`, `mail`, `scrape`) are unit-tested in `tests/`
- `components/decor.ts` seasonal SVG builders (garlands, snow, Santa, the calendar candle) · `components/Hero.tsx` page header with countdown and candle
- Christmas theme: dark page with paper cards, so colour variables are set twice in `app/globals.css` (page, then paper surfaces). Preview dates with `#jul-9` (9 December), `#jul`, `#foedselsdag`
- `supabase/migrations/` schema; `supabase/seed.sql` is fictional local data
- Local database: `supabase start` (ports 553xx, so it can run beside other projects), `supabase db reset` to re-apply migrations and seed

## Commands

`npm run dev` · `npm test` · `npm run typecheck` · `npm run build`
