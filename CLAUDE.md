# Ønskelisten – notes for Claude

Kåre's family wish list. Product description: https://claude.ai/artifact/5mtsQbyS1WdMS1BWKrnZ3E

## Rules that protect the product

- **Owner code paths never read `reservations`.** That covers `app/admin/**`, `app/admin/actions.ts` and anything they import. Only `reservationsForGivers()` in `lib/queries.ts` reads it, and only giver views call it. Deleting a reservation when a gift is received is allowed: it reveals nothing.
- **The browser never talks to Supabase directly.** All data access is server-side with the service-role key (`lib/db.ts`, `server-only`). RLS denies every client role.
- **Givers never log in.** A personal link `/f/<giverId>.<hmac>` sets a cookie. The HMAC uses `LINK_SECRET` and the giver's `link_version`; bumping the version revokes the link. No token is stored.
- UI text and emails are Danish. Code, comments and commits are English.

## Layout

- `app/page.tsx` giver list (reserve / bought / release) · `app/f/[token]` link landing
- `app/admin/*` owner pages; `app/admin/actions.ts` owner server actions (each starts with `requireOwner()`)
- `lib/` pure helpers (`price`, `season`, `mail`, `scrape`, `tokens`) are unit-tested in `tests/`
- `components/decor.ts` seasonal SVG builders ported from the artifact
- `supabase/migrations/` schema; apply new migrations in the Supabase SQL editor

## Commands

`npm run dev` · `npm test` · `npm run typecheck` · `npm run build`
