# Ønskelisten – notes for Claude

Kåre's family wish list. Product description: https://claude.ai/artifact/5mtsQbyS1WdMS1BWKrnZ3E

## Rules that protect the product

- **Owner code paths never read `reservations`.** That covers `app/admin/**`, `app/admin/actions.ts` and anything they import. Only `reservationsForGivers()` in `lib/queries.ts` reads it, and only giver views call it. Deleting a reservation when a gift is received is allowed: it reveals nothing.
- **The browser never talks to Supabase directly.** All data access is server-side with the service-role key (`lib/db.ts`, `server-only`). RLS denies every client role.
- **Givers get in two ways.** Google sign-in, matched on `givers.email` (stored lower-case), or a personal link `/f/<giverId>.<hmac>` that sets a cookie. The HMAC uses `LINK_SECRET` and the giver's `link_version`; bumping the version revokes the link. No token is stored. Nobody signs up: Kåre adds givers.
- **The owner is never a giver.** `giverFromEmail()` refuses `OWNER_EMAILS` and `saveGiver` rejects them, so the owner's Google session can't open the giver view.
- UI text and emails are Danish. Code, comments and commits are English.

## Layout

- `app/page.tsx` giver list (reserve / bought / release) · `app/f/[token]` link landing
- `app/admin/*` owner pages; `app/admin/actions.ts` owner server actions (each starts with `requireOwner()`)
- `lib/` pure helpers (`price`, `season`, `mail`, `scrape`, `tokens`) are unit-tested in `tests/`
- `components/decor.ts` seasonal SVG builders ported from the artifact
- `supabase/migrations/` schema; `supabase/seed.sql` is fictional local data
- Local database: `supabase start` (ports 553xx, so it can run beside other projects), `supabase db reset` to re-apply migrations and seed

## Commands

`npm run dev` · `npm test` · `npm run typecheck` · `npm run build`
